import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'post',
    title: 'Post',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'localeString',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: (doc: any) => doc.title?.sv || doc.title?.en || 'untitled',
                maxLength: 96,
            },
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: { type: 'author' },
        }),
        defineField({
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                }
            ]
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'category' } }],
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
        }),
        defineField({
            name: 'body',
            title: 'Body',
            type: 'localeBlock',
        }),
    ],

    preview: {
        select: {
            titleSv: 'title.sv',
            titleEn: 'title.en',
            author: 'author.name',
            media: 'mainImage',
        },
        prepare(selection) {
            const { titleSv, titleEn, author } = selection
            return {
                ...selection,
                title: titleSv || titleEn || 'Untitled',
                subtitle: author && `by ${author}`
            }
        },
    },
})
