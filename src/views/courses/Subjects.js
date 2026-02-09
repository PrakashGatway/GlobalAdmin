import React, { use, useEffect, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CButton,
    CBadge,
    CInputGroup,
    CInputGroupText,
    CFormInput,
    CFormSelect,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormLabel,
    CFormTextarea,
    CAlert,
    CSpinner,
    CPagination,
    CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilPlus,
    cilPencil,
    cilTrash,
    cilReload,
} from '@coreui/icons'
import apiService from '../../services/apiService'
import { courseCategoryService } from './CategoriesList'

const subjectService = {
    getSubjects: (params) =>
        apiService.get('/subjects', { params }).then(res => res),
    createSubject: (data) =>
        apiService.post('/subjects', data).then(res => res),
    updateSubject: (id, data) =>
        apiService.put(`/subjects/${id}`, data).then(res => res),
    deleteSubject: (id) =>
        apiService.delete(`/subjects/${id}`).then(res => res),
}

const Subjects = () => {
    const [subjects, setSubjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit] = useState(50)
    const [total, setTotal] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        isActive: 'true',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Fetch Subjects
    const fetchSubjects = async () => {
        setLoading(true)
        try {
            const res = await subjectService.getSubjects({
                page,
                limit,
            })
            setSubjects(res.data || [])
            setTotal(res.total || 0)
            setError('')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch subjects')
            setSubjects([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await courseCategoryService.getCategories({
                page: 1,
                limit: 100,
            })
            setCategories(res.data || [])
            setLoadingOptions(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch categories')
            setCategories([])
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])
    useEffect(() => {
        fetchSubjects()
    }, [page])

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Auto-generate slug from name (only for new subjects)
    useEffect(() => {
        if (!editingId && formData.name) {
            setFormData(prev => ({
                ...prev,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            }))
        }
    }, [formData.name, editingId])

    // Handle form submission (create/update)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Prepare payload with boolean conversion for isActive
        const payload = {
            ...formData,
            isActive: formData.isActive === 'true'
        }

        try {
            let res
            if (editingId) {
                res = await subjectService.updateSubject(editingId, payload)
                setSuccess('Subject updated successfully')
            } else {
                res = await subjectService.createSubject(payload)
                setSuccess('Subject created successfully')
            }

            if (res?.success) {
                setShowModal(false)
                setEditingId(null)
                resetForm()
                fetchSubjects()
            } else {
                throw new Error(res?.message || 'Operation failed')
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Operation failed')
        }
    }

    // Edit subject handler
    const handleEdit = (subject) => {
        setEditingId(subject._id)
        setFormData({
            name: subject.name || '',
            slug: subject.slug || '',
            description: subject.description || '',
            icon: subject.icon || '',
            category: subject.category || '',
            isActive: subject.isActive?.toString() || 'true',
        })
        setShowModal(true)
    }

    // Delete subject handler
    const handleDelete = async () => {
        try {
            const res = await subjectService.deleteSubject(deletingId)
            if (res.data?.success) {
                setSuccess('Subject deleted successfully')
                setShowDeleteModal(false)
                fetchSubjects()
            } else {
                throw new Error(res.data?.message || 'Delete failed')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed')
        }
    }

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            icon: '',
            isActive: 'true',
        })
        setEditingId(null)
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <CRow>
            <CCol xs={12}>
                {error && <CAlert color="danger" dismissible>{error}</CAlert>}
                {success && <CAlert color="success" dismissible>{success}</CAlert>}

                <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 className="mb-0">Subjects</h5>
                            <small className="text-body-secondary">
                                Manage learning subjects
                            </small>
                        </div>
                        <div className="d-flex gap-2">
                            <CButton
                                color="primary"
                                onClick={() => {
                                    resetForm()
                                    setShowModal(true)
                                }}
                            >
                                <CIcon icon={cilPlus} className="me-1" />
                                Add Subject
                            </CButton>
                            <CButton
                                color="secondary"
                                variant="outline"
                                onClick={fetchSubjects}
                                disabled={loading}
                            >
                                <CIcon icon={cilReload} />
                            </CButton>
                        </div>
                    </CCardHeader>

                    <CCardBody>
                        {/* Table */}
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner size="lg" />
                                <div className="mt-2 text-muted">Loading subjects...</div>
                            </div>
                        ) : (
                            <CTable>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Name</CTableHeaderCell>
                                        <CTableHeaderCell>Slug</CTableHeaderCell>
                                        <CTableHeaderCell>Category</CTableHeaderCell>
                                        <CTableHeaderCell>Description</CTableHeaderCell>
                                        <CTableHeaderCell>Status</CTableHeaderCell>
                                        <CTableHeaderCell>Created</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {subjects.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan="7" className="text-center py-4">
                                                <div className="text-muted">No subjects found</div>
                                                <CButton
                                                    color="primary"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => {
                                                        resetForm()
                                                        setShowModal(true)
                                                    }}
                                                >
                                                    <CIcon icon={cilPlus} className="me-1" />
                                                    Create First Subject
                                                </CButton>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        subjects.map(subject => (
                                            <CTableRow key={subject._id}>
                                                <CTableDataCell className='px-2'>
                                                    <strong>{subject.name}</strong>
                                                </CTableDataCell>
                                                <CTableDataCell className='px-2'>
                                                    <code>{subject.slug}</code>
                                                </CTableDataCell>
                                                <CTableDataCell className='px-2'>
                                                    <small>{subject?.category?.name || '-'}</small>
                                                </CTableDataCell>
                                                <CTableDataCell className='px-2'>
                                                    {subject.description
                                                        ? (subject.description.length > 50
                                                            ? `${subject.description.substring(0, 50)}...`
                                                            : subject.description)
                                                        : '-'}
                                                </CTableDataCell>
                                                <CTableDataCell className='px-2'>
                                                    <CBadge
                                                        color={subject.isActive ? 'success' : 'secondary'}
                                                        text={subject.isActive ? 'Active' : 'Inactive'}
                                                    >
                                                        {subject.isActive ? 'Active' : 'Inactive'}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell className='px-2'>
                                                    {subject.createdAt
                                                        ? new Date(subject.createdAt).toLocaleDateString()
                                                        : '-'}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <CButton
                                                        size="sm"
                                                        variant="outline"
                                                        color="primary"
                                                        className="me-2"
                                                        onClick={() => handleEdit(subject)}
                                                        title="Edit subject"
                                                    >
                                                        <CIcon icon={cilPencil} size="sm" />
                                                    </CButton>
                                                    <CButton
                                                        size="sm"
                                                        variant="outline"
                                                        color="danger"
                                                        onClick={() => {
                                                            setDeletingId(subject._id)
                                                            setShowDeleteModal(true)
                                                        }}
                                                        title="Delete subject"
                                                    >
                                                        <CIcon icon={cilTrash} size="sm" />
                                                    </CButton>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )}
                                </CTableBody>
                            </CTable>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4">
                                <CPagination className="m-0">
                                    <CPaginationItem
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </CPaginationItem>

                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1
                                        // Show first, last, and around current page
                                        if (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= page - 1 && pageNum <= page + 1)
                                        ) {
                                            return (
                                                <CPaginationItem
                                                    key={pageNum}
                                                    active={page === pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </CPaginationItem>
                                            )
                                        }
                                        // Show ellipsis for skipped pages
                                        if (pageNum === page - 2 || pageNum === page + 2) {
                                            return (
                                                <CPaginationItem key={`ellipsis-${pageNum}`} disabled>
                                                    ...
                                                </CPaginationItem>
                                            )
                                        }
                                        return null
                                    })}

                                    <CPaginationItem
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    >
                                        Next
                                    </CPaginationItem>
                                </CPagination>
                            </div>
                        )}
                    </CCardBody>
                </CCard>

                {/* Add/Edit Modal */}
                <CModal
                    visible={showModal}
                    onClose={() => {
                        setShowModal(false)
                        resetForm()
                    }}
                    size="lg"
                >
                    <CModalHeader>
                        <CModalTitle>{editingId ? 'Edit Subject' : 'Add New Subject'}</CModalTitle>
                    </CModalHeader>
                    <CForm onSubmit={handleSubmit}>
                        <CModalBody>
                            <CRow>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="name">Name *</CFormLabel>
                                        <CFormInput
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Mathematics, Science, etc."
                                        />
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="slug">Slug *</CFormLabel>
                                        <CFormInput
                                            id="slug"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            required
                                            placeholder="mathematics"
                                            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                                            title="Lowercase letters, numbers and hyphens only"
                                        />
                                        <small className="text-muted">Auto-generated from name</small>
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Category*</CFormLabel>
                                    <CFormSelect
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        disabled={loadingOptions}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(sub => (
                                            <option key={sub._id} value={sub._id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                            </CRow>

                            <CRow>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="icon">Icon</CFormLabel>
                                        <CFormInput
                                            id="icon"
                                            name="icon"
                                            value={formData.icon}
                                            onChange={handleChange}
                                            placeholder="URL or icon class (e.g., cil-book)"
                                        />
                                        <small className="text-muted">
                                            URL for image or CoreUI icon class name
                                        </small>
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="isActive">Status</CFormLabel>
                                        <CFormSelect
                                            id="isActive"
                                            name="isActive"
                                            value={formData.isActive}
                                            onChange={handleChange}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
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
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Brief description of the subject..."
                                />
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton
                                color="secondary"
                                onClick={() => {
                                    setShowModal(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </CButton>
                            <CButton
                                color="primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <CSpinner size="sm" className="me-2" />
                                        Processing...
                                    </>
                                ) : editingId ? 'Update Subject' : 'Create Subject'}
                            </CButton>
                        </CModalFooter>
                    </CForm>
                </CModal>

                {/* Delete Modal */}
                <CModal
                    visible={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    color="danger"
                >
                    <CModalHeader>
                        <CModalTitle>Delete Subject</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <CAlert color="warning" className="mb-3">
                            <strong>Warning!</strong> This action cannot be undone. All content associated with this subject may become inaccessible.
                        </CAlert>
                        <p>Are you sure you want to delete this subject?</p>
                        <p className="text-danger fw-medium">
                            This will permanently remove the subject from the system.
                        </p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="secondary"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </CButton>
                        <CButton
                            color="danger"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <CSpinner size="sm" className="me-2" />
                                    Deleting...
                                </>
                            ) : 'Delete Permanently'}
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCol>
        </CRow>
    )
}

export default Subjects