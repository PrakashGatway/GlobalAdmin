// pages/Testimonials.js
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
    cilChevronTop,
} from '@coreui/icons'

import TestimonialForm from './TestimonialForm'
import apiService from '../../services/apiService'

const getTestimonials = (params) =>
    apiService.get('/testimonials', { params }).then(res => res)

const createTestimonial = (data) =>
    apiService.post('/testimonials', data).then(res => res)

const updateTestimonial = (id, data) =>
    apiService.put(`/testimonials/${id}`, data).then(res => res)

const deleteTestimonial = (id) =>
    apiService.delete(`/testimonials/${id}`).then(res => res)

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        status: '',
        isFeatured: '',
        rating: '',
        isAdmin:true,
        page: 1,
        limit: 20,
    })

    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    // ================= FETCH =================
    const fetchTestimonials = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getTestimonials(filters)
            if (res.success) {
                setTestimonials(res.data || [])
                setTotal(res.total || 0)
                setTotalPages(res.pages || 1)
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch testimonials')
        } finally {
            setLoading(false)
        }
    }, [filters])


    const handleFormSuccess = async (payload) => {
        try {
            setLoading(true)
            let res
            if (editing) {
                res = await updateTestimonial(editing._id, payload)
                if (res.success) setSuccess('Testimonial updated successfully')
            } else {
                res = await createTestimonial(payload)
                if (res.success) setSuccess('Testimonial created successfully')
            }

            if (res.success) {
                setShowModal(false)
                setEditing(null)
                fetchTestimonials()
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Operation failed')
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchTestimonials()
    }, [fetchTestimonials])

    // ================= HANDLERS =================
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            status: '',
            isFeatured: '',
            rating: '',
            page: 1,
            limit: 10,
        })
    }

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return
        setFilters(prev => ({ ...prev, page }))
    }

    const handleDelete = async () => {
        try {
            const res = await deleteTestimonial(deleteId)
            if (res.success) {
                setSuccess('Testimonial deleted successfully')
                setShowDeleteModal(false)
                setDeleteId(null)
                fetchTestimonials()
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Delete failed')
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
                            <h5 className="mb-0">Testimonials</h5>
                            <small className="text-muted">Total: {total}</small>
                        </div>
                        <div className="d-flex gap-2">
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

                            <CButton
                                color="primary"
                                onClick={() => {
                                    setEditing(null)
                                    setShowModal(true)
                                }}
                            >
                                <CIcon icon={cilPlus} className="me-2" /> Add Testimonial
                            </CButton>
                        </div>
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
                                            placeholder="Name / University"
                                            value={filters.search}
                                            onChange={e => handleFilterChange('search', e.target.value)}
                                        />
                                    </CInputGroup>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Type</CFormLabel>
                                    <CFormSelect
                                        value={filters.type}
                                        onChange={e => handleFilterChange('type', e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="image">Image Testimonial</option>
                                        <option value="video">Video Testimonial</option>
                                        <option value="caseStudy">Case Study</option>
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Status</CFormLabel>
                                    <CFormSelect
                                        value={filters.status}
                                        onChange={e => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Rating</CFormLabel>
                                    <CFormSelect
                                        value={filters.rating}
                                        onChange={e => handleFilterChange('rating', e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {[5, 4, 3, 2, 1].map(r => (
                                            <option key={r} value={r}>{r} Star</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={12} className="d-flex justify-content-between">
                                    <CFormCheck
                                        label="Featured Only"
                                        checked={filters.isFeatured === 'true'}
                                        onChange={e =>
                                            handleFilterChange('isFeatured', e.target.checked ? 'true' : '')
                                        }
                                    />

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
                            <div className="text-center py-5">
                                <CSpinner />
                            </div>
                        ) : testimonials.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                No testimonials found
                            </div>
                        ) : (
                            <>
                                <CTable hover responsive>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Name</CTableHeaderCell>
                                            <CTableHeaderCell>University</CTableHeaderCell>
                                            <CTableHeaderCell>Type</CTableHeaderCell>
                                            <CTableHeaderCell>Rating</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Featured</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody>
                                        {testimonials.map(t => (
                                            <CTableRow key={t._id}>
                                                <CTableDataCell>{t.name}</CTableDataCell>
                                                <CTableDataCell>{t.university || '-'}</CTableDataCell>
                                                <CTableDataCell>{t.type}</CTableDataCell>
                                                <CTableDataCell>{t.rating} ⭐</CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={t.status === 'Approved' ? 'success' : 'warning'}>
                                                        {t.status}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={t.isFeatured ? 'info' : 'secondary'}>
                                                        {t.isFeatured ? 'Yes' : 'No'}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CButton
                                                        size="sm"
                                                        color="warning"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditing(t)
                                                            setShowModal(true)
                                                        }}
                                                    >
                                                        <CIcon icon={cilPencil} />
                                                    </CButton>
                                                    <CButton
                                                        size="sm"
                                                        color="danger"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setDeleteId(t._id)
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

                {/* ADD / EDIT MODAL */}
                <CModal visible={showModal} onClose={() => setShowModal(false)} fullscreen>
                    <CModalHeader>
                        <CModalTitle>
                            {editing ? 'Edit Testimonial' : 'Add Testimonial'}
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <TestimonialForm
                            testimonial={editing}
                            onSuccess={handleFormSuccess}
                        />
                    </CModalBody>
                </CModal>

                {/* DELETE MODAL */}
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <CModalHeader>
                        <CModalTitle>Confirm Delete</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        Are you sure you want to delete this testimonial?
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

export default Testimonials
