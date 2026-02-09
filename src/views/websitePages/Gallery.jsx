// pages/Gallery.js
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
    CImage,
    CAccordion,
    CAccordionItem,
    CAccordionHeader,
    CAccordionBody,
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
    cilStar,
    cilPaperclip,
    cilAlbum,
} from '@coreui/icons'

import apiService from '../../services/apiService'
import uploadService from '../../services/uploadService'

const getGalleries = (params) =>
    apiService.get('/galleries', { params }).then(res => res)

const createGallery = (data) =>
    apiService.post('/galleries', data).then(res => res)

const updateGallery = (id, data) =>
    apiService.put(`/galleries/${id}`, data).then(res => res)

const deleteGallery = (id) =>
    apiService.delete(`/galleries/${id}`).then(res => res)

const Gallery = () => {
    const [galleries, setGalleries] = useState([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showPreviewModal, setShowPreviewModal] = useState(false)
    const [previewItem, setPreviewItem] = useState(null)
    const [editing, setEditing] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'campus',
        mediaType: 'Image',
        mediaUrl: '',
        isFeatured: false,
        isPublished: true,
        status: 'Active'
    })

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        status: '',
        mediaType: '',
        isPublished: '',
        isFeatured: '',
        page: 1,
        limit: 20,
    })

    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    // ================= FETCH =================
    const fetchGalleries = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getGalleries(filters)
            if (res.success) {
                setGalleries(res.data || [])
                setTotal(res.count || 0)
                setTotalPages(Math.ceil(res.count / filters.limit) || 1)
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch gallery items')
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchGalleries()
    }, [fetchGalleries])

    // ================= HANDLERS =================
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            status: '',
            mediaType: '',
            isPublished: '',
            isFeatured: '',
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

            const payload = { ...formData }

            if (editing) {
                res = await updateGallery(editing._id, payload)
                if (res.success) setSuccess('Gallery item updated successfully')
            } else {
                res = await createGallery(payload)
                if (res.success) setSuccess('Gallery item created successfully')
            }

            if (res.success) {
                setShowModal(false)
                setEditing(null)
                resetForm()
                fetchGalleries()
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
            const res = await deleteGallery(deleteId)
            if (res.success) {
                setSuccess('Gallery item deleted successfully')
                setShowDeleteModal(false)
                setDeleteId(null)
                fetchGalleries()
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Delete failed')
        }
    }

    const handleEditClick = (gallery) => {
        setEditing(gallery)
        setFormData({
            title: gallery.title,
            description: gallery.description || '',
            type: gallery.type,
            mediaType: gallery.mediaType,
            mediaUrl: gallery.mediaUrl,
            isFeatured: gallery.isFeatured || false,
            isPublished: gallery.isPublished !== false,
            status: gallery.status || 'Active'
        })
        setShowModal(true)
    }

    const handlePreviewClick = (gallery) => {
        setPreviewItem(gallery)
        setShowPreviewModal(true)
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'campus',
            mediaType: 'Image',
            mediaUrl: '',
            isFeatured: false,
            isPublished: true,
            status: 'Active'
        })
    }

    const toggleFeaturedStatus = async (gallery) => {
        try {
            const res = await updateGallery(gallery._id, {
                isFeatured: !gallery.isFeatured
            })
            if (res.success) {
                fetchGalleries()
                setSuccess(`Item ${!gallery.isFeatured ? 'featured' : 'unfeatured'} successfully`)
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Failed to update featured status')
        }
    }

    const togglePublishStatus = async (gallery) => {
        try {
            const res = await updateGallery(gallery._id, {
                isPublished: !gallery.isPublished
            })
            if (res.success) {
                fetchGalleries()
                setSuccess(`Item ${!gallery.isPublished ? 'published' : 'unpublished'} successfully`)
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Failed to update publish status')
        }
    }

    const toggleStatus = async (gallery) => {
        const newStatus = gallery.status === 'Active' ? 'Inactive' : 'Active'
        try {
            const res = await updateGallery(gallery._id, { status: newStatus })
            if (res.success) {
                fetchGalleries()
                setSuccess(`Status updated to ${newStatus}`)
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError(err.message || 'Failed to update status')
        }
    }

    // Simulate file upload (you can replace with actual upload)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file size (e.g., 5MB max)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            setError('File size too large. Maximum size is 5MB.')
            return
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
        ]

        if (!allowedTypes.includes(file.type)) {
            setError('Unsupported file type. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG, MOV).')
            return
        }

        setUploading(true)
        setUploadProgress(0)

        try {
            // Upload the file using uploadService
            const uploadResponse = await uploadService.uploadImage(file)

            if (uploadResponse.success) {
                // Determine media type from file type
                const isImage = file.type.startsWith('image/')
                const isVideo = file.type.startsWith('video/')

                // Get the URL from the response (adjust based on your API response structure)
                const mediaUrl = uploadResponse.data?.url || uploadResponse.data?.secure_url || uploadResponse.url

                if (mediaUrl) {
                    setFormData(prev => ({
                        ...prev,
                        mediaUrl: mediaUrl,
                        mediaType: isImage ? 'Image' : isVideo ? 'Video' : 'Image'
                    }))

                    setSuccess('File uploaded successfully!')
                    setTimeout(() => setSuccess(''), 3000)
                } else {
                    throw new Error('No URL returned from upload service')
                }
            } else {
                throw new Error(uploadResponse.message || 'Upload failed')
            }
        } catch (err) {
            console.error('Upload error:', err)
            setError('Upload failed: ' + (err.message || 'Unknown error'))
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }


    const galleryTypes = [
        { value: 'campus', label: 'Campus' },
        { value: 'events', label: 'Events' },
        { value: 'counseling', label: 'Counseling' },
        { value: 'students', label: 'Students' },
        { value: 'facilities', label: 'Facilities' },
        { value: 'classroom', label: 'Classroom' },
        { value: 'visa', label: 'Visa' },
        { value: 'centres', label: 'Centres' },
        { value: 'success', label: 'Success' },
        { value: 'cultural', label: 'Cultural' }
    ]

    const activeFilterCount = Object.keys(filters).filter(
        key => !['page', 'limit'].includes(key) && filters[key]
    ).length

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // ================= UI =================
    return (
        <CRow>
            <CCol xs={12}>
                {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
                {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

                <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-0">Gallery Management</h5>
                            <small className="text-muted">Total: {total} items</small>
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
                                <CIcon icon={cilPlus} className="me-2" /> Add Gallery Item
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
                                            placeholder="Search titles..."
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
                                        <option value="">All Types</option>
                                        {galleryTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Media Type</CFormLabel>
                                    <CFormSelect
                                        value={filters.mediaType}
                                        onChange={e => handleFilterChange('mediaType', e.target.value)}
                                    >
                                        <option value="">All Media</option>
                                        <option value="Image">Image</option>
                                        <option value="Video">Video</option>
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Status</CFormLabel>
                                    <CFormSelect
                                        value={filters.status}
                                        onChange={e => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </CFormSelect>
                                </CCol>

                                <CCol md={12} className="d-flex justify-content-between">
                                    <div className="d-flex gap-3">
                                        <CFormCheck
                                            label="Featured Only"
                                            checked={filters.isFeatured === 'true'}
                                            onChange={e =>
                                                handleFilterChange('isFeatured', e.target.checked ? 'true' : '')
                                            }
                                        />
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

                    {/* TABLE */}
                    <CCardBody>
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner />
                            </div>
                        ) : galleries.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                No gallery items found
                            </div>
                        ) : (
                            <>
                                <CTable>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Preview</CTableHeaderCell>
                                            <CTableHeaderCell>Title</CTableHeaderCell>
                                            <CTableHeaderCell>Type</CTableHeaderCell>
                                            <CTableHeaderCell>Media</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody>
                                        {galleries.map(item => (
                                            <CTableRow key={item._id}>
                                                <CTableDataCell >
                                                    <div
                                                        className="cursor-pointer"
                                                        onClick={() => handlePreviewClick(item)}
                                                    >
                                                        {item.mediaType === 'Image' ? (
                                                            <CImage
                                                                src={item.mediaUrl}
                                                                alt={item.title}
                                                                width={50}
                                                                height={50}
                                                                style={{ borderRadius: "50%", boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)" }}
                                                                className="object-fit-cover shodow-sm"
                                                            />
                                                        ) : (
                                                            <div className="position-relative" style={{ width: 60, height: 60 }}>
                                                                <div className="bg-secondary rounded d-flex align-items-center justify-content-center w-100 h-100">
                                                                    <CIcon icon={cilPaperclip} size="xl" />
                                                                </div>
                                                                <div className="position-absolute top-50 start-50 translate-middle">
                                                                    <CBadge color="info">Video</CBadge>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="fw-semibold">{item.title}</div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color="info">{item.type}</CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={item.mediaType === 'Image' ? 'success' : 'primary'}>
                                                        {item.mediaType}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex flex-column gap-1">
                                                        <div className="d-flex gap-1">
                                                            <CBadge
                                                                color={item.status === 'Active' ? 'success' : 'secondary'}
                                                                className="cursor-pointer"
                                                                onClick={() => toggleStatus(item)}
                                                            >
                                                                {item.status}
                                                            </CBadge>
                                                            <CBadge
                                                                color={item.isPublished ? 'primary' : 'warning'}
                                                                className="cursor-pointer"
                                                                onClick={() => togglePublishStatus(item)}
                                                            >
                                                                {item.isPublished ? 'Published' : 'Unpublished'}
                                                            </CBadge>
                                                            <CBadge
                                                                color={item.isFeatured ? 'warning' : 'secondary'}
                                                                className="cursor-pointer"
                                                                onClick={() => toggleFeaturedStatus(item)}
                                                            >
                                                                <CIcon icon={cilStar} className={item.isFeatured ? 'text-warning' : 'text-muted'} />
                                                                {item.isFeatured ? 'Featured' : 'Not Featured'}
                                                            </CBadge>
                                                        </div>

                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex gap-1">
                                                        <CButton
                                                            size="sm"
                                                            color="info"
                                                            variant="ghost"
                                                            onClick={() => handlePreviewClick(item)}
                                                            title="Preview"
                                                        >
                                                            <CIcon icon={cilAlbum} />
                                                        </CButton>
                                                        <CButton
                                                            size="sm"
                                                            color="warning"
                                                            variant="ghost"
                                                            onClick={() => handleEditClick(item)}
                                                            title="Edit"
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                        <CButton
                                                            size="sm"
                                                            color="danger"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setDeleteId(item._id)
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
                            {editing ? 'Edit Gallery Item' : 'Add Gallery Item'}
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <CRow className="g-3">
                            <CCol xs={12}>
                                <CFormLabel>Title *</CFormLabel>
                                <CFormInput
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter title..."
                                    required
                                />
                            </CCol>

                            <CCol xs={12}>
                                <CFormLabel>Description</CFormLabel>
                                <CFormTextarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter description..."
                                    rows={3}
                                />
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel>Type *</CFormLabel>
                                <CFormSelect
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {galleryTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel>Media Type *</CFormLabel>
                                <CFormSelect
                                    value={formData.mediaType}
                                    onChange={e => setFormData({ ...formData, mediaType: e.target.value })}
                                    required
                                >
                                    <option value="Image">Image</option>
                                    <option value="Video">Video</option>
                                </CFormSelect>
                            </CCol>

                            <CCol xs={12}>
                                <CFormLabel>Media URL *</CFormLabel>
                                <CInputGroup>
                                    <CFormInput
                                        value={formData.mediaUrl}
                                        onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                                        placeholder="Enter media URL..."
                                        required
                                    />
                                    <CInputGroupText className="cursor-pointer">
                                        <label htmlFor="file-upload" className="mb-0 cursor-pointer">
                                            <CIcon icon={cilPaperclip} /> Upload
                                        </label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="d-none"
                                            onChange={handleFileUpload}
                                            accept="image/*,video/*"
                                        />
                                    </CInputGroupText>
                                </CInputGroup>
                                {uploading && (
                                    <div className="mt-2">
                                        <small>Uploading... {uploadProgress}%</small>
                                        <div className="progress" style={{ height: '5px' }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {formData.mediaUrl && (
                                    <div className="mt-2">
                                        <small>Preview:</small>
                                        <div className="mt-1">
                                            {formData.mediaType === 'Image' ? (
                                                <CImage
                                                    src={formData.mediaUrl}
                                                    alt="Preview"
                                                    width={100}
                                                    height={100}
                                                    className="rounded object-fit-cover"
                                                />
                                            ) : (
                                                <div className="bg-light p-2 rounded">
                                                    <small>{formData.mediaUrl}</small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel>Status</CFormLabel>
                                <CFormSelect
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </CFormSelect>
                            </CCol>

                            <CCol md={6} className="d-flex align-items-end">
                                <div className="d-flex gap-3">
                                    <CFormCheck
                                        label="Published"
                                        checked={formData.isPublished}
                                        onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                    />
                                    <CFormCheck
                                        label="Featured"
                                        checked={formData.isFeatured}
                                        onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    />
                                </div>
                            </CCol>
                        </CRow>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
                        <CButton
                            color="primary"
                            onClick={handleFormSubmit}
                            disabled={!formData.title || !formData.mediaUrl || loading || uploading}
                        >
                            {loading && <CSpinner size="sm" className="me-2" />}
                            {editing ? 'Update' : 'Create'}
                        </CButton>
                    </CModalFooter>
                </CModal>

                {/* PREVIEW MODAL */}
                <CModal visible={showPreviewModal} onClose={() => setShowPreviewModal(false)} size="lg">
                    <CModalHeader>
                        <CModalTitle>Preview Gallery Item</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        {previewItem && (
                            <CRow>
                                <CCol md={previewItem.mediaType === 'Image' ? 6 : 12}>
                                    {previewItem.mediaType === 'Image' ? (
                                        <CImage
                                            src={previewItem.mediaUrl}
                                            alt={previewItem.title}
                                            fluid
                                            className="rounded"
                                        />
                                    ) : (
                                        <div className="ratio ratio-16x9">
                                            <video controls className="rounded">
                                                <source src={previewItem.mediaUrl} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    )}
                                </CCol>
                                <CCol md={previewItem.mediaType === 'Image' ? 6 : 12}>
                                    <h5>{previewItem.title}</h5>
                                    <p>{previewItem.description}</p>

                                    <CAccordion>
                                        <CAccordionItem itemKey={1}>
                                            <CAccordionHeader>Details</CAccordionHeader>
                                            <CAccordionBody>
                                                <table className="table table-sm">
                                                    <tbody>
                                                        <tr>
                                                            <th width="120">Type:</th>
                                                            <td>{previewItem.type}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>Media Type:</th>
                                                            <td>{previewItem.mediaType}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>Status:</th>
                                                            <td>
                                                                <CBadge color={previewItem.status === 'Active' ? 'success' : 'secondary'}>
                                                                    {previewItem.status}
                                                                </CBadge>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Published:</th>
                                                            <td>
                                                                <CBadge color={previewItem.isPublished ? 'primary' : 'warning'}>
                                                                    {previewItem.isPublished ? 'Yes' : 'No'}
                                                                </CBadge>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Featured:</th>
                                                            <td>
                                                                <CBadge color={previewItem.isFeatured ? 'warning' : 'secondary'}>
                                                                    {previewItem.isFeatured ? 'Yes' : 'No'}
                                                                </CBadge>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Created:</th>
                                                            <td>{formatDate(previewItem.createdAt)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </CAccordionBody>
                                        </CAccordionItem>
                                    </CAccordion>
                                </CCol>
                            </CRow>
                        )}
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowPreviewModal(false)}>Close</CButton>
                        {previewItem && (
                            <CButton
                                color="primary"
                                onClick={() => {
                                    setShowPreviewModal(false)
                                    handleEditClick(previewItem)
                                }}
                            >
                                Edit Item
                            </CButton>
                        )}
                    </CModalFooter>
                </CModal>

                {/* DELETE MODAL */}
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <CModalHeader>
                        <CModalTitle>Confirm Delete</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        Are you sure you want to delete this gallery item? This action cannot be undone.
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

export default Gallery