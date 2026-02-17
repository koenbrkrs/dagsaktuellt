import { defineType } from 'sanity'
import TranslateBlockInput from '../components/TranslateBlockInput'

export default defineType({
    name: 'localeBlock',
    title: 'Localized Block Content',
    type: 'object',
    components: {
        input: TranslateBlockInput,
    },
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
