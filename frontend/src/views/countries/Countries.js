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
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFlagAlt,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilFilter,
  cilReload,
} from '@coreui/icons'
import countryService from '../../services/countryService'
import uploadService from '../../services/uploadService'

const Countries = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    currency: '',
    status: 'Active',
    image: '',
    imagePublicId: '',
  })
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch countries
  const fetchCountries = async () => {
    setLoading(true)
    try {
      const response = await countryService.getCountries()
      if (response.success) {
        setCountries(response.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch countries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
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

  // Handle edit - populate form with country data
  const handleEdit = (country) => {
    setFormData({
      name: country.name || '',
      code: country.code || '',
      currency: country.currency || '',
      status: country.status || 'Active',
      image: country.image || '',
      imagePublicId: country.imagePublicId || '',
    })
    setImagePreview(country.image || '')
    setEditingId(country._id || country.id)
    setError('')
    setShowModal(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (country) => {
    setDeletingId(country._id || country.id)
    setShowDeleteModal(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const response = await countryService.deleteCountry(deletingId)
      if (response.success) {
        setSuccess('Country deleted successfully!')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchCountries()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete country')
      setShowDeleteModal(false)
    }
  }

  // Handle form submit (both add and edit)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.code || !formData.currency) {
      setError('Please fill all required fields')
      return
    }

    if (formData.code.length < 2 || formData.code.length > 3) {
      setError('Country code must be 2-3 characters')
      return
    }

    try {
      let response
      if (editingId) {
        response = await countryService.updateCountry(editingId, formData)
        if (response.success) {
          setSuccess('Country updated successfully!')
        }
      } else {
        response = await countryService.createCountry(formData)
        if (response.success) {
          setSuccess('Country added successfully!')
        }
      }

      if (response.success) {
        setFormData({
          name: '',
          code: '',
          currency: '',
          status: 'Active',
        })
        setEditingId(null)
        setShowModal(false)
        fetchCountries()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || (editingId ? 'Failed to update country' : 'Failed to add country'))
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      currency: '',
      status: 'Active',
      image: '',
      imagePublicId: '',
    })
    setImagePreview('')
    setEditingId(null)
    setError('')
    setSuccess('')
  }

  const filteredCountries = countries.filter(
    (country) =>
      country.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.currency?.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <CCard className="mb-4 card-hover animate-fade-in">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <strong>Countries</strong>
              </h5>
              <small className="text-body-secondary">Manage countries and their details</small>
            </div>
            <div>
              <CButton
                color="primary"
                className="me-2 btn-animated"
                onClick={() => {
                  handleReset()
                  setShowModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add Country
              </CButton>
              <CButton color="secondary" variant="outline" className="btn-animated" onClick={fetchCountries}>
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
                    placeholder="Search countries by name, code, or currency..."
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
                    <CDropdownItem>All Countries</CDropdownItem>
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
                      <CIcon icon={cilFlagAlt} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Country Name</CTableHeaderCell>
                    <CTableHeaderCell>Code</CTableHeaderCell>
                    <CTableHeaderCell>Currency</CTableHeaderCell>
                    <CTableHeaderCell>Universities</CTableHeaderCell>
                    <CTableHeaderCell>Students</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredCountries.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="9" className="text-center py-5">
                        <div className="text-body-secondary">No countries found</div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredCountries.map((country, index) => (
                      <CTableRow key={country._id || country.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <CTableDataCell className="text-center">
                          {country.image ? (
                            <img
                              src={country.image}
                              alt={country.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            <CAvatar size="md" color="danger" textColor="white">
                              {country.name?.charAt(0) || 'C'}
                            </CAvatar>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{country.name}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{country.code}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{country.currency}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{country.universities || 0}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{(country.students || 0).toLocaleString()}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={country.status === 'Active' ? 'success' : 'secondary'}>
                            {country.status || 'Active'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {country.createdAt
                              ? new Date(country.createdAt).toLocaleDateString()
                              : '-'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="primary"
                            variant="outline"
                            size="sm"
                            className="me-2 btn-animated"
                            onClick={() => handleEdit(country)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            className="btn-animated"
                            onClick={() => handleDeleteClick(country)}
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

        {/* Add Country Modal */}
        <CModal visible={showModal} onClose={() => setShowModal(false)} className="modal-animate">
          <CModalHeader>
            <CModalTitle>Add New Country</CModalTitle>
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
                  Country Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter country name"
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="code">
                  Country Code <span className="text-danger">*</span>
                  <small className="text-muted ms-2">(2-3 characters, e.g., US, IN, GBR)</small>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter country code"
                  maxLength={3}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="currency">
                  Currency <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  placeholder="Enter currency code (e.g., USD, INR)"
                  required
                />
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
              <div className="mb-3">
                <CFormLabel htmlFor="image">Country Image (Flag)</CFormLabel>
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
              <CButton color="primary" type="submit" className="btn-animated">
                {editingId ? 'Update Country' : 'Add Country'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="modal-animate">
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>Are you sure you want to delete this country? This action cannot be undone.</p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete} className="btn-animated">
              Delete
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Countries
