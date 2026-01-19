# Fix "Failed to Fetch" Error

## 🔴 Problem

Error: `Failed to fetch` in `getImageBySlug` function

**Reason:** Backend server running nahi hai!

---

## ✅ Solution

### Step 1: Backend Start Karo

**Terminal 1:**
```bash
cd "Admin Panel/backend"
npm start
```

Ya development mode mein:
```bash
cd "Admin Panel/backend"
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB Connected: ...
```

---

### Step 2: Verify Backend

**Browser ya Postman mein:**
```
GET http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

### Step 3: Frontend Restart Karo

**Terminal 2:**
```bash
cd "Gway frontend"
# Ctrl+C se stop karo (agar running hai)
npm run dev
```

**Hard Refresh Browser:**
- `Ctrl + Shift + R` (Windows)
- `Cmd + Shift + R` (Mac)

---

## 🔍 Other Possible Issues

### Issue 1: .env.local File Missing

**Check:**
```bash
cd "Gway frontend"
# .env.local file check karo
```

**Fix:**
```bash
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### Issue 2: Wrong API URL

**Check `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Fix:** URL sahi hai ya nahi verify karo.

### Issue 3: CORS Error

**Error:**
```
Access to fetch at 'http://localhost:5000/...' has been blocked by CORS policy
```

**Fix:**
Backend `server.js` mein:
```javascript
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000']
}))
```

---

## ✅ Quick Checklist

- [ ] Backend server running (`http://localhost:5000`)
- [ ] Health check successful (`/api/health`)
- [ ] `.env.local` file exists
- [ ] `NEXT_PUBLIC_API_URL` sahi set hai
- [ ] Frontend restarted after `.env.local` create
- [ ] Browser hard refresh kiya

---

## 🎯 Test Commands

### Test Backend
```bash
curl http://localhost:5000/api/health
```

### Test Image API
```bash
curl http://localhost:5000/api/page-information/images/home/heroImage
```

### Test Frontend
Browser console mein:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

---

## 💡 What I Fixed

1. ✅ **Better Error Handling** - Network errors ab properly handle ho rahe hain
2. ✅ **Warning Messages** - Console mein clear warnings dikhenge
3. ✅ **Fallback Support** - Agar backend nahi hai, to default images use hongi
4. ✅ **API URL Check** - Environment variable check karta hai

---

## 🚀 Next Steps

1. **Backend start karo** (Most Important!)
2. **Frontend restart karo**
3. **Browser hard refresh karo**
4. **Check console** - Ab warnings dikhenge, errors nahi

---

**Backend start karne ke baad error fix ho jayega! 🎉**
