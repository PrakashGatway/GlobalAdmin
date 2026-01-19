# Frontend Mein Image Upload & Test Guide

Yeh guide aapko batayega ki kaise backend se image upload karke frontend mein test karein.

---

## 🎯 Complete Workflow

### Step 1: Backend Start Karo

**Terminal 1:**
```bash
cd "Admin Panel/backend"
npm start
```

✅ Backend `http://localhost:5000` par chalega

---

### Step 2: Frontend Start Karo

**Terminal 2:**
```bash
cd "Gway frontend"
npm run dev
```

✅ Frontend `http://localhost:3001` par chalega

---

## 📤 Method 1: Postman Se Image Upload (Recommended)

### Step 1: Login & Get Token

**Postman Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@gateway.com",
  "password": "your-password"
}
```

**Response se `token` copy karo!**

---

### Step 2: Image Upload

**Postman Request:**
```
POST http://localhost:5000/api/upload/image
Authorization: Bearer YOUR_TOKEN_HERE
Body (form-data):
  Key: image
  Type: File
  Value: [Select your image file]
```

**Response Example:**
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

**Important:** `url` aur `publicId` copy karo!

---

### Step 3: Page Information Create/Update

**Pehle existing page ID get karo:**
```
GET http://localhost:5000/api/page-information
Authorization: Bearer YOUR_TOKEN_HERE
```

**Phir update karo:**
```
PUT http://localhost:5000/api/page-information/PAGE_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

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

---

## 🌐 Method 2: Admin Panel UI Se (Easiest)

### Step 1: Admin Panel Start Karo

**Terminal 3:**
```bash
cd "Admin Panel/frontend"
npm start
```

✅ Admin Panel `http://localhost:5173` par chalega

---

### Step 2: Login Karo

1. Browser mein admin panel kholo: `http://localhost:5173`
2. Login credentials se login karo

---

### Step 3: Page Information Section

1. **Page Information** section mein jao
2. **Create New** ya existing page **Edit** karo
3. **Slug** set karo: `home`
4. **Status** set karo: `Published` (Important!)

---

### Step 4: Images Add Karo

**Option A: Direct URL Paste**

1. Pehle image upload karo Cloudinary dashboard se ya upload API se
2. Page Information form mein directly URLs paste karo:
   - `heroImage`: Hero section background image URL
   - `universitySliderBg`: University slider background URL
   - `immigrationServicesBg`: Immigration services section background URL
3. **Save** karo

**Option B: Upload Button Use Karo (Agar Available Hai)**

1. Form mein upload button click karo
2. Image select karo
3. Upload ho jayega aur URL automatically fill ho jayega

---

## ✅ Step 4: Frontend Mein Test Karo

### Step 1: Browser Kholo

```
http://localhost:3001
```

---

### Step 2: Browser DevTools Kholo

**F12** press karo ya right-click → **Inspect**

---

### Step 3: Network Tab Check Karo

1. **Network** tab select karo
2. **Filter** mein type karo: `page-information`
3. **Page refresh** karo (`Ctrl + Shift + R`)

**Expected API Calls:**
```
GET /api/page-information/images/home/heroImage
GET /api/page-information/images/home/universitySliderBg
GET /api/page-information/images/home/immigrationServicesBg
```

---

### Step 4: Verify Images

**Check Karo:**
1. ✅ Hero section background image change hui hai
2. ✅ University slider cards ka background change hua hai
3. ✅ Immigration services section background change hui hai

---

## 🧪 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Image API (Browser)
```
http://localhost:5000/api/page-information/images/home/heroImage
```

### Test Page Information (Browser)
```
http://localhost:5000/api/page-information/public/home
```

---

## 📝 Example: Complete Test Flow

### 1. Upload Hero Image
```bash
# Postman se upload
POST /api/upload/image
→ Get URL: https://res.cloudinary.com/.../hero.jpg
```

### 2. Upload Slider Background
```bash
POST /api/upload/image
→ Get URL: https://res.cloudinary.com/.../slider-bg.jpg
```

### 3. Upload Immigration Services Background
```bash
POST /api/upload/image
→ Get URL: https://res.cloudinary.com/.../immigration-bg.jpg
```

### 4. Update Page Information
```bash
PUT /api/page-information/PAGE_ID
Body: {
  "slug": "home",
  "status": "Published",
  "heroImage": "URL_FROM_STEP_1",
  "universitySliderBg": "URL_FROM_STEP_2",
  "immigrationServicesBg": "URL_FROM_STEP_3"
}
```

### 5. Frontend Check
```
Browser: http://localhost:3001
→ Images load ho rahi hain!
```

---

## 🐛 Troubleshooting

### Issue 1: Images Load Nahi Ho Rahi

**Check:**
1. Backend running hai? (`http://localhost:5000/api/health`)
2. Page slug `home` hai?
3. Page status `Published` hai?
4. `.env.local` file exists hai?
5. Frontend restarted hai?

**Solution:**
```bash
# Backend check
curl http://localhost:5000/api/health

# Frontend restart
cd "Gway frontend"
npm run dev
```

### Issue 2: 404 Error

**Error:**
```
GET /api/page-information/images/home/heroImage 404
```

**Solution:**
1. Page Information create karo slug `home` ke saath
2. Status `Published` set karo
3. Images URLs add karo

### Issue 3: CORS Error

**Error:**
```
Access to fetch at 'http://localhost:5000/...' has been blocked by CORS policy
```

**Solution:**
Backend `server.js` mein:
```javascript
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000']
}))
```

---

## ✅ Testing Checklist

### Backend
- [ ] Backend running (`http://localhost:5000`)
- [ ] Health check successful
- [ ] Login successful (token mila)
- [ ] Image upload successful
- [ ] Page Information updated

### Frontend
- [ ] Frontend running (`http://localhost:3001`)
- [ ] `.env.local` file exists
- [ ] `NEXT_PUBLIC_API_URL` set hai
- [ ] No console errors
- [ ] Network tab mein API calls dikh rahi hain
- [ ] Images load ho rahi hain

---

## 🎯 Expected Results

### Success:
1. ✅ Images upload ho gayi
2. ✅ Page Information update ho gaya
3. ✅ Frontend mein images load ho rahi hain
4. ✅ Network tab mein successful API calls
5. ✅ No console errors

### Fallback (Agar Image Nahi Hai):
1. ⚠️ Default local images dikhengi
2. ⚠️ Console mein warning dikhega
3. ⚠️ Page crash nahi hogi

---

## 💡 Tips

1. **Postman Collection Banao** - Sab requests ek jagah
2. **Environment Variables Use Karo** - Token manage karne ke liye
3. **Browser Hard Refresh** - `Ctrl + Shift + R`
4. **Network Tab Monitor** - API calls check karne ke liye
5. **Console Check** - Errors aur warnings ke liye

---

## 📚 Related Guides

- **Postman Testing**: `POSTMAN_API_TESTING_GUIDE.md`
- **Step-by-Step Setup**: `Gway frontend/STEP_BY_STEP_SETUP.md`
- **Integration Guide**: `Gway frontend/IMAGE_INTEGRATION_GUIDE.md`

---

**Ready! Ab aap images upload karke frontend mein test kar sakte hain! 🚀**

Agar koi issue ho to batao - main help karunga!
