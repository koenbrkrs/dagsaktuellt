'use client'

import React, { useCallback, useState } from 'react'
import { ObjectInputProps, set, useFormValue } from 'sanity'
import { Button, Flex, Stack, Text } from '@sanity/ui'

export default function TranslateStringInput(props: ObjectInputProps) {
    const { renderDefault, path } = props
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Read the current Swedish value from the form
    const svValue = useFormValue([...path, 'sv']) as string | undefined

    const handleTranslate = useCallback(async () => {
        if (!svValue) {
            setError('No Swedish text to translate')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: svValue, from: 'sv', to: 'en' }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Translation failed')
                return
            }

            // Patch the English field value
            props.onChange(set(data.translatedText, ['en']))
        } catch (err) {
            setError('Network error — could not translate')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [svValue, props])

    return (
        <Stack space={3}>
            {renderDefault(props)}
            <Flex align="center" gap={2}>
                <Button
                    text={loading ? 'Translating…' : '🌐 Translate SV → EN'}
                    tone="primary"
                    mode="ghost"
                    fontSize={1}
                    padding={2}
                    onClick={handleTranslate}
                    disabled={loading || !svValue}
                />
                {error && (
                    <Text size={1} style={{ color: 'var(--card-badge-caution-fg-color, #e5a00d)' }}>
                        {error}
                    </Text>
                )}
            </Flex>
        </Stack>
    )
}
