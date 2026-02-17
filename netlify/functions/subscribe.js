const { createClient } = require('@sanity/client')

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN, // Must be set in Netlify env vars
})

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        }
    }

    try {
        const { email } = JSON.parse(event.body || '{}')

        // Validate email
        if (!email || typeof email !== 'string') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email is required' }),
            }
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email address' }),
            }
        }

        // Check if already subscribed
        const existing = await client.fetch(
            `count(*[_type == "subscriber" && email == $email])`,
            { email }
        )

        if (existing > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Already subscribed', alreadyExists: true }),
            }
        }

        // Create subscriber document in Sanity
        await client.create({
            _type: 'subscriber',
            email,
            createdAt: new Date().toISOString(),
        })

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Subscribed successfully' }),
        }
    } catch (error) {
        console.error('Subscribe error:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        }
    }
}
