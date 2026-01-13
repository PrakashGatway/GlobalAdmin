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
  cilList,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilFilter,
  cilReload,
} from '@coreui/icons'
import programService from '../../services/programService'
import universityService from '../../services/universityService'
import uploadService from '../../services/uploadService'

const Programs = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    university: '',
    duration: '',
    description: '',
    status: 'Active',
    image: '',
    imagePublicId: '',
  })
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch programs
  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const response = await programService.getPrograms()
      if (response.success) {
        setPrograms(response.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch programs')
    } finally {
      setLoading(false)
    }
  }

  // Fetch universities for dropdown
  const fetchUniversities = async () => {
    try {
      const response = await universityService.getUniversities()
      if (response.success) {
        setUniversities(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch universities:', err)
    }
  }

  useEffect(() => {
    fetchPrograms()
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

  // Handle edit - populate form with program data
  const handleEdit = (program) => {
    const universityId = program.university?._id || program.university || ''
    setFormData({
      name: program.name || '',
      type: program.type || '',
      university: universityId,
      duration: program.duration || '',
      description: program.description || '',
      status: program.status || 'Active',
      image: program.image || '',
      imagePublicId: program.imagePublicId || '',
    })
    setImagePreview(program.image || '')
    setEditingId(program._id || program.id)
    setError('')
    fetchUniversities()
    setShowModal(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (program) => {
    setDeletingId(program._id || program.id)
    setShowDeleteModal(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const response = await programService.deleteProgram(deletingId)
      if (response.success) {
        setSuccess('Program deleted successfully!')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchPrograms()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete program')
      setShowDeleteModal(false)
    }
  }

  // Handle form submit (both add and edit)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.type || !formData.university || !formData.duration) {
      setError('Please fill all required fields')
      return
    }

    try {
      let response
      if (editingId) {
        response = await programService.updateProgram(editingId, formData)
        if (response.success) {
          setSuccess('Program updated successfully!')
        }
      } else {
        response = await programService.createProgram(formData)
        if (response.success) {
          setSuccess('Program added successfully!')
        }
      }

      if (response.success) {
        setFormData({
          name: '',
          type: '',
          university: '',
          duration: '',
          description: '',
          status: 'Active',
        })
        setEditingId(null)
        setShowModal(false)
        fetchPrograms()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || (editingId ? 'Failed to update program' : 'Failed to add program'))
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      type: '',
      university: '',
      duration: '',
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

  const filteredPrograms = programs.filter(
    (program) =>
      program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.university?.name || program.university)?.toLowerCase().includes(searchTerm.toLowerCase()),
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
                <strong>Programs</strong>
              </h5>
              <small className="text-body-secondary">Manage all academic programs</small>
            </div>
            <div>
              <CButton
                color="primary"
                className="me-2 btn-animated"
                onClick={() => {
                  handleReset()
                  fetchUniversities() // Refresh universities list
                  setShowModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add Program
              </CButton>
              <CButton color="secondary" variant="outline" className="btn-animated" onClick={fetchPrograms}>
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
                    placeholder="Search programs by name, type, or university..."
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
                    <CDropdownItem>All Programs</CDropdownItem>
                    <CDropdownItem>Undergraduate</CDropdownItem>
                    <CDropdownItem>Graduate</CDropdownItem>
                    <CDropdownItem>Doctorate</CDropdownItem>
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
                      <CIcon icon={cilList} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Program Name</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>University</CTableHeaderCell>
                    <CTableHeaderCell>Duration</CTableHeaderCell>
                    <CTableHeaderCell>Students</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredPrograms.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="9" className="text-center py-5">
                        <div className="text-body-secondary">No programs found</div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredPrograms.map((program, index) => (
                      <CTableRow key={program._id || program.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <CTableDataCell className="text-center">
                          {program.image ? (
                            <img
                              src={program.image}
                              alt={program.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            <CAvatar size="md" color="success" textColor="white">
                              {program.name?.charAt(0) || 'P'}
                            </CAvatar>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{program.name}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{program.type}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{program.university?.name || program.university || '-'}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{program.duration}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{(program.students || 0).toLocaleString()}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={program.status === 'Active' ? 'success' : 'secondary'}>
                            {program.status || 'Active'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {program.createdAt
                              ? new Date(program.createdAt).toLocaleDateString()
                              : '-'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="primary"
                            variant="outline"
                            size="sm"
                            className="me-2 btn-animated"
                            onClick={() => handleEdit(program)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            className="btn-animated"
                            onClick={() => handleDeleteClick(program)}
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

        {/* Add/Edit Program Modal */}
        <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg" className="modal-animate">
          <CModalHeader>
            <CModalTitle>{editingId ? 'Edit Program' : 'Add New Program'}</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              {error && (
                <CAlert color="danger" className="mb-3">
                  {error}
                </CAlert>
              )}
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="name">
                      Program Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter program name"
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="type">
                      Program Type <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Doctorate">Doctorate</option>
                      <option value="Certificate">Certificate</option>
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="university">
                      University <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select University</option>
                      {universities.map((univ) => (
                        <option key={univ._id || univ.id} value={univ._id || univ.id}>
                          {univ.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="duration">
                      Duration <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 4 years, 2 years"
                      required
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
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
                </CCol>
              </CRow>
              <div className="mb-3">
                <CFormLabel htmlFor="description">Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter program description (optional)"
                  rows="3"
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="image">Program Image</CFormLabel>
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
                {editingId ? 'Update Program' : 'Add Program'}
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
            <p>Are you sure you want to delete this program? This action cannot be undone.</p>
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

export default Programs
