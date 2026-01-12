# Add Functionality Guide - Courses, Programs, Countries, Universities

Yeh guide aapko batayega ki kaise courses, programs, countries, aur universities add kar sakte hain.

## 📋 Available Endpoints

### 1. Add University
**POST** `/api/universities`
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "name": "Harvard University",
  "country": "USA",
  "city": "Cambridge",
  "description": "Prestigious university",
  "status": "Active"
}
```

**Required Fields:**
- `name` (String) - University name
- `country` (String) - Country name
- `city` (String) - City name

**Optional Fields:**
- `description` (String)
- `status` (String) - "Active" or "Inactive" (default: "Active")

**Success Response (201):**
```json
{
  "success": true,
  "message": "University created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Harvard University",
    "country": "USA",
    "city": "Cambridge",
    "status": "Active",
    "students": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Add Country
**POST** `/api/countries`
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "name": "United States",
  "code": "US",
  "currency": "USD",
  "status": "Active"
}
```

**Required Fields:**
- `name` (String) - Country name (must be unique)
- `code` (String) - Country code, 2-3 characters (must be unique, auto-uppercase)
- `currency` (String) - Currency code

**Optional Fields:**
- `status` (String) - "Active" or "Inactive" (default: "Active")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Country created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "United States",
    "code": "US",
    "currency": "USD",
    "status": "Active",
    "universities": 0,
    "students": 0
  }
}
```

**Note:** Country code automatically converts to uppercase (e.g., "us" becomes "US")

---

### 3. Add Course
**POST** `/api/courses`
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "name": "Web Development",
  "code": "WEB101",
  "university": "65a1b2c3d4e5f6g7h8i9j0k1",
  "duration": "6 months",
  "price": 1000,
  "description": "Learn web development",
  "status": "Active"
}
```

**Required Fields:**
- `name` (String) - Course name
- `code` (String) - Course code (must be unique)
- `university` (ObjectId) - University ID (must exist)
- `duration` (String) - Course duration
- `price` (Number) - Course price (must be >= 0)

**Optional Fields:**
- `description` (String)
- `status` (String) - "Active" or "Inactive" (default: "Active")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Web Development",
    "code": "WEB101",
    "university": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Harvard University"
    },
    "duration": "6 months",
    "price": 1000,
    "status": "Active",
    "students": 0
  }
}
```

**⚠️ Important:** 
- University ID must be a valid MongoDB ObjectId
- University must exist in database
- Course code must be unique

---

### 4. Add Program
**POST** `/api/programs`
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "name": "Computer Science",
  "type": "Undergraduate",
  "university": "65a1b2c3d4e5f6g7h8i9j0k1",
  "duration": "4 years",
  "description": "Bachelor's degree in Computer Science",
  "status": "Active"
}
```

**Required Fields:**
- `name` (String) - Program name
- `type` (String) - Must be one of: "Undergraduate", "Graduate", "Doctorate", "Certificate"
- `university` (ObjectId) - University ID (must exist)
- `duration` (String) - Program duration

**Optional Fields:**
- `description` (String)
- `status` (String) - "Active" or "Inactive" (default: "Active")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Program created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Computer Science",
    "type": "Undergraduate",
    "university": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Harvard University"
    },
    "duration": "4 years",
    "status": "Active",
    "students": 0
  }
}
```

**Valid Program Types:**
- `Undergraduate`
- `Graduate`
- `Doctorate`
- `Certificate`

---

## 🧪 Testing Examples

### Example 1: Complete Flow (University → Course)

**Step 1: Create University**
```http
POST http://localhost:5000/api/universities
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "MIT",
  "country": "USA",
  "city": "Cambridge"
}
```

**Response:** Copy the `_id` from response (e.g., `"65a1b2c3d4e5f6g7h8i9j0k1"`)

**Step 2: Create Course**
```http
POST http://localhost:5000/api/courses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Data Science",
  "code": "DS101",
  "university": "65a1b2c3d4e5f6g7h8i9j0k1",
  "duration": "12 months",
  "price": 5000
}
```

---

### Example 2: Create Country

```http
POST http://localhost:5000/api/countries
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "India",
  "code": "IN",
  "currency": "INR"
}
```

---

### Example 3: Create Program

```http
POST http://localhost:5000/api/programs
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "MBA",
  "type": "Graduate",
  "university": "65a1b2c3d4e5f6g7h8i9j0k1",
  "duration": "2 years"
}
```

---

## ❌ Common Errors & Solutions

### Error 1: "Please provide all required fields"
**Cause:** Missing required field
**Solution:** Check that all required fields are included in request body

### Error 2: "University not found. Please provide a valid university ID"
**Cause:** Invalid or non-existent university ID
**Solution:** 
1. First create/get a university
2. Copy the actual `_id` from response
3. Use that ID (not placeholder text like `{university_id}`)

### Error 3: "Course code already exists"
**Cause:** Course code must be unique
**Solution:** Use a different course code

### Error 4: "Country name or code already exists"
**Cause:** Country name or code must be unique
**Solution:** Use a different country name or code

### Error 5: "Program type must be one of: Undergraduate, Graduate, Doctorate, Certificate"
**Cause:** Invalid program type
**Solution:** Use one of the valid program types

### Error 6: "Price cannot be negative"
**Cause:** Price value is negative
**Solution:** Use price >= 0

### Error 7: "Country code must be 2-3 characters long"
**Cause:** Country code length invalid
**Solution:** Use 2-3 character country code (e.g., "US", "IN", "GBR")

---

## 📝 Field Validation Summary

### University
- ✅ `name` - Required, String
- ✅ `country` - Required, String
- ✅ `city` - Required, String
- ⚪ `description` - Optional, String
- ⚪ `status` - Optional, "Active" | "Inactive" (default: "Active")

### Country
- ✅ `name` - Required, String, Unique
- ✅ `code` - Required, String, Unique, 2-3 chars, Auto-uppercase
- ✅ `currency` - Required, String
- ⚪ `status` - Optional, "Active" | "Inactive" (default: "Active")

### Course
- ✅ `name` - Required, String
- ✅ `code` - Required, String, Unique
- ✅ `university` - Required, ObjectId (must exist)
- ✅ `duration` - Required, String
- ✅ `price` - Required, Number, >= 0
- ⚪ `description` - Optional, String
- ⚪ `status` - Optional, "Active" | "Inactive" (default: "Active")

### Program
- ✅ `name` - Required, String
- ✅ `type` - Required, "Undergraduate" | "Graduate" | "Doctorate" | "Certificate"
- ✅ `university` - Required, ObjectId (must exist)
- ✅ `duration` - Required, String
- ⚪ `description` - Optional, String
- ⚪ `status` - Optional, "Active" | "Inactive" (default: "Active")

---

## 🔄 Order of Creation

For best results, create in this order:

1. **Countries** (if needed)
2. **Universities** (requires country name)
3. **Courses** (requires university ID)
4. **Programs** (requires university ID)

---

## ✅ Success Checklist

- [ ] All required fields provided
- [ ] University ID is valid (for courses/programs)
- [ ] Unique fields (course code, country name/code) are unique
- [ ] Price is non-negative (for courses)
- [ ] Program type is valid (for programs)
- [ ] Country code is 2-3 characters (for countries)
- [ ] Authentication token is valid

---

**Happy Adding! 🎉**
