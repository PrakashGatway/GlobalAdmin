// components/PageForm.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
  CButton,
  CRow,
  CCol,
  CAlert,
  CSpinner,
  CCard,
  CCardBody,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import DynamicFormBuilder, { uploadFile } from './FormBuilder'
import { getPageSchema, getPageTypes, getDefaultValues } from './SchemaLoader'
import countryService from '../../services/countryService'

const PageForm = ({ page, onSubmit, onCancel, error, submitting }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [pageType, setPageType] = useState(page?.pageType || 'general')
  const [formData, setFormData] = useState({
    // Basic page info
    title: '',
    subTitle: '',
    description: '',
    slug: '',
    pageType: '',
    // SEO fields
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    // Page settings
    status: 'Draft',
    isFeatured: false,
    isNavbar: false,
    navbarTitle: '',
    navbarImage: '',
    cardImage: '',
    // Country specific
    country: "",
    // Content sections
    content: {},
  })

  const [slugError, setSlugError] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const pageSchema = getPageSchema(pageType)
  const [countries, setCountries] = useState([])
  
  // Add ref to track if initial load has been done
  const previousPageIdRef = useRef(null)



  const fetchCountries = async () => {
    try {
      const res = await countryService.getCountries({ limit: 300 })
      if (res.success) {
        const countriesData = res.data || []
        setCountries(countriesData)
        
        setTimeout(() => {
          console.log('After 1 second - countries state:', countries)
        }, 1000)
      }
    } catch (err) {
      console.error('Failed to fetch countries', err)
    }
  }

  useEffect(() => {
    if (formData?.pageType === "country") {
      fetchCountries()
    }
  }, [formData?.pageType])

  // Fixed useEffect to prevent resetting form on every render
 useEffect(() => {
  // Get current page ID
  const currentPageId = page?._id || null
  
  // Check if this is a new page or different page
  const isNewPage = !page
  const isDifferentPage = currentPageId !== previousPageIdRef.current
  
  // Only set form data if:
  // 1. We have a page AND (it's a different page OR it's the first load)
  // 2. OR we're creating a new page (page is null)
  if (page && (isDifferentPage || previousPageIdRef.current === null)) {
    console.log('Setting page data for:', page.title || page._id)
    
    const seoData = page.seoMeta || {}
    
    setPageType(page.pageType || 'general')
    setFormData({
      title: page.title || '',
      subTitle: page.subTitle || '',
      description: page.description || '',
      slug: page.slug || '',
      pageType: page.pageType || 'general',
      metaTitle: seoData.metaTitle || '',
      metaDescription: seoData.metaDescription || '',
      metaKeywords: seoData.metaKeywords || '',
      canonicalUrl: seoData.canonicalUrl || page.canonicalUrl || '',
      status: page.status || 'Draft',
      isFeatured: page.isFeatured || false,
      isNavbar: page.isNavbar || false,
      navbarTitle: page.navbarTitle || '',
      navbarImage: page.navbarImage || '',
      cardImage: page.cardImage || '',
      country: page?.country && page?.country || null,
      content: page.sections || {},
    })
    
    // Store the current page ID
    previousPageIdRef.current = currentPageId
  }
  
  // Handle new page creation (when page becomes null)
  if (!page && previousPageIdRef.current !== null) {
   
    const defaultPageType = 'general'
    setPageType(defaultPageType)
    setFormData({
      title: '',
      subTitle: '',
      description: '',
      slug: '',
      pageType: defaultPageType,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      canonicalUrl: '',
      status: 'Draft',
      isFeatured: false,
      isNavbar: false,
      navbarTitle: '',
      navbarImage: '',
      cardImage: '',
      country: null,
      content: getDefaultValues(defaultPageType),
    })
    
    previousPageIdRef.current = null
  }
}, [page]) // Keep dependency on page

  const handleBasicInfoChange = (e) => {
    const { name, value, type, checked } = e.target
    
    console.log('Input changed:', name, value)
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
      console.log('New form data:', newData)
      return newData
    })

    // Auto-generate slug from title
    if (name === 'title' && !page) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
      validateSlug(generatedSlug)
    }

    // Page type change
    if (name === 'pageType' && !page) {
      const newPageType = value
      setPageType(newPageType)
      const defaultContent = getDefaultValues(newPageType)
      setFormData(prev => ({
        ...prev,
        pageType: newPageType,
        content: defaultContent
      }))
    }
  }

  const handleContentChange = (sectionId, fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [sectionId]: {
          ...(prev.content[sectionId] || {}),
          [fieldName]: value
        }
      }
    }))
  }

  const handleSectionsUpdate = (updatedContent, updatedSections) => {
    setFormData(prev => ({
      ...prev,
      content: updatedContent
    }))
    
    console.log('Sections updated:', updatedSections)
  }

  const validateSlug = (slug) => {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens')
      return false
    }
    if (slug.startsWith('-') || slug.endsWith('-')) {
      setSlugError('Slug cannot start or end with a hyphen')
      return false
    }
    if (slug.includes('--')) {
      setSlugError('Slug cannot contain consecutive hyphens')
      return false
    }
    setSlugError('')
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setFormErrors({ title: 'Title is required' })
      setActiveTab(0)
      return
    }

    if (!formData.slug.trim()) {
      setSlugError('Slug is required')
      setActiveTab(0)
      return
    }

    if (!validateSlug(formData.slug)) {
      setActiveTab(0)
      return
    }

    const { content, metaTitle, metaDescription, metaKeywords, canonicalUrl, ...rest } = formData
    
    const submitData = {
      ...rest,
      sections: content,
      seoMeta: {
        metaTitle: metaTitle || '',
        metaDescription: metaDescription || '',
        metaKeywords: metaKeywords || '',
        canonicalUrl: canonicalUrl || '',
      }
    }

    console.log('Submitting data:', submitData)
    onSubmit(submitData)
  }

  const handleFormError = (fieldName, error) => {
    setFormErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  const pageTypes = getPageTypes()

  useEffect(() => {
    console.log('Current SEO values in form:', {
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      metaKeywords: formData.metaKeywords,
      canonicalUrl: formData.canonicalUrl
    })
  }, [formData.metaTitle, formData.metaDescription, formData.metaKeywords, formData.canonicalUrl])

  return (
    <CForm onSubmit={handleSubmit}>
      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}
      
      <CNav variant="tabs" className="mb-3">
        <CNavItem>
          <CNavLink
            active={activeTab === 0}
            onClick={() => setActiveTab(0)}
            style={{ cursor: 'pointer' }}
          >
            General Info
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 1}
            onClick={() => setActiveTab(1)}
            style={{ cursor: 'pointer' }}
          >
            Page Content
            {Object.keys(formData.content || {}).length > 0 && (
              <CBadge color="info" className="ms-2" size="sm">
                {Object.keys(formData.content).length} sections
              </CBadge>
            )}
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 2}
            onClick={() => setActiveTab(2)}
            style={{ cursor: 'pointer' }}
          >
            SEO Settings
          </CNavLink>
        </CNavItem>
      </CNav>

      

      <div style={{ maxWidth: "1400px" }} className='mx-auto'>
        {/* General Info Tab */}
        {activeTab === 0 && (
          <div className="mt-3">
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="title">Page Title *</CFormLabel>
                <CFormInput
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter page title"
                  required
                  invalid={!!formErrors.title}
                />
                {formErrors.title && (
                  <div className="invalid-feedback d-block">
                    {formErrors.title}
                  </div>
                )}
                <div className="form-text">
                  This will be displayed as the main heading of the page
                </div>
              </CCol>

              <CCol md={3}>
                <CFormLabel htmlFor="pageType">Page Type *</CFormLabel>
                <CFormSelect
                  id="pageType"
                  name="pageType"
                  value={formData.pageType}
                  onChange={handleBasicInfoChange}
                  required
                  disabled={!!page}
                >
                  <option value="">Select Page Type</option>
                  {pageTypes.map((type, idx) => (
                    <option key={idx} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </CFormSelect>
                <div className="form-text">
                  {pageTypes.find(t => t.value === formData.pageType)?.description}
                </div>
                {page && (
                  <div className="text-warning small mt-1">
                    ⚠️ Page type cannot be changed after creation
                  </div>
                )}
              </CCol>

              <CCol md={3}>
                <CFormLabel htmlFor="status">Status</CFormLabel>
                <CFormSelect
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleBasicInfoChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </CFormSelect>
                <div className="form-text">
                  Draft pages are only visible to admins
                </div>
              </CCol>
            </CRow>

            <CRow className="g-3 mt-3">
              <CCol md={6}>
                <CFormLabel htmlFor="slug">Slug *</CFormLabel>
                <CFormInput
                  id="slug"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter URL slug"
                  required
                  invalid={!!slugError}
                />
                {slugError && (
                  <div className="invalid-feedback d-block">
                    {slugError}
                  </div>
                )}
                <div className="form-text">
                  URL will be: /{formData.slug || 'page-slug'}
                </div>
              </CCol>

              <CCol md={6}>
                <CFormLabel htmlFor="navbarTitle">Navbar Title</CFormLabel>
                <CFormInput
                  id="navbarTitle"
                  name="navbarTitle"
                  value={formData.navbarTitle || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter navbar title"
                />
                <div className="form-text">
                  If left empty, page title will be used in navbar
                </div>
              </CCol>
            </CRow>

            <CRow className="g-3 mt-3">
              <CCol md={6}>
                <CFormLabel htmlFor="subTitle">Subtitle</CFormLabel>
                <CFormTextarea
                  id="subTitle"
                  name="subTitle"
                  value={formData.subTitle || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter subtitle (optional)"
                  rows={2}
                />
                <div className="form-text">
                  Brief subtitle that appears below the title
                </div>
              </CCol>

              <CCol md={6}>
                <CFormLabel htmlFor="description">Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter description (optional)"
                  rows={2}
                />
                <div className="form-text">
                  Detailed description of the page content
                </div>
              </CCol>
            </CRow>

            {formData?.pageType === 'country' && (
              <CRow className="g-3 mt-3">
                <CCol md={12}>
                  <CFormLabel htmlFor="country">Country</CFormLabel>
                  <CFormSelect
                    id="country"
                    name="country"
                    value={formData?.country || null}
                    onChange={handleBasicInfoChange}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country?._id} value={country?._id}>
                        {country?.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <div className="form-text">
                    Select the country this page is associated with
                  </div>
                </CCol>
              </CRow>
            )}

            <CRow className="g-3 mt-3">
              <CCol md={6}>
                <CFormLabel htmlFor="cardImage">Card Image</CFormLabel>
                <CFormInput
                  type="file"
                  id="cardImage"
                  accept="image/*"
                  name="cardImage"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return

                    try {
                      const imageUrl = await uploadFile(file)
                      setFormData(prev => ({ ...prev, cardImage: imageUrl }))
                    } catch (err) {
                      console.error(err)
                      alert(err.message || 'Image upload failed')
                    }
                  }}
                />
                <div className="form-text">
                  Image shown in cards and listings (recommended size: 400x300px)
                </div>
                {formData.cardImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.cardImage} 
                      alt="Card preview" 
                      width="120" 
                      className="img-thumbnail" 
                    />
                    <CButton
                      size="sm"
                      color="danger"
                      variant="ghost"
                      className="ms-2"
                      onClick={() => setFormData(prev => ({ ...prev, cardImage: '' }))}
                    >
                      Remove
                    </CButton>
                  </div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel htmlFor="navbarImage">Navbar Logo</CFormLabel>
                <CFormInput
                  type="file"
                  id="navbarImage"
                  accept="image/*"
                  name="navbarImage"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    try {
                      const imageUrl = await uploadFile(file)
                      setFormData(prev => ({ ...prev, navbarImage: imageUrl }))
                    } catch (err) {
                      console.error(err)
                      alert(err.message || 'Image upload failed')
                    }
                  }}
                />
                <div className="form-text">
                  Custom logo for navbar (recommended size: 150x50px)
                </div>
                {formData.navbarImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.navbarImage} 
                      alt="Navbar logo preview" 
                      width="120" 
                      className="img-thumbnail" 
                    />
                    <CButton
                      size="sm"
                      color="danger"
                      variant="ghost"
                      className="ms-2"
                      onClick={() => setFormData(prev => ({ ...prev, navbarImage: '' }))}
                    >
                      Remove
                    </CButton>
                  </div>
                )}
              </CCol>
            </CRow>

            <CRow className="mt-4">
              <CCol md={12} className="d-flex gap-4">
                <CFormCheck
                  id="isFeatured"
                  name="isFeatured"
                  label="Featured Page"
                  checked={formData.isFeatured}
                  onChange={handleBasicInfoChange}
                />
                <div className="form-text ms-2">
                  Featured pages appear on the homepage
                </div>
              </CCol>
              <CCol md={12} className="d-flex gap-4 mt-2">
                <CFormCheck
                  id="isNavbar"
                  name="isNavbar"
                  label="Show in Navbar"
                  checked={formData.isNavbar}
                  onChange={handleBasicInfoChange}
                />
                <div className="form-text ms-2">
                  Display this page in the main navigation menu
                </div>
              </CCol>
            </CRow>

            <CRow className="mt-4">
              <CCol md={12}>
                <CCard className="bg-light">
                  <CCardBody>
                    <h6 className="mb-2">Page Information Help</h6>
                    <small className="text-muted">
                      <strong>Title:</strong> The main heading of your page. This appears in search results and browser tabs.<br />
                      <strong>Slug:</strong> The URL path for your page. Use hyphens between words (e.g., "about-us").<br />
                      <strong>Page Type:</strong> Determines the layout and available content sections.<br />
                      <strong>Status:</strong> Draft pages are not visible to visitors.<br />
                      <strong>Navbar Title:</strong> If set, this appears in the navigation menu instead of the page title.<br />
                      <strong>Images:</strong> Upload images for cards and navbar. Supported formats: JPG, PNG, GIF. Max size: 2MB.
                    </small>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </div>
        )}

        {/* Page Content Tab */}
        {activeTab === 1 && (
          <div className="mt-3">
            <CCard>
              <CCardBody>
                <DynamicFormBuilder
                  schema={pageSchema}
                  formData={formData.content}
                  onChange={handleContentChange}
                  onError={handleFormError}
                  onSectionsUpdate={handleSectionsUpdate}
                  loading={submitting}
                />
              </CCardBody>
            </CCard>
          </div>
        )}

        {/* SEO Settings Tab */}
        {activeTab === 2 && (
          <div className="mt-3">
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="metaTitle">Meta Title</CFormLabel>
                <CFormInput
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter meta title for SEO"
                />
                <div className="form-text">
                  Recommended length: 50-60 characters. Current: {formData.metaTitle?.length || 0}
                </div>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="metaDescription">Meta Description</CFormLabel>
                <CFormTextarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter meta description for SEO (recommended: 150-160 characters)"
                  rows={3}
                />
                <div className="form-text">
                  {formData.metaDescription?.length || 0} characters (recommended: 150-160)
                </div>
              </CCol>
            </CRow>

            <CRow className="g-3 mt-3">
              <CCol md={6}>
                <CFormLabel htmlFor="metaKeywords">Meta Keywords</CFormLabel>
                <CFormTextarea
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter keywords separated by commas"
                  rows={2}
                />
                <div className="form-text">
                  Example: study abroad, university admission, education consultancy
                </div>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="canonicalUrl">Canonical URL</CFormLabel>
                <CFormInput
                  id="canonicalUrl"
                  name="canonicalUrl"
                  value={formData.canonicalUrl || ''}
                  onChange={handleBasicInfoChange}
                  placeholder="https://example.com/preferred-url"
                />
                <div className="form-text">
                  Use absolute URL for canonical tag to prevent duplicate content issues
                </div>
              </CCol>
            </CRow>

            <CRow className="mt-4">
              <CCol md={12}>
                <CCard className="bg-light">
                  <CCardBody>
                    <h6 className="mb-2">SEO Best Practices</h6>
                    <small className="text-muted">
                      <strong>Meta Title:</strong> Include primary keywords and keep under 60 characters.<br />
                      <strong>Meta Description:</strong> Write a compelling summary that encourages clicks. Include key information.<br />
                      <strong>Meta Keywords:</strong> Separate keywords with commas. Focus on relevant terms.<br />
                      <strong>Canonical URL:</strong> Set this if you have multiple URLs pointing to the same content to avoid duplicate content penalties.
                    </small>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <CButton color="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </CButton>
        <CButton color="primary" type="submit" disabled={submitting}>
          {submitting && <CSpinner size="sm" className="me-2" />}
          {page ? 'Update Page' : 'Create Page'}
        </CButton>
      </div>
    </CForm>
  )
}

export default PageForm