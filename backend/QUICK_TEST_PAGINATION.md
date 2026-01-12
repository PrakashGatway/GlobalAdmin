# 🚀 Quick Pagination Testing Guide

## Step 1: Install Dependencies (if needed)
```bash
npm install axios
```

## Step 2: Get JWT Token

### Option A: Using Postman/Thunder Client
```
POST http://localhost:5000/api/auth/send-otp
Body: {
  "email": "admin@gateway.com",
  "role": "admin"
}

POST http://localhost:5000/api/auth/verify-otp
Body: {
  "email": "admin@gateway.com",
  "otp": "123456",  // Check console for OTP in development
  "role": "admin"
}
```

### Option B: Using cURL
```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gateway.com","role":"admin"}'

# Verify OTP (replace 123456 with actual OTP)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gateway.com","otp":"123456","role":"admin"}'
```

## Step 3: Test Pagination

### Method 1: Using Test Script (Recommended)
```bash
# 1. Edit scripts/testPagination.js
# 2. Replace YOUR_JWT_TOKEN with actual token
# 3. Run:
npm run test:pagination
```

### Method 2: Using Postman/Thunder Client

#### Test 1: Basic Pagination
```
GET http://localhost:5000/api/users?page=1&limit=10
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Test 2: Page 2
```
GET http://localhost:5000/api/users?page=2&limit=10
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Test 3: With Sorting
```
GET http://localhost:5000/api/users?page=1&limit=10&sortBy=name&sortOrder=asc
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Test 4: Different Limit
```
GET http://localhost:5000/api/users?page=1&limit=20
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### Method 3: Using Browser Console

1. Open browser console (F12)
2. Run this code:

```javascript
const token = 'YOUR_JWT_TOKEN'; // Replace with actual token

// Test pagination
async function testPagination() {
  const response = await fetch('http://localhost:5000/api/users?page=1&limit=10', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Pagination Info:', data.pagination);
  console.log('Total Items:', data.pagination.totalItems);
  console.log('Current Page:', data.pagination.currentPage);
  console.log('Total Pages:', data.pagination.totalPages);
  console.log('Data:', data.data);
}

testPagination();
```

### Method 4: Using cURL
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Expected Response Format

```json
{
  "success": true,
  "count": 100,
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "data": [
    // Array of 10 items
  ]
}
```

## Test All Endpoints

Replace `/api/users` with:
- `/api/wallets`
- `/api/universities`
- `/api/courses`
- `/api/programs`
- `/api/countries`
- `/api/support`

## Quick Validation Checklist

✅ Response has `pagination` object
✅ `data` array length matches `itemsPerPage`
✅ `totalPages` = ceil(`totalItems` / `itemsPerPage`)
✅ First page: `hasPrevPage` = false
✅ Last page: `hasNextPage` = false
✅ Middle pages: both `hasNextPage` and `hasPrevPage` = true
✅ Invalid page numbers default to 1
✅ Limit over 100 caps at 100

## Troubleshooting

**Error: 401 Unauthorized**
- Check JWT token is valid
- Token might be expired, login again

**Error: Empty data**
- Check database has data
- Verify page number is not too large

**Error: Cannot find module 'axios'**
- Run: `npm install axios`

**Server not running**
- Start server: `npm start` or `npm run dev`
