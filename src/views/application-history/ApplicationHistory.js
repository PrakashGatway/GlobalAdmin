// ApplicationManagement.jsx
import React, { useState, useEffect, useCallback } from 'react'
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
  CFormTextarea,
  CPagination,
  CPaginationItem,
  CTabContent,
  CTabPane,
  CFormCheck
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMagnifyingGlass,
  cilFilter,
  cilCloudDownload,
  cilReload,
  cilPlus,
  cilPencil,
  cilTrash,
} from '@coreui/icons'
import applicationService from '../../services/applicationService'
import userService from '../../services/userService'
import universityService from '../../services/universityService'
import courseService from '../../services/courseService'
import countryService from '../../services/countryService'
import DocumentUpload from './DocumentUpload'
import ApplicationDetailModal from './Application'
// import ApplicationStepper from './ApplicationStepper'

const ApplicationManagement = () => {
  // State for applications list
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    primaryStatus: '',
    paymentStatus: '',
    country: '',
    course: '',
    intake: '',
    startDate: '',
    endDate: ''
  })

  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  // Dropdown data
  const [users, setUsers] = useState([])
  const [universities, setUniversities] = useState([])
  const [countries, setCountries] = useState([])
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)

  // Add this function to handle viewing application details
  const handleViewDetails = (application) => {
    setSelectedApplication(application)
    setShowDetailModal(true)
  }

  // Add this function to refresh after updates
  const handleApplicationUpdate = () => {
    fetchApplications()
  }

  // Form data
  const [formData, setFormData] = useState({
    applicationNumber: '',
    student: '',
    country: '',
    course: '',
    intake: '',
    paymentStatus: 'Pending',
    expectations: {
      understood: false,
      agreed: false
    },
    documents: [],
    OoshasDocuments: [],
    extraRequirements: {},
    backups: [],
    primaryStatus: 'Pending',
    isWithdrawn: false,
    userNotes: '',
    adminNotes: ''
  })

  // Status options
  const primaryStatusOptions = [
    'Pending',
    'Started',
    'ReviewbyOoshas',
    'SubmitToSchool',
    'AwaitingSchoolResponse',
    'AdmissionProcessing',
    'Refused',
    'Withdrawn',
    'PreArrival',
    'Arrived',
    'Completed'
  ]

  const paymentStatusOptions = ['Pending', 'Completed', 'Failed']

  // Fetch applications with pagination and filters
  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '') {
          delete params[key]
        }
      })

      const response = await applicationService.getApplications(params)
      if (response.success) {
        setApplications(response.data || [])
        setPagination({
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          pages: response.pages || 0
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [usersRes, universitiesRes, countriesRes] = await Promise.all([
        userService.getUsers({ limit: 1000 }),
        universityService.getUniversities({ limit: 1000 }),
        countryService.getCountries({ limit: 200 })
      ])

      if (usersRes.success) setUsers(usersRes.data || [])
      if (universitiesRes.success) setUniversities(universitiesRes.data || [])
      if (countriesRes.success) setCountries(countriesRes.data || [])
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err)
    }
  }

  useEffect(() => {
    fetchDropdownData()
  }, [])

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      primaryStatus: '',
      paymentStatus: '',
      country: '',
      course: '',
      intake: '',
      startDate: '',
      endDate: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle add new application
  const handleAdd = () => {
    setFormData({
      applicationNumber: '',
      student: '',
      country: '',
      course: '',
      intake: '',
      paymentStatus: 'Pending',
      expectations: {
        understood: false,
        agreed: false
      },
      documents: [],
      OoshasDocuments: [],
      extraRequirements: {},
      backups: [],
      primaryStatus: 'Pending',
      isWithdrawn: false,
      userNotes: '',
      adminNotes: ''
    })
    setEditingId(null)
    setActiveTab(0)
    setError('')
    setSuccess('')
    setShowModal(true)
  }
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return
    }

    setLoading(true)
    try {
      const response = await applicationService.deleteApplication(id)
      if (response.success) {
        setSuccess('Application withdrawn successfully')
        fetchApplications()
      }
    } catch (err) {
      setError(err.message || 'Failed to withdraw application')
    } finally {
      setLoading(false)
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Started': 'info',
      'ReviewbyOoshas': 'primary',
      'SubmitToSchool': 'secondary',
      'AwaitingSchoolResponse': 'dark',
      'AdmissionProcessing': 'info',
      'Refused': 'danger',
      'Withdrawn': 'secondary',
      'PreArrival': 'success',
      'Arrived': 'success',
      'Completed': 'success'
    }
    return colors[status] || 'light'
  }

  const getPaymentBadgeColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Completed': 'success',
      'Failed': 'danger'
    }
    return colors[status] || 'light'
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
      minute: '2-digit'
    })
  }
  const convertToCSV = (data) => {
    const headers = [
      'Application Number',
      'Student Name',
      'Student Email',
      'Country',
      'Course',
      'Intake',
      'Primary Status',
      'Payment Status',
      'Created At',
      'Updated At'
    ]

    const rows = data.map((app) => [
      app.applicationNumber || '',
      app.student?.name || '',
      app.student?.email || '',
      app.country || '',
      app.course?.name || '',
      app.intake || '',
      app.primaryStatus || '',
      app.paymentStatus || '',
      formatDate(app.createdAt),
      formatDate(app.updatedAt)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

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
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="mb-0">
              <strong>Application Management</strong>
            </h5>
            <div className="d-flex gap-2">
              <CButton color="primary" onClick={handleAdd}>
                <CIcon icon={cilPlus} className="me-2" />
                New Application
              </CButton>
              {/* <CButton color="success" variant="outline" onClick={handleDownloadAll}>
                <CIcon icon={cilCloudDownload} className="me-2" />
                Export CSV
              </CButton> */}
              <CButton color="secondary" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <CIcon icon={cilFilter} className="me-2" />
                Filters
              </CButton>
              <CButton color="secondary" variant="outline" size="sm" onClick={fetchApplications}>
                <CIcon icon={cilReload} />
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
            {/* Search Bar */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilMagnifyingGlass} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Search by application number, student name, email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </CInputGroup>
              </CCol>
            </CRow>

            {/* Advanced Filters */}
            {showFilters && (
              <CCard className="mb-3 bg-light">
                <CCardBody>
                  <CRow className="g-3">
                    <CCol md={3}>
                      <CFormLabel>Primary Status</CFormLabel>
                      <CFormSelect
                        value={filters.primaryStatus}
                        onChange={(e) => handleFilterChange('primaryStatus', e.target.value)}
                      >
                        <option value="">All Status</option>
                        {primaryStatusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Payment Status</CFormLabel>
                      <CFormSelect
                        value={filters.paymentStatus}
                        onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                      >
                        <option value="">All</option>
                        {paymentStatusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Country</CFormLabel>
                      <CFormSelect
                        value={filters.country}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                      >
                        <option value="">All Countries</option>
                        {countries.map(country => (
                          <option key={country._id} value={country._id}>
                            {country.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Intake</CFormLabel>
                      <CFormInput
                        type="text"
                        placeholder="e.g., September 2025"
                        value={filters.intake}
                        onChange={(e) => handleFilterChange('intake', e.target.value)}
                      />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Start Date</CFormLabel>
                      <CFormInput
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>End Date</CFormLabel>
                      <CFormInput
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      />
                    </CCol>
                    <CCol md={12}>
                      <CButton color="secondary" size="sm" onClick={resetFilters}>
                        Reset Filters
                      </CButton>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            )}

            {/* Applications Table */}
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
              </div>
            ) : (
              <>
                <CTable align="middle" className="mb-0 border" hover responsive>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>App. Number</CTableHeaderCell>
                      <CTableHeaderCell>Student</CTableHeaderCell>
                      <CTableHeaderCell>Course</CTableHeaderCell>
                      <CTableHeaderCell>Intake</CTableHeaderCell>
                      <CTableHeaderCell>Primary Status</CTableHeaderCell>
                      <CTableHeaderCell>Payment</CTableHeaderCell>
                      <CTableHeaderCell>Created</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {applications.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center py-5">
                          <div className="text-body-secondary">No applications found</div>
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      applications.map((app) => (
                        <CTableRow key={app._id}>
                          <CTableDataCell>
                            <strong>{app.applicationNumber}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <strong>{app.student?.name || 'N/A'}</strong>
                              <br />
                              <small className="text-body-secondary">{app.student?.email || 'N/A'}</small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <strong>{app.course?.name || 'N/A'}</strong>
                              <br />
                              <small className="text-body-secondary">
                                {app.course?.university?.name || 'N/A'}
                              </small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{app.intake}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getStatusBadgeColor(app.primaryStatus)}>
                              {app.primaryStatus}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getPaymentBadgeColor(app.paymentStatus)}>
                              {app.paymentStatus}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>{formatDate(app.createdAt)}</small>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="info"
                              variant="outline"
                              size="sm"
                              className="me-2"
                              title="View Details"
                              onClick={() => handleViewDetails(app)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>

                            {app.paymentStatus === 'Pending' && !app.isWithdrawn && (
                              <CButton
                                color="danger"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(app._id)}
                                title="Withdraw"
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <CPagination>
                      <CPaginationItem
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        Previous
                      </CPaginationItem>
                      {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                        let pageNum
                        if (pagination.pages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i
                        } else {
                          pageNum = pagination.page - 2 + i
                        }
                        return (
                          <CPaginationItem
                            key={pageNum}
                            active={pageNum === pagination.page}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          >
                            {pageNum}
                          </CPaginationItem>
                        )
                      })}
                      <CPaginationItem
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
        {showDetailModal && (
          <ApplicationDetailModal
            visible={showDetailModal}
            application={selectedApplication}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedApplication(null)
            }}
            onUpdate={handleApplicationUpdate}
          />
        )}
      </CCol>
    </CRow>
  )
}

export default ApplicationManagement