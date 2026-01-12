# Postman Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Import the `POSTMAN_API_DOCUMENTATION.md` file or manually create requests

### Step 2: Create Environment
1. Click **Environments** → **Create Environment**
2. Name: `C-way Admin API`
3. Add variables:
   - `base_url` = `http://localhost:5000/api`
   - `token` = (leave empty)

### Step 3: Test Health Check
```
GET {{base_url}}/health
```
Should return: `{"status":"OK","message":"Server is running"}`

### Step 4: Login & Get Token
```
POST {{base_url}}/auth/login
Body (JSON):
{
  "email": "admin@gateway.com",
  "role": "admin"
}
```

**Note:** Password is not required, only email and role!

**Copy the token from response!**

### Step 5: Set Token in Environment
1. Copy token from login response
2. Go to Environment → Edit
3. Set `token` variable value
4. Save

### Step 6: Test Authenticated Endpoint
```
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

---

## 📋 Test Credentials

| Role | Email |
|------|-------|
| Admin | `admin@gateway.com` |
| Manager | `manager@gateway.com` |
| Counsellor | `counsellor@gateway.com` |

**Note:** Password is not required for login, only email and role!

---

## 🔑 Common Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (get token)
- `GET /api/auth/me` - Get current user

### Users (Admin only for create/update/delete)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Other Resources
- `GET /api/wallets` - Get all wallets
- `GET /api/universities` - Get all universities
- `GET /api/courses` - Get all courses
- `GET /api/programs` - Get all programs
- `GET /api/countries` - Get all countries
- `GET /api/support` - Get all support tickets

### Purchases & Rewards
- `POST /api/purchases` - Purchase a course/program (Student only, supports coupon codes)
- `GET /api/purchases/my-purchases` - Get my purchases
- `GET /api/rewards/my-rewards` - Get my rewards
- `POST /api/rewards/redeem-points` - Redeem points to cashback
- `GET /api/rewards/statistics` - Get reward statistics (Admin/Manager)

### Coupons (Admin for create/update/delete)
- `GET /api/coupons` - Get all coupons
- `GET /api/coupons/:id` - Get single coupon
- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/coupons` - Create coupon (Admin)
- `PUT /api/coupons/:id` - Update coupon (Admin)
- `DELETE /api/coupons/:id` - Delete coupon (Admin)

---

## 📝 Request Examples

### Login Request
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@gateway.com",
  "role": "admin"
}
```

**Note:** Password is not required!

### Authenticated Request
```http
GET http://localhost:5000/api/users
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create User (Admin)
```http
POST http://localhost:5000/api/users
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "counsellor"
}
```

---

## ⚡ Auto-Save Token Script

Add this to **Tests** tab in Login request:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    console.log("✅ Token saved:", jsonData.token);
}
```

Now token will be saved automatically after login!

---

## 🐛 Common Issues

### 401 Unauthorized
- Token expired or invalid
- Missing Authorization header
- **Fix:** Login again to get new token

### 403 Forbidden
- Endpoint requires admin role
- **Fix:** Login with admin credentials

### 404 Not Found
- Wrong endpoint URL
- Resource doesn't exist
- **Fix:** Check URL and resource ID

### 500 Server Error
- Server not running
- Database connection issue
- **Fix:** Check server logs

---

## 📚 Full Documentation

See `POSTMAN_API_DOCUMENTATION.md` for complete API documentation with all endpoints, request/response examples, and detailed explanations.

---

## ✅ Testing Checklist

- [ ] Health check works
- [ ] Can login with admin credentials
- [ ] Token is saved automatically
- [ ] Can get current user
- [ ] Can get all users
- [ ] Can create user (admin)
- [ ] Can update user (admin)
- [ ] Can delete user (admin)
- [ ] Test other endpoints (wallets, universities, etc.)

---

**Happy Testing! 🎉**
