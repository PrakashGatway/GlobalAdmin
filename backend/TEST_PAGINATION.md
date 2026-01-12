# Pagination Testing Guide

## 🧪 How to Test Pagination

### Prerequisites
1. Server should be running on `http://localhost:5000`
2. You need a valid JWT token (login first)
3. Database should have some data to test

---

## 📋 Test Cases

### 1. Basic Pagination Tests

#### Test 1: Default Pagination (No Parameters)
```bash
GET http://localhost:5000/api/users
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
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
  "data": [...10 users...]
}
```

#### Test 2: Specific Page and Limit
```bash
GET http://localhost:5000/api/users?page=2&limit=20
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "count": 100,
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  },
  "data": [...20 users (users 21-40)...]
}
```

#### Test 3: Sorting
```bash
GET http://localhost:5000/api/users?page=1&limit=10&sortBy=name&sortOrder=asc
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected:** Users sorted by name in ascending order

#### Test 4: Last Page
```bash
GET http://localhost:5000/api/users?page=10&limit=10
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "pagination": {
    "currentPage": 10,
    "hasNextPage": false,
    "hasPrevPage": true,
    "nextPage": null,
    "prevPage": 9
  }
}
```

---

### 2. Edge Cases Testing

#### Test 5: Invalid Page Number (Negative)
```bash
GET http://localhost:5000/api/users?page=-1&limit=10
```

**Expected:** Should default to page 1

#### Test 6: Invalid Page Number (Zero)
```bash
GET http://localhost:5000/api/users?page=0&limit=10
```

**Expected:** Should default to page 1

#### Test 7: Very Large Page Number
```bash
GET http://localhost:5000/api/users?page=9999&limit=10
```

**Expected:** Should return empty data array with correct pagination info

#### Test 8: Invalid Limit (Negative)
```bash
GET http://localhost:5000/api/users?page=1&limit=-5
```

**Expected:** Should default to limit 10

#### Test 9: Very Large Limit (Over Max)
```bash
GET http://localhost:5000/api/users?page=1&limit=1000
```

**Expected:** Should cap at 100 (max limit)

#### Test 10: Limit Zero
```bash
GET http://localhost:5000/api/users?page=1&limit=0
```

**Expected:** Should default to limit 10

---

### 3. Different Endpoints Testing

#### Test 11: Wallets Pagination
```bash
GET http://localhost:5000/api/wallets?page=1&limit=5
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Test 12: Universities Pagination
```bash
GET http://localhost:5000/api/universities?page=2&limit=15&sortBy=name&sortOrder=asc
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Test 13: Courses Pagination
```bash
GET http://localhost:5000/api/courses?page=1&limit=20
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Test 14: Programs Pagination
```bash
GET http://localhost:5000/api/programs?page=1&limit=10
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Test 15: Countries Pagination
```bash
GET http://localhost:5000/api/countries?page=1&limit=25
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Test 16: Support Tickets Pagination
```bash
GET http://localhost:5000/api/support?page=1&limit=10
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 4. Filtered Pagination (User-specific)

#### Test 17: User Wallets
```bash
GET http://localhost:5000/api/wallets/user/USER_ID?page=1&limit=10
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔧 Using cURL Commands

### Basic cURL Test
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### With Sorting
```bash
curl -X GET "http://localhost:5000/api/users?page=2&limit=20&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🌐 Browser Testing (After Login)

1. **Login first** to get JWT token
2. Open browser console (F12)
3. Run this JavaScript:

```javascript
// Replace YOUR_JWT_TOKEN with actual token
const token = 'YOUR_JWT_TOKEN';

// Test pagination
fetch('http://localhost:5000/api/users?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Pagination Info:', data.pagination);
  console.log('Data Count:', data.data.length);
  console.log('Total Items:', data.pagination.totalItems);
});
```

---

## 📊 Postman Collection

### Step 1: Create Environment Variables
- `base_url`: `http://localhost:5000`
- `token`: Your JWT token

### Step 2: Create Requests

#### Request 1: Get Users (Page 1)
```
GET {{base_url}}/api/users?page=1&limit=10
Headers:
  Authorization: Bearer {{token}}
```

#### Request 2: Get Users (Page 2)
```
GET {{base_url}}/api/users?page=2&limit=10
Headers:
  Authorization: Bearer {{token}}
```

#### Request 3: Get Users with Sorting
```
GET {{base_url}}/api/users?page=1&limit=10&sortBy=name&sortOrder=asc
Headers:
  Authorization: Bearer {{token}}
```

---

## ✅ Checklist for Testing

- [ ] Default pagination works (no params)
- [ ] Page parameter works correctly
- [ ] Limit parameter works correctly
- [ ] Sorting works (sortBy and sortOrder)
- [ ] First page shows hasPrevPage: false
- [ ] Last page shows hasNextPage: false
- [ ] Middle pages show both hasNextPage and hasPrevPage: true
- [ ] Negative page numbers default to 1
- [ ] Zero page number defaults to 1
- [ ] Very large page numbers return empty data
- [ ] Negative limit defaults to 10
- [ ] Zero limit defaults to 10
- [ ] Limit over 100 caps at 100
- [ ] Total items count is correct
- [ ] Total pages calculation is correct
- [ ] Data count matches itemsPerPage
- [ ] All endpoints support pagination

---

## 🐛 Common Issues to Check

1. **Empty Database**: If no data, should return empty array with pagination info
2. **Single Page**: If total items < limit, should show only 1 page
3. **Exact Multiple**: If total items = limit * pages, pagination should be correct
4. **Remainder**: If total items % limit != 0, last page should have correct count

---

## 📝 Expected Response Structure

Every paginated response should have:
```json
{
  "success": true,
  "count": <total_items>,
  "pagination": {
    "currentPage": <number>,
    "totalPages": <number>,
    "totalItems": <number>,
    "itemsPerPage": <number>,
    "hasNextPage": <boolean>,
    "hasPrevPage": <boolean>,
    "nextPage": <number | null>,
    "prevPage": <number | null>
  },
  "data": [<array_of_items>]
}
```

---

## 🚀 Quick Test Script

Save this as `test-pagination.js` and run: `node test-pagination.js`

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TOKEN = 'YOUR_JWT_TOKEN'; // Replace with actual token

async function testPagination() {
  try {
    console.log('🧪 Testing Pagination...\n');

    // Test 1: Default pagination
    console.log('Test 1: Default pagination');
    const res1 = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Default:', res1.data.pagination);
    console.log('Data count:', res1.data.data.length, '\n');

    // Test 2: Page 2
    console.log('Test 2: Page 2, Limit 20');
    const res2 = await axios.get(`${BASE_URL}/api/users?page=2&limit=20`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Page 2:', res2.data.pagination);
    console.log('Data count:', res2.data.data.length, '\n');

    // Test 3: Sorting
    console.log('Test 3: Sorting by name');
    const res3 = await axios.get(`${BASE_URL}/api/users?sortBy=name&sortOrder=asc`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Sorted:', res3.data.pagination);
    console.log('First user name:', res3.data.data[0]?.name, '\n');

    // Test 4: Edge case - invalid page
    console.log('Test 4: Invalid page (-1)');
    const res4 = await axios.get(`${BASE_URL}/api/users?page=-1`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Invalid page handled:', res4.data.pagination.currentPage, '\n');

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPagination();
```

---

## 📱 Frontend Testing

If you have a frontend, test these scenarios:

1. **Page Navigation**: Click next/prev buttons
2. **Page Size Change**: Change items per page
3. **Sorting**: Click column headers to sort
4. **Edge Cases**: Go to first/last page
5. **Empty State**: Test with no data
6. **Loading States**: Check loading indicators

---

## 🎯 Performance Testing

Test with large datasets:
- 1000+ records
- 10,000+ records
- Verify response time < 500ms
- Check memory usage

---

## 📞 Need Help?

If pagination is not working:
1. Check server logs for errors
2. Verify JWT token is valid
3. Check database connection
4. Verify query parameters format
5. Check pagination utility file exists
