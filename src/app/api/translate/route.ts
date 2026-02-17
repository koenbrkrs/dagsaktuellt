import { NextRequest, NextResponse } from 'next/server'

const MAX_CHUNK = 4500 // Google Translate handles up to ~5000 chars; safe margin

/**
 * Split text into chunks of ≤ maxLen characters, breaking at sentence
 * boundaries (. ! ?) when possible. Falls back to word boundaries, then
 * hard-splits as a last resort.
 */
function splitIntoChunks(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text]

    const chunks: string[] = []
    let remaining = text

    while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
            chunks.push(remaining)
            break
        }

        let splitAt = -1

        // Try to split at a sentence boundary (. ! ?) within the window
        for (let i = maxLen; i >= maxLen * 0.4; i--) {
            const ch = remaining[i]
            if (ch === '.' || ch === '!' || ch === '?') {
                splitAt = i + 1
                break
            }
        }

        // Fall back to a space boundary
        if (splitAt === -1) {
            for (let i = maxLen; i >= maxLen * 0.4; i--) {
                if (remaining[i] === ' ') {
                    splitAt = i + 1
                    break
                }
            }
        }

        // Hard split if nothing found
        if (splitAt === -1) {
            splitAt = maxLen
        }

        chunks.push(remaining.slice(0, splitAt).trimEnd())
        remaining = remaining.slice(splitAt).trimStart()
    }

    return chunks.filter(c => c.length > 0)
}

/**
 * Translate a single chunk via Google Translate (free, no API key needed).
 */
async function translateChunk(
    text: string,
    from: string,
    to: string
): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Google Translate returned ${response.status}`)
    }

    const data = await response.json()

    // Google returns an array of arrays: [[["translated text","source text",...],...],...]
    // We need to concatenate all translated segments
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
        throw new Error('Unexpected response format from Google Translate')
    }

    const translated = data[0]
        .filter((segment: any) => Array.isArray(segment) && segment[0])
        .map((segment: any) => segment[0])
        .join('')

    return translated
}

/** Small delay between requests */
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function POST(request: NextRequest) {
    try {
        const { text, from = 'sv', to = 'en' } = await request.json()

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid "text" field' },
                { status: 400 }
            )
        }

        // Split into safe-sized chunks (rarely needed — Google handles ~5000 chars)
        const chunks = splitIntoChunks(text, MAX_CHUNK)

        const translatedParts: string[] = []

        for (let i = 0; i < chunks.length; i++) {
            const translated = await translateChunk(chunks[i], from, to)
            translatedParts.push(translated)

            if (i < chunks.length - 1) {
                await delay(200)
            }
        }

        const translatedText = translatedParts.join(' ')

        return NextResponse.json({ translatedText })
    } catch (error) {
        console.error('Translation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

