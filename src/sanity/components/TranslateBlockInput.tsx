'use client'

import React, { useCallback, useState } from 'react'
import { ObjectInputProps, set, useFormValue } from 'sanity'
import { Button, Flex, Stack, useToast } from '@sanity/ui'

const API_Endpoint = '/api/translate'

// Helper to generate a random key for Sanity blocks
const randomKey = () => Math.random().toString(36).slice(2, 10)

async function translateText(text: string): Promise<string> {
    if (!text || !text.trim()) return ''

    try {
        const res = await fetch(API_Endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, from: 'sv', to: 'en' }),
        })

        if (!res.ok) throw new Error('Translation failed')
        const data = await res.json()
        return data.translatedText || text
    } catch (error) {
        console.error('Translation error for text:', text, error)
        return text // Fallback: return original text if translation fails
    }
}

interface PortableTextItem {
    _type: string
    _key: string
    children?: { _type: string; _key: string; text: string; marks?: string[] }[]
    style?: string
    markDefs?: any[]
    caption?: string
    alt?: string
    [key: string]: any
}

export default function TranslateBlockInput(props: ObjectInputProps) {
    const { renderDefault, path, onChange } = props
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    // Read the current Swedish block content from the form
    const svValue = useFormValue([...path, 'sv']) as PortableTextItem[] | undefined

    const handleTranslate = useCallback(async () => {
        if (!svValue || svValue.length === 0) {
            toast.push({
                status: 'warning',
                title: 'No content to translate',
                description: 'The Swedish field is empty.'
            })
            return
        }

        setLoading(true)

        try {
            // Process all blocks in parallel
            const newBlocks = await Promise.all(svValue.map(async (block) => {
                // Handle different block types
                if (block._type === 'block') {
                    // Extract text from the block's children (spans)
                    const plainText = block.children
                        ? block.children.map((c) => c.text).join('')
                        : ''

                    if (!plainText.trim()) {
                        // Return empty block with same style if no text
                        return { ...block, _key: randomKey() }
                    }

                    const translatedText = await translateText(plainText)

                    // Return a new block with translated text, preserving style
                    // Note: We lose inline marks (bold/italic) as agreed, but keep block style (H1, H2, etc)
                    return {
                        ...block,
                        _key: randomKey(),
                        children: [{
                            _type: 'span',
                            _key: randomKey(),
                            text: translatedText,
                            marks: [],
                        }],
                        markDefs: [] // Reset marks as they point to spans we removed
                    }
                }

                else if (block._type === 'image') {
                    // It's an image block — translate metadata
                    // Shallow copy the block first
                    const newImageBlock = { ...block, _key: randomKey() }

                    // Translate caption if present
                    if (block.caption) {
                        newImageBlock.caption = await translateText(block.caption)
                    }

                    // Translate alt text if present
                    if (block.alt) {
                        newImageBlock.alt = await translateText(block.alt)
                    }

                    return newImageBlock
                }

                // For any other types, just copy them with a new key so React doesn't complain? 
                // Actually, if we copy exactly, we might want new keys to be safe.
                return { ...block, _key: randomKey() }
            }))

            // Update the English field
            onChange(set(newBlocks, ['en']))

            toast.push({
                status: 'success',
                title: 'Translation Complete',
                description: 'Content and images have been translated and copied.'
            })

        } catch (err) {
            console.error(err)
            toast.push({
                status: 'error',
                title: 'Translation Failed',
                description: 'Check console for details.'
            })
        } finally {
            setLoading(false)
        }
    }, [svValue, onChange, toast])

    return (
        <Stack space={3}>
            {renderDefault(props)}
            <Flex align="center" gap={2} wrap="wrap">
                <Button
                    text={loading ? 'Translating…' : '🌐 Translate SV → EN + Images'}
                    tone="primary"
                    mode="ghost"
                    fontSize={1}
                    padding={2}
                    onClick={handleTranslate}
                    disabled={loading || !svValue}
                />
                <Button
                    text="🎨 Create Visuals [GROK]"
                    tone="default"
                    mode="ghost"
                    fontSize={1}
                    padding={2}
                    onClick={() => window.open('https://grok.com/share/c2hhcmQtMw_ca535a8a-a89d-4735-9390-10b0416e94ad', '_blank')}
                />
                <Button
                    text="🎨 Create Visuals [GEMINI]"
                    tone="default"
                    mode="ghost"
                    fontSize={1}
                    padding={2}
                    onClick={() => window.open('https://gemini.google.com/share/8c61c0f09fe2', '_blank')}
                />
                <Button
                    text="🎨 Create Visuals [CHATGPT]"
                    tone="default"
                    mode="ghost"
                    fontSize={1}
                    padding={2}
                    onClick={() => window.open('https://chatgpt.com/share/69948a12-81b8-8003-bf71-e61320607d06', '_blank')}
                />
            </Flex>
        </Stack>
    )
}
