/**
 * Custom Preview Templates for Decap CMS
 * Provides WYSIWYG preview of articles with styled graphic blocks
 */

// Register preview template for Articles collection
CMS.registerPreviewTemplate('articles', createArticlePreview);

// Register custom preview styles
CMS.registerPreviewStyle('/admin/preview-styles.css');

/**
 * Create preview component for articles
 */
function createArticlePreview() {
    return {
        component: ArticlePreview,
        stylesheet: '/admin/preview-styles.css'
    };
}

/**
 * Article Preview Component
 */
const ArticlePreview = createClass({
    render: function () {
        const entry = this.props.entry;
        const title = entry.getIn(['data', 'title']);
        const author = entry.getIn(['data', 'author']);
        const date = entry.getIn(['data', 'date']);
        const category = entry.getIn(['data', 'category']);
        const featuredImage = entry.getIn(['data', 'featured_image']);
        const blocks = entry.getIn(['data', 'blocks']);

        return h('article', { className: 'article-preview' },
            // Article Header
            h('header', { className: 'article-header' },
                category && h('span', { className: 'article-category' }, category),
                h('h1', { className: 'article-title' }, title),
                h('div', { className: 'article-meta' },
                    author && h('span', { className: 'article-author' }, `By ${author}`),
                    date && h('time', { className: 'article-date' }, new Date(date).toLocaleDateString('sv-SE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }))
                )
            ),

            // Featured Image
            featuredImage && h('div', { className: 'article-featured-image' },
                h('img', { src: featuredImage, alt: title })
            ),

            // Article Content Blocks
            h('div', { className: 'article-content' },
                blocks && blocks.map((block, index) => {
                    const blockType = block.get('type');

                    // Text Block
                    if (blockType === 'text') {
                        const content = block.getIn(['data', 'content']);
                        return h('div', {
                            key: index,
                            className: 'text-block',
                            dangerouslySetInnerHTML: { __html: this.props.widgetFor(`blocks.${index}.data.content`) }
                        });
                    }

                    // Graphic Block (Image + Caption)
                    if (blockType === 'graphic') {
                        const image = block.getIn(['data', 'image']);
                        const caption = block.getIn(['data', 'caption']);
                        const alt = block.getIn(['data', 'alt']) || caption || '';

                        return h('figure', { key: index, className: 'graphic-block' },
                            h('img', { src: image, alt: alt, className: 'graphic-image' }),
                            caption && h('figcaption', { className: 'graphic-caption' }, caption)
                        );
                    }

                    return null;
                })
            )
        );
    }
});

/**
 * Helper function to create React-like elements
 * CMS provides 'h' function similar to React.createElement
 */
const h = window.h || CMS.h;
const createClass = window.createClass || CMS.createClass;
