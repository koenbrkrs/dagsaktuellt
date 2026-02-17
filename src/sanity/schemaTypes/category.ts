import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'category',
    title: 'Category',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'localeString',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'localeString',
        }),
        defineField({
            name: 'image',
            title: 'Category Background',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'displayInHeader',
            title: 'Display in Header',
            type: 'boolean',
            initialValue: false,
        }),
    ],
})
