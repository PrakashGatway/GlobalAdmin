# Next.js Frontend Integration Guide - Page Information API

## Overview
Yeh guide aapko batayega ki kaise aapke Next.js frontend website mein Page Information API ko integrate karein.

## Step 1: API Service Create Karein

**File:** `lib/api/pageInformation.js` (ya `services/pageInformation.js`)

```javascript
// lib/api/pageInformation.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

/**
 * Get page information by slug (Public)
 * @param {string} slug - Page slug
 * @returns {Promise<Object>} Page information
 */
export async function getPageInformationBySlug(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/page-information/public/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Next.js 13+ App Router ke liye
      cache: 'no-store', // ya 'force-cache' agar static data ho
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching page information:', error)
    return { success: false, data: null }
  }
}

/**
 * Get all page information (Admin - requires auth)
 * @param {string} token - Auth token
 * @returns {Promise<Object>} All pages
 */
export async function getAllPageInformation(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/page-information`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching pages:', error)
    return { success: false, data: [] }
  }
}

/**
 * Get home page information
 * @returns {Promise<Object>} Home page data
 */
export async function getHomePage() {
  return getPageInformationBySlug('home')
}
```

## Step 2: Environment Variables Setup

**File:** `.env.local` (Next.js project root mein)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 3: Home Page Component (Pages Router)

**File:** `pages/index.js` (ya `pages/home.js`)

```javascript
// pages/index.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { getHomePage } from '../lib/api/pageInformation'

export default function Home() {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPageData()
  }, [])

  const fetchPageData = async () => {
    try {
      const response = await getHomePage()
      if (response.success) {
        setPageData(response.data)
      }
    } catch (error) {
      console.error('Error loading page:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!pageData) {
    return <div>Page not found</div>
  }

  return (
    <>
      <Head>
        <title>{pageData.metaTitle || pageData.title}</title>
        <meta name="description" content={pageData.metaDescription} />
        <meta name="keywords" content={pageData.keywords?.join(', ')} />
        {pageData.canonicalUrl && (
          <link rel="canonical" href={pageData.canonicalUrl} />
        )}
      </Head>

      <div className="hero-section">
        {/* Hero Content */}
        <div className="hero-content">
          <h1>{pageData.title}</h1>
          {pageData.subTitle && <h2>{pageData.subTitle}</h2>}
        </div>

        {/* Hero Image */}
        {pageData.heroImage && (
          <div className="hero-image">
            <img
              src={pageData.heroImage}
              alt={pageData.title}
              className="hero-img"
            />
          </div>
        )}

        {/* Roadmap Images */}
        {pageData.roadmapImage && (
          <div className="roadmap-image">
            <img
              src={pageData.roadmapImage}
              alt="Roadmap"
              className="roadmap-img"
            />
          </div>
        )}

        {/* Sections */}
        {pageData.sections && pageData.sections.length > 0 && (
          <div className="sections">
            {pageData.sections.map((section, index) => (
              <div key={index} className={`section-${section.type}`}>
                {/* Render section based on type */}
                {section.type === 'hero_section' && (
                  <HeroSection data={section.data} />
                )}
                {section.type === 'form_section' && (
                  <FormSection data={section.data} />
                )}
                {section.type === 'why_choose_us' && (
                  <WhyChooseUs data={section.data} />
                )}
                {section.type === 'slider_card' && (
                  <SliderCard data={section.data} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
```

## Step 4: Using getServerSideProps (Server-Side Rendering)

**File:** `pages/index.js`

```javascript
// pages/index.js
import Head from 'next/head'
import { getHomePage } from '../lib/api/pageInformation'

export default function Home({ pageData, error }) {
  if (error) {
    return <div>Error loading page: {error}</div>
  }

  if (!pageData) {
    return <div>Page not found</div>
  }

  return (
    <>
      <Head>
        <title>{pageData.metaTitle || pageData.title}</title>
        <meta name="description" content={pageData.metaDescription} />
      </Head>

      <div className="hero-section">
        <h1>{pageData.title}</h1>
        {pageData.subTitle && <h2>{pageData.subTitle}</h2>}
        
        {pageData.heroImage && (
          <img src={pageData.heroImage} alt={pageData.title} />
        )}
      </div>
    </>
  )
}

// Server-side rendering
export async function getServerSideProps(context) {
  try {
    const response = await getHomePage()
    
    if (!response.success || !response.data) {
      return {
        props: {
          pageData: null,
          error: 'Page not found',
        },
      }
    }

    return {
      props: {
        pageData: response.data,
        error: null,
      },
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    return {
      props: {
        pageData: null,
        error: error.message,
      },
    }
  }
}
```

## Step 5: Using getStaticProps (Static Site Generation)

**File:** `pages/index.js`

```javascript
// pages/index.js
import Head from 'next/head'
import { getHomePage } from '../lib/api/pageInformation'

export default function Home({ pageData }) {
  // ... component code
}

// Static generation with revalidation
export async function getStaticProps() {
  try {
    const response = await getHomePage()
    
    if (!response.success || !response.data) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        pageData: response.data,
      },
      // Revalidate every 60 seconds
      revalidate: 60,
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    return {
      notFound: true,
    }
  }
}
```

## Step 6: App Router (Next.js 13+)

**File:** `app/page.js` (ya `app/home/page.js`)

```javascript
// app/page.js
import { getHomePage } from '@/lib/api/pageInformation'
import Image from 'next/image'

export default async function HomePage() {
  const response = await getHomePage()
  
  if (!response.success || !response.data) {
    return <div>Page not found</div>
  }

  const pageData = response.data

  return (
    <>
      <head>
        <title>{pageData.metaTitle || pageData.title}</title>
        <meta name="description" content={pageData.metaDescription} />
      </head>

      <div className="hero-section">
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

        {/* Roadmap Images */}
        {pageData.roadmapImage && (
          <div className="roadmap-container">
            <Image
              src={pageData.roadmapImage}
              alt="Roadmap"
              width={800}
              height={400}
            />
          </div>
        )}

        {/* Mobile Roadmap */}
        {pageData.mobileRoadmapImage && (
          <div className="mobile-roadmap-container">
            <Image
              src={pageData.mobileRoadmapImage}
              alt="Mobile Roadmap"
              width={400}
              height={600}
            />
          </div>
        )}

        {/* Sections */}
        {pageData.sections?.map((section, index) => (
          <div key={index}>
            {section.type === 'hero_section' && (
              <HeroSection data={section.data} />
            )}
            {/* Add other section types */}
          </div>
        ))}
      </div>
    </>
  )
}

// Generate metadata
export async function generateMetadata() {
  const response = await getHomePage()
  
  if (!response.success || !response.data) {
    return {
      title: 'Home',
    }
  }

  const pageData = response.data

  return {
    title: pageData.metaTitle || pageData.title,
    description: pageData.metaDescription,
    keywords: pageData.keywords?.join(', '),
    alternates: {
      canonical: pageData.canonicalUrl,
    },
  }
}
```

## Step 7: Dynamic Route for Pages

**File:** `pages/[slug].js` (Pages Router)

```javascript
// pages/[slug].js
import { getPageInformationBySlug } from '../lib/api/pageInformation'
import Head from 'next/head'

export default function DynamicPage({ pageData, error }) {
  if (error) {
    return <div>Error: {error}</div>
  }

  if (!pageData) {
    return <div>Page not found</div>
  }

  return (
    <>
      <Head>
        <title>{pageData.metaTitle || pageData.title}</title>
        <meta name="description" content={pageData.metaDescription} />
      </Head>

      <article>
        <h1>{pageData.title}</h1>
        {pageData.subTitle && <h2>{pageData.subTitle}</h2>}
        
        {pageData.heroImage && (
          <img src={pageData.heroImage} alt={pageData.title} />
        )}
      </article>
    </>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const response = await getPageInformationBySlug(params.slug)
    
    if (!response.success || !response.data) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        pageData: response.data,
      },
    }
  } catch (error) {
    return {
      props: {
        pageData: null,
        error: error.message,
      },
    }
  }
}
```

**File:** `app/[slug]/page.js` (App Router)

```javascript
// app/[slug]/page.js
import { getPageInformationBySlug } from '@/lib/api/pageInformation'
import { notFound } from 'next/navigation'

export default async function DynamicPage({ params }) {
  const response = await getPageInformationBySlug(params.slug)
  
  if (!response.success || !response.data) {
    notFound()
  }

  const pageData = response.data

  return (
    <article>
      <h1>{pageData.title}</h1>
      {pageData.subTitle && <h2>{pageData.subTitle}</h2>}
      
      {pageData.heroImage && (
        <img src={pageData.heroImage} alt={pageData.title} />
      )}
    </article>
  )
}

export async function generateMetadata({ params }) {
  const response = await getPageInformationBySlug(params.slug)
  
  if (!response.success || !response.data) {
    return {
      title: 'Page Not Found',
    }
  }

  const pageData = response.data

  return {
    title: pageData.metaTitle || pageData.title,
    description: pageData.metaDescription,
  }
}
```

## Step 8: Custom Hook (Optional)

**File:** `hooks/usePageInformation.js`

```javascript
// hooks/usePageInformation.js
import { useState, useEffect } from 'react'
import { getPageInformationBySlug } from '@/lib/api/pageInformation'

export function usePageInformation(slug) {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true)
        setError(null)
        const response = await getPageInformationBySlug(slug)
        
        if (response.success) {
          setPageData(response.data)
        } else {
          setError('Page not found')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPage()
    }
  }, [slug])

  return { pageData, loading, error }
}

// Usage in component:
// const { pageData, loading, error } = usePageInformation('home')
```

## Step 9: TypeScript Support (Optional)

**File:** `types/pageInformation.ts`

```typescript
// types/pageInformation.ts
export interface PageSection {
  type: 'hero_section' | 'form_section' | 'why_choose_us' | 'slider_card'
  data: Record<string, any>
  order: number
}

export interface PageInformation {
  _id: string
  pageType: 'home_page' | 'about_page' | 'contact_page' | 'other'
  title: string
  subTitle?: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  status: 'Draft' | 'Published'
  isFeatured: 'Yes' | 'No'
  heroImage?: string
  heroImagePublicId?: string
  roadmapImage?: string
  roadmapImagePublicId?: string
  mobileRoadmapImage?: string
  mobileRoadmapImagePublicId?: string
  sections: PageSection[]
  keywords: string[]
  tags: string[]
  canonicalUrl?: string
  createdAt: string
  updatedAt: string
}

export interface PageInformationResponse {
  success: boolean
  data: PageInformation
  message?: string
}
```

## Step 10: Example Component with All Features

**File:** `components/HomePage.tsx`

```javascript
// components/HomePage.tsx
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getHomePage } from '@/lib/api/pageInformation'

export default function HomePage() {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPage() {
      const response = await getHomePage()
      if (response.success) {
        setPageData(response.data)
      }
      setLoading(false)
    }
    loadPage()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!pageData) {
    return <div>Page not found</div>
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>{pageData.title}</h1>
            {pageData.subTitle && <h2>{pageData.subTitle}</h2>}
          </div>

          {/* Hero Image */}
          {pageData.heroImage && (
            <div className="hero-image">
              <Image
                src={pageData.heroImage}
                alt={pageData.title}
                width={1200}
                height={600}
                priority
                className="hero-img"
              />
            </div>
          )}
        </div>
      </section>

      {/* Roadmap Section */}
      {pageData.roadmapImage && (
        <section className="roadmap-section">
          <div className="container">
            <Image
              src={pageData.roadmapImage}
              alt="Roadmap"
              width={800}
              height={400}
              className="roadmap-img"
            />
          </div>
        </section>
      )}

      {/* Mobile Roadmap */}
      {pageData.mobileRoadmapImage && (
        <section className="mobile-roadmap-section">
          <div className="container">
            <Image
              src={pageData.mobileRoadmapImage}
              alt="Mobile Roadmap"
              width={400}
              height={600}
              className="mobile-roadmap-img"
            />
          </div>
        </section>
      )}

      {/* Dynamic Sections */}
      {pageData.sections && pageData.sections.length > 0 && (
        <div className="sections">
          {pageData.sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div key={index} className={`section section-${section.type}`}>
                {section.type === 'hero_section' && (
                  <HeroSectionComponent data={section.data} />
                )}
                {section.type === 'form_section' && (
                  <FormSectionComponent data={section.data} />
                )}
                {section.type === 'why_choose_us' && (
                  <WhyChooseUsComponent data={section.data} />
                )}
                {section.type === 'slider_card' && (
                  <SliderCardComponent data={section.data} />
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
```

## Step 11: Next.js Image Configuration

**File:** `next.config.js`

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary images
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
```

## Step 12: Error Handling & Fallbacks

```javascript
// lib/api/pageInformation.js (updated)
export async function getPageInformationBySlug(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/page-information/public/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // App Router
    })

    if (response.status === 404) {
      return { success: false, data: null, error: 'Page not found' }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching page:', error)
    // Return fallback data
    return {
      success: false,
      data: {
        title: 'Default Title',
        subTitle: 'Default Subtitle',
        heroImage: '/default-hero.jpg',
      },
      error: error.message,
    }
  }
}
```

## Testing

1. Backend server start karein: `npm start` (port 5000)
2. Admin portal se page information add karein (slug: "home")
3. Next.js app start karein: `npm run dev`
4. Browser mein check karein: `http://localhost:3000`

## API Endpoints Summary

- **Public:** `GET /api/page-information/public/:slug`
- **Admin (All):** `GET /api/page-information` (requires auth)
- **Admin (Single):** `GET /api/page-information/:id` (requires auth)
- **Create:** `POST /api/page-information` (requires auth)
- **Update:** `PUT /api/page-information/:id` (requires auth)
- **Delete:** `DELETE /api/page-information/:id` (requires auth)

## Important Notes

1. **CORS:** Backend mein CORS already enabled hai
2. **Environment Variables:** `.env.local` mein `NEXT_PUBLIC_API_URL` set karein
3. **Image Optimization:** Next.js Image component use karein
4. **SEO:** Metadata properly set karein
5. **Error Handling:** Always error handling add karein
6. **Loading States:** Loading states show karein

Agar koi specific issue ho to batayein!
