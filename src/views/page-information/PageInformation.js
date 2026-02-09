// pages/PageManagement.js
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
  cilChevronTop,
  cilCalendar,
} from '@coreui/icons'
import pageService from '../../services/pageInformationService'
import PageForm from './pageForm'
const PageManagement = () => {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewPage, setPreviewPage] = useState(null)

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    pageType: '',
    isFeatured: '',
    isNavbar: '',
    slug: '',
    fromDate: '',
    toDate: '',
    sort: '-createdAt',
    page: 1,
    limit: 10,
  })

  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Fetch pages
  const fetchPages = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
      }

      // Add all filters from backend controller
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.pageType) params.pageType = filters.pageType
      if (filters.isFeatured !== '') params.isFeatured = filters.isFeatured
      if (filters.isNavbar !== '') params.isNavbar = filters.isNavbar
      if (filters.slug) params.slug = filters.slug
      if (filters.fromDate) params.fromDate = filters.fromDate
      if (filters.toDate) params.toDate = filters.toDate

      const res = await pageService.getAllPages(params)
      if (res.success) {
        setPages(res.data || [])
        setTotal(res.total || 0)
        setTotalPages(res.pages || 1)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleSearchChange = (value) => {
    handleFilterChange('search', value)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setFilters(prev => ({ ...prev, page }))
  }

  const handleLimitChange = (limit) => {
    setFilters(prev => ({ ...prev, limit: parseInt(limit), page: 1 }))
  }

  const handleSortChange = (sort) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: '',
      pageType: '',
      isFeatured: '',
      isNavbar: '',
      slug: '',
      fromDate: '',
      toDate: '',
      sort: '-createdAt',
      page: 1,
      limit: 10,
    })
  }

  const handleEdit = (page) => {
    setEditingPage(page)
    setShowModal(true)
  }

  const handlePreview = (page) => {
    setPreviewPage(page)
    setShowPreview(true)
  }

  const handleDeleteClick = (id) => {
    setDeletingId(id)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    try {
      const res = await pageService.deletePage(deletingId)
      if (res.success) {
        setSuccess('Page deleted successfully!')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchPages()
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
      if (editingPage) {
        res = await pageService.updatePage(editingPage._id, data)
        if (res.success) setSuccess('Page updated successfully!')
      } else {
        res = await pageService.createPage(data)
        if (res.success) setSuccess('Page created successfully!')
      }
      if (res.success) {
        setShowModal(false)
        setEditingPage(null)
        fetchPages()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Operation failed')
    }
  }

  const handleToggleStatus = async (page) => {
    try {
      const newStatus = page.status === 'Published' ? 'Draft' : 'Published'
      const res = await pageService.updatePage(page._id, { status: newStatus })
      if (res.success) {
        setSuccess(`Page status changed to ${newStatus}!`)
        fetchPages()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Status update failed')
    }
  }

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(key =>
    key !== 'page' &&
    key !== 'limit' &&
    key !== 'sort' &&
    filters[key] !== '' &&
    filters[key] !== false &&
    filters[key] !== null
  ).length

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get unique page types
  const pageTypes = [...new Set(pages.map(p => p.pageType).filter(Boolean))].sort()

  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
        {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Page Management</h5>
              <small className="text-muted">Total: {total} pages</small>
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
                  setEditingPage(null)
                  setShowModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" /> Create Page
              </CButton>
            </div>
          </CCardHeader>

          {/* Filters Section */}
          {showFilters && (
            <CCardBody className="border-bottom">
              <CRow className="g-3">
                <CCol md={4}>
                  <CFormLabel>Search</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                    <CFormInput
                      placeholder="Search by title, slug, or subtitle..."
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CFormLabel>Page Type</CFormLabel>
                  <CFormSelect
                    value={filters.pageType}
                    onChange={(e) => handleFilterChange('pageType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    {pageTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Slug</CFormLabel>
                  <CFormInput
                    placeholder="Enter slug..."
                    value={filters.slug}
                    onChange={(e) => handleFilterChange('slug', e.target.value)}
                  />
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Sort By</CFormLabel>
                  <CFormSelect
                    value={filters.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="-title">Title Z-A</option>
                    <option value="-updatedAt">Recently Updated</option>
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>From Date</CFormLabel>
                  <CFormInput
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  />
                </CCol>

                <CCol md={3}>
                  <CFormLabel>To Date</CFormLabel>
                  <CFormInput
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  />
                </CCol>

                <CCol md={12} className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  {/* Left Filters */}
                  <div className="d-flex align-items-center gap-3">
                    <CFormCheck
                      id="featured"
                      label="Featured"
                      checked={filters.isFeatured === 'true'}
                      onChange={(e) =>
                        handleFilterChange(
                          'isFeatured',
                          e.target.checked ? 'true' : ''
                        )
                      }
                    />

                    <CFormCheck
                      id="navbar"
                      label="Show in Navbar"
                      checked={filters.isNavbar === 'true'}
                      onChange={(e) =>
                        handleFilterChange(
                          'isNavbar',
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
                <div className="mt-2">Loading pages...</div>
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-5">
                <CIcon icon={cilMagnifyingGlass} size="xxl" className="text-muted mb-3" />
                <h5>No pages found</h5>
                <p className="text-muted">
                  {activeFilterCount > 0
                    ? 'Try changing your filters or clear them to see all pages.'
                    : 'No pages available. Create your first page.'}
                </p>
              </div>
            ) : (
              <>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Title</CTableHeaderCell>
                      <CTableHeaderCell>Slug</CTableHeaderCell>
                      <CTableHeaderCell>Page Type</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Featured</CTableHeaderCell>
                      <CTableHeaderCell>Navbar</CTableHeaderCell>
                      <CTableHeaderCell>Created</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {pages.map((page) => (
                      <CTableRow key={page._id}>
                        <CTableDataCell className="fw-semibold">
                          <div>{page.title}</div>
                          {page.subTitle && (
                            <div className="small text-muted">{page.subTitle}</div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <code>{page.slug}</code>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="info">{page.pageType || 'General'}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-2">
                            <CBadge
                              color={
                                page.status === 'Published' ? 'success' :
                                page.status === 'Draft' ? 'warning' : 'secondary'
                              }
                            >
                              {page.status}
                            </CBadge>
                            <CButton
                              size="sm"
                              color="outline"
                              variant="ghost"
                              onClick={() => handleToggleStatus(page)}
                              title="Toggle Status"
                            >
                              {page.status !== 'Published' ? 'Unpublish' : 'Publish'}
                            </CButton>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormCheck
                            checked={page.isFeatured}
                            disabled
                            title={page.isFeatured ? 'Featured Page' : 'Not Featured'}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormCheck
                            checked={page.isNavbar}
                            disabled
                            title={page.isNavbar ? 'Shown in Navbar' : 'Hidden from Navbar'}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="small">
                            <CIcon icon={cilCalendar} className="me-1" />
                            {formatDate(page.createdAt)}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CButton
                              size="sm"
                              color="info"
                              variant="ghost"
                              onClick={() => handlePreview(page)}
                              title="Preview"
                            >
                              {/* <CIcon icon={cilEye} /> */}
                            </CButton>
                            <CButton
                              size="sm"
                              color="warning"
                              variant="ghost"
                              onClick={() => handleEdit(page)}
                              title="Edit"
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              size="sm"
                              color="danger"
                              variant="ghost"
                              onClick={() => handleDeleteClick(page._id)}
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
            setEditingPage(null)
            setError('')
          }}
          fullscreen
          scrollable
        >
          <CModalHeader>
            <CModalTitle>
              {editingPage ? `Edit Page: ${editingPage.title}` : 'Create New Page'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody className="p-4">
            <PageForm
              page={editingPage}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowModal(false)
                setEditingPage(null)
              }}
              error={error}
              submitting={loading}
            />
          </CModalBody>
        </CModal>

        {/* Preview Modal */}
        <CModal
          visible={showPreview}
          onClose={() => setShowPreview(false)}
          size="lg"
          scrollable
        >
          <CModalHeader>
            <CModalTitle>Page Preview: {previewPage?.title}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {previewPage && (
              <div>
                <div className="mb-4">
                  <h2>{previewPage.title}</h2>
                  {previewPage.subTitle && (
                    <h5 className="text-muted">{previewPage.subTitle}</h5>
                  )}
                  <div className="d-flex gap-2 mt-2">
                    <CBadge color="info">{previewPage.pageType || 'General'}</CBadge>
                    <CBadge color={previewPage.status === 'Published' ? 'success' : 'warning'}>
                      {previewPage.status}
                    </CBadge>
                    {previewPage.isFeatured && (
                      <CBadge color="primary">Featured</CBadge>
                    )}
                    {previewPage.isNavbar && (
                      <CBadge color="success">In Navbar</CBadge>
                    )}
                  </div>
                </div>
                
                {previewPage.content && (
                  <div className="mb-4">
                    <h5>Content:</h5>
                    <div className="border rounded p-3">
                      <div dangerouslySetInnerHTML={{ __html: previewPage.content }} />
                    </div>
                  </div>
                )}
                
                {previewPage.metaDescription && (
                  <div className="mb-4">
                    <h5>Meta Description:</h5>
                    <p className="text-muted">{previewPage.metaDescription}</p>
                  </div>
                )}
                
                <div className="row">
                  <div className="col-md-6">
                    <h6>SEO Information:</h6>
                    <p><strong>Slug:</strong> /pages/{previewPage.slug}</p>
                    {previewPage.metaKeywords && (
                      <p><strong>Keywords:</strong> {previewPage.metaKeywords}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6>Dates:</h6>
                    <p><strong>Created:</strong> {formatDate(previewPage.createdAt)}</p>
                    <p><strong>Updated:</strong> {formatDate(previewPage.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowPreview(false)}>
              Close
            </CButton>
            {previewPage && (
              <CButton color="primary" onClick={() => handleEdit(previewPage)}>
                Edit Page
              </CButton>
            )}
          </CModalFooter>
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
            <p>Are you sure you want to delete this page?</p>
            <p className="text-muted">
              This action cannot be undone. The page will be permanently removed from the website.
            </p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Delete Page
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default PageManagement