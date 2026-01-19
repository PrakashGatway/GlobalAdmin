# Postman Quick Reference - Image APIs

## 🚀 Quick Start (3 Steps)

### 1️⃣ Login & Get Token
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "admin@gateway.com",
  "password": "your-password"
}
```
**Copy token from response!**

---

### 2️⃣ Upload Image
```
POST http://localhost:5000/api/upload/image
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (form-data):
  image: [Select File]
```
**Copy URL from response!**

---

### 3️⃣ Update Page Information
```
PUT http://localhost:5000/api/page-information/PAGE_ID
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body (JSON):
{
  "slug": "home",
  "status": "Published",
  "heroImage": "IMAGE_URL_FROM_STEP_2",
  "heroImagePublicId": "PUBLIC_ID_FROM_STEP_2",
  "universitySliderBg": "IMAGE_URL_FROM_STEP_2",
  "universitySliderBgPublicId": "PUBLIC_ID_FROM_STEP_2",
  "immigrationServicesBg": "IMAGE_URL_FROM_STEP_2",
  "immigrationServicesBgPublicId": "PUBLIC_ID_FROM_STEP_2"
}
```

---

### 4️⃣ Delete Image (Optional)
```
DELETE http://localhost:5000/api/upload/image/:publicId
Headers:
  Authorization: Bearer YOUR_TOKEN
```
**Example:**
```
DELETE http://localhost:5000/api/upload/image/cway-admin/image
Authorization: Bearer YOUR_TOKEN
```

**Note:** `publicId` upload response se milta hai (`publicId` field)

---

## ✅ Test Public Endpoints (No Auth)

### Get Page by Slug
```
GET http://localhost:5000/api/page-information/public/home
```

### Get Image by Slug/Type
```
GET http://localhost:5000/api/page-information/images/home/heroImage
GET http://localhost:5000/api/page-information/images/home/universitySliderBg
GET http://localhost:5000/api/page-information/images/home/immigrationServicesBg
```

---

## 📋 Available Image Types

- `heroImage`
- `universityCapBg`
- `universitySliderBg`
- `immigrationServicesBg`
- `roadmapImage`
- `mobileRoadmapImage`

---

## 🔑 Important Notes

1. **Token Required** - Upload aur Page Information APIs ke liye
2. **Status = Published** - Public APIs ke liye zaroori
3. **Slug = home** - Homepage ke liye
4. **Public Endpoints** - No auth required

---

**Full Guide:** `POSTMAN_API_TESTING_GUIDE.md`
