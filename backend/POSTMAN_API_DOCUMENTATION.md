# Postman API Testing Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. After login, use the token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 1. Health Check

### GET /api/health
**No authentication required**

**Request:**
```
GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## 2. Authentication Endpoints

### 2.1 Register User
**POST /api/auth/register**
**No authentication required**

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "696495f5e859aece0d1d3267",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user"
  }
}
```

---

### 2.2 Login User (Email Only)
**POST /api/auth/login**
**No authentication required**
**Note: Password is not required, only email and role**

**Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@gateway.com",
  "role": "admin"
}
```

**Available Test Emails:**
- Admin: `admin@gateway.com` / `admin`
- Manager: `manager@gateway.com` / `manager`
- Counsellor: `counsellor@gateway.com` / `counsellor`

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "696495f4e859aece0d1d325e",
    "name": "Admin User",
    "email": "admin@gateway.com",
    "phone": "+1234567890",
    "role": "admin"
  }
}
```

**Save the token for subsequent requests!**

---

### 2.3 Get Current User
**GET /api/auth/me**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "696495f4e859aece0d1d325e",
    "name": "Admin User",
    "email": "admin@gateway.com",
    "phone": "+1234567890",
    "role": "admin",
    "status": "Active",
    "createdAt": "2026-01-12T06:34:28.000Z",
    "updatedAt": "2026-01-12T06:34:28.000Z"
  }
}
```

---

## 3. User Management Endpoints

### 3.1 Get All Users
**GET /api/users**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/users
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response (200):**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "696495f4e859aece0d1d325e",
      "name": "Admin User",
      "email": "admin@gateway.com",
      "phone": "+1234567890",
      "role": "admin",
      "status": "Active"
    }
  ]
}
```

---

### 3.2 Get Single User
**GET /api/users/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/users/696495f4e859aece0d1d325e
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "696495f4e859aece0d1d325e",
    "name": "Admin User",
    "email": "admin@gateway.com",
    "phone": "+1234567890",
    "role": "admin",
    "status": "Active"
  }
}
```

---

### 3.3 Create User
**POST /api/users**
**Authentication required (Admin only)**

**Request:**
```
POST http://localhost:5000/api/users
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "+1234567891",
  "password": "password123",
  "role": "counsellor",
  "status": "Active"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "696495f5e859aece0d1d3268",
    "name": "New User",
    "email": "newuser@example.com",
    "phone": "+1234567891",
    "role": "counsellor",
    "status": "Active"
  }
}
```

---

### 3.4 Update User
**PUT /api/users/:id**
**Authentication required (Admin only)**

**Request:**
```
PUT http://localhost:5000/api/users/696495f5e859aece0d1d3268
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated User",
  "status": "Inactive"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "696495f5e859aece0d1d3268",
    "name": "Updated User",
    "email": "newuser@example.com",
    "phone": "+1234567891",
    "role": "counsellor",
    "status": "Inactive"
  }
}
```

---

### 3.5 Delete User
**DELETE /api/users/:id**
**Authentication required (Admin only)**

**Request:**
```
DELETE http://localhost:5000/api/users/696495f5e859aece0d1d3268
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 4. Wallet Endpoints

### 4.1 Get All Wallets
**GET /api/wallets**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/wallets
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 4.2 Get Wallet by User ID
**GET /api/wallets/user/:userId**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/wallets/user/USER_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 4.3 Get Single Wallet
**GET /api/wallets/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/wallets/WALLET_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 4.4 Create Wallet
**POST /api/wallets**
**Authentication required**

**Request:**
```
POST http://localhost:5000/api/wallets
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "696495f4e859aece0d1d325e",
  "currency": "USD",
  "balance": 1000.00,
  "status": "Active",
  "transactionType": "Credit"
}
```

**Note:** Currency must be one of: `USD`, `EUR`, `GBP`, `INR`  
Status must be one of: `Active`, `Inactive`, `Frozen`

---

### 4.5 Update Wallet
**PUT /api/wallets/:id**
**Authentication required**

**Request:**
```
PUT http://localhost:5000/api/wallets/WALLET_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "balance": 1500.00,
  "status": "Active"
}
```

---

### 4.6 Delete Wallet
**DELETE /api/wallets/:id**
**Authentication required**

**Request:**
```
DELETE http://localhost:5000/api/wallets/WALLET_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 5. University Endpoints

### 5.1 Get All Universities
**GET /api/universities**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/universities
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 5.2 Get Single University
**GET /api/universities/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/universities/UNIVERSITY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 5.3 Create University
**POST /api/universities**
**Authentication required**

**Request:**
```
POST http://localhost:5000/api/universities
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Harvard University",
  "country": "USA",
  "city": "Cambridge",
  "status": "Active"
}
```

---

### 5.4 Update University
**PUT /api/universities/:id**
**Authentication required**

**Request:**
```
PUT http://localhost:5000/api/universities/UNIVERSITY_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Harvard University Updated",
  "status": "Active"
}
```

---

### 5.5 Delete University
**DELETE /api/universities/:id**
**Authentication required**

**Request:**
```
DELETE http://localhost:5000/api/universities/UNIVERSITY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 6. Course Endpoints

### 6.1 Get All Courses
**GET /api/courses**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/courses
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 6.2 Get Single Course
**GET /api/courses/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/courses/COURSE_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 6.3 Create Course
**POST /api/courses**
**Authentication required**

**Request:**
```
POST http://localhost:5000/api/courses
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Computer Science",
  "code": "CS101",
  "university": "UNIVERSITY_ID",
  "duration": "4 years",
  "status": "Active",
  "description": "Computer Science course description"
}
```

**Note:** `code` must be unique

---

### 6.4 Update Course
**PUT /api/courses/:id**
**Authentication required**

**Request:**
```
PUT http://localhost:5000/api/courses/COURSE_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

---

### 6.5 Delete Course
**DELETE /api/courses/:id**
**Authentication required**

**Request:**
```
DELETE http://localhost:5000/api/courses/COURSE_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 7. Purchase Endpoints

### 7.1 Purchase a Course
**POST /api/purchases**
**Authentication required (Student only)**

**Request:**
```
POST http://localhost:5000/api/purchases
Authorization: Bearer YOUR_STUDENT_TOKEN
Content-Type: application/json
```

**Body (without coupon):**
```json
{
  "courseId": "COURSE_ID",
  "paymentMethod": "Credit Card",
  "transactionId": "TXN123456"
}
```

**Body (with coupon code):**
```json
{
  "courseId": "COURSE_ID",
  "couponCode": "SAVE20",
  "paymentMethod": "Credit Card",
  "transactionId": "TXN123456"
}
```

**Body (purchase program with coupon):**
```json
{
  "programId": "PROGRAM_ID",
  "couponCode": "PROGRAM15",
  "paymentMethod": "Credit Card",
  "transactionId": "TXN123456"
}
```

**Response (201):**
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

**Note:** 
- Only students (role: 'user') can purchase courses/programs
- Supports both `courseId` and `programId` (provide either one, not both)
- Optional `couponCode` field for applying discount coupons
- Rewards: 10% cashback + 10% points (capped at 500 points per purchase)
- Rewards are calculated on the discounted amount (after coupon)

---

### 7.2 Get My Purchases
**GET /api/purchases/my-purchases**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/purchases/my-purchases
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
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
      "status": "Completed",
      "rewardsEarned": {
        "cashback": 100,
        "points": 100
      }
    }
  ]
}
```

---

### 7.3 Get All Purchases
**GET /api/purchases**
**Authentication required (Admin/Manager)**

**Request:**
```
GET http://localhost:5000/api/purchases
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

### 7.4 Get Single Purchase
**GET /api/purchases/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/purchases/PURCHASE_ID
Authorization: Bearer YOUR_TOKEN
```

---

## 8. Rewards Endpoints

### 8.1 Get My Rewards
**GET /api/rewards/my-rewards**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/rewards/my-rewards
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
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

---

### 8.2 Redeem Points
**POST /api/rewards/redeem-points**
**Authentication required**

**Request:**
```
POST http://localhost:5000/api/rewards/redeem-points
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "points": 200
}
```

**Response (200):**
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

---

### 8.3 Get All Rewards
**GET /api/rewards**
**Authentication required (Admin/Manager)**

**Request:**
```
GET http://localhost:5000/api/rewards
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

### 8.4 Update Conversion Rate
**PUT /api/rewards/conversion-rate**
**Authentication required (Admin only)**

**Request:**
```
PUT http://localhost:5000/api/rewards/conversion-rate
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "pointToRupeeRate": 0.1
}
```

**Note:** Rate must be between 0.02 and 0.2 (500 points = ₹10-100)

---

### 8.5 Get Reward Statistics
**GET /api/rewards/statistics**
**Authentication required (Admin/Manager)**

**Request:**
```
GET http://localhost:5000/api/rewards/statistics
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsersWithRewards": 10,
    "totalPointsInSystem": 5000,
    "totalCashbackInSystem": 10000,
    "totalPointsEarned": 6000,
    "totalCashbackEarned": 11000
  }
}
```

---

## 9. Program Endpoints

### 7.1 Get All Programs
**GET /api/programs**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/programs
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 7.2 Get Single Program
**GET /api/programs/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/programs/PROGRAM_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 7.3 Create Program
**POST /api/programs**
**Authentication required**

**Request:**
```
POST http://localhost:5000/api/programs
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "MBA Program",
  "type": "Graduate",
  "university": "UNIVERSITY_ID",
  "duration": "2 years",
  "status": "Active",
  "description": "MBA program description"
}
```

**Note:** Type must be one of: `Undergraduate`, `Graduate`, `Doctorate`, `Certificate`

---

### 7.4 Update Program
**PUT /api/programs/:id**
**Authentication required**

**Request:**
```
PUT http://localhost:5000/api/programs/PROGRAM_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

---

### 7.5 Delete Program
**DELETE /api/programs/:id**
**Authentication required**

**Request:**
```
DELETE http://localhost:5000/api/programs/PROGRAM_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 8. Country Endpoints

### 8.1 Get All Countries
**GET /api/countries**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/countries
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 8.2 Get Single Country
**GET /api/countries/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/countries/COUNTRY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 8.3 Create Country
**POST /api/countries**
**Authentication required**

**Request:**
```
POST http://localhost:5000/api/countries
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "United States",
  "code": "US",
  "currency": "USD",
  "status": "Active"
}
```

**Note:** `name` and `code` must be unique

---

### 8.4 Update Country
**PUT /api/countries/:id**
**Authentication required**

**Request:**
```
PUT http://localhost:5000/api/countries/COUNTRY_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

---

### 8.5 Delete Country
**DELETE /api/countries/:id**
**Authentication required**

**Request:**
```
DELETE http://localhost:5000/api/countries/COUNTRY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 9. Support Ticket Endpoints

### 9.1 Get All Support Tickets
**GET /api/support**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/support
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 9.2 Get Single Support Ticket
**GET /api/support/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/support/TICKET_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 9.3 Create Support Ticket
**POST /api/support**
**Authentication required**

**Request:**
```
POST http://localhost:5000/api/support
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "user": "696495f4e859aece0d1d325e",
  "email": "user@example.com",
  "subject": "Need Help",
  "description": "I need assistance with my account",
  "priority": "High",
  "status": "Open"
}
```

**Note:** 
- Priority must be one of: `Low`, `Medium`, `High`, `Urgent`
- Status must be one of: `Open`, `In Progress`, `Resolved`, `Closed`
- `ticketNumber` is auto-generated

---

### 9.4 Update Support Ticket
**PUT /api/support/:id**
**Authentication required**

**Request:**
```
PUT http://localhost:5000/api/support/TICKET_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "status": "Resolved",
  "priority": "Low"
}
```

---

### 9.5 Delete Support Ticket
**DELETE /api/support/:id**
**Authentication required**

**Request:**
```
DELETE http://localhost:5000/api/support/TICKET_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Postman Collection Setup

### Step 1: Create Environment Variables
1. Open Postman
2. Click on "Environments" → "Create Environment"
3. Add these variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (leave empty, will be set after login)

### Step 2: Setup Authorization
1. Create a new request
2. Go to "Authorization" tab
3. Select "Bearer Token"
4. Enter `{{token}}` in the Token field

### Step 3: Testing Flow
1. **First, test Health Check:**
   - GET `{{base_url}}/health`

2. **Login to get token:**
   - POST `{{base_url}}/auth/login`
   - Use test credentials (admin@gateway.com / admin123)
   - Copy the token from response
   - Set it in environment variable `token`

3. **Test authenticated endpoints:**
   - All other endpoints will use `{{token}}` automatically

### Step 4: Save Token Automatically (Optional)
Add this script in the "Tests" tab of login request:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    console.log("Token saved:", jsonData.token);
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Quick Test Checklist

- [ ] Health Check
- [ ] Register User
- [ ] Login (Admin)
- [ ] Login (Manager)
- [ ] Login (Counsellor)
- [ ] Get Current User
- [ ] Get All Users
- [ ] Get Single User
- [ ] Create User (Admin only)
- [ ] Update User (Admin only)
- [ ] Delete User (Admin only)
- [ ] Test other endpoints (Wallets, Universities, Courses, Programs, Countries, Support)
- [ ] Purchase a course (Student)
- [ ] Get my rewards
- [ ] Redeem points
- [ ] Get all purchases (Admin)
- [ ] Get reward statistics (Admin)
- [ ] Get all coupons
- [ ] Validate coupon code
- [ ] Create coupon (Admin)
- [ ] Update coupon (Admin)
- [ ] Delete coupon (Admin)
- [ ] Purchase course with coupon
- [ ] Purchase program with coupon

---

## 10. Coupon Endpoints

### 10.1 Get All Coupons
**GET /api/coupons**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/coupons
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "pagination": {...},
  "data": [
    {
      "_id": "...",
      "code": "SAVE20",
      "description": "20% off on all courses",
      "discountType": "percentage",
      "discountValue": 20,
      "minPurchaseAmount": 1000,
      "maxDiscountAmount": 2000,
      "validFrom": "2024-01-01T00:00:00.000Z",
      "validTo": "2024-12-31T23:59:59.000Z",
      "usageLimit": 100,
      "usedCount": 5,
      "applicableTo": "all",
      "status": "Active"
    }
  ]
}
```

---

### 10.2 Get Single Coupon
**GET /api/coupons/:id**
**Authentication required**

**Request:**
```
GET http://localhost:5000/api/coupons/COUPON_ID
Authorization: Bearer YOUR_TOKEN
```

---

### 10.3 Validate Coupon Code
**POST /api/coupons/validate**
**Authentication required**

**Request:**
```
POST http://localhost:5000/api/coupons/validate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "code": "SAVE20",
  "amount": 10000,
  "itemId": "COURSE_ID",
  "itemType": "course"
}
```

**Response (200 - Valid):**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "...",
      "code": "SAVE20",
      "description": "20% off on all courses",
      "discountType": "percentage",
      "discountValue": 20
    },
    "discount": 2000,
    "originalAmount": 10000,
    "finalAmount": 8000
  }
}
```

**Response (400 - Invalid):**
```json
{
  "success": false,
  "message": "Invalid coupon code"
}
```

---

### 10.4 Create Coupon
**POST /api/coupons**
**Authentication required (Admin only)**

**Request:**
```
POST http://localhost:5000/api/coupons
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body (Percentage Discount):**
```json
{
  "code": "SAVE20",
  "description": "20% off on all courses",
  "discountType": "percentage",
  "discountValue": 20,
  "minPurchaseAmount": 1000,
  "maxDiscountAmount": 2000,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validTo": "2024-12-31T23:59:59.000Z",
  "usageLimit": 100,
  "applicableTo": "all"
}
```

**Body (Fixed Amount Discount):**
```json
{
  "code": "FLAT500",
  "description": "Flat ₹500 off",
  "discountType": "fixed",
  "discountValue": 500,
  "minPurchaseAmount": 2000,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validTo": "2024-12-31T23:59:59.000Z",
  "usageLimit": 50,
  "applicableTo": "courses"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "...",
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    ...
  }
}
```

---

### 10.5 Update Coupon
**PUT /api/coupons/:id**
**Authentication required (Admin only)**

**Request:**
```
PUT http://localhost:5000/api/coupons/COUPON_ID
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Updated: 25% off on all courses",
  "discountValue": 25,
  "maxDiscountAmount": 3000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "_id": "...",
    "code": "SAVE20",
    "discountValue": 25,
    ...
  }
}
```

---

### 10.6 Delete Coupon
**DELETE /api/coupons/:id**
**Authentication required (Admin only)**

**Request:**
```
DELETE http://localhost:5000/api/coupons/COUPON_ID
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

**Note:** For detailed coupon testing guide, see `TEST_COUPONS.md`

---

## Notes

1. **Token Expiry**: Tokens expire in 7 days (configurable in `.env`)
2. **Admin Only**: Some endpoints require admin role
3. **Password**: Never returned in responses for security
4. **CORS**: Enabled for all origins (configure in production)
5. **Base URL**: Change `localhost:5000` to your server URL in production

---

## Support

For issues or questions, check:
- Server logs in terminal
- MongoDB connection status
- Environment variables in `.env` file
