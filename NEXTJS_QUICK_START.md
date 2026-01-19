# Next.js Quick Start Guide

## 1. API Service File Create Karein

**File:** `lib/api/pageInformation.js`

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function getPageInformationBySlug(slug) {
  const response = await fetch(`${API_BASE_URL}/page-information/public/${slug}`, {
    cache: 'no-store'
  })
  const data = await response.json()
  return data
}

export async function getHomePage() {
  return getPageInformationBySlug('home')
}
```

## 2. Environment Variable

**.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 3. Home Page Component

**Pages Router:** `pages/index.js`
```javascript
import { getHomePage } from '../lib/api/pageInformation'

export default function Home({ pageData }) {
  return (
    <div>
      <h1>{pageData?.title}</h1>
      {pageData?.heroImage && (
        <img src={pageData.heroImage} alt={pageData.title} />
      )}
    </div>
  )
}

export async function getServerSideProps() {
  const response = await getHomePage()
  return {
    props: {
      pageData: response.data || null
    }
  }
}
```

**App Router:** `app/page.js`
```javascript
import { getHomePage } from '@/lib/api/pageInformation'

export default async function HomePage() {
  const response = await getHomePage()
  const pageData = response.data

  return (
    <div>
      <h1>{pageData.title}</h1>
      {pageData.heroImage && (
        <img src={pageData.heroImage} alt={pageData.title} />
      )}
    </div>
  )
}
```

## 4. Next.js Config (Images ke liye)

**next.config.js:**
```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}
```

## 5. Admin Portal Se Page Add Karein

1. Admin portal mein "Page Information" page open karein
2. Form fill karein:
   - Page Type: `home_page`
   - Title: "Your Gateway to the World's"
   - Sub Title: "Top Universities"
   - Slug: `home` (important!)
   - Status: `Published`
   - Hero Image upload karein
   - Roadmap Image upload karein
   - Mobile Roadmap Image upload karein
3. "Save Page" click karein

## 6. Frontend Mein Use Karein

```javascript
// Simple example
const response = await getPageInformationBySlug('home')
const pageData = response.data

// Access fields:
pageData.title
pageData.subTitle
pageData.heroImage
pageData.roadmapImage
pageData.mobileRoadmapImage
pageData.sections
```

## API Endpoint

```
GET http://localhost:5000/api/page-information/public/:slug
```

Example: `http://localhost:5000/api/page-information/public/home`

## Complete Example

```javascript
// app/page.js (Next.js 13+)
import { getHomePage } from '@/lib/api/pageInformation'
import Image from 'next/image'

export default async function Home() {
  const { data: pageData } = await getHomePage()

  return (
    <main>
      <section className="hero">
        <h1>{pageData.title}</h1>
        {pageData.subTitle && <h2>{pageData.subTitle}</h2>}
        
        {pageData.heroImage && (
          <Image
            src={pageData.heroImage}
            alt={pageData.title}
            width={1200}
            height={600}
            priority
          />
        )}
      </section>

      {pageData.roadmapImage && (
        <section className="roadmap">
          <Image
            src={pageData.roadmapImage}
            alt="Roadmap"
            width={800}
            height={400}
          />
        </section>
      )}
    </main>
  )
}

export async function generateMetadata() {
  const { data: pageData } = await getHomePage()
  
  return {
    title: pageData.metaTitle || pageData.title,
    description: pageData.metaDescription,
  }
}
```

## Troubleshooting

**Problem:** API call fail ho rahi hai
- **Solution:** Backend server check karein (port 5000)
- CORS error ho to backend `server.js` mein CORS check karein

**Problem:** Images load nahi ho rahi
- **Solution:** `next.config.js` mein image domains add karein
- Cloudinary URL check karein

**Problem:** Page not found
- **Solution:** Admin portal mein slug verify karein
- Status "Published" hona chahiye

## Next Steps

1. ✅ API service file create karein
2. ✅ Environment variable set karein
3. ✅ Home page component update karein
4. ✅ Admin portal se page add karein
5. ✅ Test karein

Detailed guide: `NEXTJS_INTEGRATION_GUIDE.md`
