import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Site Title',
            type: 'string',
            initialValue: 'Dagsaktuellt',
        }),
        defineField({
            name: 'socialLinks',
            title: 'Social Media Links',
            type: 'object',
            fields: [
                {
                    name: 'facebook',
                    title: 'Facebook',
                    type: 'object',
                    fields: [
                        { name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false },
                        { name: 'url', title: 'URL', type: 'url' },
                    ],
                },
                {
                    name: 'instagram',
                    title: 'Instagram',
                    type: 'object',
                    fields: [
                        { name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false },
                        { name: 'url', title: 'URL', type: 'url' },
                    ],
                },
                {
                    name: 'linkedin',
                    title: 'LinkedIn',
                    type: 'object',
                    fields: [
                        { name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false },
                        { name: 'url', title: 'URL', type: 'url' },
                    ],
                },
                {
                    name: 'whatsapp',
                    title: 'WhatsApp',
                    type: 'object',
                    fields: [
                        { name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false },
                        { name: 'url', title: 'URL', type: 'url' },
                    ],
                },
            ],
        }),
    ],
    preview: {
        prepare() {
            return {
                title: 'Site Settings',
            }
        },
    },
})
