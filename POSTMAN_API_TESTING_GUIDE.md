# Postman API Testing Guide - Image Integration

Yeh guide aapko batayega ki kaise Postman mein APIs test karein.

## 📋 Prerequisites

1. Postman installed
2. Backend running (`http://localhost:5000`)
3. Admin user credentials (login ke liye)

---

## 🔐 Step 1: Login (JWT Token Lene Ke Liye)

### Request Setup:

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "...",
    "name": "...",
    "email": "..."
  }
}
```

**Important:** Response se `token` copy karo - yeh baaki requests ke liye zaroori hai!

---

## 📤 Step 2: Image Upload

### Request Setup:

**Method:** `POST`  
**URL:** `http://localhost:5000/api/upload/image`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (form-data):**
- Key: `image` (Type: File)
- Value: Select your image file

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image.jpg",
    "publicId": "cway-admin/image",
    "width": 800,
    "height": 600
  }
}
```

**Important:** Response se `url` aur `publicId` copy karo - page information update ke liye zaroori hai!

---

## 📄 Step 3: Page Information Create/Update

### Option A: Create New Page

**Method:** `POST`  
**URL:** `http://localhost:5000/api/page-information`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "pageType": "home_page",
  "title": "Home Page",
  "slug": "home",
  "status": "Published",
  "heroImage": "https://res.cloudinary.com/.../hero.jpg",
  "heroImagePublicId": "cway-admin/hero",
  "universitySliderBg": "https://res.cloudinary.com/.../slider-bg.jpg",
  "universitySliderBgPublicId": "cway-admin/slider-bg",
  "immigrationServicesBg": "https://res.cloudinary.com/.../immigration-bg.jpg",
  "immigrationServicesBgPublicId": "cway-admin/immigration-bg"
}
```

### Option B: Update Existing Page

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/page-information/PAGE_ID`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "slug": "home",
  "status": "Published",
  "heroImage": "https://res.cloudinary.com/.../hero.jpg",
  "heroImagePublicId": "cway-admin/hero",
  "universitySliderBg": "https://res.cloudinary.com/.../slider-bg.jpg",
  "universitySliderBgPublicId": "cway-admin/slider-bg",
  "immigrationServicesBg": "https://res.cloudinary.com/.../immigration-bg.jpg",
  "immigrationServicesBgPublicId": "cway-admin/immigration-bg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Page information updated successfully",
  "data": {
    "_id": "...",
    "slug": "home",
    "heroImage": "https://...",
    ...
  }
}
```

---

## 📥 Step 4: Get Page Information (Public - No Auth)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/page-information/public/home`

**Headers:** None required (Public endpoint)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "slug": "home",
    "title": "Home Page",
    "heroImage": "https://...",
    "universitySliderBg": "https://...",
    "immigrationServicesBg": "https://...",
    ...
  }
}
```

---

## 🖼️ Step 5: Get Image by Slug and Type (Public - No Auth)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/page-information/images/home/heroImage`

**Headers:** None required (Public endpoint)

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://res.cloudinary.com/.../image.jpg",
    "publicId": "cway-admin/image",
    "imageType": "heroImage",
    "slug": "home"
  }
}
```

**Response (404 - Image Not Found):**
```json
{
  "success": false,
  "message": "Image not found for type: heroImage"
}
```

**Available Image Types:**
- `heroImage`
- `universityCapBg`
- `universitySliderBg`
- `immigrationServicesBg`
- `roadmapImage`
- `mobileRoadmapImage`

---

## 📋 Complete Workflow Example

### 1. Login
```
POST http://localhost:5000/api/auth/login
→ Get token
```

### 2. Upload Image 1 (Hero)
```
POST http://localhost:5000/api/upload/image
Authorization: Bearer TOKEN
Body: image file
→ Get URL: https://res.cloudinary.com/.../hero.jpg
```

### 3. Upload Image 2 (Slider BG)
```
POST http://localhost:5000/api/upload/image
Authorization: Bearer TOKEN
Body: image file
→ Get URL: https://res.cloudinary.com/.../slider-bg.jpg
```

### 4. Upload Image 3 (Immigration Services)
```
POST http://localhost:5000/api/upload/image
Authorization: Bearer TOKEN
Body: image file
→ Get URL: https://res.cloudinary.com/.../immigration-bg.jpg
```

### 5. Create/Update Page Information
```
POST/PUT http://localhost:5000/api/page-information
Authorization: Bearer TOKEN
Body: {
  "slug": "home",
  "status": "Published",
  "heroImage": "URL_FROM_STEP_2",
  "universitySliderBg": "URL_FROM_STEP_3",
  "immigrationServicesBg": "URL_FROM_STEP_4"
}
```

### 6. Test Public Endpoints
```
GET http://localhost:5000/api/page-information/public/home
GET http://localhost:5000/api/page-information/images/home/heroImage
GET http://localhost:5000/api/page-information/images/home/universitySliderBg
GET http://localhost:5000/api/page-information/images/home/immigrationServicesBg
```

---

## 🎯 Postman Collection Setup

### Environment Variables (Recommended)

Postman mein environment create karo:

**Variables:**
- `base_url`: `http://localhost:5000/api`
- `token`: (Login ke baad set karo)

**Usage:**
- URL: `{{base_url}}/auth/login`
- Authorization: `Bearer {{token}}`

### Collection Structure

```
📁 Image Integration APIs
  📁 Authentication
    POST Login
  📁 Upload
    POST Upload Image
  📁 Page Information
    GET Get All Pages (Protected)
    GET Get Page by ID (Protected)
    GET Get Page by Slug (Public)
    POST Create Page (Protected)
    PUT Update Page (Protected)
    DELETE Delete Page (Protected)
  📁 Images
    GET Get Image by Slug/Type (Public)
```

---

## ✅ Testing Checklist

### Authentication
- [ ] Login successful
- [ ] Token received
- [ ] Token saved in environment

### Image Upload
- [ ] Image upload successful
- [ ] URL received
- [ ] Public ID received

### Page Information
- [ ] Page created/updated
- [ ] Slug set correctly (`home`)
- [ ] Status set to `Published`
- [ ] Images URLs saved

### Public Endpoints
- [ ] Get page by slug works
- [ ] Get image by slug/type works
- [ ] 404 handled correctly (if image not found)

---

## 🐛 Common Errors

### 401 Unauthorized
**Error:** `Unauthorized - Invalid token`

**Solution:**
- Token expire ho gaya hai - login phir se karo
- Token sahi copy kiya hai ya nahi check karo
- Authorization header format: `Bearer TOKEN`

### 400 Bad Request
**Error:** `Page with this slug already exists`

**Solution:**
- Existing page update karo (PUT request)
- Ya phir different slug use karo

### 404 Not Found
**Error:** `Page not found or not published`

**Solution:**
- Slug sahi hai? (`home`)
- Status `Published` hai?
- Page exists karta hai database mein?

### 500 Internal Server Error
**Error:** Server error

**Solution:**
- Backend console check karo
- MongoDB connected hai?
- Cloudinary credentials sahi hain?

---

## 📝 Quick Test Scripts

### Test All Endpoints (Postman Runner)

1. **Login** → Save token
2. **Upload Image** → Save URL
3. **Create Page** → Save page ID
4. **Get Page (Public)** → Verify
5. **Get Image (Public)** → Verify

### Manual Test URLs

Copy-paste karo browser mein (Public endpoints):

```
http://localhost:5000/api/page-information/public/home
http://localhost:5000/api/page-information/images/home/heroImage
http://localhost:5000/api/page-information/images/home/universitySliderBg
http://localhost:5000/api/page-information/images/home/immigrationServicesBg
```

---

## 💡 Tips

1. **Environment Variables Use Karo** - Token aur URLs manage karne ke liye
2. **Tests Tab** - Automatic validation ke liye
3. **Pre-request Scripts** - Auto token refresh ke liye
4. **Collection Runner** - Multiple requests ek saath test karne ke liye
5. **Save Responses** - Examples ke liye

---

## 🎯 Expected Results

### Success Flow:
1. ✅ Login → Token mila
2. ✅ Upload → Image URL mila
3. ✅ Create/Update → Page saved
4. ✅ Get Public → Data mila
5. ✅ Get Image → Image URL mila

### Frontend Integration:
- Frontend ab yeh URLs use karega
- Images automatically load hongi
- Fallback images agar API fail ho

---

**Ready! Ab aap Postman mein APIs test kar sakte hain! 🚀**

Agar koi issue ho to batao - main help karunga!
