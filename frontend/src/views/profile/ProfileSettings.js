import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
  CSpinner,
} from '@coreui/react'
import { cilUser, cilSave } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import uploadService from '../../services/uploadService'

const ProfileSettings = () => {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
    profileImagePublicId: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await authService.getMe()
      if (response.success) {
        const userData = response.data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          profileImage: userData.profileImage || '',
          profileImagePublicId: userData.profileImagePublicId || '',
        })
        setImagePreview(userData.profileImage || '')
        // Update context user
        if (setUser) {
          setUser({
            ...user,
            ...userData,
          })
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  // Handle image file change
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload image
    setUploadingImage(true)
    setError('')
    try {
      const response = await uploadService.uploadImage(file)
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          profileImage: response.data.url,
          profileImagePublicId: response.data.publicId,
        }))
        setSuccess('Image uploaded successfully')
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image')
      setImagePreview(formData.profileImage || '')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.phone) {
      setError('Name and phone are required')
      return
    }

    setLoading(true)
    try {
      const response = await authService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        profileImage: formData.profileImage,
        profileImagePublicId: formData.profileImagePublicId,
      })

      if (response.success) {
        setSuccess('Profile updated successfully')
        // Update context user
        if (setUser) {
          setUser({
            ...user,
            ...response.data,
          })
        }
        // Refresh profile data
        await fetchProfile()
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.name) {
    return (
      <CRow>
        <CCol xs={12}>
          <div className="text-center py-5">
            <CSpinner />
          </div>
        </CCol>
      </CRow>
    )
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
          <CCardHeader>
            <div className="d-flex align-items-center">
              <CIcon icon={cilUser} className="me-2" />
              <h5 className="mb-0">
                <strong>Profile Settings</strong>
              </h5>
            </div>
            <small className="text-body-secondary">Manage your profile information and image</small>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={4} className="text-center mb-4">
                  <div className="mb-3">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          border: '3px solid #dee2e6',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          backgroundColor: '#dee2e6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          fontSize: '48px',
                          color: '#6c757d',
                        }}
                      >
                        {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="profileImage">Profile Image</CFormLabel>
                    <CFormInput
                      type="file"
                      id="profileImage"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <div className="mt-2">
                        <CSpinner size="sm" /> <small>Uploading image...</small>
                      </div>
                    )}
                    <small className="text-muted d-block mt-2">
                      Max size: 5MB. Supported formats: JPG, PNG, GIF
                    </small>
                  </div>
                </CCol>
                <CCol md={8}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="name">
                      Full Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="email">Email Address</CFormLabel>
                    <CFormInput
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="bg-body-secondary"
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="phone">
                      Phone Number <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel>Role</CFormLabel>
                    <CFormInput
                      type="text"
                      value={user?.role || 'user'}
                      disabled
                      className="bg-body-secondary text-capitalize"
                    />
                    <small className="text-muted">Role cannot be changed</small>
                  </div>
                </CCol>
              </CRow>
              <div className="d-flex justify-content-end">
                <CButton
                  type="submit"
                  color="primary"
                  disabled={loading || uploadingImage}
                  className="me-2"
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilSave} className="me-2" />
                      Save Changes
                    </>
                  )}
                </CButton>
                <CButton
                  color="secondary"
                  variant="outline"
                  onClick={fetchProfile}
                  disabled={loading}
                >
                  Cancel
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProfileSettings
