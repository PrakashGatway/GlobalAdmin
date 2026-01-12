# Testing Rewards & Purchase Functionality

This guide will help you test the rewards system that awards students with cashback and points when they purchase courses.

## 🚀 Quick Test Flow

1. **Setup**: Create a student user and a course with price
2. **Purchase**: Student purchases a course
3. **Verify Rewards**: Check rewards earned (10% cashback + points)
4. **Redeem Points**: Convert points to cashback
5. **View Statistics**: Admin views reward statistics

---

## 📋 Prerequisites

1. **Start the server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Setup Postman Environment:**
   - Base URL: `http://localhost:5000/api`
   - Token: (will be set after login)

---

## Step 1: Create Test Data

### 1.1 Register a Student User

**POST** `/api/auth/register`

```json
{
  "name": "Test Student",
  "email": "student@test.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "...",
    "name": "Test Student",
    "email": "student@test.com",
    "role": "user"
  }
}
```

**Save the token for student requests!**

### 1.2 Login as Admin (to create course)

**POST** `/api/auth/send-otp`

```json
{
  "email": "admin@gateway.com",
  "role": "admin"
}
```

**POST** `/api/auth/verify-otp`

```json
{
  "email": "admin@gateway.com",
  "otp": "123456",
  "role": "admin"
}
```

**Save the admin token!**

### 1.3 Create a University (if needed)

**POST** `/api/universities`
**Authorization:** `Bearer {admin_token}`

```json
{
  "name": "Test University",
  "country": "India",
  "city": "Mumbai",
  "status": "Active"
}
```

**⚠️ IMPORTANT:** Copy the actual `_id` from the response. It will look like:
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

**Save the university ID (the `_id` value, not the literal string `{university_id}`)!**

**Alternative: Get existing universities**
```http
GET /api/universities
Authorization: Bearer {admin_token}
```
Then copy the `_id` from any existing university.

### 1.4 Create a Course with Price

**POST** `/api/courses`
**Authorization:** `Bearer {admin_token}`

```json
{
  "name": "Web Development Course",
  "code": "WEB101",
  "university": "65a1b2c3d4e5f6g7h8i9j0k1",
  "duration": "6 months",
  "price": 1000,
  "description": "Learn web development",
  "status": "Active"
}
```

**⚠️ CRITICAL:** Replace `65a1b2c3d4e5f6g7h8i9j0k1` with the **actual university ID** you got from Step 1.3!

**DO NOT use the literal string `{university_id}` - it will cause an error!**

**Example of correct ID format:** `"65a1b2c3d4e5f6g7h8i9j0k1"` (24 character MongoDB ObjectId)

**Save the course ID from response!**

---

## Step 2: Test Purchase Functionality

### 2.1 Purchase a Course (Student)

**POST** `/api/purchases`
**Authorization:** `Bearer {student_token}`

```json
{
  "courseId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "paymentMethod": "Credit Card",
  "transactionId": "TXN123456"
}
```

**⚠️ IMPORTANT:** Replace `65a1b2c3d4e5f6g7h8i9j0k1` with the actual course ID from Step 1.4!

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Course purchased successfully",
  "data": {
    "purchase": {
      "id": "...",
      "course": "Web Development Course",
      "amount": 1000,
      "status": "Completed",
      "rewardsEarned": {
        "cashback": 100,
        "points": 100
      }
    },
    "rewards": {
      "totalPoints": 100,
      "totalCashback": 100
    }
  }
}
```

**✅ Verification:**
- Cashback = 10% of purchase amount (₹1000 × 10% = ₹100)
- Points = 10% of purchase amount, capped at 500 (₹1000 × 10% = 100 points)

### 2.2 Test Large Purchase (to verify 500 points cap)

Create another course with price ₹10000:

**POST** `/api/courses`
```json
{
  "name": "Advanced Course",
  "code": "ADV101",
  "university": "{university_id}",
  "duration": "12 months",
  "price": 10000,
  "status": "Active"
}
```

Purchase it:
**POST** `/api/purchases`
```json
{
  "courseId": "{new_course_id}",
  "paymentMethod": "UPI"
}
```

**Expected:**
- Cashback: ₹1000 (10% of ₹10000)
- Points: 500 (capped at 500, even though 10% would be 1000)

### 2.3 Get Student's Purchases

**GET** `/api/purchases/my-purchases`
**Authorization:** `Bearer {student_token}`

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "pagination": {...},
  "data": [
    {
      "student": {...},
      "course": {...},
      "amount": 1000,
      "rewardsEarned": {...}
    }
  ]
}
```

### 2.4 Test Duplicate Purchase (Should Fail)

Try to purchase the same course again:

**POST** `/api/purchases`
```json
{
  "courseId": "{same_course_id}"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "You have already purchased this course"
}
```

---

## Step 3: Test Rewards Functionality

### 3.1 Get Student's Rewards

**GET** `/api/rewards/my-rewards`
**Authorization:** `Bearer {student_token}`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "points": 600,
    "cashback": 1100,
    "pointsValueInRupees": 12.00,
    "pointToRupeeRate": 0.02,
    "totalEarned": {
      "points": 600,
      "cashback": 1100
    },
    "totalRedeemed": {
      "points": 0,
      "cashback": 0
    },
    "conversionInfo": {
      "minValue": 10,
      "maxValue": 100,
      "currentValue": 10
    }
  }
}
```

**✅ Verification:**
- Points: 100 (from ₹1000 purchase) + 500 (from ₹10000 purchase) = 600
- Cashback: ₹100 + ₹1000 = ₹1100
- Points value: 600 × 0.02 = ₹12

### 3.2 Redeem Points to Cashback

**POST** `/api/rewards/redeem-points`
**Authorization:** `Bearer {student_token}`

```json
{
  "points": 200
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully redeemed 200 points for ₹4.00",
  "data": {
    "pointsRedeemed": 200,
    "cashbackAdded": 4.00,
    "remainingPoints": 400,
    "totalCashback": 1104.00
  }
}
```

**✅ Verification:**
- 200 points × 0.02 = ₹4 cashback added
- Remaining points: 600 - 200 = 400
- Total cashback: ₹1100 + ₹4 = ₹1104

### 3.3 Test Insufficient Points

**POST** `/api/rewards/redeem-points`
```json
{
  "points": 1000
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Insufficient points. You have 400 points."
}
```

---

## Step 4: Admin Functions

### 4.1 Get All Purchases (Admin)

**GET** `/api/purchases`
**Authorization:** `Bearer {admin_token}`

**Expected:** List of all purchases from all students

### 4.2 Get All Rewards (Admin)

**GET** `/api/rewards`
**Authorization:** `Bearer {admin_token}`

**Expected:** List of all user rewards

### 4.3 Get Reward Statistics

**GET** `/api/rewards/statistics`
**Authorization:** `Bearer {admin_token}`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalUsersWithRewards": 1,
    "totalPointsInSystem": 400,
    "totalCashbackInSystem": 1104,
    "totalPointsEarned": 600,
    "totalCashbackEarned": 1100
  }
}
```

### 4.4 Update Conversion Rate (Admin)

**PUT** `/api/rewards/conversion-rate`
**Authorization:** `Bearer {admin_token}`

```json
{
  "pointToRupeeRate": 0.1
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Conversion rate updated successfully",
  "data": {
    "pointToRupeeRate": 0.1,
    "conversionInfo": {
      "minValue": 10,
      "maxValue": 100,
      "currentValue": 50
    }
  }
}
```

**✅ Verification:**
- Now 500 points = ₹50 (instead of ₹10)
- All users' conversion rates are updated

---

## Step 5: Test Edge Cases

### 5.1 Purchase with Inactive Course

Create an inactive course and try to purchase:

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Course is not available for purchase"
}
```

### 5.2 Purchase as Admin (Should Fail)

Try to purchase as admin:

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Only students can purchase courses"
}
```

### 5.3 Get Purchase as Different User (Should Fail)

Student A tries to view Student B's purchase:

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Access denied"
}
```

---

## 📊 Test Scenarios Summary

| Scenario | Endpoint | Expected Result |
|----------|----------|----------------|
| Purchase ₹1000 course | POST /api/purchases | ₹100 cashback + 100 points |
| Purchase ₹10000 course | POST /api/purchases | ₹1000 cashback + 500 points (capped) |
| Duplicate purchase | POST /api/purchases | Error: Already purchased |
| Get my rewards | GET /api/rewards/my-rewards | Shows points and cashback |
| Redeem 200 points | POST /api/rewards/redeem-points | ₹4 cashback added |
| Insufficient points | POST /api/rewards/redeem-points | Error: Insufficient points |
| Admin view all purchases | GET /api/purchases | List of all purchases |
| Admin update conversion rate | PUT /api/rewards/conversion-rate | Rate updated for all users |

---

## 🧪 Automated Test Script

You can also use this Node.js script to test the functionality:

```bash
node backend/scripts/testRewards.js
```

(See `backend/scripts/testRewards.js` for the test script)

---

## ✅ Testing Checklist

- [ ] Student can register
- [ ] Admin can create course with price
- [ ] Student can purchase course
- [ ] Rewards are calculated correctly (10% cashback)
- [ ] Points are capped at 500 per purchase
- [ ] Student can view their purchases
- [ ] Student can view their rewards
- [ ] Student can redeem points
- [ ] Duplicate purchase is prevented
- [ ] Admin can view all purchases
- [ ] Admin can view all rewards
- [ ] Admin can update conversion rate
- [ ] Admin can view statistics
- [ ] Access control works (students can't see others' purchases)

---

## 🐛 Common Issues

### Issue: "Cast to ObjectId failed for value \"{university_id}\""
- **Error:** You used the literal string `{university_id}` instead of a real MongoDB ObjectId
- **Solution:** 
  1. First create or get a university (Step 1.3)
  2. Copy the actual `_id` from the response (looks like `"65a1b2c3d4e5f6g7h8i9j0k1"`)
  3. Use that real ID in the course creation request
  4. **Never use placeholder text like `{university_id}` in actual API calls**

### Issue: "Course not found"
- **Solution:** Make sure the course ID is correct and the course exists

### Issue: "Only students can purchase courses"
- **Solution:** Make sure you're logged in as a user with role "user", not "admin"

### Issue: "You have already purchased this course"
- **Solution:** This is expected behavior. Try purchasing a different course.

### Issue: "Insufficient points"
- **Solution:** Make more purchases to earn more points, or redeem fewer points

---

**Happy Testing! 🎉**
