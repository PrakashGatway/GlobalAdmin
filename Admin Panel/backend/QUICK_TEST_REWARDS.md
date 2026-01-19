# Quick Test Guide - Rewards & Purchase

## 🚀 5-Minute Test Flow

### Step 1: Register a Student
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Student",
  "email": "student@test.com",
  "phone": "+1234567890",
  "password": "password123"
}
```
**Save the token from response!**

### Step 2: Login as Admin (to create course)
```http
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "email": "admin@gateway.com",
  "role": "admin"
}
```

Then verify OTP:
```http
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "admin@gateway.com",
  "otp": "123456",
  "role": "admin"
}
```
**Save the admin token!**

### Step 3: Create or Get a University

**Option A: Create a new university**
```http
POST http://localhost:5000/api/universities
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Test University",
  "country": "India",
  "city": "Mumbai",
  "status": "Active"
}
```

**Option B: Get existing universities**
```http
GET http://localhost:5000/api/universities
Authorization: Bearer {admin_token}
```

**⚠️ IMPORTANT:** Copy the actual `_id` from the response (it looks like `"65a1b2c3d4e5f6g7h8i9j0k1"`)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Test University",
    ...
  }
}
```

**Save the university ID (the `_id` value)!**

### Step 4: Create a Course with Price
```http
POST http://localhost:5000/api/courses
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Web Development",
  "code": "WEB101",
  "university": "65a1b2c3d4e5f6g7h8i9j0k1",
  "duration": "6 months",
  "price": 1000,
  "status": "Active"
}
```

**⚠️ IMPORTANT:** Replace `65a1b2c3d4e5f6g7h8i9j0k1` with the actual university ID you got from Step 3!

**Save the course ID from the response!**

### Step 5: Purchase Course (as Student)
```http
POST http://localhost:5000/api/purchases
Authorization: Bearer {student_token}
Content-Type: application/json

{
  "courseId": "{course_id}",
  "paymentMethod": "Credit Card"
}
```

**Expected Rewards:**
- Cashback: ₹100 (10% of ₹1000)
- Points: 100 (10% of ₹1000, capped at 500)

### Step 6: Check Rewards
```http
GET http://localhost:5000/api/rewards/my-rewards
Authorization: Bearer {student_token}
```

### Step 7: Redeem Points
```http
POST http://localhost:5000/api/rewards/redeem-points
Authorization: Bearer {student_token}
Content-Type: application/json

{
  "points": 50
}
```

---

## 📋 Test Checklist

- [ ] Student registered
- [ ] Admin logged in
- [ ] University created or retrieved
- [ ] **University ID copied (actual MongoDB ObjectId)**
- [ ] Course created with price (using real university ID)
- [ ] Course purchased successfully
- [ ] Rewards earned (10% cashback + points)
- [ ] Can view my rewards
- [ ] Can redeem points
- [ ] Points converted to cashback correctly

## ⚠️ Common Error Fix

**Error:** `Cast to ObjectId failed for value "{university_id}"`

**Solution:** 
1. You used the literal string `{university_id}` instead of a real ID
2. First create/get a university (Step 3)
3. Copy the actual `_id` from the response
4. Use that real ID in the course creation (Step 4)

---

## 🎯 Expected Results

**Purchase ₹1000 course:**
- Cashback: ₹100
- Points: 100

**Purchase ₹10000 course:**
- Cashback: ₹1000
- Points: 500 (capped)

**Redeem 200 points (at 0.02 rate):**
- Cashback added: ₹4
- Remaining points: (total - 200)

---

## 📚 Full Documentation

See `TEST_REWARDS.md` for complete testing guide with all scenarios and edge cases.
