// pages/ContactManagement.js
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
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CButton,
  CBadge,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CFormTextarea,
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
  cilMagnifyingGlass,
  cilFilter,
  cilFilterX,
  cilChevronBottom,
  cilChevronTop,
  cilTrash,
  cilPencil,
} from '@coreui/icons'

import apiService from '../../services/apiService'

// ================= API =================
const getContacts = (params) =>
  apiService.get('/contactus', { params }).then(res => res)

const updateContact = (id, data) =>
  apiService.put(`/contactus/${id}`, data).then(res => res)

const deleteContact = (id) =>
  apiService.delete(`/contactus/${id}`).then(res => res)

const ContactManagement = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [viewing, setViewing] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    type: '',
    source: '',
    country: '',
    page: 1,
    limit: 20,
  })

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // ================= FETCH =================
  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getContacts(filters)
      if (res.success) {
        setContacts(res.data || [])
        setTotal(res.total || 0)
        setTotalPages(res.pages || 1)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // ================= HANDLERS =================
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      type: '',
      source: '',
      country: '',
      page: 1,
      limit: 20,
    })
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setFilters(prev => ({ ...prev, page }))
  }

  const handleDelete = async () => {
    try {
      const res = await deleteContact(deleteId)
      if (res.success) {
        setSuccess('Contact deleted successfully')
        setShowDeleteModal(false)
        setDeleteId(null)
        fetchContacts()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const handleResolve = async () => {
    try {
      const res = await updateContact(viewing._id, {
        status: 'Resolved',
        resolution: viewing.resolution,
      })
      if (res.success) {
        setSuccess('Marked as resolved')
        setShowViewModal(false)
        fetchContacts()
      }
    } catch (err) {
      setError(err.message || 'Update failed')
    }
  }

  const activeFilterCount = Object.keys(filters).filter(
    key => !['page', 'limit'].includes(key) && filters[key]
  ).length

  // ================= UI =================
  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="danger" dismissible>{error}</CAlert>}
        {success && <CAlert color="success" dismissible>{success}</CAlert>}

        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Contact Management</h5>
              <small className="text-muted">Total: {total}</small>
            </div>

            <CButton
              color="secondary"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <CIcon icon={cilFilter} className="me-2" />
              Filters
              {activeFilterCount > 0 && (
                <CBadge color="danger" className="ms-1">{activeFilterCount}</CBadge>
              )}
              <CIcon icon={showFilters ? cilChevronTop : cilChevronBottom} className="ms-2" />
            </CButton>
          </CCardHeader>

          {/* FILTERS */}
          {showFilters && (
            <CCardBody className="border-bottom">
              <CRow className="g-3">
                <CCol md={3}>
                  <CFormLabel>Search</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                    <CFormInput
                      placeholder="Name / Email / Phone"
                      value={filters.search}
                      onChange={e => handleFilterChange('search', e.target.value)}
                    />
                  </CInputGroup>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    value={filters.status}
                    onChange={e => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Priority</CFormLabel>
                  <CFormSelect
                    value={filters.priority}
                    onChange={e => handleFilterChange('priority', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Type</CFormLabel>
                  <CFormInput
                    value={filters.type}
                    onChange={e => handleFilterChange('type', e.target.value)}
                  />
                </CCol>

                <CCol md={12} className="d-flex justify-content-between">
                  <CButton color="danger" variant="outline" onClick={clearFilters}>
                    <CIcon icon={cilFilterX} className="me-2" />
                    Clear Filters
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          )}

          {/* TABLE */}
          <CCardBody>
            {loading ? (
              <div className="text-center py-5"><CSpinner /></div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-5 text-muted">No contacts found</div>
            ) : (
              <>
                <CTable >
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Phone</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Priority</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {contacts.map(c => (
                      <CTableRow key={c._id}>
                        <CTableDataCell>{c.fullName}</CTableDataCell>
                        <CTableDataCell>{c.email || '-'}</CTableDataCell>
                        <CTableDataCell>{c.phone || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={c.status === 'Resolved' ? 'success' : 'warning'}>
                            {c.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={c.priority === 'Urgent' ? 'danger' : 'info'}>
                            {c.priority}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            color="info"
                            variant="ghost"
                            onClick={() => {
                              setViewing(c)
                              setShowViewModal(true)
                            }}
                          >
                            View
                          </CButton>
                          <CButton
                            size="sm"
                            color="danger"
                            variant="ghost"
                            onClick={() => {
                              setDeleteId(c._id)
                              setShowDeleteModal(true)
                            }}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <CCardFooter className="d-flex justify-content-between">
                    <span>
                      Showing {(filters.page - 1) * filters.limit + 1}–
                      {Math.min(filters.page * filters.limit, total)} of {total}
                    </span>
                    <CPagination>
                      <CPaginationItem
                        disabled={filters.page === 1}
                        onClick={() => handlePageChange(filters.page - 1)}
                      >
                        Prev
                      </CPaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <CPaginationItem
                          key={i}
                          active={filters.page === i + 1}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={filters.page === totalPages}
                        onClick={() => handlePageChange(filters.page + 1)}
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

        {/* VIEW / RESOLVE MODAL */}
        <CModal visible={showViewModal} onClose={() => setShowViewModal(false)} size="lg">
          <CModalHeader>
            <CModalTitle>Contact Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {viewing && (
              <>
                <p><strong>Name:</strong> {viewing.fullName}</p>
                <p><strong>Email:</strong> {viewing.email}</p>
                <p><strong>Phone:</strong> {viewing.phone}</p>
                <p><strong>Subject:</strong> {viewing.subject}</p>
                <p><strong>Destination:</strong> {viewing.destination}</p>
                <p><strong>Message:</strong> {viewing.description}</p>
                <CFormLabel>Resolution</CFormLabel>
                <CFormTextarea
                  rows={3}
                  value={viewing.resolution || ''}
                  onChange={e =>
                    setViewing(prev => ({ ...prev, resolution: e.target.value }))
                  }
                />
              </>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={handleResolve}>Mark Resolved</CButton>
            <CButton color="secondary" onClick={() => setShowViewModal(false)}>Close</CButton>
          </CModalFooter>
        </CModal>

        {/* DELETE MODAL */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Are you sure you want to delete this contact?
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</CButton>
            <CButton color="danger" onClick={handleDelete}>Delete</CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default ContactManagement
