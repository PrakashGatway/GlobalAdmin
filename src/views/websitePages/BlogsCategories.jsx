import React, { useEffect, useState } from 'react'
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
    cilMagnifyingGlass,
    cilReload,
} from '@coreui/icons'
import apiService from '../../services/apiService'


const blogCategoryService = {
    getCategories: (params) =>
        apiService.get('/blogs/categories', { params }).then(res => res),

    createCategory: (data) =>
        apiService.post('/blogs/categories', data).then(res => res),

    updateCategory: (id, data) =>
        apiService.put(`/blogs/categories/${id}`, data).then(res => res),

    deleteCategory: (id) =>
        apiService.delete(`/blogs/categories/${id}`).then(res => res),
}

const BlogCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [withBlogs, setWithBlogs] = useState(false)

    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [total, setTotal] = useState(0)

    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [editingId, setEditingId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        status: 'Active',
    })

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Fetch Categories
    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await blogCategoryService.getCategories({
                search,
                status,
                withBlogs,
                page,
                limit,
                sort: '-createdAt',
            })
            console.log('Fetched categories:', res)
            setCategories(res.data)
            setTotal(res.total)
        } catch (err) {
            setError(err.message || 'Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [page, search, status, withBlogs])

    // Handle input
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Auto slug
    useEffect(() => {
        if (!editingId && formData.name) {
            setFormData(prev => ({
                ...prev,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
            }))
        }
    }, [formData.name])

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        try {
            let res
            if (editingId) {
                res = await blogCategoryService.updateCategory(editingId, formData)
                setSuccess('Category updated successfully')
            } else {
                res = await blogCategoryService.createCategory(formData)
                setSuccess('Category created successfully')
            }

            if (res.success) {
                setShowModal(false)
                setEditingId(null)
                resetForm()
                fetchCategories()
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed')
        }
    }

    // Edit
    const handleEdit = (cat) => {
        setEditingId(cat._id)
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            status: cat.status,
        })
        setShowModal(true)
    }

    // Delete
    const handleDelete = async () => {
        try {
            const res = await blogCategoryService.deleteCategory(deletingId)
            if (res.success) {
                setSuccess('Category deleted')
                setShowDeleteModal(false)
                fetchCategories()
            }
        } catch (err) {
            setError('Delete failed')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            status: 'Active',
        })
        setEditingId(null)
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <CRow>
            <CCol xs={12}>
                {error && <CAlert color="danger">{error}</CAlert>}
                {success && <CAlert color="success">{success}</CAlert>}

                <CCard>
                    <CCardHeader className="d-flex justify-content-between">
                        <div>
                            <h5 className="mb-0">Blog Categories</h5>
                            <small className="text-body-secondary">
                                Manage blog categories
                            </small>
                        </div>
                        <div>
                            <CButton
                                color="primary"
                                className="me-2"
                                onClick={() => {
                                    resetForm()
                                    setShowModal(true)
                                }}
                            >
                                <CIcon icon={cilPlus} className="me-1" />
                                Add Category
                            </CButton>
                            <CButton color="secondary" variant="outline" onClick={fetchCategories}>
                                <CIcon icon={cilReload} />
                            </CButton>
                        </div>
                    </CCardHeader>

                    <CCardBody>
                        {/* Filters */}
                        <CRow className="mb-3">
                            <CCol md={4}>
                                <CInputGroup>
                                    <CInputGroupText>
                                        <CIcon icon={cilMagnifyingGlass} />
                                    </CInputGroupText>
                                    <CFormInput
                                        placeholder="Search category..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </CInputGroup>
                            </CCol>

                            <CCol md={3}>
                                <CFormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </CFormSelect>
                            </CCol>

                            <CCol md={3}>
                                <CFormSelect
                                    value={withBlogs ? 'true' : ''}
                                    onChange={(e) => setWithBlogs(e.target.value === 'true')}
                                >
                                    <option value="">All Categories</option>
                                    <option value="true">With Blogs Only</option>
                                </CFormSelect>
                            </CCol>
                        </CRow>

                        {/* Table */}
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner />
                            </div>
                        ) : (
                            <CTable>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Name</CTableHeaderCell>
                                        <CTableHeaderCell>Slug</CTableHeaderCell>
                                        <CTableHeaderCell>Total Blogs</CTableHeaderCell>
                                        <CTableHeaderCell>Status</CTableHeaderCell>
                                        <CTableHeaderCell>Created</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {categories?.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan="6" className="text-center">
                                                No categories found
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        categories?.map(cat => (
                                            <CTableRow key={cat._id}>
                                                <CTableDataCell>{cat.name}</CTableDataCell>
                                                <CTableDataCell>{cat.slug}</CTableDataCell>
                                                <CTableDataCell>{cat.totalBlogs}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={cat.status === 'Active' ? 'success' : 'secondary'}>
                                                        {cat.status}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {new Date(cat.createdAt).toLocaleDateString()}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <CButton size="sm" variant="outline" color="primary" className="me-2" onClick={() => handleEdit(cat)}>
                                                        <CIcon icon={cilPencil} />
                                                    </CButton>
                                                    <CButton size="sm" variant="outline" color="danger" onClick={() => {
                                                        setDeletingId(cat._id)
                                                        setShowDeleteModal(true)
                                                    }}>
                                                        <CIcon icon={cilTrash} />
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
                            <CPagination className="mt-3">
                                {[...Array(totalPages)].map((_, i) => (
                                    <CPaginationItem
                                        key={i}
                                        active={page === i + 1}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </CPaginationItem>
                                ))}
                            </CPagination>
                        )}
                    </CCardBody>
                </CCard>

                {/* Add/Edit Modal */}
                <CModal visible={showModal} onClose={() => setShowModal(false)}>
                    <CModalHeader>
                        <CModalTitle>{editingId ? 'Edit Category' : 'Add Category'}</CModalTitle>
                    </CModalHeader>
                    <CForm onSubmit={handleSubmit}>
                        <CModalBody>
                            <div className="mb-3">
                                <CFormLabel>Name *</CFormLabel>
                                <CFormInput name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Slug *</CFormLabel>
                                <CFormInput name="slug" value={formData.slug} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Status</CFormLabel>
                                <CFormSelect name="status" value={formData.status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </CFormSelect>
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Description</CFormLabel>
                                <CFormTextarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </CButton>
                            <CButton color="primary" type="submit">
                                {editingId ? 'Update' : 'Create'}
                            </CButton>
                        </CModalFooter>
                    </CForm>
                </CModal>

                {/* Delete Modal */}
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <CModalHeader>
                        <CModalTitle>Confirm Delete</CModalTitle>
                    </CModalHeader>
                    <CModalBody>Are you sure you want to delete this category?</CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </CButton>
                        <CButton color="danger" onClick={handleDelete}>
                            Delete
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCol>
        </CRow>
    )
}

export default BlogCategories
