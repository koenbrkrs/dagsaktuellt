import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'aboutPage',
    title: 'About Page',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'mainImage',
            title: 'Hero Background Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'heroSubtitle',
            title: 'Hero Subtitle',
            description: 'The small text shown below the title on the About hero section.',
            type: 'localeString',
        }),
        defineField({
            name: 'aboutBio',
            title: 'About Bio',
            description: 'The biography / about text shown on the About page. Provide in both Swedish and English.',
            type: 'object',
            fields: [
                defineField({
                    name: 'sv',
                    title: 'Swedish',
                    type: 'text',
                    rows: 6,
                }),
                defineField({
                    name: 'en',
                    title: 'English',
                    type: 'text',
                    rows: 6,
                }),
            ],
        }),
    ],
})

