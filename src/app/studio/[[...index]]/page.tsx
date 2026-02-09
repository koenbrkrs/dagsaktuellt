/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path will handle this file as it is a catch-all route.
 * To learn more about the others roles of this file, such as static export,
 * read more at https://github.com/sanity-io/next-sanity
 */

import Studio from './Studio'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
    return <Studio />
}
