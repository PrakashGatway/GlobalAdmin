// pages/Universities.js
import React, { useState, useEffect, useCallback } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
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
  CFormSelect,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert,
  CPagination,
  CPaginationItem,
  CFormLabel,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilFilter,
  cilFilterX,
  cilChevronBottom,
  cilChevronTop
} from '@coreui/icons'
import UniversityForm from './UniversityForm'
import universityService from '../../services/universityService'

const Universities = () => {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])

  // Filters state
  const [filters, setFilters] = useState({
    searchTerm: '',
    country: '',
    city: '',
    status: '',
    code: '',
    established_year: '',
    on_compus_accommodation: '',
    isPublished: '',
    extraStatus: '',
    page: 1,
    limit: 10,
    populateExtra: 'true',
  })

  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Fetch unique countries and cities from existing data
  useEffect(() => {
    if (universities.length > 0) {
      const uniqueCountries = [...new Set(universities.map(u => u.country).filter(Boolean))].sort()
      const uniqueCities = [...new Set(universities.map(u => u.city).filter(Boolean))].sort()
      setCountries(uniqueCountries)

      // Filter cities based on selected country
      if (filters.country) {
        const filteredCities = universities
          .filter(u => u.country === filters.country)
          .map(u => u.city)
          .filter(Boolean)
        setCities([...new Set(filteredCities)].sort())
      } else {
        setCities(uniqueCities)
      }
    }
  }, [universities, filters.country])

  const fetchUniversities = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        populateExtra: filters.populateExtra,
      }

      // Add all filters from backend controller
      if (filters.searchTerm) params.name = filters.searchTerm
      if (filters.country) params.country = filters.country
      if (filters.city) params.city = filters.city
      if (filters.status) params.status = filters.status
      if (filters.code) params.code = filters.code
      if (filters.established_year) params.established_year = filters.established_year
      if (filters.on_compus_accommodation !== '') params.on_compus_accommodation = filters.on_compus_accommodation
      if (filters.isPublished !== '') params.isPublished = filters.isPublished
      if (filters.extraStatus) params.extraStatus = filters.extraStatus

      const res = await universityService.getUniversities(params)
      if (res.success) {
        setUniversities(res.result || [])
        setTotal(res.total || 0)
        setTotalPages(res.totalPages || 1)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch universities')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUniversities()
  }, [fetchUniversities])

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleSearchChange = (value) => {
    handleFilterChange('searchTerm', value)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setFilters(prev => ({ ...prev, page }))
  }

  const handleLimitChange = (limit) => {
    setFilters(prev => ({ ...prev, limit: parseInt(limit), page: 1 }))
  }

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      country: '',
      city: '',
      status: '',
      code: '',
      established_year: '',
      on_compus_accommodation: '',
      isPublished: '',
      extraStatus: '',
      page: 1,
      limit: 10,
      populateExtra: 'true',
    })
  }

  const handleEdit = (uni) => {
    setEditingUniversity(uni)
    setShowModal(true)
  }

  const handleDeleteClick = (id) => {
    setDeletingId(id)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    try {
      const res = await universityService.deleteUniversity(deletingId)
      if (res.success) {
        setSuccess('University deleted successfully!')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchUniversities()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Delete failed')
      setShowDeleteModal(false)
    }
  }

  const handleFormSubmit = async (data) => {
    try {
      let res
      if (editingUniversity) {
        res = await universityService.updateUniversity(editingUniversity._id, data)
        if (res.success) setSuccess('University updated successfully!')
      } else {
        res = await universityService.createUniversity(data)
        if (res.success) setSuccess('University created successfully!')
      }
      if (res.success) {
        setShowModal(false)
        setEditingUniversity(null)
        fetchUniversities()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Operation failed')
    }
  }

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(key =>
    key !== 'page' &&
    key !== 'limit' &&
    key !== 'populateExtra' &&
    filters[key] !== '' &&
    filters[key] !== false &&
    filters[key] !== null
  ).length

  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
        {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Universities</h5>
              <small className="text-muted">Total: {total} universities</small>
            </div>
            <div className="d-flex gap-2">
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <CIcon icon={cilFilter} className="me-2" />
                Filters {activeFilterCount > 0 && <CBadge color="danger" className="ms-1">{activeFilterCount}</CBadge>}
                <CIcon icon={showFilters ? cilChevronTop : cilChevronBottom} className="ms-2" />
              </CButton>
              <CButton
                color="primary"
                onClick={() => {
                  setEditingUniversity(null)
                  setShowModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" /> Add University
              </CButton>
            </div>
          </CCardHeader>

          {/* Filters Section */}
          {showFilters && (
            <CCardBody className="border-bottom">
              <CRow className="g-3">
                <CCol md={3}>
                  <CFormLabel>Search Name</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                    <CFormInput
                      placeholder="Search by name..."
                      value={filters.searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Established Year</CFormLabel>
                  <CFormInput
                    type="number"
                    min="1500"
                    max={new Date().getFullYear()}
                    placeholder="Year..."
                    value={filters.established_year}
                    onChange={(e) => handleFilterChange('established_year', e.target.value)}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Country</CFormLabel>
                  <CFormSelect
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                  >
                    <option value="">All Countries</option>
                    {countries.map((country, idx) => (
                      <option key={idx} value={country}>{country}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Review">Under Review</option>
                  </CFormSelect>
                </CCol>

<CCol md={12} className="d-flex align-items-center justify-content-between flex-wrap gap-3">

  {/* Left Filters */}
  <div className="d-flex align-items-center gap-3">
    <CFormCheck
      id="accommodation"
      label="On-Campus Accommodation"
      checked={filters.on_campus_accommodation === 'true'}
      onChange={(e) =>
        handleFilterChange(
          'on_campus_accommodation',
          e.target.checked ? 'true' : ''
        )
      }
    />

    <CFormCheck
      id="published"
      label="Published"
      checked={filters.isPublished === 'true'}
      onChange={(e) =>
        handleFilterChange(
          'isPublished',
          e.target.checked ? 'true' : ''
        )
      }
    />
  </div>

  {/* Right Controls */}
  <div className="d-flex align-items-center gap-2">
    <CFormSelect
      style={{ width: '100px' }}
      value={filters.limit}
      onChange={(e) => handleLimitChange(e.target.value)}
    >
      <option value="5">5</option>
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="50">50</option>
    </CFormSelect>

    <CButton color="danger" variant="outline" onClick={clearAllFilters}>
      <CIcon icon={cilFilterX} className="me-2" />
      Clear Filters
    </CButton>
  </div>

</CCol>

              </CRow>
            </CCardBody>
          )}

          <CCardBody>
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
                <div className="mt-2">Loading universities...</div>
              </div>
            ) : universities.length === 0 ? (
              <div className="text-center py-5">
                <CIcon icon={cilMagnifyingGlass} size="xxl" className="text-muted mb-3" />
                <h5>No universities found</h5>
                <p className="text-muted">
                  {activeFilterCount > 0
                    ? 'Try changing your filters or clear them to see all universities.'
                    : 'No universities available. Create your first university.'}
                </p>
              </div>
            ) : (
              <>
                <CTable >
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Code</CTableHeaderCell>
                      <CTableHeaderCell>Country</CTableHeaderCell>
                      <CTableHeaderCell>City</CTableHeaderCell>
                      <CTableHeaderCell>Year</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Published</CTableHeaderCell>
                      <CTableHeaderCell>Accommodation</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {universities.map((uni) => (
                      <CTableRow key={uni._id}>
                        <CTableDataCell className="fw-semibold">{uni.name}</CTableDataCell>
                        <CTableDataCell><code>{uni.code}</code></CTableDataCell>
                        <CTableDataCell>{uni.country}</CTableDataCell>
                        <CTableDataCell>{uni.city}</CTableDataCell>
                        <CTableDataCell>{uni.established_year || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge
                            color={
                              uni.status === 'Active' ? 'success' :
                                uni.status === 'Inactive' ? 'secondary' : 'warning'
                            }
                          >
                            {uni.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={uni.extra_content?.isPublished ? 'info' : 'dark'}>
                            {uni.extra_content?.isPublished ? 'Yes' : 'No'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={uni.on_compus_accommodation ? 'success' : 'secondary'}>
                            {uni.on_compus_accommodation ? 'Yes' : 'No'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CButton
                              size="sm"
                              color="warning"
                              variant="ghost"
                              onClick={() => handleEdit(uni)}
                              title="Edit"
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              size="sm"
                              color="danger"
                              variant="ghost"
                              onClick={() => handleDeleteClick(uni._id)}
                              title="Delete"
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                {/* Pagination */}
                {totalPages > 1 && (
                  <CCardFooter className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                      {Math.min(filters.page * filters.limit, total)} of {total} entries
                    </div>
                    <CPagination>
                      <CPaginationItem
                        disabled={filters.page <= 1}
                        onClick={() => handlePageChange(filters.page - 1)}
                        style={{ cursor: filters.page > 1 ? 'pointer' : 'not-allowed' }}
                      >
                        Previous
                      </CPaginationItem>

                      {/* Show limited page numbers */}
                      {(() => {
                        const pages = []
                        const maxVisible = 5
                        let startPage = Math.max(1, filters.page - Math.floor(maxVisible / 2))
                        let endPage = Math.min(totalPages, startPage + maxVisible - 1)

                        if (endPage - startPage + 1 < maxVisible) {
                          startPage = Math.max(1, endPage - maxVisible + 1)
                        }

                        if (startPage > 1) {
                          pages.push(
                            <CPaginationItem
                              key={1}
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </CPaginationItem>
                          )
                          if (startPage > 2) {
                            pages.push(<CPaginationItem key="dots1" disabled>...</CPaginationItem>)
                          }
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <CPaginationItem
                              key={i}
                              active={filters.page === i}
                              onClick={() => handlePageChange(i)}
                            >
                              {i}
                            </CPaginationItem>
                          )
                        }

                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(<CPaginationItem key="dots2" disabled>...</CPaginationItem>)
                          }
                          pages.push(
                            <CPaginationItem
                              key={totalPages}
                              onClick={() => handlePageChange(totalPages)}
                            >
                              {totalPages}
                            </CPaginationItem>
                          )
                        }

                        return pages
                      })()}

                      <CPaginationItem
                        disabled={filters.page >= totalPages}
                        onClick={() => handlePageChange(filters.page + 1)}
                        style={{ cursor: filters.page < totalPages ? 'pointer' : 'not-allowed' }}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </CCardFooter>
                )}
              </>
            )}
          </CCardBody>
        </CCard>

        {/* Add/Edit Modal */}
        <CModal
          visible={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingUniversity(null)
            setError('')
          }}
          fullscreen
          scrollable
        >
          <CModalHeader>
            <CModalTitle>
              {editingUniversity ? `Edit University: ${editingUniversity.name}` : 'Add New University'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody className="p-4">
            <UniversityForm
              university={editingUniversity}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowModal(false)
                setEditingUniversity(null)
              }}
              error={error}
              submitting={loading}
            />
          </CModalBody>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <CModalHeader>
            <CModalTitle>Confirm Deletion</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>Are you sure you want to delete this university?</p>
            <p className="text-muted">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Delete University
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Universities