# Cloudinary Setup Guide

## 📋 Prerequisites

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloudinary credentials from the dashboard

## 🔧 Configuration

### Step 1: Get Cloudinary Credentials

1. Sign up at https://cloudinary.com/users/register_free
2. After login, go to Dashboard
3. Copy your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 2: Update Environment Variables

Add these to your `.env` file in the `backend` folder:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 3: Install Dependencies

Dependencies are already added to `package.json`. Run:

```bash
cd backend
npm install
```

This will install:
- `cloudinary` - Cloudinary SDK
- `multer` - File upload middleware

## 🚀 Usage

### Backend API Endpoints

#### Upload Image
**POST** `/api/upload/image`
**Authentication:** Required (Bearer Token)
**Content-Type:** `multipart/form-data`

**Request:**
- Form field name: `image`
- File type: Image files only (jpg, png, gif, etc.)
- Max size: 5MB

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "cway-admin/xyz123",
    "width": 800,
    "height": 600
  }
}
```

#### Delete Image
**DELETE** `/api/upload/image/:publicId`
**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## 📝 Frontend Integration

### Using in Forms

1. Import the upload service:
```javascript
import uploadService from '../../services/uploadService'
```

2. Handle image upload:
```javascript
const handleImageChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const response = await uploadService.uploadImage(file)
    if (response.success) {
      // Use response.data.url in your form
      setFormData(prev => ({
        ...prev,
        image: response.data.url,
        imagePublicId: response.data.publicId
      }))
    }
  } catch (err) {
    console.error('Upload failed:', err)
  }
}
```

3. Add file input in form:
```jsx
<CFormInput
  type="file"
  accept="image/*"
  onChange={handleImageChange}
/>
```

## 🎯 Features

- ✅ Automatic image optimization
- ✅ Automatic resizing (max 800x600)
- ✅ Secure URL generation
- ✅ Image deletion support
- ✅ File type validation
- ✅ File size validation (5MB max)
- ✅ Organized folder structure in Cloudinary

## 📦 Models Updated

All models now include image fields:
- `Course` - `image`, `imagePublicId`
- `University` - `image`, `imagePublicId`
- `Program` - `image`, `imagePublicId`
- `Country` - `image`, `imagePublicId`

## 🔒 Security

- Images are stored securely in Cloudinary
- Only authenticated users can upload
- File type and size validation
- Automatic image optimization

## 💡 Tips

1. **Free Tier Limits:**
   - 25GB storage
   - 25GB bandwidth/month
   - Perfect for development and small projects

2. **Image Optimization:**
   - Images are automatically optimized
   - Quality is set to 'auto' for best balance

3. **Folder Organization:**
   - All images are stored in `cway-admin` folder
   - Easy to manage and organize

## 🐛 Troubleshooting

### Error: "Cloudinary configuration error"
- Check your `.env` file has all three Cloudinary variables
- Verify credentials are correct

### Error: "File too large"
- Maximum file size is 5MB
- Compress images before uploading

### Error: "Invalid file type"
- Only image files are allowed
- Supported: jpg, png, gif, webp, etc.

---

**Happy Uploading! 🎉**
