# Dagsaktuellt - Nordic News Platform

A modern, bilingual news platform built with Next.js 15 and Sanity CMS, featuring a sophisticated design inspired by Nordic journalism.

## 🌟 Features

- **Multilingual Support**: Swedish and English language toggle
- **Dark/Light Mode**: System preference detection with manual toggle
- **Sanity CMS Integration**: Headless CMS for content management
- **Dynamic Articles**: Full blog/article system with categories and authors
- **Responsive Design**: Mobile-first approach with beautiful layouts
- **SEO Optimized**: Meta tags, semantic HTML, and structured data
- **Built-in Studio**: Sanity Studio integrated at `/studio` route

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **CMS**: Sanity.io
- **Styling**: CSS Modules
- **Language**: TypeScript
- **Fonts**: Merriweather (Google Fonts)
- **Deployment**: Netlify

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/koenbrkrs/dagsaktuellt.git
   cd dagsaktuellt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update with your Sanity project credentials:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_SANITY_DATASET="production"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Content Management

Access the Sanity Studio at [http://localhost:3000/studio](http://localhost:3000/studio) to:
- Create and manage articles
- Add authors with profiles
- Organize content into categories
- Edit the about page

## 🌐 Deployment

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure environment variables in Netlify:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
4. Deploy!

The `netlify.toml` file is pre-configured with:
- Static export build command
- Output directory set to `out`
- Environment variables template

## 📁 Project Structure

```
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── about/      # About page
│   │   ├── articles/   # Articles listing & detail pages
│   │   ├── studio/     # Sanity Studio route
│   │   └── page.tsx    # Homepage
│   ├── components/     # React components
│   ├── sanity/         # Sanity configuration & schemas
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript definitions
├── netlify.toml        # Netlify configuration
└── sanity.config.ts    # Sanity Studio configuration
```

## 🎯 Key Features Explained

### Article System
- Full CRUD operations via Sanity Studio
- Category filtering and search
- Author profiles with images
- Rich text content with Portable Text
- Featured images with captions
- Publication dates and metadata

### Internationalization
- Toggle between Swedish (sv) and English (en)
- Persisted language preference in localStorage
- Translated UI elements throughout

### Theme System
- Auto-detects system preference
- Manual dark/light mode toggle
- Smooth transitions between themes
- Persisted theme preference

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 License

This project is private and proprietary.

## 👥 Author

**Koen Berkers**

---

Built with ❤️ using Next.js and Sanity
