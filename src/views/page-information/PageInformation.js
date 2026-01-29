import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CAlert,
  CSpinner,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowTop,
  cilPlus,
  cilSave,
  cilX,
  cilTrash,
  cilSearch,
} from '@coreui/icons'
import pageInformationService from '../../services/pageInformationService'
import uploadService from '../../services/uploadService'

// Page Information Form Structure JSON
const pageInformationFormStructure = {
  "Load Existing Page": {
    "heading": "Load Existing Page",
    "shortDescription": "Enter the page ID from the database to load and edit existing page data including images",
    "containerClass": "input_container_bx",
    "form-feild": [
      {
        "label": "Page ID",
        "width": "col_width100",
        "placeHolder": "Enter Page ID to load existing page",
        "id": "pageId",
        "type": "text",
        "value": "",
        "name": "pageId",
        "attributes": "",
        "validation": {
          "required": "Page ID is required to load existing page"
        },
        "pattern": {
          "message": ""
        },
        "patternValue": ""
      }
    ]
  },
  "Basic Information": {
    "heading": "Basic Information",
    "shortDescription": "Enter the basic details for your page",
    "containerClass": "input_container_bx",
    "form-feild": [
      {
        "label": "Page Type *",
        "width": "col_width50",
        "placeHolder": "",
        "id": "pageType",
        "type": "select",
        "value": "",
        "name": "pageType",
        "option": [
          "home_page",
          "about_page",
          "contact_page",
          "city_page",
          "ivy_league",
          "usa_universities",
          "uk_universities",
          "germany_public_universities",
          "italy_france",
          "canada_australia",
          "other"
        ],
        "attributes": "",
        "validation": {
          "required": "Page type is required"
        }
      },
      {
        "label": "Status *",
        "width": "col_width50",
        "placeHolder": "",
        "id": "status",
        "type": "select",
        "value": "",
        "name": "status",
        "option": ["Draft", "Published"],
        "attributes": "",
        "validation": {
          "required": "Status is required"
        }
      },
      {
        "label": "Title *",
        "width": "col_width100",
        "placeHolder": "Enter page title",
        "id": "title",
        "type": "text",
        "value": "",
        "name": "title",
        "attributes": "",
        "validation": {
        
          "maxLength": {
            "value": 200,
            "message": "The length of Title must be 200 characters or fewer."
          }
        },
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Sub Title",
        "width": "col_width100",
        "placeHolder": "Enter sub title",
        "id": "subTitle",
        "type": "text",
        "value": "",
        "name": "subTitle",
        "attributes": "",
        "validation": {
          "maxLength": {
            "value": 300,
            "message": "The length of Sub Title must be 300 characters or fewer."
          }
        },
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Slug *",
        "width": "col_width100",
        "placeHolder": "page-slug",
        "id": "slug",
        "type": "text",
        "value": "",
        "name": "slug",
        "attributes": "",
        "validation": {
          "required": "Slug is required",
          "maxLength": {
            "value": 100,
            "message": "The length of Slug must be 100 characters or fewer."
          }
        },
        "pattern": {
          "message": "Slug must contain only lowercase letters, numbers, and hyphens"
        },
        "patternValue": "^[a-z0-9-]+$"
      },
      {
        "label": "Is Featured",
        "width": "col_width50",
        "placeHolder": "",
        "id": "isFeatured",
        "type": "select",
        "value": "",
        "name": "isFeatured",
        "option": ["Yes", "No"],
        "attributes": "",
        "validation": {}
      },
      {
        "label": "Meta Title",
        "width": "col_width100",
        "placeHolder": "Enter meta title",
        "id": "metaTitle",
        "type": "text",
        "value": "",
        "name": "metaTitle",
        "attributes": "",
        "validation": {
          "maxLength": {
            "value": 60,
            "message": "The length of Meta Title must be 60 characters or fewer for optimal SEO."
          }
        },
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Meta Description",
        "width": "col_width100",
        "placeHolder": "Enter meta description",
        "id": "metaDescription",
        "type": "textarea",
        "value": "",
        "name": "metaDescription",
        "attributes": "",
        "validation": {
          "maxLength": {
            "value": 160,
            "message": "The length of Meta Description must be 160 characters or fewer for optimal SEO."
          }
        },
        "pattern": { "message": "" },
        "patternValue": ""
      }
    ]
  },
  "Home Page Images": {
    "heading": "Home Page Images",
    "shortDescription": "Upload images for your page (conditional based on page type)",
    "containerClass": "input_container_bx",
    "form-feild": [
      {
        "label": "Hero Image",
        "width": "col_width100",
        "placeHolder": "",
        "id": "heroImage",
        "type": "file",
        "value": "",
        "name": "heroImage",
        "attributes": "accept='image/*'",
        "validation": {},
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Roadmap Image",
        "width": "col_width100",
        "placeHolder": "",
        "id": "roadmapImage",
        "type": "file",
        "value": "",
        "name": "roadmapImage",
        "attributes": "accept='image/*'",
        "validation": {},
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Mobile Roadmap Image",
        "width": "col_width100",
        "placeHolder": "",
        "id": "mobileRoadmapImage",
        "type": "file",
        "value": "",
        "name": "mobileRoadmapImage",
        "attributes": "accept='image/*'",
        "validation": {},
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "University Cap Background",
        "width": "col_width100",
        "placeHolder": "",
        "id": "universityCapBg",
        "type": "file",
        "value": "",
        "name": "universityCapBg",
        "attributes": "accept='image/*'",
        "validation": {},
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "University Slider Background",
        "width": "col_width100",
        "placeHolder": "",
        "id": "universitySliderBg",
        "type": "file",
        "value": "",
        "name": "universitySliderBg",
        "attributes": "accept='image/*'",
        "validation": {},
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Immigration Services Background",
        "width": "col_width100",
        "placeHolder": "",
        "id": "immigrationServicesBg",
        "type": "file",
        "value": "",
        "name": "immigrationServicesBg",
        "attributes": "accept='image/*'",
        "validation": {},
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Immigration IMG1",
        "width": "col_width100",
        "placeHolder": "",
        "id": "immigrationServices1Bg",  // ✅ CORRECT
        "type": "file",
        "value": "",
        "name": "immigrationServices1Bg", // ✅ CORRECT
        "attributes": "accept='image/*'",
        "validation": {},
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Immigration IMG2",
        "width": "col_width100",
        "placeHolder": "",
        "id": "immigrationServices2Bg",  // ✅ CORRECT
        "type": "file",
        "value": "",
        "name": "immigrationServices2Bg", // ✅ CORRECT
        "attributes": "accept='image/*'",
        "validation": {},
        "pattern": { "message": "" },
        "patternValue": ""
      }
    ]
  },
  "Sections Fields": {
    "heading": "Sections Fields",
    "shortDescription": "Add dynamic content sections to your page",
    "containerClass": "input_container_bx",
    "form-feild": [
      { "label": "Hero Section", "width": "col_width100", "placeHolder": "", "id": "hero_section", "type": "button", "value": "Add Hero Section", "name": "hero_section", "sectionType": "hero_section", "attributes": "", "validation": {} },
      { "label": "Form Section", "width": "col_width100", "placeHolder": "", "id": "form_section", "type": "button", "value": "Add Form Section", "name": "form_section", "sectionType": "form_section", "attributes": "", "validation": {} },
      { "label": "Why Choose Us", "width": "col_width100", "placeHolder": "", "id": "why_choose_us", "type": "button", "value": "Add Why Choose Us", "name": "why_choose_us", "sectionType": "why_choose_us", "attributes": "", "validation": {} },
      { "label": "Slider Card", "width": "col_width100", "placeHolder": "", "id": "slider_card", "type": "button", "value": "Add Slider Card", "name": "slider_card", "sectionType": "slider_card", "attributes": "", "validation": {} },
      { "label": "Road-map", "width": "col_width100", "placeHolder": "", "id": "road-map", "type": "button", "value": "Add Road-map", "name": "road-map", "sectionType": "road-map", "attributes": "", "validation": {} },
      { "label": "Content", "width": "col_width100", "placeHolder": "", "id": "content", "type": "button", "value": "Add Content", "name": "content", "sectionType": "content", "attributes": "", "validation": {} },
      { "label": "Statistics", "width": "col_width100", "placeHolder": "", "id": "statistics", "type": "button", "value": "Add Statistics", "name": "statistics", "sectionType": "statistics", "attributes": "", "validation": {} },
      { "label": "Comparison Table", "width": "col_width100", "placeHolder": "", "id": "comparison_table", "type": "button", "value": "Add Comparison Table", "name": "comparison_table", "sectionType": "comparison_table", "attributes": "", "validation": {} },
      { "label": "Blog/News", "width": "col_width100", "placeHolder": "", "id": "blog_section", "type": "button", "value": "Add Blog/News", "name": "blog_section", "sectionType": "blog_section", "attributes": "", "validation": {} },
      { "label": "Requirements", "width": "col_width100", "placeHolder": "", "id": "requirements", "type": "button", "value": "Add Requirements", "name": "requirements", "sectionType": "requirements", "attributes": "", "validation": {} },
      { "label": "Testimonials", "width": "col_width100", "placeHolder": "", "id": "testimonials", "type": "button", "value": "Add Testimonials", "name": "testimonials", "sectionType": "testimonials", "attributes": "", "validation": {} },
      { "label": "Case Studies", "width": "col_width100", "placeHolder": "", "id": "case_studies", "type": "button", "value": "Add Case Studies", "name": "case_studies", "sectionType": "case_studies", "attributes": "", "validation": {} },
      { "label": "CTA Section", "width": "col_width100", "placeHolder": "", "id": "cta_section", "type": "button", "value": "Add CTA Section", "name": "cta_section", "sectionType": "cta_section", "attributes": "", "validation": {} },
      { "label": "Track Record", "width": "col_width100", "placeHolder": "", "id": "track_record", "type": "button", "value": "Add Track Record", "name": "track_record", "sectionType": "track_record", "attributes": "", "validation": {} },
      { "label": "University Partners", "width": "col_width100", "placeHolder": "", "id": "university_partners", "type": "button", "value": "Add University Partners", "name": "university_partners", "sectionType": "university_partners", "attributes": "", "validation": {} },
      { "label": "Immigration Services bg1", "width": "col_width100", "placeHolder": "", "id": "immigration_services", "type": "button", "value": "Add Immigration Services", "name": "immigration_services", "sectionType": "immigration_services", "attributes": "", "validation": {} },
      { "label": "Video Testimonials", "width": "col_width100", "placeHolder": "", "id": "video_testimonials", "type": "button", "value": "Add Video Testimonials", "name": "video_testimonials", "sectionType": "video_testimonials", "attributes": "", "validation": {} },
      { "label": "Image Testimonials", "width": "col_width100", "placeHolder": "", "id": "image_testimonials", "type": "button", "value": "Add Image Testimonials", "name": "image_testimonials", "sectionType": "image_testimonials", "attributes": "", "validation": {} },
      { "label": "Top Universities", "width": "col_width100", "placeHolder": "", "id": "top_universities", "type": "button", "value": "Add Top Universities", "name": "top_universities", "sectionType": "top_universities", "attributes": "", "validation": {} }
    ]
  },
  "SEO and Metadata Fields": {
    "heading": "SEO and Metadata Fields",
    "shortDescription": "Configure SEO settings and metadata for better search engine visibility",
    "containerClass": "input_container_bx",
    "form-feild": [
      {
        "label": "Keywords (comma-separated)",
        "width": "col_width100",
        "placeHolder": "seo, marketing, education",
        "id": "keywords",
        "type": "text",
        "value": "",
        "name": "keywords",
        "attributes": "",
        "validation": {
          "maxLength": {
            "value": 500,
            "message": "The length of Keywords must be 500 characters or fewer."
          }
        },
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Tags (comma-separated)",
        "width": "col_width100",
        "placeHolder": "blog, featured, news",
        "id": "tags",
        "type": "text",
        "value": "",
        "name": "tags",
        "attributes": "",
        "validation": {
          "maxLength": {
            "value": 500,
            "message": "The length of Tags must be 500 characters or fewer."
          }
        },
        "pattern": { "message": "" },
        "patternValue": ""
      },
      {
        "label": "Canonical URL",
        "width": "col_width100",
        "placeHolder": "https://example.com/page",
        "id": "canonicalUrl",
        "type": "url",
        "value": "",
        "name": "canonicalUrl",
        "attributes": "",
        "validation": {
          "maxLength": {
            "value": 500,
            "message": "The length of Canonical URL must be 500 characters or fewer."
          }
        },
        "pattern": {
          "message": "Please enter a valid URL"
        },
        "patternValue": "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$"
      }
    ]
  }
}

const PageInformation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  // Get page ID from URL query params if available
  const urlParams = new URLSearchParams(location.search)
  const urlPageId = urlParams.get('id')
  const [pageId, setPageId] = useState(urlPageId || '')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(pageId || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingRoadmap, setUploadingRoadmap] = useState(false)
  const [uploadingMobileRoadmap, setUploadingMobileRoadmap] = useState(false)
  const [uploadingUniversityCapBg, setUploadingUniversityCapBg] = useState(false)
  const [uploadingUniversitySliderBg, setUploadingUniversitySliderBg] = useState(false)
  const [uploadingImmigrationServicesBg, setUploadingImmigrationServicesBg] = useState(false)
  const [uploadingImmigrationServices1Bg, setUploadingImmigrationServices1Bg] = useState(false)
  const [uploadingImmigrationServices2Bg, setUploadingImmigrationServices2Bg] = useState(false)
  const [deletingImages, setDeletingImages] = useState({})

  const [formData, setFormData] = useState({
    pageType: 'home_page',
    title: '',
    subTitle: '',
    navbarTitle: '',
    route: '',
    hasDropdown: false,
    slug: '',
    metaTitle: '',
    metaDescription: '',
    status: 'Draft',
    isFeatured: 'No',
    heroImage: '',
    heroImagePublicId: '',
    roadmapImage: '',
    roadmapImagePublicId: '',
    mobileRoadmapImage: '',
    mobileRoadmapImagePublicId: '',
    universityCapBg: '',
    universityCapBgPublicId: '',
    universitySliderBg: '',
    universitySliderBgPublicId: '',
    immigrationServicesBg: '',
    immigrationServices1Bg: '',
    immigrationServices1BgPublicId: '',
    immigrationServices2Bg: '',
    immigrationServices2BgPublicId: '',
    immigrationServicesBgPublicId: '',

    keywords: '',
    tags: '',
    canonicalUrl: '',
  })

  const [sections, setSections] = useState([])

  // Display form structure JSON when on /add route
  useEffect(() => {
    // Check if we're on the add page route
    const isAddPage = location.pathname.includes('/pages/add') || location.pathname.includes('/page-information') && !location.search.includes('id=')
    
    if (isAddPage) {
      // Log form structure JSON for Network tab visibility
      console.log('📋 Page Information Form Structure JSON:', JSON.stringify(pageInformationFormStructure, null, 2))
      console.log('📊 Form Structure Summary:', {
        sections: Object.keys(pageInformationFormStructure).length,
        totalFields: Object.values(pageInformationFormStructure).reduce((sum, section) => sum + (section['form-feild']?.length || 0), 0),
        sectionNames: Object.keys(pageInformationFormStructure)
      })
      
      // Make form structure available globally for console access
      window.pageInformationFormStructure = pageInformationFormStructure
      window.getPageInfoFormData = () => {
        return {
          formStructure: pageInformationFormStructure,
          currentFormData: formData,
          currentSections: sections,
          formDataJSON: JSON.stringify({
            formStructure: pageInformationFormStructure,
            currentFormData: formData,
            currentSections: sections
          }, null, 2)
        }
      }
      
      // Add helper function to fetch page information with auth
      window.fetchPageInfoWithAuth = async (pageId = null, params = {}) => {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('❌ No auth token found. Please login first.')
          return null
        }
        
        const baseURL = window.location.protocol + '//' + window.location.hostname + ':5000/api'
        let url = `${baseURL}/page-information`
        
        if (pageId) {
          url = `${baseURL}/page-information/${pageId}`
        } else {
          const queryParams = new URLSearchParams(params).toString()
          if (queryParams) {
            url += `?${queryParams}`
          }
        }
        
        try {
          console.log('🌐 Fetching page information with auth token...')
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          const data = await response.json()
          console.log('✅ Page Information Response:', data)
          console.log('📋 Complete JSON:', JSON.stringify(data, null, 2))
          
          // Store in sessionStorage
          sessionStorage.setItem('pageInfoResponse', JSON.stringify(data))
          
          return data
        } catch (error) {
          console.error('❌ Error fetching page information:', error)
          return null
        }
      }
      
      // Add helper function to show sections array structure and examples
      window.getSectionsExamples = () => {
        return {
          structure: {
            description: "Sections array structure in MongoDB",
            example: {
              sections: [
                {
                  type: "hero_section",
                  order: 1,
                  data: {
                    title: "Welcome to Our Website",
                    subTitle: "Your Journey Starts Here",
                    description: "This is a hero section description",
                    ctaText: "Get Started",
                    ctaLink: "/contact",
                    backgroundImage: "https://example.com/image.jpg",
                    backgroundImagePublicId: "folder/image-id"
                  }
                },
                {
                  type: "track_record",
                  order: 2,
                  data: {
                    title: "IVY COACH'S COLLEGE ADMISSIONS TRACK RECORD",
                    description: "Our success rate",
                    totalOffers: "1,485",
                    successRate: "98%"
                  }
                },
                {
                  type: "testimonials",
                  order: 3,
                  data: {
                    title: "What Our Students Say",
                    items: [
                      {
                        name: "John Doe",
                        text: "Great experience",
                        image: "https://example.com/testimonial.jpg"
                      }
                    ]
                  }
                }
              ]
            }
          },
          availableTypes: [
            "hero_section",
            "form_section",
            "why_choose_us",
            "slider_card",
            "road-map",
            "content",
            "statistics",
            "comparison_table",
            "blog_section",
            "requirements",
            "testimonials",
            "case_studies",
            "cta_section",
            "track_record"
          ],
          howToAdd: {
            method1: {
              title: "Via Admin Panel",
              steps: [
                "1. Go to /pages/add",
                "2. Click on section buttons (e.g., '+ Add Hero Section')",
                "3. Fill in the section data",
                "4. Click 'Save Page'",
                "5. Sections will be saved in sections array"
              ]
            },
            method2: {
              title: "Via MongoDB Compass",
              steps: [
                "1. Open MongoDB Compass",
                "2. Find your page document",
                "3. Click 'UPDATE' button",
                "4. Find 'sections' field",
                "5. Replace empty array [] with section objects"
              ],
              example: [
                {
                  type: "hero_section",
                  order: 1,
                  data: {
                    title: "Your Title",
                    subTitle: "Your Subtitle",
                    description: "Description text"
                  }
                }
              ]
            },
            method3: {
              title: "Via API",
              steps: [
                "1. Use PUT /api/page-information/{id}",
                "2. Send sections array in request body",
                "3. Each section must have: type, order, data"
              ]
            }
          },
          mongoDBExample: {
            description: "How to add sections in MongoDB Compass",
            steps: [
              "1. Open your page document",
              "2. Click 'UPDATE' button",
              "3. Find 'sections' field (currently empty array)",
              "4. Replace empty array [] with:",
              "",
              "[",
              "  {",
              "    \"type\": \"hero_section\",",
              "    \"order\": 1,",
              "    \"data\": {",
              "      \"title\": \"Your Title\",",
              "      \"subTitle\": \"Your Subtitle\",",
              "      \"description\": \"Description text\"",
              "    }",
              "  }",
              "]",
              "",
              "5. Click 'UPDATE' to save"
            ]
          }
        }
      }
      
      
      // Create a comprehensive response object
      const mockResponse = {
        success: true,
        data: pageInformationFormStructure,
        message: 'Page Information Form Structure',
        timestamp: new Date().toISOString(),
        route: location.pathname
      }
      
      // Log complete JSON structure in a prominent way
      console.log('%c📋 COMPLETE PAGE INFORMATION FORM STRUCTURE JSON', 'color: #2196F3; font-weight: bold; font-size: 16px; background: #E3F2FD; padding: 5px;')
      console.log('%cAll Sections Included:', 'color: #4CAF50; font-weight: bold;')
      console.log('  1. Load Existing Page')
      console.log('  2. Basic Information')
      console.log('  3. Page Images (Home Page Images)')
      console.log('  4. Sections Fields')
      console.log('  5. SEO and Metadata Fields')
      console.log('')
      console.log(JSON.stringify(mockResponse, null, 2))
      console.log('%c📋 Copy the JSON above to use in your application', 'color: #4CAF50; font-weight: bold;')
      
      // Also log each section separately for easy access
      console.log('%c📑 Individual Sections:', 'color: #FF9800; font-weight: bold; font-size: 14px;')
      Object.keys(pageInformationFormStructure).forEach((sectionName, index) => {
        console.log(`${index + 1}. ${sectionName}:`, pageInformationFormStructure[sectionName])
      })
      
      // Log sections array structure example
      console.log('%c📋 SECTIONS ARRAY STRUCTURE:', 'color: #9C27B0; font-weight: bold; font-size: 14px; background: #F3E5F5; padding: 5px;')
      console.log('The sections field in MongoDB should be an array of objects with this structure:')
      console.log(JSON.stringify({
        sections: [
          {
            type: "hero_section",
            order: 1,
            data: {
              title: "Example Title",
              subTitle: "Example Subtitle",
              description: "Example description text",
              ctaText: "Get Started",
              ctaLink: "/contact"
            }
          },
          {
            type: "track_record",
            order: 2,
            data: {
              title: "TRACK RECORD TITLE",
              description: "Description text",
              totalOffers: "1,485",
              successRate: "98%"
            }
          }
        ]
      }, null, 2))
      console.log('%c💡 To see more examples, run: window.getSectionsExamples()', 'color: #4CAF50; font-weight: bold;')
      
      // Log as if it's an API response
      console.log('🌐 Form Structure API Response:', mockResponse)
      
      // Store form structure as "general-info" for easy access
      const jsonString = JSON.stringify(mockResponse, null, 2)
      sessionStorage.setItem('pageInformationFormStructure', jsonString)
      sessionStorage.setItem('generalInfoFormStructure', jsonString)
      sessionStorage.setItem('general-info', jsonString) // Also as "general-info"
      
      // Create downloadable JSON file
      try {
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        // Create download function
        window.downloadGeneralInfoJSON = () => {
          const link = document.createElement('a')
          link.href = url
          link.download = 'general-info-form-structure.json'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        
        // Create function to open JSON in new tab
        window.openGeneralInfoJSON = () => {
          const newWindow = window.open('', '_blank')
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>General Info - Form Structure JSON</title>
                  <style>
                    body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                    pre { background: white; padding: 15px; border-radius: 5px; overflow-x: auto; }
                    h1 { color: #2196F3; }
                  </style>
                </head>
                <body>
                  <h1>General Info - Form Structure JSON</h1>
                  <pre>${jsonString}</pre>
                </body>
              </html>
            `)
            newWindow.document.close()
          }
        }
        
        console.log('✅ General Info Form Structure ready!')
        console.log('💡 Commands:')
        console.log('  - window.downloadGeneralInfoJSON() - Download JSON file')
        console.log('  - window.openGeneralInfoJSON() - Open JSON in new tab')
        console.log('  - sessionStorage.getItem("general-info") - Get JSON string')
        
        // Also log the data URL for direct access
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`
        console.log('🔗 Data URL:', dataUrl)
        console.log('📋 Copy above URL and paste in browser to open JSON')
      } catch (error) {
        console.error('Error creating form structure:', error)
      }
    }
  }, [location.pathname, location.search])

  // Load existing page data
  useEffect(() => {
    const loadPageData = async () => {
      // If pageId exists in URL params, load the page data
      const urlParams = new URLSearchParams(location.search)
      const idFromUrl = urlParams.get('id')
      const pageIdToLoad = idFromUrl || pageId
      
      if (pageIdToLoad) {
        setLoading(true)
        setError('')
        try {
          const response = await pageInformationService.getPageInformation(pageIdToLoad)
          if (response.success && response.data) {
            const pageData = response.data
            setEditingId(pageData._id)
            setPageId(pageData._id) // Update pageId state
            
            // Populate form with existing data
            setFormData({
              pageType: pageData.pageType || 'home_page',
              title: pageData.title || '',
              subTitle: pageData.subTitle || '',
              navbarTitle: pageData.navbarTitle || '',
              slug: pageData.slug || '',
              metaTitle: pageData.metaTitle || '',
              metaDescription: pageData.metaDescription || '',
              status: pageData.status || 'Draft',
              isFeatured: pageData.isFeatured || 'No',
              heroImage: pageData.heroImage || '',
              heroImagePublicId: pageData.heroImagePublicId || '',
              roadmapImage: pageData.roadmapImage || '',
              roadmapImagePublicId: pageData.roadmapImagePublicId || '',
              mobileRoadmapImage: pageData.mobileRoadmapImage || '',
              mobileRoadmapImagePublicId: pageData.mobileRoadmapImagePublicId || '',
              universityCapBg: pageData.universityCapBg || '',
              universityCapBgPublicId: pageData.universityCapBgPublicId || '',
              universitySliderBg: pageData.universitySliderBg || '',
              universitySliderBgPublicId: pageData.universitySliderBgPublicId || '',
              immigrationServicesBg: pageData.immigrationServicesBg || '',
              immigrationServicesBgPublicId: pageData.immigrationServicesBgPublicId || '',
              immigrationServices1Bg: pageData.immigrationServices1Bg || '',
              immigrationServices1BgPublicId: pageData.immigrationServices1BgPublicId || '',
              immigrationServices2Bg: pageData.immigrationServices2Bg || '',
              immigrationServices2BgPublicId: pageData.immigrationServices2BgPublicId || '',
              sections: pageData.sections || [],
              keywords: Array.isArray(pageData.keywords) ? pageData.keywords.join(', ') : (pageData.keywords || ''),
              tags: Array.isArray(pageData.tags) ? pageData.tags.join(', ') : (pageData.tags || ''),
              canonicalUrl: pageData.canonicalUrl || '',
            })
            
            // Set sections
            setSections(pageData.sections || [])
            setSuccess('Page data loaded successfully!')
            setTimeout(() => setSuccess(''), 3000)
          }
        } catch (err) {
          setError(err.message || 'Failed to load page data')
        } finally {
          setLoading(false)
        }
      }
    }

    // Load data if pageId exists in URL or state
    loadPageData()
  }, [location.search, pageId])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    // Handle hasDropdown as boolean
    if (name === 'hasDropdown') {
      setFormData((prev) => ({ ...prev, [name]: value === 'true' || value === true }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    setError('')
  }

  // Handle image upload
  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0]
    if (!file) return
    console.log(`🔄 Starting upload for ${imageType}:`, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      imageType: imageType,
      expectedField: imageType,
      expectedPublicIdField: `${imageType}PublicId`
    })
  
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
  
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }
  
    // Map image types to their setUploading functions
    const uploadingStateMap = {
      heroImage: setUploadingHero,
      roadmapImage: setUploadingRoadmap,
      mobileRoadmapImage: setUploadingMobileRoadmap,
      universityCapBg: setUploadingUniversityCapBg,
      universitySliderBg: setUploadingUniversitySliderBg,
      immigrationServicesBg: setUploadingImmigrationServicesBg,
      immigrationServices1Bg: setUploadingImmigrationServices1Bg,
      immigrationServices2Bg: setUploadingImmigrationServices2Bg,
    }
  
    const setUploading = uploadingStateMap[imageType]
    if (setUploading) {
      setUploading(true)
    }
    setError('')
  
    try {
      const response = await uploadService.uploadImage(file)
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          [imageType]: response.data.url,
          [`${imageType}PublicId`]: response.data.publicId,
        }))
        setSuccess(`${imageType} uploaded successfully!`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image')
    } finally {
      if (setUploading) {
        setUploading(false)
      }
    }
  }

  // Handle image delete
  const handleImageDelete = async (imageType) => {
    const publicId = formData[`${imageType}PublicId`]
    if (!publicId) {
      setError('No image to delete')
      return
    }

    if (!window.confirm(`Are you sure you want to delete this ${imageType}?`)) {
      return
    }

    setDeletingImages((prev) => ({ ...prev, [imageType]: true }))
    setError('')
    setSuccess('')

    try {
      const response = await uploadService.deleteImage(publicId)
      if (response && response.success) {
        setFormData((prev) => ({
          ...prev,
          [imageType]: '',
          [`${imageType}PublicId`]: '',
        }))
        setSuccess(`${imageType} deleted successfully!`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response?.message || 'Failed to delete image')
      }
    } catch (err) {
      console.error('Delete image error:', err)
      // Provide more specific error messages
      const errorMessage = err.message || 'Failed to delete image'
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setError('Image not found or already deleted')
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        setError('Unauthorized. Please login again.')
      } else if (errorMessage.includes('Network')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setDeletingImages((prev) => ({ ...prev, [imageType]: false }))
    }
  }

  // Helper function to render image upload field with delete button
  const renderImageField = (label, imageType) => {
    const imageUrl = formData[imageType]
    const publicId = formData[`${imageType}PublicId`]
    const isDeleting = deletingImages[imageType] || false
    
    // Get uploading state based on image type
    let isUploading = false
    const uploadingStateMap = {
      heroImage: uploadingHero,
      roadmapImage: uploadingRoadmap,
      mobileRoadmapImage: uploadingMobileRoadmap,
      universityCapBg: uploadingUniversityCapBg,
      universitySliderBg: uploadingUniversitySliderBg,
      immigrationServicesBg: uploadingImmigrationServicesBg,
      immigrationServices1Bg: uploadingImmigrationServices1Bg,
      immigrationServices2Bg: uploadingImmigrationServices2Bg,
    }
    
    isUploading = uploadingStateMap[imageType] || false
    
    return (
      <CCol md={4} className="mb-3">
        <CFormLabel>{label}</CFormLabel>
        <div>
          <CButton
            color="primary"
            variant="outline"
            className="w-100 mb-2"
            onClick={() => document.getElementById(imageType).click()}
            disabled={isUploading || isDeleting}
          >
            {isUploading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              <>
                <CIcon icon={cilArrowTop} className="me-2" />
                Upload Image
              </>
            )}
          </CButton>
          <input
            type="file"
            id={imageType}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleImageUpload(e, imageType)}
          />
          {imageUrl && (
            <div className="mt-2 position-relative">
              <img
                src={imageUrl}
                alt={label}
                style={{
                  maxWidth: '100%',
                  maxHeight: '150px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                }}
              />
              <CButton
                color="danger"
                variant="ghost"
                size="sm"
                className="position-absolute top-0 end-0 m-1"
                onClick={() => handleImageDelete(imageType)}
                disabled={isDeleting}
                title="Delete Image"
              >
                {isDeleting ? (
                  <CSpinner size="sm" />
                ) : (
                  <CIcon icon={cilTrash} />
                )}
              </CButton>
            </div>
          )}
        </div>
      </CCol>
    )
  }

  // Add section
  const handleAddSection = (sectionType) => {
    const currentSections = Array.isArray(sections) ? sections : []
    const newSection = {
      type: sectionType,
      order: currentSections.length + 1,
      data: getDefaultSectionData(sectionType),
    }
    const updatedSections = [...currentSections, newSection]
    setSections(updatedSections)
    setFormData((prev) => {
      const prevSections = Array.isArray(prev.sections) ? prev.sections : []
      return {
        ...prev,
        sections: [...prevSections, newSection],
      }
    })
  }

  // Remove section
  const handleRemoveSection = (index) => {
    const currentSections = Array.isArray(sections) ? sections : []
    const newSections = currentSections.filter((_, i) => i !== index)
    setSections(newSections)
    setFormData((prev) => ({
      ...prev,
      sections: newSections,
    }))
  }

  // Load page by ID
  const handleLoadPage = async () => {
    if (!pageId) {
      setError('Please enter a page ID')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await pageInformationService.getPageInformation(pageId)
      if (response.success && response.data) {
        const pageData = response.data
        setEditingId(pageData._id)
        
        // Populate form with existing data
        setFormData({
          pageType: pageData.pageType || 'home_page',
          title: pageData.title || '',
          subTitle: pageData.subTitle || '',
          navbarTitle: pageData.navbarTitle || '',
          route: pageData.route || '',
          hasDropdown: pageData.hasDropdown || false,
          slug: pageData.slug || '',
          metaTitle: pageData.metaTitle || '',
          metaDescription: pageData.metaDescription || '',
          status: pageData.status || 'Draft',
          isFeatured: pageData.isFeatured || 'No',
          heroImage: pageData.heroImage || '',
          heroImagePublicId: pageData.heroImagePublicId || '',
          roadmapImage: pageData.roadmapImage || '',
          roadmapImagePublicId: pageData.roadmapImagePublicId || '',
          mobileRoadmapImage: pageData.mobileRoadmapImage || '',
          mobileRoadmapImagePublicId: pageData.mobileRoadmapImagePublicId || '',
          universityCapBg: pageData.universityCapBg || '',
          universityCapBgPublicId: pageData.universityCapBgPublicId || '',
          universitySliderBg: pageData.universitySliderBg || '',
          universitySliderBgPublicId: pageData.universitySliderBgPublicId || '',
          immigrationServicesBg: pageData.immigrationServicesBg || '',
          immigrationServices1Bg: pageData.immigrationServices1Bg || '',
          immigrationServices1BgPublicId: pageData.immigrationServices1BgPublicId || '',
          immigrationServices2Bg: pageData.immigrationServices2Bg || '',
          immigrationServices2BgPublicId: pageData.immigrationServices2BgPublicId || '',
          immigrationServicesBgPublicId: pageData.immigrationServicesBgPublicId || '',
          sections: pageData.sections || [],
          keywords: Array.isArray(pageData.keywords) ? pageData.keywords.join(', ') : (pageData.keywords || ''),
          tags: Array.isArray(pageData.tags) ? pageData.tags.join(', ') : (pageData.tags || ''),
          canonicalUrl: pageData.canonicalUrl || '',
        })
        
        // Set sections - ensure it's always an array
        const loadedSections = Array.isArray(pageData.sections) ? pageData.sections : []
        setSections(loadedSections)
        setSuccess('Page data loaded successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to load page data')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSectionData = (type) => {
    switch (type) {
      case 'hero_section':
        return {
          title: '',
          subTitle: '',
          description: '',
          ctaText: '',
          ctaLink: '',
          backgroundImage: '',
          backgroundImagePublicId: '',
          buttonText: '',
          buttonLink: '',
          secondaryButtonText: '',
          secondaryButtonLink: '',
        }

      case 'form_section':
        return {
          title: '',
          subTitle: '',
          description: '',
          formTitle: '',
          formSubtitle: '',
          buttonText: 'Submit',
          buttonLink: '',
          successMessage: '',
        }

      case 'why_choose_us':
        return {
          title: '',
          subTitle: '',
          description: '',
          items: [],
        }

      case 'slider_card':
        return {
          title: '',
          subTitle: '',
          description: '',
          cards: [],
        }

      case 'road-map':
      case 'roadmap':
        return {
          title: '',
          subTitle: '',
          description: '',
          steps: [],
        }

      case 'content':
      case 'content_section':
        return {
          title: '',
          content: '',
        }

      case 'statistics':
      case 'stats_section':
        return {
          title: '',
          subTitle: '',
          description: '',
          stats: [],
        }

      case 'comparison_table':
      case 'comparison':
        return {
          title: '',
          subTitle: '',
          description: '',
          rows: [],
        }

      case 'blog_section':
      case 'news_section':
        return {
          title: '',
          subTitle: '',
          description: '',
          posts: [],
        }

      case 'requirements':
      case 'requirements_list':
        return {
          title: '',
          subTitle: '',
          description: '',
          items: [],
        }

      case 'testimonials':
      case 'testimonial_section':
        return {
          title: '',
          subTitle: '',
          description: '',
          testimonials: [],
        }

      case 'case_studies':
      case 'case_study':
        return {
          title: '',
          subTitle: '',
          description: '',
          studies: [],
        }

      case 'cta_section':
      case 'call_to_action':
        return {
          title: '',
          subTitle: '',
          description: '',
          buttonText: '',
          buttonLink: '',
          secondaryButtonText: '',
          secondaryButtonLink: '',
        }

      case 'track_record':
      case 'admissions_track':
        return {
          title: '',
          subTitle: '',
          description: '',
        }

      case 'university_partners':
        return {
          title: 'International University Partners',
          subTitle: '',
          description: '',
          images: []
        }

      case 'immigration_services':
        return {
          title: 'Your Trusted Partner in Immigration Services',
          subTitle: '',
          description: 'We provide reliable guidance for study, work, and permanent residency applications.',
          buttonText: 'About Us',
          buttonLink: '/about-us'
        }

      case 'video_testimonials':
        return {
          title: 'Video Testimonials',
          subTitle: '',
          description: '',
          videos: []
        }

      case 'image_testimonials':
        return {
          title: 'Image Testimonials',
          subTitle: '',
          description: '',
          images: []
        }

      case 'top_universities':
        return {
          title: 'Top Universities Hub',
          subTitle: '',
          description: 'Explore globally recognized university groups across major study destinations.',
          items: []
        }

      default:
        return {}
    }
  }

  // Handle section data change
  const handleSectionDataChange = (index, field, value) => {
    const currentSections = Array.isArray(sections) ? sections : []
    const updatedSections = [...currentSections]
    if (updatedSections[index]) {
      updatedSections[index] = {
        ...updatedSections[index],
        data: {
          ...(updatedSections[index].data || {}),
          [field]: value,
        },
      }
      setSections(updatedSections)
    }
  }

  // Render section edit form
  const renderSectionForm = (section, index) => {
    // Common order field component
    const renderOrderField = () => (
      <CCol md={12} className="mb-3">
        <CFormLabel>Order</CFormLabel>
        <CFormInput
          type="number"
          value={section.order || 0}
          onChange={(e) => {
            const currentSections = Array.isArray(sections) ? sections : []
            const updatedSections = [...currentSections]
            updatedSections[index] = { ...updatedSections[index], order: parseInt(e.target.value) || 0 }
            setSections(updatedSections)
            setFormData((prev) => {
              const prevSections = Array.isArray(prev.sections) ? prev.sections : []
              const updatedPrevSections = [...prevSections]
              updatedPrevSections[index] = { ...updatedPrevSections[index], order: parseInt(e.target.value) || 0 }
              return { ...prev, sections: updatedPrevSections }
            })
          }}
          placeholder="Order"
        />
      </CCol>
    )

    if (section.type === 'hero_section') {
      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Hero Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="Enter hero title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="Enter hero sub title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  value={section.data?.description || ''}
                  onChange={(e) => handleSectionDataChange(index, 'description', e.target.value)}
                  placeholder="Enter hero description"
                  rows={3}
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Primary Button Text</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.buttonText || section.data?.ctaText || ''}
                  onChange={(e) => {
                    handleSectionDataChange(index, 'buttonText', e.target.value)
                    handleSectionDataChange(index, 'ctaText', e.target.value) // Keep backward compatibility
                  }}
                  placeholder="e.g., Get Started"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Primary Button Link</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.buttonLink || section.data?.ctaLink || ''}
                  onChange={(e) => {
                    handleSectionDataChange(index, 'buttonLink', e.target.value)
                    handleSectionDataChange(index, 'ctaLink', e.target.value) // Keep backward compatibility
                  }}
                  placeholder="e.g., /contact"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Secondary Button Text (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.secondaryButtonText || ''}
                  onChange={(e) => handleSectionDataChange(index, 'secondaryButtonText', e.target.value)}
                  placeholder="e.g., Learn More"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Secondary Button Link (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.secondaryButtonLink || ''}
                  onChange={(e) => handleSectionDataChange(index, 'secondaryButtonLink', e.target.value)}
                  placeholder="e.g., /about"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Background Image (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.backgroundImage || ''}
                  onChange={(e) => handleSectionDataChange(index, 'backgroundImage', e.target.value)}
                  placeholder="Enter image URL or upload via image upload section"
                />
                <small className="text-muted">
                  You can also upload image in the Images section above and use that URL here
                </small>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    if (section.type === 'form_section') {
      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Form Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="Enter section title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="Enter sub title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  value={section.data?.description || ''}
                  onChange={(e) => handleSectionDataChange(index, 'description', e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Form Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.formTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'formTitle', e.target.value)}
                  placeholder="e.g., Contact Us"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Form Subtitle</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.formSubtitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'formSubtitle', e.target.value)}
                  placeholder="e.g., Fill out the form below"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Button Text</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.buttonText || 'Submit'}
                  onChange={(e) => handleSectionDataChange(index, 'buttonText', e.target.value)}
                  placeholder="e.g., Submit"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Button Link (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.buttonLink || ''}
                  onChange={(e) => handleSectionDataChange(index, 'buttonLink', e.target.value)}
                  placeholder="e.g., /thank-you"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Success Message (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.successMessage || ''}
                  onChange={(e) => handleSectionDataChange(index, 'successMessage', e.target.value)}
                  placeholder="e.g., Thank you! We'll get back to you soon."
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    if (section.type === 'why_choose_us') {
      // Support both 'items' and 'cards' for backward compatibility
      const cards = Array.isArray(section.data?.cards) ? section.data.cards : 
                    Array.isArray(section.data?.items) ? section.data.items : []
      
      const handleAddCard = () => {
        const newCards = [...cards, { label: '', icon: '', quote: '' }]
        handleSectionDataChange(index, 'cards', newCards)
        // Also update items for backward compatibility
        if (section.data?.items) {
          handleSectionDataChange(index, 'items', newCards)
        }
      }

      const handleRemoveCard = (cardIndex) => {
        const newCards = cards.filter((_, i) => i !== cardIndex)
        handleSectionDataChange(index, 'cards', newCards)
        // Also update items for backward compatibility
        if (section.data?.items) {
          handleSectionDataChange(index, 'items', newCards)
        }
      }

      const handleCardChange = (cardIndex, field, value) => {
        const newCards = [...cards]
        newCards[cardIndex] = { ...newCards[cardIndex], [field]: value }
        handleSectionDataChange(index, 'cards', newCards)
        // Also update items for backward compatibility
        if (section.data?.items) {
          handleSectionDataChange(index, 'items', newCards)
        }
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Why Choose Us Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="Enter section title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="Enter sub title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  value={section.data?.description || ''}
                  onChange={(e) => handleSectionDataChange(index, 'description', e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Cards</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCard}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Cards
                  </CButton>
                </div>
                {cards.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No cards added yet. Click "Add Cards" to add features.
                  </div>
                )}
                {cards.map((card, cardIndex) => (
                  <CCard key={cardIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Card #{cardIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCard(cardIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Label</CFormLabel>
                          <CFormInput
                            type="text"
                            value={card.label || card.title || ''}
                            onChange={(e) => handleCardChange(cardIndex, 'label', e.target.value)}
                            placeholder="e.g., Expert Instructors"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Icon</CFormLabel>
                          <CFormInput
                            type="text"
                            value={card.icon || ''}
                            onChange={(e) => handleCardChange(cardIndex, 'icon', e.target.value)}
                            placeholder="e.g., GraduationCap"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Quote</CFormLabel>
                          <CFormTextarea
                            value={card.quote || card.description || ''}
                            onChange={(e) => handleCardChange(cardIndex, 'quote', e.target.value)}
                            placeholder="Enter quote/description"
                            rows={3}
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    if (section.type === 'road-map' || section.type === 'roadmap') {
      const steps = Array.isArray(section.data?.steps) ? section.data.steps : []
      
      const handleAddStep = () => {
        const newSteps = [...steps, { label: '', quote: '', points: [], icon: '' }]
        handleSectionDataChange(index, 'steps', newSteps)
      }

      const handleRemoveStep = (stepIndex) => {
        const newSteps = steps.filter((_, i) => i !== stepIndex)
        handleSectionDataChange(index, 'steps', newSteps)
      }

      const handleStepChange = (stepIndex, field, value) => {
        const newSteps = [...steps]
        newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value }
        handleSectionDataChange(index, 'steps', newSteps)
      }

      const handlePointsChange = (stepIndex, pointsString) => {
        // Convert comma-separated string to array
        const pointsArray = pointsString.split(',').map(p => p.trim()).filter(p => p)
        handleStepChange(stepIndex, 'points', pointsArray)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Road-map Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={12} className="mb-3">
                <CFormLabel>Section Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || section.data?.sectionTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="Enter section title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Section Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || section.data?.sectionSubTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="Enter sub title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Steps</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddStep}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Steps
                  </CButton>
                </div>
                {steps.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No steps added yet. Click "Add Steps" to add roadmap steps.
                  </div>
                )}
                {steps.map((step, stepIndex) => (
                  <CCard key={stepIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Step #{stepIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStep(stepIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Label</CFormLabel>
                          <CFormInput
                            type="text"
                            value={step.label || ''}
                            onChange={(e) => handleStepChange(stepIndex, 'label', e.target.value)}
                            placeholder="e.g., Initial Consultation"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Quote</CFormLabel>
                          <CFormTextarea
                            value={step.quote || ''}
                            onChange={(e) => handleStepChange(stepIndex, 'quote', e.target.value)}
                            placeholder="Enter quote/description"
                            rows={2}
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Points (comma-separated)</CFormLabel>
                          <CFormTextarea
                            value={Array.isArray(step.points) ? step.points.join(', ') : (step.points || '')}
                            onChange={(e) => handlePointsChange(stepIndex, e.target.value)}
                            placeholder="e.g., Point 1, Point 2, Point 3"
                            rows={3}
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Icon</CFormLabel>
                          <CFormInput
                            type="text"
                            value={step.icon || ''}
                            onChange={(e) => handleStepChange(stepIndex, 'icon', e.target.value)}
                            placeholder="e.g., BookHeart"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    if (section.type === 'content' || section.type === 'content_section') {
      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Content Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Section Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || section.data?.sectionTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="Enter section title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Section Content</CFormLabel>
                <CFormTextarea
                  value={section.data?.content || section.data?.sectionContent || ''}
                  onChange={(e) => handleSectionDataChange(index, 'content', e.target.value)}
                  placeholder="Enter section content (HTML or plain text)"
                  rows={10}
                />
                <small className="text-muted">
                  You can enter HTML content or plain text. For rich text, use HTML tags.
                </small>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Statistics Section (Numbers Don't Lie, etc.)
    if (section.type === 'statistics' || section.type === 'stats_section') {
      const stats = Array.isArray(section.data?.stats) ? section.data.stats : []
      
      const handleAddStat = () => {
        const newStats = [...stats, { label: '', value: '', description: '', icon: '' }]
        handleSectionDataChange(index, 'stats', newStats)
      }

      const handleRemoveStat = (statIndex) => {
        const newStats = stats.filter((_, i) => i !== statIndex)
        handleSectionDataChange(index, 'stats', newStats)
      }

      const handleStatChange = (statIndex, field, value) => {
        const newStats = [...stats]
        newStats[statIndex] = { ...newStats[statIndex], [field]: value }
        handleSectionDataChange(index, 'stats', newStats)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Statistics Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., Numbers Don't Lie"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="e.g., Proven Success. Unmatched Results."
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Statistics</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddStat}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Statistic
                  </CButton>
                </div>
                {stats.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No statistics added yet. Click "Add Statistic" to add stats.
                  </div>
                )}
                {stats.map((stat, statIndex) => (
                  <CCard key={statIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Stat #{statIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStat(statIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Value (Number/Percentage)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={stat.value || ''}
                            onChange={(e) => handleStatChange(statIndex, 'value', e.target.value)}
                            placeholder="e.g., 98% or 1,485"
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Label</CFormLabel>
                          <CFormInput
                            type="text"
                            value={stat.label || ''}
                            onChange={(e) => handleStatChange(statIndex, 'label', e.target.value)}
                            placeholder="e.g., of our students are admitted"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Description (Optional)</CFormLabel>
                          <CFormTextarea
                            value={stat.description || ''}
                            onChange={(e) => handleStatChange(statIndex, 'description', e.target.value)}
                            placeholder="Enter description"
                            rows={2}
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Icon (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={stat.icon || ''}
                            onChange={(e) => handleStatChange(statIndex, 'icon', e.target.value)}
                            placeholder="e.g., icon name or URL"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Comparison Table Section (College Specific Acceptance Rates)
    if (section.type === 'comparison_table' || section.type === 'comparison') {
      const rows = Array.isArray(section.data?.rows) ? section.data.rows : []
      
      const handleAddRow = () => {
        const newRows = [...rows, { college: '', generalRate: '', studentRate: '', image: '' }]
        handleSectionDataChange(index, 'rows', newRows)
      }

      const handleRemoveRow = (rowIndex) => {
        const newRows = rows.filter((_, i) => i !== rowIndex)
        handleSectionDataChange(index, 'rows', newRows)
      }

      const handleRowChange = (rowIndex, field, value) => {
        const newRows = [...rows]
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value }
        handleSectionDataChange(index, 'rows', newRows)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Comparison Table Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., College Specific Acceptance Rates"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Table Rows</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Row
                  </CButton>
                </div>
                {rows.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No rows added yet. Click "Add Row" to add comparison data.
                  </div>
                )}
                {rows.map((row, rowIndex) => (
                  <CCard key={rowIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Row #{rowIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRow(rowIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={4} className="mb-2">
                          <CFormLabel>College Name</CFormLabel>
                          <CFormInput
                            type="text"
                            value={row.college || ''}
                            onChange={(e) => handleRowChange(rowIndex, 'college', e.target.value)}
                            placeholder="e.g., Harvard"
                          />
                        </CCol>
                        <CCol md={4} className="mb-2">
                          <CFormLabel>General Admit Rate</CFormLabel>
                          <CFormInput
                            type="text"
                            value={row.generalRate || ''}
                            onChange={(e) => handleRowChange(rowIndex, 'generalRate', e.target.value)}
                            placeholder="e.g., 20%"
                          />
                        </CCol>
                        <CCol md={4} className="mb-2">
                          <CFormLabel>Student Admit Rate</CFormLabel>
                          <CFormInput
                            type="text"
                            value={row.studentRate || ''}
                            onChange={(e) => handleRowChange(rowIndex, 'studentRate', e.target.value)}
                            placeholder="e.g., 80%"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>College Image URL (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={row.image || ''}
                            onChange={(e) => handleRowChange(rowIndex, 'image', e.target.value)}
                            placeholder="Enter image URL"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Track Record Section (IVY COACH'S COLLEGE ADMISSIONS TRACK RECORD)
    if (section.type === 'track_record' || section.type === 'admissions_track') {
      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Track Record Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., IVY COACH'S COLLEGE ADMISSIONS TRACK RECORD"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="e.g., At most of these schools, we typically have 3-4 applicants annually."
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  value={section.data?.description || ''}
                  onChange={(e) => handleSectionDataChange(index, 'description', e.target.value)}
                  placeholder="e.g., The percentage of Ivy Coach's packaged clients over the last 10 years who earned admission to the following schools in the Early round."
                  rows={4}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Blog/News Section (THE IVY COACH DAILY)
    if (section.type === 'blog_section' || section.type === 'news_section') {
      const posts = Array.isArray(section.data?.posts) ? section.data.posts : []
      
      const handleAddPost = () => {
        const newPosts = [...posts, { title: '', author: '', date: '', excerpt: '', link: '', image: '' }]
        handleSectionDataChange(index, 'posts', newPosts)
      }

      const handleRemovePost = (postIndex) => {
        const newPosts = posts.filter((_, i) => i !== postIndex)
        handleSectionDataChange(index, 'posts', newPosts)
      }

      const handlePostChange = (postIndex, field, value) => {
        const newPosts = [...posts]
        newPosts[postIndex] = { ...newPosts[postIndex], [field]: value }
        handleSectionDataChange(index, 'posts', newPosts)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Blog/News Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., THE IVY COACH DAILY"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="e.g., Way To Tell It Like It Is, Ivy Coach"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Posts</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPost}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Post
                  </CButton>
                </div>
                {posts.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No posts added yet. Click "Add Post" to add blog posts.
                  </div>
                )}
                {posts.map((post, postIndex) => (
                  <CCard key={postIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Post #{postIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePost(postIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Post Title</CFormLabel>
                          <CFormInput
                            type="text"
                            value={post.title || ''}
                            onChange={(e) => handlePostChange(postIndex, 'title', e.target.value)}
                            placeholder="e.g., Harvard University Class of 2028..."
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Author</CFormLabel>
                          <CFormInput
                            type="text"
                            value={post.author || ''}
                            onChange={(e) => handlePostChange(postIndex, 'author', e.target.value)}
                            placeholder="e.g., by S.K."
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Date</CFormLabel>
                          <CFormInput
                            type="text"
                            value={post.date || ''}
                            onChange={(e) => handlePostChange(postIndex, 'date', e.target.value)}
                            placeholder="e.g., Date: December 15, 2023"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Excerpt/Description</CFormLabel>
                          <CFormTextarea
                            value={post.excerpt || ''}
                            onChange={(e) => handlePostChange(postIndex, 'excerpt', e.target.value)}
                            placeholder="Enter post excerpt"
                            rows={2}
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Link (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={post.link || ''}
                            onChange={(e) => handlePostChange(postIndex, 'link', e.target.value)}
                            placeholder="e.g., /blog/post-url"
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Image URL (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={post.image || ''}
                            onChange={(e) => handlePostChange(postIndex, 'image', e.target.value)}
                            placeholder="Enter image URL"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Requirements List Section
    if (section.type === 'requirements' || section.type === 'requirements_list') {
      const items = Array.isArray(section.data?.items) ? section.data.items : []
      
      const handleAddItem = () => {
        const newItems = [...items, { text: '', icon: '' }]
        handleSectionDataChange(index, 'items', newItems)
      }

      const handleRemoveItem = (itemIndex) => {
        const newItems = items.filter((_, i) => i !== itemIndex)
        handleSectionDataChange(index, 'items', newItems)
      }

      const handleItemChange = (itemIndex, field, value) => {
        const newItems = [...items]
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value }
        handleSectionDataChange(index, 'items', newItems)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Requirements List Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., Admission Requirements for United Kingdom"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="Enter sub title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Requirements</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Requirement
                  </CButton>
                </div>
                {items.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No requirements added yet. Click "Add Requirement" to add items.
                  </div>
                )}
                {items.map((item, itemIndex) => (
                  <CCard key={itemIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Requirement #{itemIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(itemIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Requirement Text</CFormLabel>
                          <CFormInput
                            type="text"
                            value={item.text || ''}
                            onChange={(e) => handleItemChange(itemIndex, 'text', e.target.value)}
                            placeholder="e.g., Copy of a valid passport"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Icon (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={item.icon || ''}
                            onChange={(e) => handleItemChange(itemIndex, 'icon', e.target.value)}
                            placeholder="Enter icon name or URL"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Testimonials Section
    if (section.type === 'testimonials' || section.type === 'testimonial_section') {
      const testimonials = Array.isArray(section.data?.testimonials) ? section.data.testimonials : []
      
      const handleAddTestimonial = () => {
        const newTestimonials = [...testimonials, { name: '', role: '', quote: '', image: '', rating: '' }]
        handleSectionDataChange(index, 'testimonials', newTestimonials)
      }

      const handleRemoveTestimonial = (testimonialIndex) => {
        const newTestimonials = testimonials.filter((_, i) => i !== testimonialIndex)
        handleSectionDataChange(index, 'testimonials', newTestimonials)
      }

      const handleTestimonialChange = (testimonialIndex, field, value) => {
        const newTestimonials = [...testimonials]
        newTestimonials[testimonialIndex] = { ...newTestimonials[testimonialIndex], [field]: value }
        handleSectionDataChange(index, 'testimonials', newTestimonials)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Testimonials Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., Image Testimonials"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Testimonials</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTestimonial}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Testimonial
                  </CButton>
                </div>
                {testimonials.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No testimonials added yet. Click "Add Testimonial" to add testimonials.
                  </div>
                )}
                {testimonials.map((testimonial, testimonialIndex) => (
                  <CCard key={testimonialIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Testimonial #{testimonialIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTestimonial(testimonialIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Name</CFormLabel>
                          <CFormInput
                            type="text"
                            value={testimonial.name || ''}
                            onChange={(e) => handleTestimonialChange(testimonialIndex, 'name', e.target.value)}
                            placeholder="e.g., John Doe"
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Role</CFormLabel>
                          <CFormInput
                            type="text"
                            value={testimonial.role || ''}
                            onChange={(e) => handleTestimonialChange(testimonialIndex, 'role', e.target.value)}
                            placeholder="e.g., Student"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Quote/Testimonial</CFormLabel>
                          <CFormTextarea
                            value={testimonial.quote || ''}
                            onChange={(e) => handleTestimonialChange(testimonialIndex, 'quote', e.target.value)}
                            placeholder="Enter testimonial quote"
                            rows={3}
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Image URL (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={testimonial.image || ''}
                            onChange={(e) => handleTestimonialChange(testimonialIndex, 'image', e.target.value)}
                            placeholder="Enter image URL"
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Rating (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={testimonial.rating || ''}
                            onChange={(e) => handleTestimonialChange(testimonialIndex, 'rating', e.target.value)}
                            placeholder="e.g., 5 stars or 4.5"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Case Studies Section
    if (section.type === 'case_studies' || section.type === 'case_study') {
      const studies = Array.isArray(section.data?.studies) ? section.data.studies : []
      
      const handleAddStudy = () => {
        const newStudies = [...studies, { title: '', description: '', image: '', link: '', category: '' }]
        handleSectionDataChange(index, 'studies', newStudies)
      }

      const handleRemoveStudy = (studyIndex) => {
        const newStudies = studies.filter((_, i) => i !== studyIndex)
        handleSectionDataChange(index, 'studies', newStudies)
      }

      const handleStudyChange = (studyIndex, field, value) => {
        const newStudies = [...studies]
        newStudies[studyIndex] = { ...newStudies[studyIndex], [field]: value }
        handleSectionDataChange(index, 'studies', newStudies)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Case Studies Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., Case Studies"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="Enter sub title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Case Studies</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddStudy}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Case Study
                  </CButton>
                </div>
                {studies.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No case studies added yet. Click "Add Case Study" to add studies.
                  </div>
                )}
                {studies.map((study, studyIndex) => (
                  <CCard key={studyIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Case Study #{studyIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStudy(studyIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Title</CFormLabel>
                          <CFormInput
                            type="text"
                            value={study.title || ''}
                            onChange={(e) => handleStudyChange(studyIndex, 'title', e.target.value)}
                            placeholder="Enter case study title"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Description</CFormLabel>
                          <CFormTextarea
                            value={study.description || ''}
                            onChange={(e) => handleStudyChange(studyIndex, 'description', e.target.value)}
                            placeholder="Enter case study description"
                            rows={3}
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Image URL (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={study.image || ''}
                            onChange={(e) => handleStudyChange(studyIndex, 'image', e.target.value)}
                            placeholder="Enter image URL"
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Category (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={study.category || ''}
                            onChange={(e) => handleStudyChange(studyIndex, 'category', e.target.value)}
                            placeholder="e.g., Success Story"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Link (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={study.link || ''}
                            onChange={(e) => handleStudyChange(studyIndex, 'link', e.target.value)}
                            placeholder="e.g., /case-study/url"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // CTA Section (Call to Action)
    if (section.type === 'cta_section' || section.type === 'call_to_action') {
      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Call to Action Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., TOWARD THE CONQUEST OF ADMISSION"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="Enter sub title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  value={section.data?.description || ''}
                  onChange={(e) => handleSectionDataChange(index, 'description', e.target.value)}
                  placeholder="e.g., If you're interested in Ivy Coach's college counseling..."
                  rows={3}
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Primary Button Text</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.buttonText || ''}
                  onChange={(e) => handleSectionDataChange(index, 'buttonText', e.target.value)}
                  placeholder="e.g., GET STARTED"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Primary Button Link</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.buttonLink || ''}
                  onChange={(e) => handleSectionDataChange(index, 'buttonLink', e.target.value)}
                  placeholder="e.g., /contact or /consultation"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Secondary Button Text (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.secondaryButtonText || ''}
                  onChange={(e) => handleSectionDataChange(index, 'secondaryButtonText', e.target.value)}
                  placeholder="e.g., Learn More"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Secondary Button Link (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.secondaryButtonLink || ''}
                  onChange={(e) => handleSectionDataChange(index, 'secondaryButtonLink', e.target.value)}
                  placeholder="e.g., /about"
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    if (section.type === 'slider_card') {
      const cards = Array.isArray(section.data?.cards) ? section.data.cards : []
      
      const handleAddCard = () => {
        const newCards = [...cards, { title: '', description: '', image: '', link: '', buttonText: '' }]
        handleSectionDataChange(index, 'cards', newCards)
      }

      const handleRemoveCard = (cardIndex) => {
        const newCards = cards.filter((_, i) => i !== cardIndex)
        handleSectionDataChange(index, 'cards', newCards)
      }

      const handleCardChange = (cardIndex, field, value) => {
        const newCards = [...cards]
        newCards[cardIndex] = { ...newCards[cardIndex], [field]: value }
        handleSectionDataChange(index, 'cards', newCards)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Slider Card Section #{index + 1}</strong>
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(index)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.title || ''}
                  onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)}
                  placeholder="Enter section title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={section.data?.subTitle || ''}
                  onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)}
                  placeholder="Enter sub title"
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  value={section.data?.description || ''}
                  onChange={(e) => handleSectionDataChange(index, 'description', e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Cards</CFormLabel>
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCard}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Card
                  </CButton>
                </div>
                {cards.length === 0 && (
                  <div className="text-muted text-center p-3 border rounded">
                    No cards added yet. Click "Add Card" to add slider cards.
                  </div>
                )}
                {cards.map((card, cardIndex) => (
                  <CCard key={cardIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Card #{cardIndex + 1}</strong>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCard(cardIndex)}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                      <CRow>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Card Title</CFormLabel>
                          <CFormInput
                            type="text"
                            value={card.title || ''}
                            onChange={(e) => handleCardChange(cardIndex, 'title', e.target.value)}
                            placeholder="e.g., Premium Service"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Card Description</CFormLabel>
                          <CFormTextarea
                            value={card.description || ''}
                            onChange={(e) => handleCardChange(cardIndex, 'description', e.target.value)}
                            placeholder="Enter card description"
                            rows={2}
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Card Image URL</CFormLabel>
                          <CFormInput
                            type="text"
                            value={card.image || ''}
                            onChange={(e) => handleCardChange(cardIndex, 'image', e.target.value)}
                            placeholder="Enter image URL"
                          />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Button Text (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={card.buttonText || ''}
                            onChange={(e) => handleCardChange(cardIndex, 'buttonText', e.target.value)}
                            placeholder="e.g., Learn More"
                          />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Card Link (Optional)</CFormLabel>
                          <CFormInput
                            type="text"
                            value={card.link || ''}
                            onChange={(e) => handleCardChange(cardIndex, 'link', e.target.value)}
                            placeholder="e.g., /service-details"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // University Partners Section
    if (section.type === 'university_partners') {
      const images = Array.isArray(section.data?.images) ? section.data.images : []
      
      const handleAddImage = () => {
        const newImages = [...images, { url: '', alt: '' }]
        handleSectionDataChange(index, 'images', newImages)
      }

      const handleRemoveImage = (imgIndex) => {
        const newImages = images.filter((_, i) => i !== imgIndex)
        handleSectionDataChange(index, 'images', newImages)
      }

      const handleImageChange = (imgIndex, field, value) => {
        const newImages = [...images]
        newImages[imgIndex] = { ...newImages[imgIndex], [field]: value }
        handleSectionDataChange(index, 'images', newImages)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>University Partners Section #{index + 1}</strong>
            <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveSection(index)}><CIcon icon={cilTrash} /></CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput type="text" value={section.data?.title || ''} onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)} placeholder="e.g., International University Partners" />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput type="text" value={section.data?.subTitle || ''} onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)} placeholder="Enter sub title" />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Partner Logos</CFormLabel>
                  <CButton color="primary" variant="outline" size="sm" onClick={handleAddImage}><CIcon icon={cilPlus} className="me-1" /> Add Logo</CButton>
                </div>
                {images.map((img, imgIndex) => (
                  <CCard key={imgIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Logo #{imgIndex + 1}</strong>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveImage(imgIndex)}><CIcon icon={cilX} /></CButton>
                      </div>
                      <CRow>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Image URL</CFormLabel>
                          <CFormInput type="text" value={img.url || ''} onChange={(e) => handleImageChange(imgIndex, 'url', e.target.value)} placeholder="Enter image URL" />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Alt Text</CFormLabel>
                          <CFormInput type="text" value={img.alt || ''} onChange={(e) => handleImageChange(imgIndex, 'alt', e.target.value)} placeholder="Enter alt text" />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Immigration Services Section
    if (section.type === 'immigration_services') {
      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Immigration Services Section #{index + 1}</strong>
            <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveSection(index)}><CIcon icon={cilTrash} /></CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput type="text" value={section.data?.title || ''} onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)} placeholder="Enter title" />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Sub Title</CFormLabel>
                <CFormInput type="text" value={section.data?.subTitle || ''} onChange={(e) => handleSectionDataChange(index, 'subTitle', e.target.value)} placeholder="Enter sub title" />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea value={section.data?.description || ''} onChange={(e) => handleSectionDataChange(index, 'description', e.target.value)} placeholder="Enter description" rows={3} />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Button Text</CFormLabel>
                <CFormInput type="text" value={section.data?.buttonText || ''} onChange={(e) => handleSectionDataChange(index, 'buttonText', e.target.value)} placeholder="e.g., About Us" />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Button Link</CFormLabel>
                <CFormInput type="text" value={section.data?.buttonLink || ''} onChange={(e) => handleSectionDataChange(index, 'buttonLink', e.target.value)} placeholder="e.g., /about-us" />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Video Testimonials Section
    if (section.type === 'video_testimonials') {
      const videos = Array.isArray(section.data?.videos) ? section.data.videos : []
      
      const handleAddVideo = () => {
        const newVideos = [...videos, { url: '', thumbnail: '', title: '' }]
        handleSectionDataChange(index, 'videos', newVideos)
      }

      const handleRemoveVideo = (vidIndex) => {
        const newVideos = videos.filter((_, i) => i !== vidIndex)
        handleSectionDataChange(index, 'videos', newVideos)
      }

      const handleVideoChange = (vidIndex, field, value) => {
        const newVideos = [...videos]
        newVideos[vidIndex] = { ...newVideos[vidIndex], [field]: value }
        handleSectionDataChange(index, 'videos', newVideos)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Video Testimonials Section #{index + 1}</strong>
            <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveSection(index)}><CIcon icon={cilTrash} /></CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput type="text" value={section.data?.title || ''} onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)} placeholder="e.g., Video Testimonials" />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Videos</CFormLabel>
                  <CButton color="primary" variant="outline" size="sm" onClick={handleAddVideo}><CIcon icon={cilPlus} className="me-1" /> Add Video</CButton>
                </div>
                {videos.map((vid, vidIndex) => (
                  <CCard key={vidIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Video #{vidIndex + 1}</strong>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveVideo(vidIndex)}><CIcon icon={cilX} /></CButton>
                      </div>
                      <CRow>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Video URL</CFormLabel>
                          <CFormInput type="text" value={vid.url || ''} onChange={(e) => handleVideoChange(vidIndex, 'url', e.target.value)} placeholder="YouTube/Vimeo URL" />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Thumbnail URL (Optional)</CFormLabel>
                          <CFormInput type="text" value={vid.thumbnail || ''} onChange={(e) => handleVideoChange(vidIndex, 'thumbnail', e.target.value)} placeholder="Enter thumbnail image URL" />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Video Title/Name</CFormLabel>
                          <CFormInput type="text" value={vid.title || ''} onChange={(e) => handleVideoChange(vidIndex, 'title', e.target.value)} placeholder="Enter title" />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Image Testimonials Section
    if (section.type === 'image_testimonials') {
      const images = Array.isArray(section.data?.images) ? section.data.images : []
      
      const handleAddImage = () => {
        const newImages = [...images, { url: '', name: '', role: '', text: '' }]
        handleSectionDataChange(index, 'images', newImages)
      }

      const handleRemoveImage = (imgIndex) => {
        const newImages = images.filter((_, i) => i !== imgIndex)
        handleSectionDataChange(index, 'images', newImages)
      }

      const handleImageChange = (imgIndex, field, value) => {
        const newImages = [...images]
        newImages[imgIndex] = { ...newImages[imgIndex], [field]: value }
        handleSectionDataChange(index, 'images', newImages)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Image Testimonials Section #{index + 1}</strong>
            <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveSection(index)}><CIcon icon={cilTrash} /></CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput type="text" value={section.data?.title || ''} onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)} placeholder="e.g., Image Testimonials" />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">Testimonials</CFormLabel>
                  <CButton color="primary" variant="outline" size="sm" onClick={handleAddImage}><CIcon icon={cilPlus} className="me-1" /> Add Testimonial</CButton>
                </div>
                {images.map((img, imgIndex) => (
                  <CCard key={imgIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Testimonial #{imgIndex + 1}</strong>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveImage(imgIndex)}><CIcon icon={cilX} /></CButton>
                      </div>
                      <CRow>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Name</CFormLabel>
                          <CFormInput type="text" value={img.name || ''} onChange={(e) => handleImageChange(imgIndex, 'name', e.target.value)} placeholder="Student Name" />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Role/University</CFormLabel>
                          <CFormInput type="text" value={img.role || ''} onChange={(e) => handleImageChange(imgIndex, 'role', e.target.value)} placeholder="e.g., Harvard University" />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Review Text</CFormLabel>
                          <CFormTextarea value={img.text || ''} onChange={(e) => handleImageChange(imgIndex, 'text', e.target.value)} placeholder="Enter review" rows={2} />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Image URL</CFormLabel>
                          <CFormInput type="text" value={img.url || ''} onChange={(e) => handleImageChange(imgIndex, 'url', e.target.value)} placeholder="Enter image URL" />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }

    // Top Universities Hub Section
    if (section.type === 'top_universities') {
      const items = Array.isArray(section.data?.items) ? section.data.items : []
      
      const handleAddItem = () => {
        const newItems = [...items, { title: '', description: '', image: '' }]
        handleSectionDataChange(index, 'items', newItems)
      }

      const handleRemoveItem = (itemIndex) => {
        const newItems = items.filter((_, i) => i !== itemIndex)
        handleSectionDataChange(index, 'items', newItems)
      }

      const handleItemChange = (itemIndex, field, value) => {
        const newItems = [...items]
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value }
        handleSectionDataChange(index, 'items', newItems)
      }

      return (
        <CCard className="mb-3" key={index}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Top Universities Hub Section #{index + 1}</strong>
            <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveSection(index)}><CIcon icon={cilTrash} /></CButton>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {renderOrderField()}
              <CCol md={12} className="mb-3">
                <CFormLabel>Title</CFormLabel>
                <CFormInput type="text" value={section.data?.title || ''} onChange={(e) => handleSectionDataChange(index, 'title', e.target.value)} placeholder="e.g., Top Universities Hub" />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea value={section.data?.description || ''} onChange={(e) => handleSectionDataChange(index, 'description', e.target.value)} placeholder="Enter description" rows={3} />
              </CCol>
              <CCol md={12} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="mb-0">University Groups</CFormLabel>
                  <CButton color="primary" variant="outline" size="sm" onClick={handleAddItem}><CIcon icon={cilPlus} className="me-1" /> Add Group</CButton>
                </div>
                {items.map((item, itemIndex) => (
                  <CCard key={itemIndex} className="mb-2">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Group #{itemIndex + 1}</strong>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemoveItem(itemIndex)}><CIcon icon={cilX} /></CButton>
                      </div>
                      <CRow>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Group Title</CFormLabel>
                          <CFormInput type="text" value={item.title || ''} onChange={(e) => handleItemChange(itemIndex, 'title', e.target.value)} placeholder="e.g., Ivy League" />
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <CFormLabel>Image URL</CFormLabel>
                          <CFormInput type="text" value={item.image || ''} onChange={(e) => handleItemChange(itemIndex, 'image', e.target.value)} placeholder="Enter image URL" />
                        </CCol>
                        <CCol md={12} className="mb-2">
                          <CFormLabel>Description</CFormLabel>
                          <CFormTextarea value={item.description || ''} onChange={(e) => handleItemChange(itemIndex, 'description', e.target.value)} placeholder="Enter short description" rows={2} />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    }
    
    // Default render for other section types (generic section editor)
    const sectionData = section.data || {}
    const sectionFields = Object.keys(sectionData).filter(key => 
      !Array.isArray(sectionData[key]) && typeof sectionData[key] !== 'object'
    )
    
    return (
      <CCard className="mb-3" key={index}>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>
            {section.type.replace(/_/g, ' ').replace(/-/g, ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')} Section #{index + 1}
          </strong>
          <CButton
            color="danger"
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveSection(index)}
          >
            <CIcon icon={cilTrash} />
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={12} className="mb-3">
              <CFormLabel>Order</CFormLabel>
              <CFormInput
                type="number"
                value={section.order || 0}
                onChange={(e) => {
                  const updatedSections = [...(Array.isArray(sections) ? sections : [])]
                  updatedSections[index] = { ...updatedSections[index], order: parseInt(e.target.value) || 0 }
                  setSections(updatedSections)
                }}
                placeholder="Order"
              />
            </CCol>
            {/* Common fields */}
            {['title', 'sectionTitle', 'subTitle', 'sectionSubTitle', 'description', 'sectionDescription'].map(field => {
              if (sectionData[field] !== undefined || field === 'title' || field === 'subTitle') {
                return (
                  <CCol md={12} className="mb-3" key={field}>
                    <CFormLabel>
                      {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </CFormLabel>
                    {field === 'description' || field === 'sectionDescription' ? (
                      <CFormTextarea
                        value={sectionData[field] || ''}
                        onChange={(e) => handleSectionDataChange(index, field, e.target.value)}
                        placeholder={`Enter ${field}`}
                        rows={3}
                      />
                    ) : (
                      <CFormInput
                        type="text"
                        value={sectionData[field] || ''}
                        onChange={(e) => handleSectionDataChange(index, field, e.target.value)}
                        placeholder={`Enter ${field}`}
                      />
                    )}
                  </CCol>
                )
              }
              return null
            })}
            {/* Other string/number fields */}
            {sectionFields.filter(field => 
              !['title', 'sectionTitle', 'subTitle', 'sectionSubTitle', 'description', 'sectionDescription', 'order'].includes(field)
            ).map(field => (
              <CCol md={12} className="mb-3" key={field}>
                <CFormLabel>
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </CFormLabel>
                <CFormInput
                  type="text"
                  value={sectionData[field] || ''}
                  onChange={(e) => handleSectionDataChange(index, field, e.target.value)}
                  placeholder={`Enter ${field}`}
                />
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>
    )
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    console.log('🔍 DEBUG - FormData before submission:', {
      immigrationServices1Bg: {
        value: formData.immigrationServices1Bg,
        length: formData.immigrationServices1Bg?.length || 0,
        exists: !!formData.immigrationServices1Bg
      },
      immigrationServices2Bg: {
        value: formData.immigrationServices2Bg,
        length: formData.immigrationServices2Bg?.length || 0,
        exists: !!formData.immigrationServices2Bg
      },
      allImmigrationFields: Object.keys(formData)
        .filter(key => key.includes('immigration'))
        .map(key => ({ key, value: formData[key], hasValue: !!formData[key] }))
    })

    // Validation
    // Title is not required for destination pages
    const isDestinationPage = formData.pageType === 'destination_page' || 
                              (formData.pageType && !['home_page', 'about_page', 'contact_page', 'services_page', 'blogs_page', 'events_page', 'career_page', 'city_page'].includes(formData.pageType))
    
    // Title is required for non-destination pages
    if (!isDestinationPage && (!formData.title || !formData.title.trim())) {
      setError('Please enter a valid Title. Title is required.')
      setSaving(false)
      return
    }
    
    if (!formData.slug || !formData.slug.trim()) {
      setError('Please enter a valid Slug. Slug is required.')
      setSaving(false)
      return
    }
    
    // Validate slug format (should be lowercase, no spaces, use hyphens)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugPattern.test(formData.slug.trim())) {
      setError('Slug must be lowercase, contain only letters, numbers, and hyphens. Example: ivy-league')
      setSaving(false)
      return
    }

    try {
      // Ensure sections is always an array and properly formatted
      const safeSections = Array.isArray(sections) ? sections : []
      
      // Validate and normalize sections before sending
      const normalizedSections = safeSections.map((section, index) => {
        // Ensure section has required structure
        if (!section || typeof section !== 'object') {
          console.warn(`⚠️ Section at index ${index} is invalid, skipping`)
          return null
        }
        
        // Ensure type exists and is lowercase
        const sectionType = (section.type || '').trim().toLowerCase()
        if (!sectionType) {
          console.warn(`⚠️ Section at index ${index} has no type, skipping`)
          return null
        }
        
        // Return normalized section
        return {
          type: sectionType,
          order: typeof section.order === 'number' ? section.order : (index + 1),
          data: section.data || {},
        }
      }).filter(section => section !== null) // Remove invalid sections
      
      console.log(`📝 Preparing ${normalizedSections.length} sections for submission`)
      if (normalizedSections.length > 0) {
        console.log('📋 First section sample:', JSON.stringify(normalizedSections[0], null, 2))
      }
      
      // Prepare submit data - only send fields that are defined in the model
      const submitData = {
        pageType: formData.pageType || 'home_page',
        title: formData.title?.trim() || '',
        subTitle: formData.subTitle?.trim() || '',
        navbarTitle: formData.navbarTitle?.trim() || '',
        route: formData.route?.trim() || '',
        hasDropdown: formData.hasDropdown === true || formData.hasDropdown === 'true',
        slug: formData.slug?.trim().toLowerCase() || '',
        metaTitle: formData.metaTitle?.trim() || '',
        metaDescription: formData.metaDescription?.trim() || '',
        status: formData.status || 'Draft',
        isFeatured: formData.isFeatured || 'No',
        heroImage: formData.heroImage || '',
        heroImagePublicId: formData.heroImagePublicId || '',
        roadmapImage: formData.roadmapImage || '',
        roadmapImagePublicId: formData.roadmapImagePublicId || '',
        mobileRoadmapImage: formData.mobileRoadmapImage || '',
        mobileRoadmapImagePublicId: formData.mobileRoadmapImagePublicId || '',
        universityCapBg: formData.universityCapBg || '',
        universityCapBgPublicId: formData.universityCapBgPublicId || '',
        universitySliderBg: formData.universitySliderBg || '',
        universitySliderBgPublicId: formData.universitySliderBgPublicId || '',
        immigrationServicesBg: formData.immigrationServicesBg || '',
  immigrationServicesBgPublicId: formData.immigrationServicesBgPublicId || '',
  immigrationServices1Bg: formData.immigrationServices1Bg || '',
  immigrationServices1BgPublicId: formData.immigrationServices1BgPublicId || '',
  immigrationServices2Bg: formData.immigrationServices2Bg || '',
  immigrationServices2BgPublicId: formData.immigrationServices2BgPublicId || '',
        sections: normalizedSections,
        keywords: (formData.keywords && formData.keywords.trim())
          ? formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
          : [],
        tags: (formData.tags && formData.tags.trim())
          ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
          : [],
        canonicalUrl: formData.canonicalUrl?.trim() || '',
      }
      
      // Log keywords and tags conversion
      console.log('🔑 Keywords & Tags Conversion:')
      console.log('  Form Keywords (string):', formData.keywords)
      console.log('  Form Tags (string):', formData.tags)
      console.log('  Converted Keywords (array):', submitData.keywords)
      console.log('  Converted Tags (array):', submitData.tags)
      
      console.log('📤 Submitting form data:', { 
        editingId, 
        sectionsCount: normalizedSections.length,
        submitDataKeys: Object.keys(submitData),
        pageType: submitData.pageType,
        status: submitData.status,
        keywordsCount: Array.isArray(submitData.keywords) ? submitData.keywords.length : 0,
        keywordsArray: submitData.keywords,
        tagsCount: Array.isArray(submitData.tags) ? submitData.tags.length : 0,
        tagsArray: submitData.tags,
        hasCanonicalUrl: !!submitData.canonicalUrl
      })
      
      // Log full payload for Network tab visibility
      console.log('📋 Full Form Payload (Complete JSON):', JSON.stringify(submitData, null, 2))
      console.log('📊 Payload Summary:', {
        totalFields: Object.keys(submitData).length,
        sectionsCount: normalizedSections.length,
        sectionsTypes: normalizedSections.map(s => s.type),
        imagesCount: [
          submitData.heroImage,
          submitData.roadmapImage,
          submitData.mobileRoadmapImage,
          submitData.universityCapBg,
          submitData.universitySliderBg,
          submitData.immigrationServicesBg
        ].filter(img => img).length,
        payloadSize: JSON.stringify(submitData).length + ' bytes'
      })
      console.log('🔗 API Endpoint:', editingId ? `PUT /page-information/${editingId}` : 'POST /page-information')
      console.log('🌐 Full API URL:', editingId 
        ? `${window.location.protocol}//${window.location.hostname}:5000/api/page-information/${editingId}`
        : `${window.location.protocol}//${window.location.hostname}:5000/api/page-information`)
      
      // Also log as table for better visibility
      console.table({
        'Page Type': submitData.pageType,
        'Title': submitData.title,
        'Navbar Title': submitData.navbarTitle,
        'Slug': submitData.slug,
        'Status': submitData.status,
        'Is Featured': submitData.isFeatured,
        'Sections Count': normalizedSections.length,
        'Keywords Count': Array.isArray(submitData.keywords) ? submitData.keywords.length : 0,
        'Tags Count': Array.isArray(submitData.tags) ? submitData.tags.length : 0
      })
      
      let response
      if (editingId) {
        // Update existing page
        try {
          console.log('🚀 Making API call to update page information...')
          response = await pageInformationService.updatePageInformation(editingId, submitData)
          console.log('📥 Update response:', {
            success: response?.success,
            hasData: !!response?.data,
            message: response?.message,
            sectionsCount: response?.data?.sections?.length || 0
          })
          
          // Log complete response JSON
          if (response?.data) {
            console.log('📋 Complete Update Response (JSON):', JSON.stringify(response.data, null, 2))
          }
        } catch (updateError) {
          console.error('❌ Update API error:', updateError)
          throw updateError
        }
        
        if (response && response.success) {
          setSuccess('Page information updated successfully!')
          setError('')
          
          // Log updated sections count
          if (response.data && Array.isArray(response.data.sections)) {
            console.log(`✅ Page updated with ${response.data.sections.length} sections`)
          }
          
          // Update form data immediately with response data
          if (response.data) {
            const pageData = response.data
            const reloadedSections = Array.isArray(pageData.sections) ? pageData.sections : []
            
            setFormData({
              pageType: pageData.pageType || formData.pageType,
              title: pageData.title || '',
              subTitle: pageData.subTitle || '',
              navbarTitle: pageData.navbarTitle || '',
              route: pageData.route || '',
              hasDropdown: pageData.hasDropdown || false,
              slug: pageData.slug || '',
              metaTitle: pageData.metaTitle || '',
              metaDescription: pageData.metaDescription || '',
              status: pageData.status || 'Draft',
              isFeatured: pageData.isFeatured || 'No',
              heroImage: pageData.heroImage || '',
              heroImagePublicId: pageData.heroImagePublicId || '',
              roadmapImage: pageData.roadmapImage || '',
              roadmapImagePublicId: pageData.roadmapImagePublicId || '',
              mobileRoadmapImage: pageData.mobileRoadmapImage || '',
              mobileRoadmapImagePublicId: pageData.mobileRoadmapImagePublicId || '',
              universityCapBg: pageData.universityCapBg || '',
              universityCapBgPublicId: pageData.universityCapBgPublicId || '',
              universitySliderBg: pageData.universitySliderBg || '',
              universitySliderBgPublicId: pageData.universitySliderBgPublicId || '',
              immigrationServicesBg: pageData.immigrationServicesBg || '',
  immigrationServicesBgPublicId: pageData.immigrationServicesBgPublicId || '',
  immigrationServices1Bg: pageData.immigrationServices1Bg || '',
  immigrationServices1BgPublicId: pageData.immigrationServices1BgPublicId || '',
  immigrationServices2Bg: pageData.immigrationServices2Bg || '',
  immigrationServices2BgPublicId: pageData.immigrationServices2BgPublicId || '',
              keywords: Array.isArray(pageData.keywords) ? pageData.keywords.join(', ') : (pageData.keywords || ''),
              tags: Array.isArray(pageData.tags) ? pageData.tags.join(', ') : (pageData.tags || ''),
              canonicalUrl: pageData.canonicalUrl || '',
            })
            setSections(reloadedSections)
            console.log(`🔄 Form data updated with ${reloadedSections.length} sections`)
          }
          
          // Reload page data from server to ensure we have latest
          setTimeout(async () => {
            try {
              const reloadResponse = await pageInformationService.getPageInformation(editingId)
              if (reloadResponse && reloadResponse.success && reloadResponse.data) {
                const pageData = reloadResponse.data
                const reloadedSections = Array.isArray(pageData.sections) ? pageData.sections : []
                console.log(`🔄 Reloaded page from server with ${reloadedSections.length} sections`)
                
                setFormData({
                  pageType: pageData.pageType || formData.pageType,
                  title: pageData.title || '',
                  subTitle: pageData.subTitle || '',
                  navbarTitle: pageData.navbarTitle || '',
                  route: pageData.route || '',
                  hasDropdown: pageData.hasDropdown || false,
                  slug: pageData.slug || '',
                  metaTitle: pageData.metaTitle || '',
                  metaDescription: pageData.metaDescription || '',
                  status: pageData.status || 'Draft',
                  isFeatured: pageData.isFeatured || 'No',
                  heroImage: pageData.heroImage || '',
                  heroImagePublicId: pageData.heroImagePublicId || '',
                  roadmapImage: pageData.roadmapImage || '',
                  roadmapImagePublicId: pageData.roadmapImagePublicId || '',
                  mobileRoadmapImage: pageData.mobileRoadmapImage || '',
                  mobileRoadmapImagePublicId: pageData.mobileRoadmapImagePublicId || '',
                  universityCapBg: pageData.universityCapBg || '',
                  universityCapBgPublicId: pageData.universityCapBgPublicId || '',
                  universitySliderBg: pageData.universitySliderBg || '',
                  universitySliderBgPublicId: pageData.universitySliderBgPublicId || '',
                  immigrationServicesBg: pageData.immigrationServicesBg || '',
                  immigrationServicesBgPublicId: pageData.immigrationServicesBgPublicId || '',
                  keywords: Array.isArray(pageData.keywords) ? pageData.keywords.join(', ') : (pageData.keywords || ''),
                  tags: Array.isArray(pageData.tags) ? pageData.tags.join(', ') : (pageData.tags || ''),
                  canonicalUrl: pageData.canonicalUrl || '',
                })
                setSections(reloadedSections)
              }
            } catch (reloadErr) {
              console.error('❌ Error reloading page data:', reloadErr)
            }
          }, 500)
        } else {
          const errorMsg = response?.message || response?.error || 'Failed to update page information'
          setError(errorMsg)
          console.error('❌ Update failed:', response)
        }
      } else {
        // Create new page
        try {
          console.log('🚀 Making API call to create new page information...')
          response = await pageInformationService.createPageInformation(submitData)
          console.log('📥 Create response:', {
            success: response?.success,
            hasData: !!response?.data,
            message: response?.message
          })
          
          // Log complete response JSON
          if (response?.data) {
            console.log('📋 Complete Create Response (JSON):', JSON.stringify(response.data, null, 2))
          }
        } catch (createError) {
          console.error('❌ Create API error:', createError)
          throw createError
        }
        
        if (response && response.success) {
          setEditingId(response.data._id)
          setSuccess('Page information created successfully!')
          // Optionally navigate back to list after 2 seconds
          setTimeout(() => {
            if (navigate && location.pathname.includes('/website/pages')) {
              navigate('/website/pages')
            }
          }, 2000)
        } else {
          const errorMsg = response?.message || response?.error || 'Failed to create page information'
          setError(errorMsg)
          console.error('❌ Create failed:', response)
        }
      }
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Save error:', err)
      console.error('Error details:', err.response?.data || err)
      
      // Provide more descriptive error messages
      let errorMessage = 'Failed to save page information'
      let errorDetails = []
      
      // Try to extract more details from error response
      if (err.response?.data) {
        errorMessage = err.response.data.message || errorMessage
        if (err.response.data.errors) {
          // Handle array of error messages
          if (Array.isArray(err.response.data.errors)) {
            errorDetails = err.response.data.errors
          } else if (typeof err.response.data.errors === 'object') {
            // Handle object with error messages
            errorDetails = Object.values(err.response.data.errors).map(e => 
              typeof e === 'string' ? e : (e.message || String(e))
            )
          }
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Build final error message
      let finalErrorMessage = errorMessage
      if (errorDetails.length > 0) {
        finalErrorMessage += '. ' + errorDetails.join(', ')
      }
      
      // Handle specific error cases
      if (finalErrorMessage.toLowerCase().includes('validation')) {
        setError(finalErrorMessage)
      } else if (finalErrorMessage.includes('slug already exists') || finalErrorMessage.includes('already exists')) {
        setError(`A page with slug "${formData.slug}" already exists. Please use a different slug (e.g., "${formData.slug}-2" or "ivy-league").`)
      } else if (finalErrorMessage.includes('page type') && finalErrorMessage.includes('not a valid enum')) {
        setError(`Invalid page type. Please select a valid page type from the dropdown.`)
      } else if (finalErrorMessage.includes('title, slug, and page type') || finalErrorMessage.includes('Please provide')) {
        setError(`Missing required fields: ${finalErrorMessage}. Please fill all required fields.`)
      } else if (finalErrorMessage.includes('401') || finalErrorMessage.includes('unauthorized')) {
        setError('Unauthorized. Please login again.')
      } else {
        setError(finalErrorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')}>
            {error}
          </CAlert>
        )}
        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </CAlert>
        )}

        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <strong>{editingId ? 'Edit Page Information' : 'Add Page Information'}</strong>
              </h5>
              <small className="text-body-secondary">
                {editingId ? 'Update your details to keep your Page up-to-date.' : 'Create a new page with images and content'}
              </small>
            </div>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </CButton>
          </CCardHeader>
          <CCardBody>
            {/* Load Existing Page Section - Only show if not editing from URL */}
            {!urlPageId && (
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="mb-3">Load Existing Page</h6>
                <CRow>
                  <CCol md={8}>
                    <CInputGroup>
                      <CFormInput
                        type="text"
                        placeholder="Enter Page ID to load existing page"
                        value={pageId}
                        onChange={(e) => setPageId(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleLoadPage()
                          }
                        }}
                      />
                      <CButton
                        color="primary"
                        onClick={handleLoadPage}
                        disabled={loading || !pageId}
                      >
                        {loading ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilSearch} className="me-2" />
                            Load Page
                          </>
                        )}
                      </CButton>
                    </CInputGroup>
                    <small className="text-muted">
                      Enter the page ID from the database to load and edit existing page data including images.
                    </small>
                  </CCol>
                </CRow>
              </div>
            )}

            <CForm onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-4">
                <h6 className="mb-3">Basic Information</h6>
                <CRow>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="pageType">
                      Page Type <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      id="pageType"
                      name="pageType"
                      value={formData.pageType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="home_page">Home Page</option>
                      <option value="about_page">About Page</option>
                      <option value="contact_page">Contact Page</option>
                      <option value="services_page">Services Page</option>
                      <option value="destination_page">Destination Page</option>
                      <option value="blogs_page">Blogs Page</option>
                      <option value="events_page">Events Page</option>
                      <option value="career_page">Career Page</option>
                      <option value="city_page">City Page</option>
                      <option value="ivy_league">Ivy League</option>
                      <option value="usa_universities">USA Universities</option>
                      <option value="uk_universities">UK Universities</option>
                      <option value="germany_public_universities">Germany Public Universities</option>
                      <option value="italy_france">Italy & France</option>
                      <option value="canada_australia">Canada & Australia</option>
                      <option value="other">Other</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="status">Status</CFormLabel>
                    <CFormSelect
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="title">
                      Title {(() => {
                        const isDestinationPage = formData.pageType === 'destination_page' || 
                                                  (formData.pageType && !['home_page', 'about_page', 'contact_page', 'services_page', 'blogs_page', 'events_page', 'career_page', 'city_page'].includes(formData.pageType))
                        return !isDestinationPage ? <span className="text-danger">*</span> : null
                      })()}
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter page title"
                      
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="subTitle">Sub Title</CFormLabel>
                    <CFormInput
                      type="text"
                      id="subTitle"
                      name="subTitle"
                      value={formData.subTitle}
                      onChange={handleInputChange}
                      placeholder="Enter sub title"
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="navbarTitle">Navbar Title</CFormLabel>
                    <CFormInput
                      type="text"
                      id="navbarTitle"
                      name="navbarTitle"
                      value={formData.navbarTitle}
                      onChange={handleInputChange}
                      placeholder="Enter navbar title"
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="route">Route</CFormLabel>
                    <CFormInput
                      type="text"
                      id="route"
                      name="route"
                      value={formData.route}
                      onChange={handleInputChange}
                      placeholder="Enter route (e.g., /about, /contact)"
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="hasDropdown">Has Dropdown</CFormLabel>
                    <CFormSelect
                      id="hasDropdown"
                      name="hasDropdown"
                      value={formData.hasDropdown === true || formData.hasDropdown === 'true' ? 'true' : 'false'}
                      onChange={handleInputChange}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="slug">
                      Slug <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="page-slug"
                      required
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="isFeatured">Is Featured</CFormLabel>
                    <CFormSelect
                      id="isFeatured"
                      name="isFeatured"
                      value={formData.isFeatured}
                      onChange={handleInputChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="metaTitle">Meta Title</CFormLabel>
                    <CFormInput
                      type="text"
                      id="metaTitle"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      placeholder="Enter meta title"
                    />
                  </CCol>
                  <CCol md={12} className="mb-3">
                    <CFormLabel htmlFor="metaDescription">Meta Description</CFormLabel>
                    <CFormTextarea
                      id="metaDescription"
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      placeholder="Enter meta description"
                      rows="3"
                    />
                  </CCol>
                </CRow>
              </div>

              {/* Page Type Specific Fields */}
              {(formData.pageType === 'home_page' || 
                formData.pageType === 'city_page' || 
                formData.pageType === 'ivy_league' ||
                formData.pageType === 'usa_universities' ||
                formData.pageType === 'uk_universities' ||
                formData.pageType === 'germany_public_universities' ||
                formData.pageType === 'italy_france' ||
                formData.pageType === 'canada_australia' ||
                formData.pageType === 'other') && (
                <div className="mb-4">
                  <h6 className="mb-3">
                    {formData.pageType === 'home_page' ? 'Home Page Images' : 
                     formData.pageType === 'city_page' ? 'City Page Fields' : 
                     formData.pageType === 'ivy_league' ? 'Ivy League Page Fields' :
                     formData.pageType === 'usa_universities' ? 'USA Universities Page Fields' :
                     formData.pageType === 'uk_universities' ? 'UK Universities Page Fields' :
                     formData.pageType === 'germany_public_universities' ? 'Germany Public Universities Page Fields' :
                     formData.pageType === 'italy_france' ? 'Italy & France Page Fields' :
                     formData.pageType === 'canada_australia' ? 'Canada & Australia Page Fields' :
                     formData.pageType === 'services_page' ? 'Services Page Fields' :
                     formData.pageType === 'destination_page' ? 'Destination Page Fields' :
                     formData.pageType === 'blogs_page' ? 'Blogs Page Fields' :
                     formData.pageType === 'events_page' ? 'Events Page Fields' :
                     formData.pageType === 'career_page' ? 'Career Page Fields' :
                     'Page Images'}
                  </h6>
                  <CRow>
                    {renderImageField('Hero Image', 'heroImage')}
                    {formData.pageType === 'home_page' && (
  <>
    
    {renderImageField('Roadmap Image', 'roadmapImage')}
    {renderImageField('Mobile Roadmap Image', 'mobileRoadmapImage')}
    {renderImageField('University Cap Background', 'universityCapBg')}
    {renderImageField('University Slider Background', 'universitySliderBg')}
    {renderImageField('Immigration Services Background', 'immigrationServicesBg')}
    {renderImageField('Immigration Services IMG1', 'immigrationServices1Bg')}
    {renderImageField('Immigration Services IMG2', 'immigrationServices2Bg')}
  </>
)}
                    {(formData.pageType === 'ivy_league' || 
                      formData.pageType === 'city_page' || 
                      formData.pageType === 'usa_universities' ||
                      formData.pageType === 'uk_universities' ||
                      formData.pageType === 'germany_public_universities' ||
                      formData.pageType === 'italy_france' ||
                      formData.pageType === 'canada_australia' ||
                      formData.pageType === 'other') && (
                      <>
                        {/* Additional image fields for university pages */}
                        {renderImageField('Background Image 1', 'roadmapImage')}
                        {renderImageField('Background Image 2', 'mobileRoadmapImage')}
                        {renderImageField('Background Image 3', 'universityCapBg')}
                      </>
                    )}
                  </CRow>
                </div>
              )}

              {/* Sections Fields */}
              
              <div className="mb-4">
                <h6 className="mb-3">Sections Fields</h6>
                <CRow>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('hero_section')}

                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Hero Section
                    </CButton>
                  </CCol>

                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('form_section')}

                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Form Section
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('why_choose_us')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Why Choose Us
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('slider_card')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Slider Card
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('road-map')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Road-map
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('content')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Content
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('statistics')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Statistics
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('comparison_table')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Comparison Table
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('blog_section')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Blog/News
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('requirements')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Requirements
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('testimonials')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Testimonials
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('case_studies')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Case Studies
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('cta_section')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add CTA Section
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('track_record')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Track Record
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('university_partners')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add University Partners
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('immigration_services')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Immigration Services
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('video_testimonials')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Video Testimonials
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('image_testimonials')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Image Testimonials
                    </CButton>
                  </CCol>
                  <CCol md={3} className="mb-2">
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => handleAddSection('top_universities')}
                    >
                      <CIcon icon={cilPlus} className="me-2" />
                      Add Top Universities
                    </CButton>
                  </CCol>
                </CRow>

                {/* Display added sections with edit forms */}
                {Array.isArray(sections) && sections.length > 0 && (
                  <div className="mt-3">
                    {sections.map((section, index) => renderSectionForm(section, index))}
                  </div>
                )}
              </div>

              {/* SEO and Metadata Fields */}
              <div className="mb-4">
                <h6 className="mb-3">SEO and Metadata Fields</h6>
                <CRow>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="keywords">Keywords (comma-separated)</CFormLabel>
                    <CFormInput
                      type="text"
                      id="keywords"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      placeholder="seo, marketing"
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="tags">Tags (comma-separated)</CFormLabel>
                    <CFormInput
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="blog, featured"
                    />
                  </CCol>
                  <CCol md={12} className="mb-3">
                    <CFormLabel htmlFor="canonicalUrl">Canonical URL</CFormLabel>
                    <CFormInput
                      type="text"
                      id="canonicalUrl"
                      name="canonicalUrl"
                      value={formData.canonicalUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/page"
                    />
                  </CCol>
                </CRow>
              </div>

              {/* Submit Buttons */}
              <div className="d-flex justify-content-end gap-2">
                <CButton color="secondary" variant="outline">
                  Cancel
                </CButton>
                <CButton color="primary" type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilSave} className="me-2" />
                      Save Page
                    </>
                  )}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PageInformation