import { defineType } from 'sanity'
import TranslateStringInput from '../components/TranslateStringInput'

export default defineType({
    name: 'localeString',
    title: 'Localized String',
    type: 'object',
    components: {
        input: TranslateStringInput,
    },
    fields: [
        {
            name: 'sv',
            title: 'Svenska',
            type: 'string',
        },
        {
            name: 'en',
            title: 'English',
            type: 'string',
        },
    ],
    validation: (Rule) =>
        Rule.custom((fields) => {
            if (!fields?.sv && !fields?.en) {
                return 'At least one language (Swedish or English) must be provided'
            }
            return true
        }),
})
