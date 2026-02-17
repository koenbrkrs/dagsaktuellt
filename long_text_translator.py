import time
import nltk
from deep_translator import GoogleTranslator
from deep_translator.exceptions import RequestError, TranslationNotFound
import textwrap

# Ensure NLTK data is available for sentence splitting
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    print("Downloading NLTK punkt tokenizer...")
    nltk.download('punkt', quiet=True)


def split_text_smartly(text, max_chunk_size=4500):
    """
    Splits text into chunks safe for translation (under max_chunk_size).
    Prioritizes splitting by paragraphs, then sentences, then words.
    """
    if len(text) <= max_chunk_size:
        return [text]

    chunks = []
    current_chunk = ""
    
    # 1. Split by paragraphs (double newlines)
    paragraphs = text.split('\n\n')
    
    for paragraph in paragraphs:
        # Check if adding this paragraph exceeds the limit (plus separator)
        # We assume we join with '\n\n' later, so account for that len in check if current_chunk is not empty
        separator_len = 2 if current_chunk else 0
        
        if len(current_chunk) + separator_len + len(paragraph) <= max_chunk_size:
            if current_chunk:
                current_chunk += '\n\n' + paragraph
            else:
                current_chunk = paragraph
        else:
            # Current paragraph doesn't fit or is too large itself
            if current_chunk:
                chunks.append(current_chunk)
                current_chunk = ""
            
            # If paragraph itself is smaller than limit, start new chunk with it
            if len(paragraph) <= max_chunk_size:
                current_chunk = paragraph
            else:
                # Paragraph is too big, need to split by sentences
                sentences = nltk.sent_tokenize(paragraph)
                para_chunk = ""
                
                for sentence in sentences:
                    sep_len = 1 if para_chunk else 0 # space separator for sentences often
                    
                    if len(para_chunk) + sep_len + len(sentence) <= max_chunk_size:
                        if para_chunk:
                            para_chunk += ' ' + sentence
                        else:
                            para_chunk = sentence
                    else:
                        if para_chunk:
                            chunks.append(para_chunk)
                            para_chunk = ""
                        
                        # If sentence itself is too big (very rare), hard split
                        if len(sentence) > max_chunk_size:
                            # Hard split by size
                            wrapped = textwrap.wrap(sentence, max_chunk_size, break_long_words=True, break_on_hyphens=False)
                            chunks.extend(wrapped[:-1])
                            para_chunk = wrapped[-1]
                        else:
                            para_chunk = sentence
                
                if para_chunk:
                    # We might want to append this to current_chunk if it fits, but 
                    # for simplicity in this deep nesting, let's just make it the new current_chunk 
                    # or flush it. To keep logic correct with the outer paragraph loop:
                    # The paragraph was split entirely and added to chunks, manual handling:
                    if len(para_chunk) <= max_chunk_size:
                         current_chunk = para_chunk
                    else:
                         # Should not happen given logic above
                         chunks.append(para_chunk)

    if current_chunk:
        chunks.append(current_chunk)
        
    return chunks


def translate_chunk_with_retry(translator, text, retries=5):
    """
    Translates a single chunk with exponential backoff retry logic.
    """
    if not text.strip():
        return text

    for attempt in range(retries):
        try:
            return translator.translate(text)
        except (RequestError, TranslationNotFound, Exception) as e:
            wait_time = 2 ** attempt
            print(f"  [Warn] Error translating chunk: {e}. Retrying in {wait_time}s...")
            time.sleep(wait_time)
    
    raise Exception("Max retries exceeded for chunk translation.")


def translate_long_text(text, source_lang='auto', target_lang='en', chunk_size_target=4400):
    """
    Translates a long text string from source to target language.
    """
    print(f"Starting translation: {len(text)} chars, {source_lang} -> {target_lang}")
    
    translator = GoogleTranslator(source=source_lang, target=target_lang)
    
    # 1. Split text
    chunks = split_text_smartly(text, max_chunk_size=chunk_size_target)
    total_chunks = len(chunks)
    print(f"Text split into {total_chunks} chunk(s).")
    
    translated_chunks = []
    
    # 2. Translate loop
    for i, chunk in enumerate(chunks, 1):
        print(f"Translating chunk {i}/{total_chunks} ({len(chunk)} chars)...")
        
        translated_part = translate_chunk_with_retry(translator, chunk)
        translated_chunks.append(translated_part)
        
        # Determine joiner based on context logic (approximate)
        # If the chunk ended with \n\n in original, we might want to preserve that, 
        # but split_text breaks by it. We'll reconstruct simply.
        
        # Sleep slightly to be nice to the API
        if i < total_chunks:
            time.sleep(1.5) 

    # 3. Reassemble
    # Since our smart split aimed to break largely on \n\n or space, 
    # simply joining might lose the exact paragraph structure if we aren't careful.
    # A simple join with '\n\n' is often safest if we split primarily on paragraphs.
    # However, if we split mid-paragraph (sentences), '\n\n' is wrong.
    
    # Heuristic: If we have many chunks, likely paragraphs.
    # A safer approach for this script: join with space, then fix double newlines? 
    # No, that destroys formatting.
    # Let's try to join with ' ' and rely on the fact that the chunks themselves likely don't have trailing newlines
    # if they were just paragraphs. 
    # actually `split_text_smartly` strips the delimiter when splitting by '\n\n'.
    # So we probably want to join by '\n\n' UNLESS the split happened inside a paragraph.
    # To keep it simple and robust for "general" text:
    # If the original text had newlines, we want them back.
    # Ideally, `split_text_smartly` should return (chunk, delimiter) tuples, but that's complex.
    # Compromise: Join with '\n\n' because that was our primary scrape. 
    # If we split sentences inside a paragraph, we added them as separate chunks? 
    # In my logic: `split_text_smartly` flushes `current_chunks` (accumulated paragraphs) before handling a huge paragraph.
    # Then it splits the huge paragraph into sentences. 
    # It adds those sentence chunks.
    # So we have a mix. 
    # Let's refine the join logic: just return the list or join with ' '. 
    # Actually, for 99% of "long texts" (books, articles), they are paragraphs.
    # Let's join with '\n\n' and accept that if a super-long paragraph was split, it gets an extra newline.
    # Better than merging paragraphs.
    
    full_translation = "\n\n".join(translated_chunks)
    
    return full_translation


if __name__ == "__main__":
    # Example Usage
    sample_text = """
    This is a dummy text to demonstrate the translation.
    
    Here is a second paragraph. It is separated by a double newline.
    
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    """ * 50  # Make it long enough to trigger at least logic check, though maybe not split if <4500
    
    # Add a really long paragraph to test sentence splitting
    long_para = "This is a sentence. " * 300
    sample_text += "\n\n" + long_para

    try:
        translated_text = translate_long_text(sample_text, source_lang='en', target_lang='es')
        
        print("\n--- Translation Complete ---")
        print(f"Original length: {len(sample_text)}")
        print(f"Translated length: {len(translated_text)}")
        print("First 500 chars of translation:")
        print(translated_text[:500])
        
        # Optional: Save to file
        # with open("translated_output.txt", "w", encoding="utf-8") as f:
        #     f.write(translated_text)
            
    except Exception as e:
        print(f"An error occurred: {e}")
