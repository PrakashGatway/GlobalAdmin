import React, { useState, useEffect } from 'react'
import {
  CAvatar,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CBadge,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilEducation,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilFilter,
  cilReload,
} from '@coreui/icons'
import universityService from '../../services/universityService'
import uploadService from '../../services/uploadService'

const Universities = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    description: '',
    status: 'Active',
    image: '',
    imagePublicId: '',
  })
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch universities
  const fetchUniversities = async () => {
    setLoading(true)
    try {
      const response = await universityService.getUniversities()
      if (response.success) {
        setUniversities(response.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch universities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUniversities()
  }, [])

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

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    setUploadingImage(true)
    setError('')
    try {
      const response = await uploadService.uploadImage(file)
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          image: response.data.url,
          imagePublicId: response.data.publicId,
        }))
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image')
      setImagePreview('')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle edit - populate form with university data
  const handleEdit = (university) => {
    setFormData({
      name: university.name || '',
      country: university.country || '',
      city: university.city || '',
      description: university.description || '',
      status: university.status || 'Active',
      image: university.image || '',
      imagePublicId: university.imagePublicId || '',
    })
    setImagePreview(university.image || '')
    setEditingId(university._id || university.id)
    setError('')
    setShowModal(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (university) => {
    setDeletingId(university._id || university.id)
    setShowDeleteModal(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const response = await universityService.deleteUniversity(deletingId)
      if (response.success) {
        setSuccess('University deleted successfully!')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchUniversities()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete university')
      setShowDeleteModal(false)
    }
  }

  // Handle form submit (both add and edit)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.country || !formData.city) {
      setError('Please fill all required fields')
      return
    }

    try {
      let response
      if (editingId) {
        response = await universityService.updateUniversity(editingId, formData)
        if (response.success) {
          setSuccess('University updated successfully!')
        }
      } else {
        response = await universityService.createUniversity(formData)
        if (response.success) {
          setSuccess('University added successfully!')
        }
      }

      if (response.success) {
        setFormData({
          name: '',
          country: '',
          city: '',
          description: '',
          status: 'Active',
        })
        setEditingId(null)
        setShowModal(false)
        fetchUniversities()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || (editingId ? 'Failed to update university' : 'Failed to add university'))
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      country: '',
      city: '',
      description: '',
      status: 'Active',
      image: '',
      imagePublicId: '',
    })
    setImagePreview('')
    setEditingId(null)
    setError('')
    setSuccess('')
  }

  const filteredUniversities = universities.filter(
    (university) =>
      university.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      university.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      university.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                <strong>Universities</strong>
              </h5>
              <small className="text-body-secondary">Manage all registered universities</small>
            </div>
            <div>
              <CButton
                color="primary"
                className="me-2"
                onClick={() => {
                  handleReset()
                  setShowModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add University
              </CButton>
              <CButton color="secondary" variant="outline" onClick={fetchUniversities}>
                <CIcon icon={cilReload} />
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilMagnifyingGlass} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Search universities by name, country, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={6} className="text-end">
                <CDropdown>
                  <CDropdownToggle color="secondary" variant="outline">
                    <CIcon icon={cilFilter} className="me-2" />
                    Filter
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem>All Universities</CDropdownItem>
                    <CDropdownItem>Active</CDropdownItem>
                    <CDropdownItem>Inactive</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CCol>
            </CRow>
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
              </div>
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell className="text-center">
                      <CIcon icon={cilEducation} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>University Name</CTableHeaderCell>
                    <CTableHeaderCell>Country</CTableHeaderCell>
                    <CTableHeaderCell>City</CTableHeaderCell>
                    <CTableHeaderCell>Students</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUniversities.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="8" className="text-center py-5">
                        <div className="text-body-secondary">No universities found</div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredUniversities.map((university) => (
                      <CTableRow key={university._id || university.id}>
                        <CTableDataCell className="text-center">
                          {university.image ? (
                            <img
                              src={university.image}
                              alt={university.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            <CAvatar size="md" color="info" textColor="white">
                              {university.name?.charAt(0) || 'U'}
                            </CAvatar>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{university.name}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{university.country}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{university.city}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{(university.students || 0).toLocaleString()}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={university.status === 'Active' ? 'success' : 'secondary'}>
                            {university.status || 'Active'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {university.createdAt
                              ? new Date(university.createdAt).toLocaleDateString()
                              : '-'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="primary"
                            variant="outline"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(university)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(university)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>

        {/* Add/Edit University Modal */}
        <CModal visible={showModal} onClose={() => setShowModal(false)}>
          <CModalHeader>
            <CModalTitle>{editingId ? 'Edit University' : 'Add New University'}</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              {error && (
                <CAlert color="danger" className="mb-3">
                  {error}
                </CAlert>
              )}
              <div className="mb-3">
                <CFormLabel htmlFor="name">
                  University Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter university name"
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="country">
                  Country <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country name"
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="city">
                  City <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city name"
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="description">Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="image">University Image</CFormLabel>
                <CFormInput
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="mt-2">
                    <CSpinner size="sm" /> <small>Uploading image...</small>
                  </div>
                )}
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                      }}
                    />
                  </div>
                )}
                {formData.image && !imagePreview && (
                  <div className="mt-3">
                    <img
                      src={formData.image}
                      alt="Current"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="status">Status</CFormLabel>
                <CFormSelect
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </CFormSelect>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => {
                  setShowModal(false)
                  handleReset()
                }}
              >
                Cancel
              </CButton>
              <CButton color="primary" type="submit">
                {editingId ? 'Update University' : 'Add University'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>Are you sure you want to delete this university? This action cannot be undone.</p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Delete
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Universities
