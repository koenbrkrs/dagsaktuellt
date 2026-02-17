import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'subscriber',
    title: 'Subscriber',
    type: 'document',
    fields: [
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) =>
                Rule.required()
                    .regex(
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        { name: 'email', invert: false }
                    )
                    .error('Must be a valid email address'),
        }),
        defineField({
            name: 'createdAt',
            title: 'Subscribed At',
            type: 'datetime',
            readOnly: true,
            initialValue: () => new Date().toISOString(),
        }),
    ],
    preview: {
        select: {
            title: 'email',
            subtitle: 'createdAt',
        },
    },
})
