import React, { useState, useEffect } from 'react'
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
  CAlert,
  CSpinner,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import { FaYoutube, FaImage } from 'react-icons/fa'
import uploadService from '../../services/uploadService'

const TestimonialForm = ({
  testimonial = null,
  onSuccess,
  onCancel,
  submitting = false,
}) => {
  // ================= STATE =================
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    university: '',
    videoUrl: '',
    message: '',
    content: '',
    rating: 5,
    type: 'image', // image | video | caseStudy
    status: 'Pending',
    isFeatured: false,
    metaDetails: {},
  })

  // 🔥 scalable image handler
  const [images, setImages] = useState({
    testimonial: '',
    universityLogo: '',
    // future: banner, gallery, etc.
  })

  const [previews, setPreviews] = useState({})
  const [uploading, setUploading] = useState({})
  const [error, setError] = useState('')

  // ================= INIT =================
  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name || '',
        designation: testimonial.designation || '',
        university: testimonial.university || '',
        videoUrl: testimonial.videoUrl || '',
        message: testimonial.message || '',
        content: testimonial.content || '',
        rating: testimonial.rating || 5,
        type: testimonial.type || 'image',
        status: testimonial.status || 'Pending',
        isFeatured: testimonial.isFeatured || false,
        metaDetails: testimonial.metaDetails || {},
      })

      setImages({
        testimonial: testimonial.image || '',
        universityLogo: testimonial.universityLogo || '',
      })

      setPreviews({
        testimonial: testimonial.image || '',
        universityLogo: testimonial.universityLogo || '',
      })
    }
  }, [testimonial])

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // 🔥 reusable upload handler
  const handleImageUpload = async (e, key) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    setUploading(prev => ({ ...prev, [key]: true }))
    setError('')

    try {
      const res = await uploadService.uploadImage(file)
      if (res.success) {
        setImages(prev => ({ ...prev, [key]: res.data.url }))
        setPreviews(prev => ({ ...prev, [key]: res.data.url }))
      }
    } catch (err) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }))
    }
  }

  // ================= SUBMIT =================
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.message) {
      setError('Name and testimonial message are required')
      return
    }

    if (formData.type === 'caseStudy' && !formData.content) {
      setError('Case study content is required')
      return
    }

    const payload = {
      ...formData,
      image: images.testimonial,
      universityLogo: images.universityLogo,
      rating: Number(formData.rating),
    }
    

    onSuccess(payload)
  }

  // ================= UI =================
  return (
    <CForm onSubmit={handleSubmit} style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {error && <CAlert color="danger">{error}</CAlert>}

      {/* BASIC INFO */}
      <CCard className="mb-4">
        <CCardHeader><h5>Basic Information</h5></CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Name *</CFormLabel>
              <CFormInput name="name" value={formData.name} onChange={handleChange} required />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Designation</CFormLabel>
              <CFormInput name="designation" value={formData.designation} onChange={handleChange} />
            </CCol>

            <CCol md={6}>
              <CFormLabel>University</CFormLabel>
              <CFormInput name="university" value={formData.university} onChange={handleChange} />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Testimonial Type</CFormLabel>
              <CFormSelect name="type" value={formData.type} onChange={handleChange}>
                <option value="image">Image Testimonial</option>
                <option value="video">Video Testimonial</option>
                <option value="caseStudy">Case Study</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* MESSAGE */}
      <CCard className="mb-4">
        <CCardHeader><h5>Testimonial Message</h5></CCardHeader>
        <CCardBody>
          <CFormTextarea
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </CCardBody>
      </CCard>

      {/* CASE STUDY */}
      {formData.type === 'caseStudy' && (
        <CCard className="mb-4">
          <CCardHeader><h5>Case Study Content</h5></CCardHeader>
          <CCardBody>
            <CFormTextarea
              rows={6}
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
            />
          </CCardBody>
        </CCard>
      )}

      {/* MEDIA */}
      <CCard className="mb-4">
        <CCardHeader><h5>Media</h5></CCardHeader>
        <CCardBody>
          <CRow className="g-4">
            {/* Testimonial Image */}
            <CCol md={6}>
              <CFormLabel><FaImage className="me-1" /> Testimonial Image</CFormLabel>
              <CFormInput
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'testimonial')}
                disabled={uploading.testimonial}
              />
              {uploading.testimonial && <CSpinner size="sm" className="ms-2" />}
              {previews.testimonial && (
                <img src={previews.testimonial} alt="" height={80} className="mt-2" />
              )}
            </CCol>

            {/* University Logo */}
            <CCol md={6}>
              <CFormLabel><FaImage className="me-1" /> University Logo</CFormLabel>
              <CFormInput
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'universityLogo')}
                disabled={uploading.universityLogo}
              />
              {uploading.universityLogo && <CSpinner size="sm" className="ms-2" />}
              {previews.universityLogo && (
                <img src={previews.universityLogo} alt="" height={80} className="mt-2" />
              )}
            </CCol>

            {/* Video */}
            <CCol md={6}>
              <CFormLabel><FaYoutube className="me-1" /> Video URL</CFormLabel>
              <CFormInput
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="YouTube / Vimeo URL"
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* SETTINGS */}
      <CCard className="mb-4">
        <CCardHeader><h5>Settings</h5></CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>Rating</CFormLabel>
              <CFormSelect name="rating" value={formData.rating} onChange={handleChange}>
                {[5, 4, 3, 2, 1].map(r => (
                  <option key={r} value={r}>{r} Star</option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={4}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={formData.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </CFormSelect>
            </CCol>

            <CCol md={4} className="d-flex align-items-center">
              <CFormCheck
                label="Featured"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))
                }
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* ACTIONS */}
      <div className="d-flex justify-content-end gap-2">
        <CButton color="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </CButton>
        <CButton type="submit" color="primary" disabled={submitting}>
          {submitting ? (
            <>
              <CSpinner size="sm" className="me-2" /> Saving...
            </>
          ) : (
            testimonial ? 'Update Testimonial' : 'Create Testimonial'
          )}
        </CButton>
      </div>
    </CForm>
  )
}

export default TestimonialForm
