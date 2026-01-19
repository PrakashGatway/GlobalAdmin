# Quick Start - Image Integration

## 🚀 Fast Setup (5 Minutes)

### Step 1: Backend Start (Terminal 1)

```bash
# Terminal 1
cd "Admin Panel/backend"

# .env file check karo (agar nahi hai to env.example se copy karo)
# Important: Cloudinary credentials add karo

npm install  # Agar pehle se nahi kiya
npm start    # Ya npm run dev
```

✅ Backend `http://localhost:5000` par chalega

---

### Step 2: Frontend Setup (Terminal 2)

```bash
# Terminal 2
cd "Gway frontend"

# .env.local file create karo
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

npm install  # Agar pehle se nahi kiya
npm run dev
```

✅ Frontend `http://localhost:3001` par chalega

---

### Step 3: Admin Panel (Terminal 3 - Optional)

```bash
# Terminal 3
cd "Admin Panel/frontend"
npm start
```

✅ Admin Panel `http://localhost:5173` par chalega

---

### Step 4: Image Upload (3 Methods)

#### Method 1: Admin Panel UI (Easiest)

1. Admin panel kholo: `http://localhost:5173`
2. Login karo
3. **Page Information** section → **Create/Edit** page
4. Slug: `home`
5. Status: `Published`
6. Image URLs manually paste karo:
   - `heroImage`: Your Cloudinary URL
   - `universitySliderBg`: Your Cloudinary URL
   - `immigrationServicesBg`: Your Cloudinary URL
7. **Save** karo

#### Method 2: Postman/API (Recommended)

**Step 1: Login karo aur token lo**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Step 2: Image upload karo**
```bash
POST http://localhost:5000/api/upload/image
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (form-data):
  image: [Select your image file]
```

**Step 3: Page update karo**
```bash
PUT http://localhost:5000/api/page-information/PAGE_ID
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
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

#### Method 3: Direct Database (Advanced)

MongoDB Compass ya mongo shell se directly update karo.

---

### Step 5: Verify

1. Frontend kholo: `http://localhost:3001`
2. Browser DevTools (F12) → Network tab
3. Check karo API calls successful hain
4. Images load ho rahi hain ya nahi

---

## ✅ Checklist

- [ ] Backend running (`http://localhost:5000/api/health`)
- [ ] Frontend `.env.local` file exists
- [ ] Frontend running (`http://localhost:3001`)
- [ ] Page Information created with slug `home`
- [ ] Page status `Published` hai
- [ ] Images uploaded aur URLs set kiye
- [ ] Frontend par images load ho rahi hain

---

## 🔧 Troubleshooting

### Problem: Images load nahi ho rahi

**Check:**
1. `.env.local` file exists hai?
2. `NEXT_PUBLIC_API_URL` sahi hai?
3. Backend running hai?
4. Page slug `home` hai?
5. Page status `Published` hai?

**Solution:**
```bash
# Frontend restart karo after .env.local create
cd "Gway frontend"
npm run dev
```

### Problem: CORS Error

**Solution:**
Backend `server.js` mein:
```javascript
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000']
}))
```

### Problem: 404 Error

**Check:**
- Slug sahi hai? (`home`)
- Image type sahi hai? (`heroImage`, `universitySliderBg`, etc.)
- Page exists hai database mein?

---

## 📝 Example: Complete Flow

```bash
# 1. Backend start
cd "Admin Panel/backend"
npm start

# 2. Frontend setup
cd "Gway frontend"
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
npm run dev

# 3. Browser mein check
# http://localhost:3001

# 4. Admin panel se image upload
# http://localhost:5173 → Page Information → Create/Edit
```

---

## 🎯 Quick Test

```bash
# Test backend
curl http://localhost:5000/api/health

# Test image API
curl http://localhost:5000/api/page-information/images/home/heroImage

# Test frontend
# Browser: http://localhost:3001
```

---

## 📚 Detailed Guides

- **Full Setup**: `Gway frontend/STEP_BY_STEP_SETUP.md`
- **Integration Guide**: `Gway frontend/IMAGE_INTEGRATION_GUIDE.md`

---

**Ready! Ab aap backend se images upload kar sakte hain aur frontend automatically unhe fetch karega! 🎉**
