// components/PageForm.jsx
import React, { useState, useEffect } from 'react'
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
  CTabs,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import DynamicFormBuilder from './FormBuilder'
import { getPageSchema, getPageTypes, getDefaultValues } from './SchemaLoader'

const PageForm = ({ page, onSubmit, onCancel, error, submitting }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [pageType, setPageType] = useState(page?.pageType || 'general')
  const [formData, setFormData] = useState({
    // Basic page info
    title: page?.title || '',
    subTitle: page?.subTitle || '',
    slug: page?.slug || '',
    pageType: page?.pageType || 'general',
    metaDescription: page?.metaDescription || '',
    metaKeywords: page?.metaKeywords || '',
    status: page?.status || 'Draft',
    isFeatured: page?.isFeatured || false,
    isNavbar: page?.isNavbar || false,
    content: page?.content || {},
  })

  const [slugError, setSlugError] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const pageSchema = getPageSchema(pageType)

  // useEffect(() => {
  //   if (!page) {
  //     const defaultContent = getDefaultValues(pageType)
  //     console.log(defaultContent)

  //     setFormData(prev => ({
  //       ...prev,
  //       pageType,
  //       content: defaultContent
  //     }))
  //   }
  // }, [pageType, page])

  useEffect(() => {
    if (page) {
      const { sections,seoMeta, ...extra } = page
      setPageType(page.pageType || 'general')
      setFormData({
        content: page.sections || getDefaultValues(page.pageType || 'general'),
        ...extra,...seoMeta
      })
    }
  }, [page])

  const handleBasicInfoChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

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
      setPageType(value)
    }
  }

  const handleContentChange = (sectionName, fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [sectionName]: {
          ...prev.content[sectionName],
          [fieldName]: value
        }
      }
    }))
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

    // Basic validation
    if (!formData.title.trim()) {
      setFormErrors({ title: 'Title is required' })
      setActiveTab(0) // Switch to first tab (General Info)
      return
    }

    if (!formData.slug.trim()) {
      setSlugError('Slug is required')
      setActiveTab(0) // Switch to first tab (General Info)
      return
    }

    if (!validateSlug(formData.slug)) {
      setActiveTab(0) // Switch to first tab (General Info)
      return
    }

    const { content, metaDescription, metaKeywords, canonicalUrl, metaTitle, ...rest } = formData

    onSubmit({ ...rest, sections: content ,seoMeta: { metaDescription, metaKeywords, canonicalUrl, metaTitle } })
  }

  const handleFormError = (fieldName, error) => {
    setFormErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  const pageTypes = getPageTypes()

  return (
    <CForm onSubmit={handleSubmit}>
      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}
      <div style={{ maxWidth: "1400px" }} className='mx-auto'>
        <CTabContent>
          <CTabPane visible>
            <div className="mt-3">
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel>Page Title *</CFormLabel>
                  <CFormInput
                    name="title"
                    value={formData.title}
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
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Page Type *</CFormLabel>
                  <CFormSelect
                    name="pageType"
                    value={formData.pageType}
                    onChange={handleBasicInfoChange}
                    required
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
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    name="status"
                    value={formData.status}
                    onChange={handleBasicInfoChange}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="g-3">

                <CCol md={6}>
                  <CFormLabel>Slug *</CFormLabel>
                  <CFormInput
                    name="slug"
                    value={formData.slug}
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
                    URL will be: {formData.slug}
                  </div>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Navbar Title</CFormLabel>
                  <CFormInput
                    name="navbarTitle"
                    value={formData.navbarTitle}
                    onChange={handleBasicInfoChange}
                    placeholder="Enter navbarTitle"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Subtitle</CFormLabel>
                  <CFormTextarea
                    name="subTitle"
                    value={formData.subTitle}
                    onChange={handleBasicInfoChange}
                    placeholder="Enter subtitle (optional)"
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Description</CFormLabel>
                  <CFormTextarea
                    name="description"
                    value={formData.description}
                    onChange={handleBasicInfoChange}
                    placeholder="Enter description (optional)"
                  />
                </CCol>
              </CRow>


              <CRow className="mt-3">
                <CCol md={12} className="d-flex gap-4">
                  <CFormCheck
                    id="isFeatured"
                    name="isFeatured"
                    label="Featured Page"
                    checked={formData.isFeatured}
                    onChange={handleBasicInfoChange}
                  />
                  <CFormCheck
                    id="isNavbar"
                    name="isNavbar"
                    label="Show in Navbar"
                    checked={formData.isNavbar}
                    onChange={handleBasicInfoChange}
                  />
                </CCol>
              </CRow>
            </div>
          </CTabPane>

          {/* Page Content Tab */}
          <CTabPane visible>
            <div className="mt-3">
              <CCard>
                <CCardBody>
                  {pageSchema ? (
                    <DynamicFormBuilder
                      schema={pageSchema}
                      formData={formData.content}
                      onChange={handleContentChange}
                      onError={handleFormError}
                      loading={submitting}
                    />
                  ) : (
                    <div className="text-center py-5">
                      <CSpinner />
                      <div className="mt-2">Loading form schema...</div>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </div>
          </CTabPane>

          {/* SEO Settings Tab */}
          <CTabPane visible>
            <div className="mt-3">
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel>Meta title</CFormLabel>
                  <CFormTextarea
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleBasicInfoChange}
                    placeholder="Enter meta metaTitle for SEO "
                    rows={2}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Meta Description</CFormLabel>
                  <CFormTextarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleBasicInfoChange}
                    placeholder="Enter meta description for SEO (recommended: 150-160 characters)"
                    rows={2}
                  />
                  <div className="form-text">
                    {formData.metaDescription?.length || 0} characters
                  </div>
                </CCol>
              </CRow>

              <CRow className="g-3 mt-1">
                <CCol md={6}>
                  <CFormLabel>Meta Keywords</CFormLabel>
                  <CFormTextarea
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleBasicInfoChange}
                    placeholder="Enter keywords separated by commas"
                  />
                  <div className="form-text">
                    Example: study abroad, university admission, education consultancy
                  </div>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Canonical URL</CFormLabel>
                  <CFormTextarea
                    name="canonicalUrl"
                    value={formData.canonicalUrl}
                    onChange={handleBasicInfoChange}
                    placeholder="Enter canonicalUrl"
                  />
                </CCol>
              </CRow>
            </div>
          </CTabPane>
        </CTabContent>
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