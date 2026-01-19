# Hero Images API Documentation

## Overview
This API allows you to manage and retrieve images that are displayed inside the graduation cap on the frontend homepage.

## API Endpoints

### 1. Get Public Hero Images (for Frontend Website)
**GET** `/api/hero-images/public`

Returns only active hero images, sorted by order.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65abc123...",
      "title": "University Campus",
      "description": "Beautiful campus view",
      "image": "https://cloudinary.com/image.jpg",
      "order": 0,
      "status": "Active",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### 2. Get All Hero Images (Admin - Protected)
**GET** `/api/hero-images`

Requires authentication. Returns all images (active and inactive).

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Field to sort by (default: order)
- `sortOrder` - asc or desc (default: asc)

### 3. Get Single Hero Image (Admin - Protected)
**GET** `/api/hero-images/:id`

### 4. Create Hero Image (Admin - Protected)
**POST** `/api/hero-images`

**Body:**
```json
{
  "title": "Image Title",
  "description": "Optional description",
  "image": "https://cloudinary.com/image.jpg",
  "imagePublicId": "folder/image_id",
  "order": 0,
  "status": "Active"
}
```

### 5. Update Hero Image (Admin - Protected)
**PUT** `/api/hero-images/:id`

**Body:** (same as create, all fields optional)

### 6. Delete Hero Image (Admin - Protected)
**DELETE** `/api/hero-images/:id`

## Frontend Website Integration

### Example: Fetching Hero Images in React

```javascript
// In your frontend website (localhost:3001)
import { useEffect, useState } from 'react';

const HeroSection = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      // Replace with your backend URL
      const response = await fetch('http://localhost:5000/api/hero-images/public');
      const data = await response.json();
      
      if (data.success) {
        setHeroImages(data.data);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="hero-section">
      <div className="graduation-cap">
        {heroImages.map((image) => (
          <img
            key={image._id}
            src={image.image}
            alt={image.title}
            className="cap-image"
          />
        ))}
      </div>
    </div>
  );
};
```

### Example: Using Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Fetch hero images
const getHeroImages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/hero-images/public`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage
const heroImages = await getHeroImages();
console.log(heroImages.data); // Array of images
```

## Admin Portal Usage

1. Navigate to **Hero Images** in the sidebar menu
2. Click **Add Image** to upload a new image
3. Fill in:
   - **Title** (required)
   - **Description** (optional)
   - **Image** (upload file)
   - **Display Order** (lower numbers appear first)
   - **Status** (Active/Inactive)
4. Click **Add Image** to save
5. Use the up/down arrows to reorder images
6. Click edit icon to modify an image
7. Click delete icon to remove an image

## Notes

- Only images with status "Active" are returned by the public endpoint
- Images are sorted by the `order` field (ascending)
- Image uploads are handled through Cloudinary
- Maximum image size: 5MB
- Supported formats: All image formats
