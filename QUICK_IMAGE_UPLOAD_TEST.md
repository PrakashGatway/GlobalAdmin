# Quick Image Upload & Test (5 Minutes)

## 🚀 Fast Method

### 1️⃣ Backend Start
```bash
cd "Admin Panel/backend"
npm start
```

### 2️⃣ Postman Se Upload

**Step 1: Login**
```
POST http://localhost:5000/api/auth/login
Body: { "email": "admin@gateway.com", "password": "..." }
→ Copy token
```

**Step 2: Upload Image**
```
POST http://localhost:5000/api/upload/image
Authorization: Bearer TOKEN
Body (form-data): image = [Select File]
→ Copy URL
```

**Step 3: Update Page**
```
PUT http://localhost:5000/api/page-information/PAGE_ID
Authorization: Bearer TOKEN
Body: {
  "slug": "home",
  "status": "Published",
  "heroImage": "URL_FROM_STEP_2",
  "heroImagePublicId": "PUBLIC_ID_FROM_STEP_2"
}
```

### 3️⃣ Frontend Check
```
Browser: http://localhost:3001
→ Hard Refresh: Ctrl + Shift + R
→ Images load ho jayengi!
```

---

## ✅ Quick Checklist

- [ ] Backend running
- [ ] Image uploaded (Postman)
- [ ] Page updated (slug: home, status: Published)
- [ ] Frontend running
- [ ] Browser refresh kiya
- [ ] Images dikh rahi hain

---

**Full Guide:** `FRONTEND_IMAGE_UPLOAD_TEST.md`
