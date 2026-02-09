import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'author',
    title: 'Author',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'jobTitle',
            title: 'Job Title / Responsibility',
            type: 'string',
            description: 'E.g., "Correspondent Demography" or "Senior Editor"',
        }),
        defineField({
            name: 'showOnLandingPage',
            title: 'Show on Landing Page',
            type: 'boolean',
            description: 'Toggle to display this author in the featured authors section on the homepage',
            initialValue: false,
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.email(),
        }),
        defineField({
            name: 'social',
            title: 'Social Media',
            type: 'object',
            fields: [
                { name: 'whatsapp', title: 'WhatsApp', type: 'string' },
                { name: 'facebook', title: 'Facebook', type: 'string' },
                { name: 'linkedin', title: 'LinkedIn', type: 'string' },
                { name: 'instagram', title: 'Instagram', type: 'string' },
            ],
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'array',
            of: [
                {
                    title: 'Block',
                    type: 'block',
                    styles: [{ title: 'Normal', value: 'normal' }],
                    lists: [],
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'name',
            media: 'image',
        },
    },
})
