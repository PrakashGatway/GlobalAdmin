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

import apiService from '../../services/apiService'
import { BsEye, BsEyeSlash } from 'react-icons/bs'

const getFaqs = (params) =>
    apiService.get('/faqs', { params }).then(res => res)

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
        referenceModel: '',
        referenceId: '',
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
            const res = await getFaqs(filters)
            if (res.success) {
                setFaqs(res.data || [])
                setTotal(res.count || 0)
                setTotalPages(Math.ceil(res.count / filters.limit) || 1)
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch FAQs')
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchFaqs()
    }, [fetchFaqs])

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
            referenceModel: '',
            referenceId: '',
            page: 1,
            limit: 20,
        })
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

    const activeFilterCount = Object.keys(filters).filter(
        key => !['page', 'limit'].includes(key) && filters[key]
    ).length

    const referenceModels = [
        { value: '', label: 'None' },
        { value: 'Course', label: 'Course' },
        { value: 'Program', label: 'Program' },
        { value: 'University', label: 'University' },
        { value: 'Service', label: 'Service' }
    ]

    const faqTypes = [
        'General',
        'About',
        'Contact',
        'Course',
        'University',
        'Scholarship',
        'Visa',
        'Admission',
        'Application',
        'Other',
    ]

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Draft', label: 'Draft' }
    ]

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
                                    resetForm()
                                    setShowModal(true)
                                }}
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
                                {/* 
                                <CCol md={3}>
                                    <CFormLabel>Reference Model</CFormLabel>
                                    <CFormSelect
                                        value={filters.referenceModel}
                                        onChange={e => handleFilterChange('referenceModel', e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {referenceModels.map(model => (
                                            <option key={model.value} value={model.value}>
                                                {model.label}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol> */}

                                <CCol md={12} className="d-flex justify-content-between">
                                    <div className="d-flex gap-3">
                                        <CFormCheck
                                            label="Published Only"
                                            checked={filters.isPublished === 'true'}
                                            onChange={e =>
                                                handleFilterChange('isPublished', e.target.checked ? 'true' : '')
                                            }
                                        />
                                        {/* <CFormCheck
                                            label="With Reference Only"
                                            checked={filters.referenceId === 'has'}
                                            onChange={e =>
                                                handleFilterChange('referenceId', e.target.checked ? 'has' : '')
                                            }
                                        /> */}
                                    </div>

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
                        ) : faqs.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                No FAQs found
                            </div>
                        ) : (
                            <>
                                <CTable >
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Order</CTableHeaderCell>
                                            <CTableHeaderCell>Question</CTableHeaderCell>
                                            <CTableHeaderCell>Type</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            {/* <CTableHeaderCell>Reference</CTableHeaderCell> */}
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody>
                                        {faqs.map((faq, index) => (
                                            <CTableRow key={faq._id}>
                                                <CTableDataCell>{index + 1}</CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="fw-semibold">{faq.question}</div>
                                                    <small className="text-muted">
                                                        {faq.answer.substring(0, 100)}...
                                                    </small>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color="info">{faq.type}</CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex flex-row gap-1">
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
                                                {/* <CTableDataCell>
                                                    {faq.referenceModel ? (
                                                        <div>
                                                            <small className="text-muted">{faq.referenceModel}</small>
                                                            <div>{faq.referenceId || 'N/A'}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </CTableDataCell> */}
                                                <CTableDataCell>
                                                    <div className="d-flex gap-1">
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
                                    <CCardFooter className="d-flex justify-content-between align-items-center">
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
                <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
                    <CModalHeader>
                        <CModalTitle>
                            {editing ? 'Edit FAQ' : 'Add FAQ'}
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <CRow className="g-3">
                            <CCol xs={12}>
                                <CFormLabel>Question *</CFormLabel>
                                <CFormInput
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="Enter question..."
                                    required
                                />
                            </CCol>

                            <CCol xs={12}>
                                <CFormLabel>Answer *</CFormLabel>
                                <CFormTextarea
                                    value={formData.answer}
                                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                    placeholder="Enter answer..."
                                    rows={4}
                                    required
                                />
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel>Route</CFormLabel>

                                <CFormInput
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    placeholder="Enter route..."
                                    required
                                />
                            </CCol>

                            {/* <CCol md={6}>
                                <CFormLabel>Order</CFormLabel>
                                <CFormInput
                                    type="number"
                                    value={formData.order}
                                    onChange={e => setFormData({...formData, order: e.target.value})}
                                    min="0"
                                />
                            </CCol> */}

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
                            {/* 
                            <CCol md={6}>
                                <CFormLabel>Reference Model</CFormLabel>
                                <CFormSelect
                                    value={formData.referenceModel}
                                    onChange={e => setFormData({...formData, referenceModel: e.target.value})}
                                >
                                    {referenceModels.map(model => (
                                        <option key={model.value} value={model.value}>
                                            {model.label}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol> */}

                            {/* <CCol md={6}>
                                <CFormLabel>Reference ID</CFormLabel>
                                <CFormInput
                                    value={formData.referenceId}
                                    onChange={e => setFormData({...formData, referenceId: e.target.value})}
                                    placeholder="Enter reference ID..."
                                    disabled={!formData.referenceModel}
                                />
                            </CCol> */}
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