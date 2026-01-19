# Frontend Website Hero Images Integration Guide

## Overview
Yeh guide aapko batayega ki kaise aapke frontend website (localhost:3001) mein hero section ki images ko API se fetch karke display karein.

## Step 1: API Service Create Karein

Aapke frontend website mein ek service file banayein:

**File:** `src/services/heroImageService.js` (ya aapki existing services folder mein)

```javascript
// Option 1: Using Fetch
export const getHeroImages = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/hero-images/public');
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Array of images
    }
    return [];
  } catch (error) {
    console.error('Error fetching hero images:', error);
    return [];
  }
};

// Option 2: Using Axios (agar aap axios use karte hain)
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getHeroImages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/hero-images/public`);
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching hero images:', error);
    return [];
  }
};
```

## Step 2: Hero Section Component Update Karein

Aapke hero section component ko update karein:

**Example: React Component**

```javascript
import React, { useState, useEffect } from 'react';
import { getHeroImages } from '../services/heroImageService'; // Adjust path as needed

const HeroSection = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    setLoading(true);
    const images = await getHeroImages();
    setHeroImages(images);
    setLoading(false);
  };

  return (
    <div className="hero-section">
      {/* Your existing hero content */}
      <div className="hero-text">
        <h1>Your Gateway to the World's</h1>
        <h2>Top Universities</h2>
        {/* ... other content ... */}
      </div>

      {/* Graduation Cap with Images */}
      <div className="graduation-cap-container">
        <div className="graduation-cap">
          {loading ? (
            <div className="loading">Loading images...</div>
          ) : (
            heroImages.map((image, index) => (
              <img
                key={image._id || index}
                src={image.image}
                alt={image.title || 'Hero image'}
                className="cap-image"
                style={{
                  position: 'absolute',
                  // Adjust positioning based on your design
                  // Example: create a grid or overlay effect
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
```

## Step 3: CSS Styling (Optional)

Agar aap chahte hain ki images cap ke andar properly display ho:

```css
.graduation-cap-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.graduation-cap {
  position: relative;
  width: 100%;
  height: 100%;
  /* Your cap styling */
}

.cap-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  /* Adjust as per your design */
}

/* Agar multiple images ko overlay karna hai */
.graduation-cap {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  padding: 20px;
}

.cap-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
}
```

## Step 4: Environment Variables (Recommended)

Production ke liye, API URL ko environment variable mein rakhein:

**File:** `.env` (frontend website root mein)

```env
VITE_API_URL=http://localhost:5000/api
```

Phir service mein:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getHeroImages = async () => {
  const response = await fetch(`${API_BASE_URL}/hero-images/public`);
  // ... rest of code
};
```

## Step 5: Error Handling

Better error handling ke liye:

```javascript
const fetchHeroImages = async () => {
  try {
    setLoading(true);
    const images = await getHeroImages();
    
    if (images && images.length > 0) {
      setHeroImages(images);
    } else {
      // Fallback to default images if API fails
      setHeroImages([
        { image: '/default-image1.jpg', title: 'Default' },
        // ... more defaults
      ]);
    }
  } catch (error) {
    console.error('Failed to load hero images:', error);
    // Use default images
  } finally {
    setLoading(false);
  }
};
```

## Step 6: CORS Configuration

Agar CORS error aaye, backend mein already CORS enable hai, lekin agar issue ho to:

**Backend `server.js` mein check karein:**
```javascript
app.use(cors()); // Already added
```

Agar specific origin allow karna ho:
```javascript
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
```

## Complete Example (Full Component)

```javascript
import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hero-images/public');
      const data = await response.json();
      
      if (data.success && data.data) {
        setHeroImages(data.data);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h1>Your Gateway to the World's</h1>
          <h2>Top Universities</h2>
          <p>Specialized admissions guidance for Ivy League, Russell Group, German & Italian Public Universities</p>
          
          <div className="hero-buttons">
            <button className="btn-primary">Get Free Counselling</button>
            <button className="btn-secondary">Check Your Eligibility</button>
          </div>
        </div>

        <div className="hero-image">
          <div className="graduation-cap">
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              heroImages.length > 0 ? (
                heroImages.map((img, index) => (
                  <img
                    key={img._id || index}
                    src={img.image}
                    alt={img.title || `Hero image ${index + 1}`}
                    className="cap-image"
                  />
                ))
              ) : (
                <div className="no-images">No images available</div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

## Testing

1. Backend server start karein: `npm start` (port 5000)
2. Admin portal se kuch images add karein
3. Frontend website refresh karein
4. Browser console mein check karein ki API call ho rahi hai ya nahi

## Troubleshooting

**Problem:** Images load nahi ho rahi
- **Solution:** Browser console check karein, CORS error ho sakta hai
- Network tab mein API call verify karein

**Problem:** API URL wrong hai
- **Solution:** Backend server ka port check karein (default: 5000)

**Problem:** Images display nahi ho rahi
- **Solution:** CSS check karein, image URLs verify karein

## API Response Format

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65abc123...",
      "title": "University Campus",
      "description": "Beautiful campus",
      "image": "https://res.cloudinary.com/.../image.jpg",
      "order": 0,
      "status": "Active"
    }
  ]
}
```

## Next Steps

1. Frontend website mein service file create karein
2. Hero section component update karein
3. Images fetch karke display karein
4. CSS adjust karein as per design
5. Test karein ki sab kuch kaam kar raha hai

Agar koi specific issue ho to batayein!
