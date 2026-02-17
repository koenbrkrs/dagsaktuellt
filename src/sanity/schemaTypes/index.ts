import { type SchemaTypeDefinition } from 'sanity'

import blockContent from './blockContent'
import category from './category'
import post from './post'
import author from './author'
import aboutPage from './aboutPage'
import localeString from './localeString'
import localeBlock from './localeBlock'
import siteSettings from './siteSettings'
import subscriber from './subscriber'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [post, author, category, blockContent, aboutPage, localeString, localeBlock, siteSettings, subscriber],
}
