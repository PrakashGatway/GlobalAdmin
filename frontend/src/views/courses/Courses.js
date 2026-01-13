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
  cilBook,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilFilter,
  cilReload,
} from '@coreui/icons'
import courseService from '../../services/courseService'
import universityService from '../../services/universityService'
import uploadService from '../../services/uploadService'

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [courses, setCourses] = useState([])
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    university: '',
    duration: '',
    price: '',
    description: '',
    status: 'Active',
    image: '',
    imagePublicId: '',
  })
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await courseService.getCourses()
      if (response.success) {
        setCourses(response.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch courses')
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
    fetchCourses()
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

  // Handle edit - populate form with course data
  const handleEdit = (course) => {
    const universityId = course.university?._id || course.university || ''
    setFormData({
      name: course.name || '',
      code: course.code || '',
      university: universityId,
      duration: course.duration || '',
      price: course.price?.toString() || '',
      description: course.description || '',
      status: course.status || 'Active',
      image: course.image || '',
      imagePublicId: course.imagePublicId || '',
    })
    setImagePreview(course.image || '')
    setEditingId(course._id || course.id)
    setError('')
    fetchUniversities()
    setShowModal(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (course) => {
    setDeletingId(course._id || course.id)
    setShowDeleteModal(true)
  }

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const response = await courseService.deleteCourse(deletingId)
      if (response.success) {
        setSuccess('Course deleted successfully!')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchCourses() // Refresh list
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete course')
      setShowDeleteModal(false)
    }
  }

  // Handle form submit (both add and edit)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.code || !formData.university || !formData.duration || !formData.price) {
      setError('Please fill all required fields')
      return
    }

    if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      setError('Price must be a valid number greater than or equal to 0')
      return
    }

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
      }

      let response
      if (editingId) {
        // Update existing course
        response = await courseService.updateCourse(editingId, submitData)
        if (response.success) {
          setSuccess('Course updated successfully!')
        }
      } else {
        // Create new course
        response = await courseService.createCourse(submitData)
        if (response.success) {
          setSuccess('Course added successfully!')
        }
      }

      if (response.success) {
        setFormData({
          name: '',
          code: '',
          university: '',
          duration: '',
          price: '',
          description: '',
          status: 'Active',
        })
        setEditingId(null)
        setShowModal(false)
        fetchCourses() // Refresh list
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || (editingId ? 'Failed to update course' : 'Failed to add course'))
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      university: '',
      duration: '',
      price: '',
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

  const filteredCourses = courses.filter(
    (course) =>
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.university?.name || course.university)?.toLowerCase().includes(searchTerm.toLowerCase()),
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
                <strong>Courses</strong>
              </h5>
              <small className="text-body-secondary">Manage all available courses</small>
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
                Add Course
              </CButton>
              <CButton color="secondary" variant="outline" className="btn-animated" onClick={fetchCourses}>
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
                    placeholder="Search courses by name, code, or university..."
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
                    <CDropdownItem>All Courses</CDropdownItem>
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
                      <CIcon icon={cilBook} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Course Name</CTableHeaderCell>
                    <CTableHeaderCell>Course Code</CTableHeaderCell>
                    <CTableHeaderCell>University</CTableHeaderCell>
                    <CTableHeaderCell>Duration</CTableHeaderCell>
                    <CTableHeaderCell>Price</CTableHeaderCell>
                    <CTableHeaderCell>Students</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredCourses.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="10" className="text-center py-5">
                        <div className="text-body-secondary">No courses found</div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredCourses.map((course, index) => (
                      <CTableRow key={course._id || course.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <CTableDataCell className="text-center">
                          {course.image ? (
                            <img
                              src={course.image}
                              alt={course.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            <CAvatar size="md" color="warning" textColor="white">
                              {course.name?.charAt(0) || 'C'}
                            </CAvatar>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{course.name}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{course.code}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{course.university?.name || course.university || '-'}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{course.duration}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>₹{course.price?.toLocaleString() || 0}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{(course.students || 0).toLocaleString()}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={course.status === 'Active' ? 'success' : 'secondary'}>
                            {course.status || 'Active'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {course.createdAt
                              ? new Date(course.createdAt).toLocaleDateString()
                              : '-'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="primary"
                            variant="outline"
                            size="sm"
                            className="me-2 btn-animated"
                            onClick={() => handleEdit(course)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            className="btn-animated"
                            onClick={() => handleDeleteClick(course)}
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

        {/* Add/Edit Course Modal */}
        <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg" className="modal-animate">
          <CModalHeader>
            <CModalTitle>{editingId ? 'Edit Course' : 'Add New Course'}</CModalTitle>
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
                      Course Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter course name"
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="code">
                      Course Code <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="Enter course code"
                      required
                    />
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
                      placeholder="e.g., 6 months, 4 years"
                      required
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="price">
                      Price (₹) <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter course price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </CCol>
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
                  placeholder="Enter course description (optional)"
                  rows="3"
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="image">Course Image</CFormLabel>
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
                {editingId ? 'Update Course' : 'Add Course'}
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
            <p>Are you sure you want to delete this course? This action cannot be undone.</p>
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

export default Courses
