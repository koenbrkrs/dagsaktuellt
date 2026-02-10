import { defineType } from 'sanity'

export default defineType({
    name: 'localeBlock',
    title: 'Localized Block Content',
    type: 'object',
    fields: [
        {
            name: 'sv',
            title: 'Svenska',
            type: 'blockContent',
        },
        {
            name: 'en',
            title: 'English',
            type: 'blockContent',
        },
    ],
})
