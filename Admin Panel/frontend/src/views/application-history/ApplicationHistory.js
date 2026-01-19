import React, { useState, useEffect } from 'react'
import {
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
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMagnifyingGlass,
  cilFilter,
  cilCloudDownload,
  cilInfo,
  cilX,
  cilReload,
  cilArrowBottom,
  cilPlus,
  cilPencil,
} from '@coreui/icons'
import applicationService from '../../services/applicationService'
import userService from '../../services/userService'
import universityService from '../../services/universityService'
import courseService from '../../services/courseService'

const ApplicationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [users, setUsers] = useState([])
  const [universities, setUniversities] = useState([])
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    camsId: '',
    student: '',
    studentName: '',
    passportNo: '',
    studentId: '',
    university: '',
    urmDetails: {
      name: '',
      phone: '',
    },
    course: '',
    intake: '',
    primaryStatus: 'Pending',
    secondaryStatus: '',
    status: 'Active',
  })

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: 1,
        limit: 100,
        sortBy,
        sortOrder,
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      const response = await applicationService.getApplications(params)
      if (response.success) {
        setApplications(response.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
    fetchUsers()
    fetchUniversities()
  }, [sortBy, sortOrder])

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers({ limit: 1000 })
      if (response.success) {
        setUsers(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  // Fetch universities for dropdown
  const fetchUniversities = async () => {
    try {
      const response = await universityService.getUniversities({ limit: 1000 })
      if (response.success) {
        setUniversities(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch universities:', err)
    }
  }

  // Fetch courses when university is selected
  const fetchCourses = async (universityId) => {
    if (!universityId) {
      setCourses([])
      return
    }
    try {
      const response = await courseService.getCourses({ limit: 1000 })
      if (response.success) {
        // Filter courses by university
        const filteredCourses = (response.data || []).filter(
          (course) => course.university?._id === universityId || course.university === universityId
        )
        setCourses(filteredCourses)
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    }
  }

  // Handle download all data
  const handleDownloadAll = async () => {
    setLoading(true)
    try {
      const response = await applicationService.downloadAllApplications()
      if (response.success) {
        // Convert to CSV format
        const csvData = convertToCSV(response.data)
        downloadCSV(csvData, 'all_student_data.csv')
      }
    } catch (err) {
      setError(err.message || 'Failed to download data')
    } finally {
      setLoading(false)
    }
  }

  // Convert data to CSV
  const convertToCSV = (data) => {
    const headers = [
      'CAMS ID',
      'Student Name',
      'Passport No',
      'Student ID',
      'University Name',
      'URM Name',
      'URM Phone',
      'Course Name',
      'Intake',
      'Primary Status',
      'Secondary Status',
      'Date Added',
      'Date Modified',
    ]

    const rows = data.map((app) => [
      app.camsId || '',
      app.studentName || '',
      app.passportNo || '',
      app.studentId || '',
      app.university?.name || '',
      app.urmDetails?.name || '',
      app.urmDetails?.phone || '',
      app.course?.name || '',
      app.intake || '',
      app.primaryStatus || '',
      app.secondaryStatus || '',
      app.createdAt ? new Date(app.createdAt).toLocaleString() : '',
      app.updatedAt ? new Date(app.updatedAt).toLocaleString() : '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    return csvContent
  }

  // Download CSV file
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'urmName') {
      setFormData((prev) => ({
        ...prev,
        urmDetails: { ...prev.urmDetails, name: value },
      }))
    } else if (name === 'urmPhone') {
      setFormData((prev) => ({
        ...prev,
        urmDetails: { ...prev.urmDetails, phone: value },
      }))
    } else if (name === 'university') {
      setFormData((prev) => ({ ...prev, [name]: value, course: '' }))
      fetchCourses(value)
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    setError('')
    setSuccess('')
  }

  // Handle add new application
  const handleAdd = () => {
    setFormData({
      camsId: '',
      student: '',
      studentName: '',
      passportNo: '',
      studentId: '',
      university: '',
      urmDetails: {
        name: '',
        phone: '',
      },
      course: '',
      intake: '',
      primaryStatus: 'Pending',
      secondaryStatus: '',
      status: 'Active',
    })
    setEditingId(null)
    setError('')
    setSuccess('')
    setShowModal(true)
  }

  // Handle edit - populate form with application data
  const handleEdit = (application) => {
    setFormData({
      camsId: application.camsId || '',
      student: application.student?._id || application.student || '',
      studentName: application.studentName || '',
      passportNo: application.passportNo || '',
      studentId: application.studentId || '',
      university: application.university?._id || application.university || '',
      urmDetails: {
        name: application.urmDetails?.name || '',
        phone: application.urmDetails?.phone || '',
      },
      course: application.course?._id || application.course || '',
      intake: application.intake || '',
      primaryStatus: application.primaryStatus || 'Pending',
      secondaryStatus: application.secondaryStatus || '',
      status: application.status || 'Active',
    })
    setEditingId(application._id || application.id)
    setError('')
    setSuccess('')
    setShowModal(true)
    if (application.university?._id || application.university) {
      fetchCourses(application.university?._id || application.university)
    }
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (
      !formData.camsId ||
      !formData.student ||
      !formData.studentName ||
      !formData.passportNo ||
      !formData.studentId ||
      !formData.university ||
      !formData.urmDetails.name ||
      !formData.urmDetails.phone ||
      !formData.course ||
      !formData.intake
    ) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        // Update application
        const response = await applicationService.updateApplication(editingId, formData)
        if (response.success) {
          setSuccess('Application updated successfully')
          setShowModal(false)
          setEditingId(null)
          fetchApplications()
        }
      } else {
        // Create application
        const response = await applicationService.createApplication(formData)
        if (response.success) {
          setSuccess('Application created successfully')
          setShowModal(false)
          fetchApplications()
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save application')
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      camsId: '',
      student: '',
      studentName: '',
      passportNo: '',
      studentId: '',
      university: '',
      urmDetails: {
        name: '',
        phone: '',
      },
      course: '',
      intake: '',
      primaryStatus: 'Pending',
      secondaryStatus: '',
      status: 'Active',
    })
    setEditingId(null)
    setError('')
    setSuccess('')
    setCourses([])
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return
    }

    setLoading(true)
    try {
      const response = await applicationService.deleteApplication(id)
      if (response.success) {
        setSuccess('Application deleted successfully')
        fetchApplications()
      }
    } catch (err) {
      setError(err.message || 'Failed to delete application')
    } finally {
      setLoading(false)
    }
  }

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Filter applications based on search
  const filteredApplications = applications.filter(
    (app) =>
      !searchTerm ||
      app.camsId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.passportNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h5 className="mb-0">
              <strong>Application History</strong>
            </h5>
            <div className="d-flex gap-2">
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                Add Application
              </CButton>
              <CButton color="secondary" variant="outline" size="sm" onClick={fetchApplications}>
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
                    placeholder="Enter CAMS / Name / Pass..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={6} className="d-flex justify-content-end gap-2">
                <CButton color="danger" onClick={handleDownloadAll} disabled={loading}>
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Download All Student Data
                </CButton>
                <CButton color="danger" variant="outline">
                  <CIcon icon={cilFilter} className="me-2" />
                  ALL FILTERS
                </CButton>
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
                    <CTableHeaderCell>CAMS ID</CTableHeaderCell>
                    <CTableHeaderCell>Student Name</CTableHeaderCell>
                    <CTableHeaderCell>University Name</CTableHeaderCell>
                    <CTableHeaderCell>Course Name</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Date Added</CTableHeaderCell>
                    <CTableHeaderCell
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('updatedAt')}
                    >
                      Date Modified
                      {sortBy === 'updatedAt' && (
                        <CIcon
                          icon={cilArrowBottom}
                          className="ms-2"
                          style={{
                            transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      )}
                    </CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredApplications.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="8" className="text-center py-5">
                        <div className="text-body-secondary">No applications found</div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredApplications.map((app, index) => (
                      <CTableRow key={app._id || app.id}>
                        <CTableDataCell>
                          <a
                            href={`#`}
                            style={{ color: '#0d6efd', textDecoration: 'none' }}
                            onClick={(e) => {
                              e.preventDefault()
                              // Handle CAMS ID click - could navigate to detail page
                            }}
                          >
                            {app.camsId}
                          </a>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>{app.studentName}</strong>
                            <br />
                            <small className="text-body-secondary">
                              Passport No: {app.passportNo}
                            </small>
                            <br />
                            <small className="text-body-secondary">
                              Student ID: {app.studentId}
                            </small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>{app.university?.name || 'N/A'}</strong>
                            <br />
                            <small className="text-body-secondary">
                              URM Details: {app.urmDetails?.name || 'N/A'},{' '}
                              {app.urmDetails?.phone || 'N/A'}
                            </small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>{app.course?.name || 'N/A'}</strong>
                            <br />
                            <small className="text-body-secondary">
                              Intake: {app.intake || 'N/A'}
                            </small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <CBadge
                              color={
                                app.primaryStatus === 'Case Closed'
                                  ? 'success'
                                  : app.primaryStatus === 'Application Refused'
                                  ? 'danger'
                                  : app.primaryStatus === 'Offer Received'
                                  ? 'info'
                                  : 'warning'
                              }
                              className="mb-1"
                            >
                              {app.primaryStatus || 'Pending'}
                            </CBadge>
                            {app.secondaryStatus && (
                              <div>
                                <small className="text-body-secondary">{app.secondaryStatus}</small>
                              </div>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <small>{formatDate(app.createdAt)}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <small>{formatDate(app.updatedAt)}</small>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="primary"
                            variant="outline"
                            size="sm"
                            className="me-2"
                            title="Edit Application"
                            onClick={() => handleEdit(app)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(app._id || app.id)}
                            title="Delete"
                          >
                            <CIcon icon={cilX} />
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

        {/* Add/Edit Application Modal */}
        <CModal
          visible={showModal}
          onClose={() => {
            setShowModal(false)
            handleReset()
          }}
          size="lg"
        >
          <CModalHeader>
            <CModalTitle>{editingId ? 'Edit Application' : 'Add New Application'}</CModalTitle>
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
                    <CFormLabel htmlFor="camsId">
                      CAMS ID <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="camsId"
                      name="camsId"
                      value={formData.camsId}
                      onChange={handleInputChange}
                      placeholder="Enter CAMS ID"
                      required
                      disabled={!!editingId}
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="student">
                      Student <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      id="student"
                      name="student"
                      value={formData.student}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Student</option>
                      {users.map((user) => (
                        <option key={user._id || user.id} value={user._id || user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="studentName">
                      Student Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Enter student name"
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="passportNo">
                      Passport No <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="passportNo"
                      name="passportNo"
                      value={formData.passportNo}
                      onChange={handleInputChange}
                      placeholder="Enter passport number"
                      required
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="studentId">
                      Student ID <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      placeholder="Enter student ID"
                      required
                    />
                  </div>
                </CCol>
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
                      {universities.map((uni) => (
                        <option key={uni._id || uni.id} value={uni._id || uni.id}>
                          {uni.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="urmName">
                      URM Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="urmName"
                      name="urmName"
                      value={formData.urmDetails.name}
                      onChange={handleInputChange}
                      placeholder="Enter URM name"
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="urmPhone">
                      URM Phone <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="tel"
                      id="urmPhone"
                      name="urmPhone"
                      value={formData.urmDetails.phone}
                      onChange={handleInputChange}
                      placeholder="Enter URM phone"
                      required
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="course">
                      Course <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.university}
                    >
                      <option value="">{formData.university ? 'Select Course' : 'Select University first'}</option>
                      {courses.map((course) => (
                        <option key={course._id || course.id} value={course._id || course.id}>
                          {course.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="intake">
                      Intake <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="intake"
                      name="intake"
                      value={formData.intake}
                      onChange={handleInputChange}
                      placeholder="e.g., January/February 2025"
                      required
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="primaryStatus">Primary Status</CFormLabel>
                    <CFormSelect
                      id="primaryStatus"
                      name="primaryStatus"
                      value={formData.primaryStatus}
                      onChange={handleInputChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Offer Received">Offer Received</option>
                      <option value="Case Closed">Case Closed</option>
                      <option value="Application Refused">Application Refused</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </CFormSelect>
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
                      <option value="Archived">Archived</option>
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>
              <div className="mb-3">
                <CFormLabel htmlFor="secondaryStatus">Secondary Status</CFormLabel>
                <CFormInput
                  type="text"
                  id="secondaryStatus"
                  name="secondaryStatus"
                  value={formData.secondaryStatus}
                  onChange={handleInputChange}
                  placeholder="Enter secondary status (optional)"
                />
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
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : editingId ? (
                  'Update Application'
                ) : (
                  'Add Application'
                )}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default ApplicationHistory
