// pages/FAQ.js
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
    CFormTextarea,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CRow as CContainerRow,
    CCol as CContainerCol,
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
    cilFolder,
    cilFolderOpen,
    cilFile
} from '@coreui/icons'

import apiService from '../../services/apiService'
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import CKEditorComponent from '../page-information/Ckeditor'

const getFaqs = (params) =>
    apiService.get('/faqs', { params }).then(res => res)

const getFaqsTypes = () =>
    apiService.get('/faqs/types').then(res => res)

const createFaq = (data) =>
    apiService.post('/faqs', data).then(res => res)

const updateFaq = (id, data) =>
    apiService.put(`/faqs/${id}`, data).then(res => res)

const deleteFaq = (id) =>
    apiService.delete(`/faqs/${id}`).then(res => res)

const FAQ = () => {
    const [faqs, setFaqs] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [activeRoute, setActiveRoute] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [routes, setRoutes] = useState([])

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        type: 'General',
        order: 0,
        status: 'Active',
        isPublished: false
    })

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        status: '',
        isPublished: '',
        page: 1,
        limit: 20,
    })

    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    // ================= FETCH =================
    const fetchFaqs = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            // If a specific route is selected, filter by type
            const params = { ...filters }
            if (activeRoute !== 'all') {
                params.type = activeRoute
            }

            const res = await getFaqs(params)

            if (res.success) {
                setFaqs(res.data || [])
                setTotal(res.total || 0)
                setTotalPages(Math.ceil((res.total || 0) / filters.limit) || 1)
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch FAQs')
        } finally {
            setLoading(false)
        }
    }, [filters, activeRoute])

    useEffect(() => {
        fetchFaqs()
    }, [fetchFaqs])

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const types = await getFaqsTypes()

                if (types.success) {
                    setRoutes(types.data || [])
                }
            } catch (err) {
                console.error('Failed to fetch FAQ types:', err)
            }
        }
        fetchTypes()
    }, [])

    // ================= HANDLERS =================
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            status: '',
            isPublished: '',
            page: 1,
            limit: 20,
        })
        setSearchTerm('')
    }

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return
        setFilters(prev => ({ ...prev, page }))
    }

    const handleFormSubmit = async () => {
        try {
            setLoading(true)
            let res

            const payload = {
                ...formData,
                order: parseInt(formData.order) || 0
            }

            if (editing) {
                res = await updateFaq(editing._id, payload)
                if (res.success) setSuccess('FAQ updated successfully')
            } else {
                res = await createFaq(payload)
                if (res.success) setSuccess('FAQ created successfully')
            }

            if (res.success) {
                setShowModal(false)
                setEditing(null)
                resetForm()
                fetchFaqs()
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Operation failed')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            const res = await deleteFaq(deleteId)
            if (res.success) {
                setSuccess('FAQ deleted successfully')
                setShowDeleteModal(false)
                setDeleteId(null)
                fetchFaqs()
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Delete failed')
        }
    }

    const handleEditClick = (faq) => {
        setEditing(faq)
        setFormData({
            question: faq.question,
            answer: faq.answer,
            type: faq.type || 'General',
            order: faq.order || 0,
            status: faq.status || 'Active',
            isPublished: faq.isPublished || false
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            question: '',
            answer: '',
            type: 'General',
            order: 0,
            status: 'Active',
            isPublished: false
        })
    }

    const togglePublishStatus = async (faq) => {
        try {
            const res = await updateFaq(faq._id, {
                isPublished: !faq.isPublished
            })
            if (res.success) {
                fetchFaqs()
                setSuccess(`FAQ ${!faq.isPublished ? 'published' : 'unpublished'} successfully`)
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Failed to update status')
        }
    }

    const handleAddFAQ = (routeType = 'General') => {
        setEditing(null)
        resetForm()
        setFormData(prev => ({ ...prev, type: routeType }))
        setShowModal(true)
    }

    const activeFilterCount = Object.keys(filters).filter(
        key => !['page', 'limit'].includes(key) && filters[key]
    ).length

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Draft', label: 'Draft' }
    ]

    // Get FAQ count by route
    const getRouteCount = (routeId) => {
        if (routeId === 'all') return total
        return faqs.filter(faq => faq.type === routeId).length
    }

    // Filter FAQs based on search term
    const getFilteredFaqs = () => {
        if (!searchTerm) return faqs
        return faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const displayedFaqs = getFilteredFaqs()

    // ================= UI =================
    return (
        <CRow>
            <CCol xs={12}>
                {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
                {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

                <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-0">Frequently Asked Questions</h5>
                            <small className="text-muted">Total: {total} FAQs</small>
                        </div>
                        <div className="d-flex gap-2 mt-2 mt-md-0">
                            <CInputGroup style={{ maxWidth: '200px' }}>
                                <CInputGroupText>
                                    <CIcon icon={cilMagnifyingGlass} />
                                </CInputGroupText>
                                <CFormInput
                                    placeholder="Search FAQs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </CInputGroup>

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
                                onClick={() => handleAddFAQ(activeRoute !== 'all' ? activeRoute : 'General')}
                            >
                                <CIcon icon={cilPlus} className="me-2" /> Add FAQ
                            </CButton>
                        </div>
                    </CCardHeader>

                    {/* FILTERS */}
                    {showFilters && (
                        <CCardBody className="border-bottom">
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormLabel>Search</CFormLabel>
                                    <CInputGroup>
                                        <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                                        <CFormInput
                                            placeholder="Search questions..."
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
                                        <option value="">All Status</option>
                                        {statusOptions.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={12} className="d-flex justify-content-between">
                                    <div className="d-flex gap-3">
                                        <CFormCheck
                                            label="Published Only"
                                            checked={filters.isPublished === 'true'}
                                            onChange={e =>
                                                handleFilterChange('isPublished', e.target.checked ? 'true' : '')
                                            }
                                        />
                                    </div>

                                    <CButton color="danger" variant="outline" onClick={clearFilters}>
                                        <CIcon icon={cilFilterX} className="me-2" />
                                        Clear Filters
                                    </CButton>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    )}

                    {/* FOLDER STRUCTURE - ROUTE NAVIGATION */}
                    <CCardBody className="border-bottom bg-light">
                        <CNav variant="tabs" className="flex-wrap">
                            {routes.map(route => (
                                <CNavItem key={route.type}>
                                    <CNavLink
                                        active={activeRoute === route.type}
                                        onClick={() => {
                                            setActiveRoute(route.type)
                                            setFilters(prev => ({ ...prev, page: 1 }))
                                        }}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        {route.type}
                                        <CBadge
                                            color={activeRoute === route.type ? 'primary' : 'secondary'}
                                            className="ms-1"
                                        >
                                            {(route.count)}
                                        </CBadge>
                                    </CNavLink>
                                </CNavItem>
                            ))}
                        </CNav>
                    </CCardBody>

                    {/* TABLE */}
                    <CCardBody>
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner />
                            </div>
                        ) : displayedFaqs.length === 0 ? (
                            <div className="text-center py-5">
                                <CIcon icon={cilFolderOpen} size="xl" className="text-muted mb-3" />
                                <div className="text-muted">
                                    {searchTerm ? 'No FAQs match your search' : 'No FAQs found in this category'}
                                </div>
                                {activeRoute !== 'all' && (
                                    <CButton
                                        color="primary"
                                        variant="outline"
                                        className="mt-3"
                                        onClick={() => handleAddFAQ(activeRoute)}
                                    >
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Add FAQ to {activeRoute}
                                    </CButton>
                                )}
                            </div>
                        ) : (
                            <>
                                <CTable responsive>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell style={{ width: '60px' }}>#</CTableHeaderCell>
                                            <CTableHeaderCell>Question</CTableHeaderCell>
                                            <CTableHeaderCell style={{ width: '120px' }}>Route</CTableHeaderCell>
                                            <CTableHeaderCell style={{ width: '150px' }}>Status</CTableHeaderCell>
                                            <CTableHeaderCell style={{ width: '150px' }}>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody>
                                        {displayedFaqs.map((faq, index) => (
                                            <CTableRow key={faq._id}>
                                                <CTableDataCell>
                                                    {(filters.page - 1) * filters.limit + index + 1}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div
                                                        className="fw-semibold faq-question"
                                                        dangerouslySetInnerHTML={{ __html: faq.question }}
                                                    />
                                                    <small className="text-muted d-block" dangerouslySetInnerHTML={{ __html: faq.answer.substring(0, 80) + '...' }} />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color="info" className="text-uppercase">
                                                        <CIcon icon={cilFolder} className="me-1" size="sm" />
                                                        {faq.type}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        <CBadge color={
                                                            faq.status === 'Active' ? 'success' :
                                                                faq.status === 'Draft' ? 'warning' : 'secondary'
                                                        }>
                                                            {faq.status}
                                                        </CBadge>
                                                        <CBadge color={faq.isPublished ? 'primary' : 'secondary'}>
                                                            {faq.isPublished ? 'Published' : 'Unpublished'}
                                                        </CBadge>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        <CButton
                                                            size="sm"
                                                            color={faq.isPublished ? 'secondary' : 'primary'}
                                                            variant="ghost"
                                                            onClick={() => togglePublishStatus(faq)}
                                                            title={faq.isPublished ? 'Unpublish' : 'Publish'}
                                                        >
                                                            <CIcon icon={faq.isPublished ? BsEye : BsEyeSlash} />
                                                        </CButton>
                                                        <CButton
                                                            size="sm"
                                                            color="warning"
                                                            variant="ghost"
                                                            onClick={() => handleEditClick(faq)}
                                                            title="Edit"
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                        <CButton
                                                            size="sm"
                                                            color="danger"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setDeleteId(faq._id)
                                                                setShowDeleteModal(true)
                                                            }}
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

                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <CCardFooter className="d-flex justify-content-between align-items-center flex-wrap">
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
                                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (filters.page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (filters.page >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = filters.page - 2 + i;
                                                }
                                                return (
                                                    <CPaginationItem
                                                        key={i}
                                                        active={filters.page === pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </CPaginationItem>
                                                );
                                            })}
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
                <CModal fullscreen visible={showModal} onClose={() => setShowModal(false)} size="lg">
                    <CModalHeader>
                        <CModalTitle>
                            {editing ? 'Edit FAQ' : 'Add FAQ'}
                            {!editing && formData.type && (
                                <CBadge color="info" className="ms-2">
                                    <CIcon icon={cilFolder} className="me-1" />
                                    {formData.type}
                                </CBadge>
                            )}
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <CRow className="g-3">
                            <CCol xs={12}>
                                <CFormLabel>Question *</CFormLabel>
                                <CKEditorComponent
                                    value={formData.question}
                                    onChange={(value) => setFormData(prev => ({ ...prev, question: value }))}
                                />
                            </CCol>

                            <CCol xs={12}>
                                <CFormLabel>Answer *</CFormLabel>
                                <CKEditorComponent
                                    value={formData.answer}
                                    onChange={(value) => setFormData(prev => ({ ...prev, answer: value }))}
                                />
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel>Route / Category *</CFormLabel>
                                <CFormInput
                                    placeholder="Search questions..."
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                />
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel>Status</CFormLabel>
                                <CFormSelect
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={6} className="d-flex align-items-end">
                                <CFormCheck
                                    label="Published"
                                    checked={formData.isPublished}
                                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                />
                            </CCol>
                        </CRow>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
                        <CButton
                            color="primary"
                            onClick={handleFormSubmit}
                            disabled={!formData.question || !formData.answer || loading}
                        >
                            {loading && <CSpinner size="sm" className="me-2" />}
                            {editing ? 'Update' : 'Create'}
                        </CButton>
                    </CModalFooter>
                </CModal>

                {/* DELETE MODAL */}
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <CModalHeader>
                        <CModalTitle>Confirm Delete</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        Are you sure you want to delete this FAQ? This action cannot be undone.
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

export default FAQ