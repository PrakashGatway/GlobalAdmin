# Image Delete Guide - Postman

Yeh guide aapko batayega ki kaise uploaded images ko delete karein.

---

## 🗑️ Image Delete Kaise Karein

### Step 1: Get Public ID

Image upload ke baad response mein `publicId` milta hai:

**Upload Response Example:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../image.jpg",
    "publicId": "cway-admin/image",  // ← Yeh copy karo
    "width": 800,
    "height": 600
  }
}
```

**Important:** `publicId` copy karo - yeh delete ke liye zaroori hai!

---

### Step 2: Delete Image API Call

**Postman Request:**
```
DELETE http://localhost:5000/api/upload/image/:publicId
Authorization: Bearer YOUR_TOKEN
```

**Example:**
```
DELETE http://localhost:5000/api/upload/image/cway-admin/image
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Image not found"
}
```

---

## 📋 Complete Workflow

### 1. Upload Image
```
POST http://localhost:5000/api/upload/image
→ Get publicId: "cway-admin/image"
```

### 2. Use Image in Page Information
```
PUT http://localhost:5000/api/page-information/PAGE_ID
Body: {
  "heroImage": "URL",
  "heroImagePublicId": "cway-admin/image"
}
```

### 3. Delete Image (Agar Zaroorat Ho)
```
DELETE http://localhost:5000/api/upload/image/cway-admin/image
→ Image deleted from Cloudinary
```

---

## ⚠️ Important Notes

### Before Deleting:

1. **Check Page Information** - Agar image kisi page mein use ho rahi hai, to pehle page se remove karo:
   ```
   PUT /api/page-information/PAGE_ID
   Body: {
     "heroImage": "",
     "heroImagePublicId": ""
   }
   ```

2. **Backup** - Agar zaroorat ho to image URL save kar lo

3. **Verify** - Delete ke baad verify karo ki image actually delete ho gayi

---

## 🔄 Complete Example

### Upload Image
```bash
POST http://localhost:5000/api/upload/image
Authorization: Bearer TOKEN
Body: image file

Response:
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../hero.jpg",
    "publicId": "cway-admin/hero-123"
  }
}
```

### Use in Page
```bash
PUT http://localhost:5000/api/page-information/PAGE_ID
Body: {
  "heroImage": "https://res.cloudinary.com/.../hero.jpg",
  "heroImagePublicId": "cway-admin/hero-123"
}
```

### Delete Image (Later)
```bash
DELETE http://localhost:5000/api/upload/image/cway-admin/hero-123
Authorization: Bearer TOKEN

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## 🧪 Testing

### Test Delete API

**Postman:**
```
DELETE http://localhost:5000/api/upload/image/YOUR_PUBLIC_ID
Authorization: Bearer YOUR_TOKEN
```

**cURL:**
```bash
curl -X DELETE \
  http://localhost:5000/api/upload/image/cway-admin/image \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Checklist

- [ ] Image upload ki (publicId mila)
- [ ] Page Information se image remove ki (agar use ho rahi thi)
- [ ] Delete API call ki
- [ ] Success response mila
- [ ] Cloudinary se verify kiya ki image delete ho gayi

---

## 🐛 Common Issues

### Issue 1: 404 Not Found

**Error:**
```json
{
  "success": false,
  "message": "Image not found"
}
```

**Solution:**
- Public ID sahi hai ya nahi check karo
- Image already delete ho chuki hai
- Public ID format: `cway-admin/image-name`

### Issue 2: 401 Unauthorized

**Error:**
```
Unauthorized - Invalid token
```

**Solution:**
- Token expire ho gaya hai - login phir se karo
- Authorization header sahi hai ya nahi check karo

### Issue 3: Image Still Showing

**Reason:**
- Page Information mein abhi bhi URL save hai
- Browser cache mein image hai

**Solution:**
1. Page Information update karo - image fields empty karo
2. Browser cache clear karo
3. Hard refresh karo (`Ctrl + Shift + R`)

---

## 💡 Tips

1. **Public ID Save Karo** - Delete ke liye zaroori hai
2. **Page Se Pehle Remove Karo** - Image delete karne se pehle
3. **Verify Karo** - Delete ke baad Cloudinary dashboard check karo
4. **Backup** - Important images ka backup rakho

---

## 📚 Related APIs

- **Upload**: `POST /api/upload/image`
- **Delete**: `DELETE /api/upload/image/:publicId`
- **Page Update**: `PUT /api/page-information/:id`

---

**Ready! Ab aap images delete kar sakte hain! 🗑️**
