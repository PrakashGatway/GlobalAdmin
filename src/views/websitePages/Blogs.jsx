// src/views/blogs/Blogs.js
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
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilPlus,
    cilPencil,
    cilTrash,
    cilMagnifyingGlass,
    cilReload,
    cilStar,
    cilBan,
    cilOptions,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import apiService from '../../services/apiService'

const blogService = {
    getBlogs: (params) => apiService.get('/blogs', { params }).then(res => res),
    deleteBlog: (id) => apiService.delete(`/blogs/${id}`).then(res => res),
    getCategories: () => apiService.get('/blogs/categories').then(res => res.data),
}

const Blogs = () => {
    const navigate = useNavigate()
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [status, setStatus] = useState('')
    const [type, setType] = useState('')
    const [isFeatured, setIsFeatured] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(0)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [categories, setCategories] = useState([])

    const fetchBlogs = async () => {
        setLoading(true)
        try {
            const res = await blogService.getBlogs({
                search,
                category,
                status,
                isFeatured: isFeatured === '' ? undefined : isFeatured === 'true',
                fromDate,
                toDate,
                page,
                type: type,
                limit,
                sort: '-createdAt',
            })
            setBlogs(res.data)
            setTotal(res.total)
        } catch (err) {
            setError(err.message || 'Failed to fetch blogs')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const cats = await blogService.getCategories()
            setCategories(cats)
        } catch (err) {
            console.error('Failed to load categories')
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, [page, search, category, status, isFeatured, fromDate, toDate,type, limit])

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleDelete = async () => {
        try {
            const res = await blogService.deleteBlog(deletingId)
            if (res.success) {
                setSuccess('Blog deleted successfully')
                setShowDeleteModal(false)
                fetchBlogs()
            }
        } catch (err) {
            setError('Delete failed: ' + (err.response?.data?.message || err.message))
        }
    }

    const totalPages = Math.ceil(total / limit)
    const limits = [5, 10, 20, 50]

    return (
        <CRow>
            <CCol xs={12}>
                {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
                {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

                <CCard className="mb-4 shadow-sm">
                    <CCardHeader className="d-flex justify-content-between align-items-center bg-light">
                        <div>
                            <h4 className="mb-0 fw-bold">Blog Management</h4>
                            <small className="text-body-secondary">Manage your blog posts</small>
                        </div>
                        <div className='d-flex justify-content-end align-items-center gap-2'>
                            <CFormSelect
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value)
                                }}
                            >
                                <option value="">All</option>
                                <option value="blog">Blogs</option>
                                <option value="event">Events</option>
                                <option value="university">Universities</option>
                                <option value="programs">Programs</option>
                                <option value="webnair">Webnair</option>
                            </CFormSelect>
                            <CCol className="">
                                <CButton color="secondary" variant="outline" onClick={fetchBlogs}>
                                    <CIcon icon={cilReload} />
                                </CButton>
                            </CCol>
                            <CButton
                            className='d-flex align-items-center'
                                color="primary"
                                onClick={() => navigate('/blogs/create')}
                            >
                                <CIcon icon={cilPlus} className="me-1" />
                                Add
                            </CButton>
                        </div>
                    </CCardHeader>

                    <CCardBody>
                        {/* Filters Section */}
                        <CRow className="mb-4 g-1">
                            <CCol md={4} sm={6}>
                                <CInputGroup>
                                    <CInputGroupText>
                                        <CIcon icon={cilMagnifyingGlass} />
                                    </CInputGroupText>
                                    <CFormInput
                                        placeholder="Search title or description..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value)
                                            setPage(1)
                                        }}
                                    />
                                </CInputGroup>
                            </CCol>

                            <CCol md={2} sm={6}>
                                <CFormSelect
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value)
                                        setPage(1)
                                    }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={2} sm={6}>
                                <CFormSelect
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value)
                                        setPage(1)
                                    }}
                                >
                                    <option value="">All Status</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Published">Published</option>
                                </CFormSelect>
                            </CCol>

                            {/* <CCol md={2} sm={6}>
                                <CFormSelect
                                    value={isFeatured}
                                    onChange={(e) => {
                                        setIsFeatured(e.target.value)
                                        setPage(1)
                                    }}
                                >
                                    <option value="">All Featured</option>
                                    <option value="true">Featured Only</option>
                                    <option value="false">Not Featured</option>
                                </CFormSelect>
                            </CCol> */}

                            <CCol md={2} sm={6}>
                                <CFormInput
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => {
                                        setFromDate(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            </CCol>

                            <CCol md={2} sm={6}>
                                <CFormInput
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => {
                                        setToDate(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            </CCol>


                        </CRow>

                        {/* Results Info */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                Showing <strong>{Math.min((page - 1) * limit + 1, total)}</strong> to{' '}
                                <strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> results
                            </div>

                            <div className="d-flex align-items-center">
                                <span className="me-2">Items per page:</span>
                                <CDropdown variant="input-group">
                                    <CDropdownToggle color="light" size="sm">
                                        {limit}
                                    </CDropdownToggle>
                                    <CDropdownMenu>
                                        {limits.map(l => (
                                            <CDropdownItem
                                                key={l}
                                                active={limit === l}
                                                onClick={() => {
                                                    setLimit(l)
                                                    setPage(1)
                                                }}
                                            >
                                                {l}
                                            </CDropdownItem>
                                        ))}
                                    </CDropdownMenu>
                                </CDropdown>
                            </div>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner size="lg" />
                            </div>
                        ) : (
                            <div className="">
                                <CTable bordered>
                                    <CTableHead>
                                        <CTableRow className="bg-light">
                                            <CTableHeaderCell>Title & Description</CTableHeaderCell>
                                            <CTableHeaderCell>Category</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Featured</CTableHeaderCell>
                                            <CTableHeaderCell>Created</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {blogs.length === 0 ? (
                                            <CTableRow>
                                                <CTableDataCell colSpan="6" className="text-center py-5">
                                                    <div className="text-muted">No blogs found. Create your first blog!</div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ) : (
                                            blogs.map(blog => (
                                                <CTableRow key={blog._id} className="">
                                                    <CTableDataCell>
                                                        <div className="fw-semibold">{blog.title}</div>
                                                        <div className="text-muted small mt-1">{blog.shortDescription}</div>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CBadge color="info" shape="rounded-pill">
                                                            {blog.category?.name || '—'}
                                                        </CBadge>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CBadge
                                                            color={blog.status === 'Published' ? 'success' : 'warning'}
                                                            shape="rounded-pill"
                                                        >
                                                            {blog.status}
                                                        </CBadge>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {blog.isFeatured ? (
                                                            <CIcon icon={cilStar} className="text-warning fs-5" />
                                                        ) : (
                                                            <CIcon icon={cilBan} className="text-muted fs-5" />
                                                        )}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </CTableDataCell>
                                                    <CTableDataCell className="text-center">
                                                        <CButton
                                                            size="sm"
                                                            variant="ghost"
                                                            color="primary"
                                                            className="me-2"
                                                            onClick={() => navigate(`/blogs/${blog._id}`)}
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                        <CButton
                                                            size="sm"
                                                            variant="ghost"
                                                            color="danger"
                                                            onClick={() => {
                                                                setDeletingId(blog._id)
                                                                setShowDeleteModal(true)
                                                            }}
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <CPagination className="justify-content-center mt-4">
                                <CPaginationItem
                                    disabled={page === 1}
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                >
                                    Previous
                                </CPaginationItem>

                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else {
                                        if (page <= 3) {
                                            pageNum = i + 1
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = page - 2 + i
                                        }
                                    }

                                    return (
                                        <CPaginationItem
                                            key={pageNum}
                                            active={page === pageNum}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </CPaginationItem>
                                    )
                                })}

                                <CPaginationItem
                                    disabled={page === totalPages}
                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                >
                                    Next
                                </CPaginationItem>
                            </CPagination>
                        )}
                    </CCardBody>
                </CCard>

                {/* Delete Confirmation Modal */}
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <CModalHeader>
                        <CModalTitle>Delete Blog</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        Are you sure you want to permanently delete this blog post? This action cannot be undone.
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </CButton>
                        <CButton color="danger" onClick={handleDelete}>
                            Delete Permanently
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCol>
        </CRow>
    )
}

export default Blogs