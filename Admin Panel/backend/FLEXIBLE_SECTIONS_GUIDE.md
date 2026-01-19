# Flexible Sections Guide - Backend Stable, No Model Changes Needed

## 🎯 Overview

Ab sections ka enum remove kar diya gaya hai. Ab aap **koi bhi section type** add kar sakte hain **bina backend model change kiye**.

## ✅ What Changed

### Before (Fixed Enum):
```javascript
sections: [{
  type: {
    type: String,
    enum: ['hero_section', 'form_section', 'why_choose_us', 'slider_card'], // ❌ Fixed
  }
}]
```

**Problem:** Naya section type add karne ke liye model change karna padta tha.

### After (Flexible):
```javascript
sections: [{
  type: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    // ✅ No enum - koi bhi section type allowed
  }
}]
```

**Benefit:** Koi bhi section type add karo, model change ki zarurat nahi!

## 📝 How to Use

### Example 1: Existing Section Types (Still Work)
```json
{
  "sections": [
    {
      "type": "hero_section",
      "data": { "title": "Welcome" },
      "order": 0
    },
    {
      "type": "form_section",
      "data": { "formId": "contact" },
      "order": 1
    }
  ]
}
```

### Example 2: New Section Types (No Model Change Needed!)
```json
{
  "sections": [
    {
      "type": "testimonials",  // ✅ Naya type - directly use karo!
      "data": {
        "testimonials": [
          { "name": "John", "review": "Great!" }
        ]
      },
      "order": 2
    },
    {
      "type": "faq",  // ✅ Naya type
      "data": {
        "questions": [
          { "q": "What is this?", "a": "A service" }
        ]
      },
      "order": 3
    },
    {
      "type": "pricing",  // ✅ Naya type
      "data": {
        "plans": [
          { "name": "Basic", "price": 99 }
        ]
      },
      "order": 4
    },
    {
      "type": "gallery",  // ✅ Naya type
      "data": {
        "images": ["url1", "url2"]
      },
      "order": 5
    },
    {
      "type": "team",  // ✅ Naya type
      "data": {
        "members": [
          { "name": "Alice", "role": "CEO" }
        ]
      },
      "order": 6
    }
  ]
}
```

## 🚀 Benefits

1. **✅ Backend Stable:** Model change ki zarurat nahi
2. **✅ Flexible:** Koi bhi section type add karo
3. **✅ Scalable:** Future pages ke liye ready
4. **✅ No Migration:** Existing data kaam karta rahega

## 📋 Common Section Types

Aap yeh section types use kar sakte hain (ya koi bhi naya add karo):

### Existing Types:
- `hero_section` - Hero/banner section
- `form_section` - Contact/form section
- `why_choose_us` - Features/benefits section
- `slider_card` - Image/content slider

### New Types (Examples):
- `testimonials` - Customer reviews
- `faq` - Frequently asked questions
- `pricing` - Pricing plans
- `gallery` - Image gallery
- `team` - Team members
- `services` - Services list
- `blog` - Blog posts
- `stats` - Statistics/numbers
- `cta` - Call to action
- `video` - Video section
- `map` - Location map
- `timeline` - Timeline/history
- `partners` - Partners/clients logos

**Ya koi bhi custom type!**

## 🔧 API Usage

### Create Page with Flexible Sections

```javascript
POST /api/page-information

{
  "title": "About Us",
  "slug": "about",
  "pageType": "about_page",
  "sections": [
    {
      "type": "hero_section",
      "data": { "title": "About Our Company" },
      "order": 0
    },
    {
      "type": "team",  // ✅ Naya type - directly use!
      "data": {
        "members": [
          { "name": "John Doe", "role": "CEO", "image": "url" }
        ]
      },
      "order": 1
    },
    {
      "type": "testimonials",  // ✅ Naya type
      "data": {
        "testimonials": [
          { "text": "Great service!", "author": "Client" }
        ]
      },
      "order": 2
    }
  ]
}
```

### Update Page with New Sections

```javascript
PUT /api/page-information/:id

{
  "sections": [
    ...existingSections,
    {
      "type": "faq",  // ✅ Naya section add karo
      "data": {
        "questions": [
          { "q": "Question?", "a": "Answer" }
        ]
      },
      "order": 10
    }
  ]
}
```

## 💡 Frontend Implementation

Frontend mein bhi schema flexible hai:

```typescript
// Frontend schema - ab enum nahi, string allowed
export const pageSectionSchema = z.object({
  type: z.string().min(1).toLowerCase(), // ✅ Flexible
  data: z.record(z.any()),
  order: z.number().default(0),
})
```

### Frontend Usage:

```tsx
// Koi bhi section type render karo
{pageData.sections.map((section) => {
  switch (section.type) {
    case 'hero_section':
      return <HeroSection data={section.data} />
    case 'testimonials':  // ✅ Naya type
      return <Testimonials data={section.data} />
    case 'faq':  // ✅ Naya type
      return <FAQ data={section.data} />
    default:
      return <GenericSection type={section.type} data={section.data} />
  }
})}
```

## ⚠️ Important Notes

1. **Type Naming:**
   - Lowercase use karo: `testimonials` ✅, `Testimonials` ❌
   - Underscore allowed: `hero_section` ✅
   - Hyphen allowed: `call-to-action` ✅

2. **Data Structure:**
   - `data` field flexible hai - koi bhi structure use karo
   - Frontend mein type ke according render karo

3. **Order:**
   - `order` field se sections ko sort karo
   - Lower number = higher priority

4. **Backward Compatibility:**
   - Existing sections kaam karte rahenge
   - Koi migration ki zarurat nahi

## 🎯 Summary

- ✅ **Backend Model:** Enum removed, flexible string
- ✅ **Frontend Schema:** Enum removed, flexible string
- ✅ **No Breaking Changes:** Existing data kaam karta rahega
- ✅ **Future Proof:** Koi bhi naya section type add karo

**Ab backend stable hai - har naye section type ke liye model change ki zarurat nahi!** 🚀
