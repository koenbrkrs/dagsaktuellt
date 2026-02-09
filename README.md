# Decap CMS for Dagsaktuellt

This directory contains the Decap CMS (Netlify CMS) configuration for managing articles.

## Files

- **index.html** - CMS admin interface with Dagsaktuellt branding
- **config.yml** - CMS configuration (collections, fields, workflow)
- **preview.js** - Custom preview templates for article rendering
- **preview-styles.css** - Styles for the CMS preview pane

## Accessing the CMS

### Local Development
Visit `http://localhost:3000/admin/` when running the dev server.

**Note:** Full authentication requires Netlify Identity, so you'll need to deploy first or use a proxy.

### Production
Access the CMS at: `https://dagsaktuellt.netlify.app/admin/`

## Setup Instructions

1. **Enable Netlify Identity**
   - Go to your Netlify dashboard
   - Navigate to Site settings → Identity
   - Click "Enable Identity"

2. **Enable Git Gateway**
   - In Identity settings, click "Services"
   - Enable "Git Gateway"

3. **Invite Users**
   - Go to Identity tab
   - Click "Invite users"
   - Enter email addresses for content editors
   - They'll receive an email to set up their account

4. **First Login**
   - Visit `/admin/` on your deployed site
   - Click "Login with Netlify Identity"
   - Set your password from the invitation email

## Content Structure

Articles are saved to `content/articles/` as markdown files with this structure:

```markdown
---
title: "Article Title"
date: 2026-02-09T12:00:00Z
author: "Author Name"
category: "News"
featured_image: "/images/uploads/hero.jpg"
blocks:
  - type: text
    content: "Article content..."
  - type: graphic
    image: "/images/uploads/image.jpg"
    caption: "Image description"
    alt: "Alt text for accessibility"
tags:
  - tag1
  - tag2
featured: false
excerpt: "Brief summary"
---
```

## Editorial Workflow

The CMS supports three content states:

1. **Drafts** - Work in progress, not published
2. **In Review** - Ready for editorial review
3. **Ready** - Approved and ready to publish

Content moves through these states before being merged to the main branch.

## Modular Content Blocks

Articles use a flexible block system:

### Text Block
- Rich markdown editor
- Supports: headings, bold, italic, links, lists, quotes
- Toggle between rich text and raw markdown modes

### Graphic Block
- Image upload
- Caption field (displays in small, italic, gray text)
- Alt text for accessibility

Build articles by mixing these blocks in any order!

## Customization

### Branding
- Logo: Update `logo_url` in `config.yml`
- Theme: Modify styles in `index.html` (CSS variables)
- Preview: Edit `preview-styles.css` for article preview appearance

### Categories
Current categories: News, Sports, Culture, Opinion

To modify, edit the `category` field in `config.yml`.

### Fields
Add custom fields by editing the `fields` array in `config.yml` under the articles collection.

## Support

For issues or questions about Decap CMS:
- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Netlify Identity Docs](https://docs.netlify.com/visitor-access/identity/)
