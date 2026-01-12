# Coupon System Testing Guide - Postman

This guide will help you test the complete coupon system using Postman.

## 📋 Prerequisites

1. **Postman installed** on your system
2. **Backend server running** on `http://localhost:5000`
3. **Admin user account** created (for creating/updating/deleting coupons)
4. **Student user account** created (for testing coupon application)

---

## 🔐 Step 1: Login as Admin

**POST** `http://localhost:5000/api/auth/send-otp`

**Body (JSON):**
```json
{
  "email": "admin@gateway.com",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Note:** Check your email for OTP, or check console if in development mode.

---

**POST** `http://localhost:5000/api/auth/verify-otp`

**Body (JSON):**
```json
{
  "email": "admin@gateway.com",
  "otp": "123456",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@gateway.com",
    "role": "admin"
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value. You'll need it for all subsequent requests.

**Save the token in a Postman variable:**
- Go to Postman → Environment → Add variable `adminToken`
- Set value to your token

---

## 🎫 Step 2: Create a Course (Required for Testing)

**POST** `http://localhost:5000/api/courses`

**Headers:**
```
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Test Course for Coupon",
  "code": "COUPON101",
  "university": "YOUR_UNIVERSITY_ID_HERE",
  "duration": "6 months",
  "price": 10000,
  "description": "Test course for coupon testing",
  "status": "Active"
}
```

**⚠️ IMPORTANT:** Replace `YOUR_UNIVERSITY_ID_HERE` with an actual university ID from your database.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "course_id_here",
    "name": "Test Course for Coupon",
    "price": 10000,
    ...
  }
}
```

**Save the course ID** for later use.

---

## 🎟️ Step 3: Create Coupons

### 3.1 Create Percentage Discount Coupon

**POST** `http://localhost:5000/api/coupons`

**Headers:**
```
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

**Body (JSON):**
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

**Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "coupon_id_here",
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    ...
  }
}
```

---

### 3.2 Create Fixed Amount Discount Coupon

**POST** `http://localhost:5000/api/coupons`

**Body (JSON):**
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

**Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "coupon_id_here",
    "code": "FLAT500",
    "discountType": "fixed",
    "discountValue": 500,
    ...
  }
}
```

---

### 3.3 Create Program-Only Coupon

**POST** `http://localhost:5000/api/coupons`

**Body (JSON):**
```json
{
  "code": "PROGRAM15",
  "description": "15% off on programs only",
  "discountType": "percentage",
  "discountValue": 15,
  "minPurchaseAmount": 5000,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validTo": "2024-12-31T23:59:59.000Z",
  "usageLimit": null,
  "applicableTo": "programs"
}
```

---

## 📋 Step 4: Get All Coupons

**GET** `http://localhost:5000/api/coupons`

**Headers:**
```
Authorization: Bearer {{adminToken}}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "itemsPerPage": 10
  },
  "data": [
    {
      "_id": "...",
      "code": "SAVE20",
      "discountType": "percentage",
      "discountValue": 20,
      ...
    }
  ]
}
```

---

## 🔍 Step 5: Validate Coupon Code

**POST** `http://localhost:5000/api/coupons/validate`

**Headers:**
```
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "code": "SAVE20",
  "amount": 10000,
  "itemId": "course_id_here",
  "itemType": "course"
}
```

**Response (Valid Coupon):**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "coupon_id_here",
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

**Response (Invalid Coupon):**
```json
{
  "success": false,
  "message": "Invalid coupon code"
}
```

**Response (Expired Coupon):**
```json
{
  "success": false,
  "message": "Coupon has expired"
}
```

**Response (Minimum Purchase Not Met):**
```json
{
  "success": false,
  "message": "Minimum purchase amount of ₹1000 required"
}
```

---

## 🛒 Step 6: Purchase Course with Coupon

### 6.1 Login as Student

**POST** `http://localhost:5000/api/auth/send-otp`

**Body (JSON):**
```json
{
  "email": "student@example.com",
  "role": "user"
}
```

**POST** `http://localhost:5000/api/auth/verify-otp`

**Body (JSON):**
```json
{
  "email": "student@example.com",
  "otp": "123456",
  "role": "user"
}
```

**Save the student token** in a Postman variable `studentToken`.

---

### 6.2 Purchase Course WITHOUT Coupon

**POST** `http://localhost:5000/api/purchases`

**Headers:**
```
Authorization: Bearer {{studentToken}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "courseId": "course_id_here",
  "paymentMethod": "Credit Card",
  "transactionId": "TXN123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course purchased successfully",
  "data": {
    "purchase": {
      "id": "purchase_id_here",
      "itemName": "Test Course for Coupon",
      "itemType": "course",
      "originalAmount": 10000,
      "amount": 10000,
      "couponDiscount": 0,
      "couponCode": null,
      "status": "Completed",
      "rewardsEarned": {
        "cashback": 1000,
        "points": 100
      }
    },
    "rewards": {
      "totalPoints": 100,
      "totalCashback": 1000
    }
  }
}
```

---

### 6.3 Purchase Course WITH Coupon

**POST** `http://localhost:5000/api/purchases`

**Headers:**
```
Authorization: Bearer {{studentToken}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "courseId": "course_id_here",
  "couponCode": "SAVE20",
  "paymentMethod": "Credit Card",
  "transactionId": "TXN123457"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course purchased successfully",
  "data": {
    "purchase": {
      "id": "purchase_id_here",
      "itemName": "Test Course for Coupon",
      "itemType": "course",
      "originalAmount": 10000,
      "amount": 8000,
      "couponDiscount": 2000,
      "couponCode": "SAVE20",
      "status": "Completed",
      "rewardsEarned": {
        "cashback": 800,
        "points": 80
      }
    },
    "rewards": {
      "totalPoints": 180,
      "totalCashback": 1800
    }
  }
}
```

**Notice:**
- `originalAmount`: ₹10,000 (original price)
- `amount`: ₹8,000 (after 20% discount)
- `couponDiscount`: ₹2,000
- Rewards are calculated on the discounted amount (₹8,000)

---

## ✏️ Step 7: Update Coupon

**PUT** `http://localhost:5000/api/coupons/{{coupon_id}}`

**Headers:**
```
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "description": "Updated: 25% off on all courses",
  "discountValue": 25,
  "maxDiscountAmount": 3000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "_id": "coupon_id_here",
    "code": "SAVE20",
    "discountValue": 25,
    ...
  }
}
```

---

## 🗑️ Step 8: Delete Coupon

**DELETE** `http://localhost:5000/api/coupons/{{coupon_id}}`

**Headers:**
```
Authorization: Bearer {{adminToken}}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Percentage Discount with Max Cap

**Coupon:**
- Code: `SAVE30`
- Type: Percentage
- Value: 30%
- Max Discount: ₹2,000
- Min Purchase: ₹1,000

**Test Purchase:**
- Course Price: ₹10,000
- Expected Discount: ₹2,000 (capped at max)
- Final Amount: ₹8,000

---

### Scenario 2: Fixed Discount

**Coupon:**
- Code: `FLAT500`
- Type: Fixed
- Value: ₹500
- Min Purchase: ₹2,000

**Test Purchase:**
- Course Price: ₹3,000
- Expected Discount: ₹500
- Final Amount: ₹2,500

---

### Scenario 3: Minimum Purchase Not Met

**Coupon:**
- Code: `SAVE20`
- Min Purchase: ₹5,000

**Test Purchase:**
- Course Price: ₹3,000
- Expected Result: Error - "Minimum purchase amount of ₹5000 required"

---

### Scenario 4: Expired Coupon

**Coupon:**
- Code: `EXPIRED`
- Valid To: Past date

**Test Purchase:**
- Expected Result: Error - "Coupon has expired"

---

### Scenario 5: Usage Limit Reached

**Coupon:**
- Code: `LIMITED`
- Usage Limit: 10
- Used Count: 10

**Test Purchase:**
- Expected Result: Error - "Coupon usage limit reached"

---

### Scenario 6: Wrong Item Type

**Coupon:**
- Code: `PROGRAM15`
- Applicable To: "programs"

**Test Purchase:**
- Item Type: "course"
- Expected Result: Error - "This coupon is only applicable to programs"

---

## 📊 Expected Results Summary

| Scenario | Original Price | Coupon | Discount | Final Price | Rewards (10%) |
|----------|---------------|--------|----------|-------------|---------------|
| No Coupon | ₹10,000 | - | ₹0 | ₹10,000 | ₹1,000 cashback, 100 points |
| SAVE20 (20%) | ₹10,000 | SAVE20 | ₹2,000 | ₹8,000 | ₹800 cashback, 80 points |
| FLAT500 | ₹10,000 | FLAT500 | ₹500 | ₹9,500 | ₹950 cashback, 95 points |
| SAVE30 (30%, max ₹2,000) | ₹10,000 | SAVE30 | ₹2,000 | ₹8,000 | ₹800 cashback, 80 points |

---

## 🔧 Troubleshooting

### Error: "Invalid coupon code"
- Check if coupon code is correct (case-insensitive but stored in uppercase)
- Verify coupon exists in database

### Error: "Coupon is not active"
- Check coupon status in database
- Update status to "Active" if needed

### Error: "Minimum purchase amount not met"
- Verify course/program price meets minimum requirement
- Check `minPurchaseAmount` field in coupon

### Error: "Coupon has expired"
- Check `validTo` date in coupon
- Create a new coupon with future expiry date

### Error: "Coupon usage limit reached"
- Check `usedCount` vs `usageLimit` in coupon
- Create a new coupon or increase usage limit

### Error: "This coupon is only applicable to courses/programs"
- Verify `applicableTo` field matches item type
- Use a coupon with `applicableTo: "all"` for testing

---

## 📝 Notes

1. **Coupon codes are case-insensitive** but stored in uppercase
2. **Rewards are calculated on discounted amount**, not original amount
3. **Percentage discounts** can have a maximum cap (`maxDiscountAmount`)
4. **Fixed discounts** cannot exceed the purchase amount
5. **Coupon usage is automatically incremented** when applied to a purchase
6. **Program purchases** also support coupons (use `programId` instead of `courseId`)

---

## ✅ Checklist

- [ ] Admin login successful
- [ ] Course created for testing
- [ ] Percentage discount coupon created
- [ ] Fixed discount coupon created
- [ ] Program-only coupon created
- [ ] Coupon validation working
- [ ] Purchase without coupon working
- [ ] Purchase with coupon working
- [ ] Discount calculation correct
- [ ] Rewards calculated on discounted amount
- [ ] Coupon usage incremented
- [ ] Update coupon working
- [ ] Delete coupon working
- [ ] Error scenarios tested

---

**Happy Testing! 🎉**
