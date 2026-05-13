import React, { useState, useEffect, useCallback } from 'react'
import {
  CAvatar,
  CCard,
  CCardBody,
  CCardHeader,
  CCardFooter,
  CCol,
  CRow,
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CAlert,
  CSpinner,
  CPagination,
  CPaginationItem,
  CContainer,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFlagAlt,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilChevronLeft,
  cilChevronRight,
  cilFilter,
  cilSortAscending,
  cilImage,
} from '@coreui/icons'

import countryService from '../../services/countryService'
import uploadService from '../../services/uploadService'
import { FaPlus, FaTrash } from 'react-icons/fa'
import CKEditorComponent from '../page-information/Ckeditor'

const Countries = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Filters + Pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    currency: '',
    status: 'Active',
    isFeatured: 'No',
    flg: '',
    sections: [],
    extraStatus: 'Active',
    faq: []
  })

  const [newSection, setNewSection] = useState({ section_key: '', heading: '', content: '', order: 0 })
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  // ================= FETCH =================
  const fetchCountries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await countryService.getCountries(filters)
      if (res.success) {
        setCountries(res.data || [])
        setTotal(res.total || 0)
        setTotalPages(res.pages || 1)
      } else {
        setError(res.message || 'Failed to fetch countries')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch countries')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  // ================= HANDLERS =================

  const handleAddSection = () => {
    if (!newSection.section_key || !newSection.heading) return

    const order = newSection.order || formData.sections.length + 1
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { ...newSection, order }]
    }))
    setNewSection({ section_key: '', heading: '', content: '', order: 0 })
  }

  const handleAddFaq = () => {
    if (!newFaq.question || !newFaq.answer) return

    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: newFaq.question, answer: newFaq.answer }]
    }))
    setNewFaq({ question: '', answer: '' })
  }

  const handleRemoveSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }))
  }

  const handleRemoveFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }))
  }

  const handleUpdateFaq = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }))
  }

  const handleMoveSectionUp = (index) => {
    if (index === 0) return
    setFormData(prev => {
      const newSections = [...prev.sections]
      const temp = newSections[index]
      newSections[index] = newSections[index - 1]
      newSections[index - 1] = temp
      newSections.forEach((section, i) => {
        section.order = i + 1
      })
      return { ...prev, sections: newSections }
    })
  }

  const handleMoveSectionDown = (index) => {
    if (index === formData.sections.length - 1) return
    setFormData(prev => {
      const newSections = [...prev.sections]
      const temp = newSections[index]
      newSections[index] = newSections[index + 1]
      newSections[index + 1] = temp
      newSections.forEach((section, i) => {
        section.order = i + 1
      })
      return { ...prev, sections: newSections }
    })
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setFilters(prev => ({ ...prev, page }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // ================= IMAGE UPLOAD =================
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      const res = await uploadService.uploadImage(file)
      if (res.success) {
        setFormData(prev => ({ ...prev, flg: res.data.url }))
        setImagePreview(res.data.url)
      } else {
        setError(res.message || 'Image upload failed')
      }
    } catch (err) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  // ================= CRUD =================
  const handleEdit = (country) => {
    setFormData({
      name: country.name || '',
      code: country.code || '',
      isFeatured: country.isFeatured || 'No',
      currency: country.currency || '',
      status: country.status || 'Active',
      flg: country.flg || '',
      sections: country.extra_details?.sections || [],
      extraStatus: country.extra_details?.status || 'Active',
      faq: country.extra_details?.faq || [],
    })
    setImagePreview(country.flg || '')
    setEditingId(country._id)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      const res = await countryService.deleteCountry(deletingId)
      if (res.success) {
        setSuccess('Country deleted successfully')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchCountries()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(res.message || 'Delete failed')
      }
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Country name is required')
      return
    }
    if (!formData.code.trim()) {
      setError('Country code is required')
      return
    }
    if (!formData.currency.trim()) {
      setError('Currency is required')
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        currency: formData.currency.trim().toUpperCase(),
        status: formData.status,
        isFeatured: formData.isFeatured,
        flg: formData.flg,
        extra_details: {
          sections: formData.sections,
          status: formData.extraStatus,
          faq: formData.faq || []
        }
      }
      
      let res
      if (editingId) {
        res = await countryService.updateCountry(editingId, payload)
        if (res.success) setSuccess('Country updated successfully')
      } else {
        res = await countryService.createCountry(payload)
        if (res.success) setSuccess('Country created successfully')
      }

      if (res.success) {
        setShowModal(false)
        setEditingId(null)
        setFormData({ 
          name: '', 
          code: '', 
          currency: '', 
          status: 'Active', 
          isFeatured: 'No',
          flg: '',
          sections: [],
          extraStatus: 'Active',
          faq: []
        })
        setImagePreview('')
        fetchCountries()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(res.message || 'Operation failed')
      }
    } catch (err) {
      setError(err.message || 'Operation failed')
    }
  }

  // ================= PAGINATION HELPERS =================
  const getPaginationRange = () => {
    const current = filters.page
    const total = totalPages
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  // ================= UI =================
  return (
    <CContainer fluid>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-white py-3">
              <div>
                <h5 className="mb-1 fw-bold">Countries Management</h5>
                <small className="text-muted">Manage country information, flags, and currencies</small>
              </div>
              <CButton 
                color="primary" 
                onClick={() => {
                  setEditingId(null)
                  setFormData({ 
                    name: '', 
                    code: '', 
                    currency: '', 
                    status: 'Active', 
                    isFeatured: 'No',
                    flg: '',
                    sections: [],
                    extraStatus: 'Active',
                    faq: []
                  })
                  setImagePreview('')
                  setShowModal(true)
                }}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilPlus} className="me-2" /> Add Country
              </CButton>
            </CCardHeader>

            {/* FILTERS */}
            <CCardBody className="bg-light border-bottom">
              <CRow className="g-3 align-items-end">
                <CCol md={4}>
                  <div className="mb-2">
                    <CFormLabel className="text-muted small">Search</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText className="bg-white">
                        <CIcon icon={cilMagnifyingGlass} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Search by name or code..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="border-start-0"
                      />
                    </CInputGroup>
                  </div>
                </CCol>

                <CCol md={3}>
                  <div className="mb-2">
                    <CFormLabel className="text-muted small">Status</CFormLabel>
                    <CFormSelect
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="bg-white"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </CFormSelect>
                  </div>
                </CCol>

                <CCol md={3}>
                  <div className="mb-2">
                    <CFormLabel className="text-muted small">Items per page</CFormLabel>
                    <CFormSelect
                      value={filters.limit}
                      onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                      className="bg-white"
                    >
                      <option value="5">5 items</option>
                      <option value="10">10 items</option>
                      <option value="20">20 items</option>
                      <option value="50">50 items</option>
                    </CFormSelect>
                  </div>
                </CCol>

                <CCol md={2} className="d-flex justify-content-end">
                  <CTooltip content="Clear filters">
                    <CButton
                      color="light"
                      variant="outline"
                      onClick={() => {
                        setFilters({
                          search: '',
                          status: '',
                          page: 1,
                          limit: 10,
                          sortBy: 'name',
                          sortOrder: 'asc'
                        })
                      }}
                      className="d-flex align-items-center"
                    >
                      <CIcon icon={cilFilter} className="me-1" /> Clear
                    </CButton>
                  </CTooltip>
                </CCol>
              </CRow>

              {/* Results Summary */}
              {total > 0 && (
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">
                      Showing <strong>{((filters.page - 1) * filters.limit) + 1}</strong> to{' '}
                      <strong>{Math.min(filters.page * filters.limit, total)}</strong> of{' '}
                      <strong>{total}</strong> countries
                    </span>
                  </div>
                  <div>
                    <CBadge color="light" className="text-dark">
                      Page {filters.page} of {totalPages}
                    </CBadge>
                  </div>
                </div>
              )}
            </CCardBody>

            {/* TABLE */}
            <CCardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-2 text-muted">Loading countries...</p>
                </div>
              ) : error && !loading ? (
                <div className="text-center py-5">
                  <CIcon icon={cilFlagAlt} size="xxl" className="text-muted mb-3" />
                  <p className="text-danger">{error}</p>
                  <CButton color="primary" onClick={fetchCountries}>
                    Retry
                  </CButton>
                </div>
              ) : countries.length === 0 ? (
                <div className="text-center py-5">
                  <CIcon icon={cilFlagAlt} size="xxl" className="text-muted mb-3" />
                  <h5 className="text-muted">No countries found</h5>
                  <p className="text-muted">Try adjusting your search or add a new country.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable className="mb-0" align="middle">
                    <CTableHead className="bg-light">
                      <CTableRow>
                        <CTableHeaderCell className="text-center" style={{ width: '80px' }}>
                          <CIcon icon={cilFlagAlt} className="me-1" /> Flag
                        </CTableHeaderCell>
                        <CTableHeaderCell>
                          <div className="d-flex align-items-center">
                            Name
                            <CIcon icon={cilSortAscending} className="ms-1 text-muted" />
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell>Code</CTableHeaderCell>
                        <CTableHeaderCell>Currency</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Featured</CTableHeaderCell>
                        <CTableHeaderCell className="text-center" style={{ width: '120px' }}>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {countries.map((c, index) => (
                        <CTableRow key={c._id} className={index % 2 === 0 ? 'bg-white' : 'bg-light'}>
                          <CTableDataCell className="text-center">
                            {c.flg ? (
                              <img 
                                src={c.flg} 
                                width="36" 
                                height="24" 
                                className="rounded border"
                                alt={c.name}
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src = `https://via.placeholder.com/36x24/cccccc/ffffff?text=${c.code}`
                                }}
                              />
                            ) : (
                              <div className="d-flex justify-content-center">
                                <CAvatar color="light" className="text-dark border" size="md">
                                  {c.name?.charAt(0) || '?'}
                                </CAvatar>
                              </div>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="fw-semibold">{c.name}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="light" className="text-dark border">
                              {c.code}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{c.currency || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge 
                              color={c.status === 'Active' ? 'success' : 'secondary'} 
                              shape="rounded-pill"
                              className="px-3"
                            >
                              {c.status}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge 
                              color={c.isFeatured === 'Yes' ? 'success' : 'secondary'} 
                              shape="rounded-pill"
                              className="px-3"
                            >
                              {c.isFeatured === 'Yes' ? 'Yes' : 'No'}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <div className="btn-group" role="group">
                              <CTooltip content="Edit">
                                <CButton 
                                  size="sm" 
                                  color="primary" 
                                  variant="outline"
                                  onClick={() => handleEdit(c)}
                                  className="me-1"
                                >
                                  <CIcon icon={cilPencil} />
                                </CButton>
                              </CTooltip>
                              <CTooltip content="Delete">
                                <CButton
                                  size="sm"
                                  color="danger"
                                  variant="outline"
                                  onClick={() => {
                                    setDeletingId(c._id)
                                    setShowDeleteModal(true)
                                  }}
                                >
                                  <CIcon icon={cilTrash} />
                                </CButton>
                              </CTooltip>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </CCardBody>

            {/* PAGINATION */}
            {totalPages > 1 && !loading && (
              <CCardFooter className="bg-white border-top">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="text-muted small">
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, total)} of {total} entries
                  </div>
                  <CPagination aria-label="Page navigation" className="mb-0">
                    <CPaginationItem 
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange(filters.page - 1)}
                    >
                      <CIcon icon={cilChevronLeft} />
                    </CPaginationItem>
                    
                    {getPaginationRange().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <CPaginationItem key={`dots-${index}`} disabled>
                          ...
                        </CPaginationItem>
                      ) : (
                        <CPaginationItem
                          key={pageNum}
                          active={filters.page === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </CPaginationItem>
                      )
                    ))}
                    
                    <CPaginationItem 
                      disabled={filters.page === totalPages}
                      onClick={() => handlePageChange(filters.page + 1)}
                    >
                      <CIcon icon={cilChevronRight} />
                    </CPaginationItem>
                  </CPagination>
                  
                  <div className="d-flex align-items-center">
                    <span className="text-muted small me-2">Go to page:</span>
                    <CFormSelect
                      value={filters.page}
                      onChange={(e) => handlePageChange(Number(e.target.value))}
                      className="w-auto"
                      size="sm"
                      style={{ width: '70px' }}
                    >
                      {[...Array(totalPages)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </div>
              </CCardFooter>
            )}
          </CCard>

          {/* ADD/EDIT MODAL */}
          <CModal 
            visible={showModal} 
            onClose={() => {
              setShowModal(false)
              setEditingId(null)
              setFormData({ 
                name: '', 
                code: '', 
                currency: '', 
                status: 'Active', 
                isFeatured: 'No',
                flg: '',
                sections: [],
                extraStatus: 'Active',
                faq: []
              })
              setImagePreview('')
              setError('')
            }} 
            size="lg"
          >
            <CModalHeader closeButton className="bg-light">
              <CModalTitle className="fw-bold">
                <CIcon icon={editingId ? cilPencil : cilPlus} className="me-2" />
                {editingId ? 'Edit Country' : 'Add New Country'}
              </CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
              <CModalBody>
                {error && (
                  <CAlert color="danger" dismissible onClose={() => setError('')} className="mb-4">
                    {error}
                  </CAlert>
                )}
                {success && (
                  <CAlert color="success" dismissible onClose={() => setSuccess('')} className="mb-4">
                    {success}
                  </CAlert>
                )}
                
                <CRow className="g-3">
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">
                      Country Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      placeholder="Enter country name"
                      required
                    />
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">
                      Country Code <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput 
                      name="code" 
                      value={formData.code} 
                      onChange={handleInputChange}
                      placeholder="e.g., US, UK, IN"
                      className="text-uppercase"
                      maxLength="3"
                      required
                    />
                    <small className="text-muted">ISO 3166-1 alpha-2/3 code</small>
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">
                      Currency <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput 
                      name="currency" 
                      value={formData.currency} 
                      onChange={handleInputChange}
                      placeholder="e.g., USD, EUR, INR"
                    />
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">Status</CFormLabel>
                    <CFormSelect 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </CFormSelect>
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">Featured</CFormLabel>
                    <CFormSelect 
                      name="isFeatured" 
                      value={formData.isFeatured} 
                      onChange={handleInputChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </CFormSelect>
                  </CCol>
                  
                  <CCol md={12}>
                    <CFormLabel className="fw-semibold">
                      <CIcon icon={cilImage} className="me-2" />
                      Country Flag
                    </CFormLabel>
                    <div className="border rounded p-3 bg-light">
                      <div className="d-flex align-items-center flex-wrap gap-3">
                        <div className="flex-grow-1">
                          <CFormInput 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            id="flag-upload"
                          />
                        </div>
                        <div>
                          <small className="text-muted d-block">
                            Upload flag image (PNG, JPG, SVG up to 5MB)
                          </small>
                          {uploadingImage && (
                            <div className="d-flex align-items-center mt-1">
                              <CSpinner size="sm" className="me-2" />
                              <span className="text-muted small">Uploading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {imagePreview && (
                        <div className="mt-3">
                          <p className="text-muted small mb-2">Preview:</p>
                          <img 
                            src={imagePreview} 
                            height="60" 
                            className="rounded border p-1 bg-white"
                            alt="Flag preview"
                            style={{ objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = `https://via.placeholder.com/100x60/cccccc/ffffff?text=Flag`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </CCol>
                </CRow>

                {/* Extra Content Sections */}
                <CCard className="mb-4 mt-4">
                  <CCardHeader>
                    <h5 className="mb-0">Extra Content Sections</h5>
                  </CCardHeader>
                  <CCardBody>
                    {/* Add New Section */}
                    <CRow className="g-3 mb-4">
                      <CCol md={3}>
                        <CFormLabel>Section Key</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Section key"
                          value={newSection.section_key}
                          onChange={(e) => setNewSection(prev => ({ ...prev, section_key: e.target.value }))}
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Heading</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Section heading"
                          value={newSection.heading}
                          onChange={(e) => setNewSection(prev => ({ ...prev, heading: e.target.value }))}
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Order</CFormLabel>
                        <CFormInput
                          type="number"
                          min="0"
                          placeholder="Display order"
                          value={newSection.order || formData.sections.length + 1}
                          onChange={(e) => setNewSection(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        />
                      </CCol>
                      <CCol md={2} className="d-flex align-items-end">
                        <CButton 
                          color="primary" 
                          onClick={handleAddSection} 
                          disabled={!newSection.section_key || !newSection.heading}
                        >
                          <FaPlus className="me-1" /> Add
                        </CButton>
                      </CCol>
                    </CRow>

                    {/* Existing Sections */}
                    {formData.sections.map((section, index) => (
                      <CCard key={index} className="mb-3">
                        <CCardBody>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="mb-1">{section.heading}</h6>
                              <small className="text-muted">Key: {section.section_key} | Order: {section.order}</small>
                            </div>
                            <div className="d-flex gap-2">
                              <CButton
                                color="secondary"
                                size="sm"
                                onClick={() => handleMoveSectionUp(index)}
                                disabled={index === 0}
                              >
                                ↑
                              </CButton>
                              <CButton
                                color="secondary"
                                size="sm"
                                onClick={() => handleMoveSectionDown(index)}
                                disabled={index === formData.sections.length - 1}
                              >
                                ↓
                              </CButton>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => handleRemoveSection(index)}
                              >
                                <FaTrash />
                              </CButton>
                            </div>
                          </div>

                          <div className="mb-3">
                            <CFormLabel>Section Heading</CFormLabel>
                            <CFormInput
                              type="text"
                              value={section.heading || ""}
                              onChange={(e) => handleUpdateSection(index, "heading", e.target.value)}
                              placeholder="Section heading"
                            />
                          </div>

                          <div>
                            <CFormLabel>Content</CFormLabel>
                            <CKEditorComponent
                              value={section.content || ""}
                              onChange={(value) => handleUpdateSection(index, "content", value)}
                            />
                          </div>
                        </CCardBody>
                      </CCard>
                    ))}

                    {/* Extra Content Settings */}
                    <CRow className="g-3 mt-3">
                      <CCol md={6}>
                        <CFormLabel>Extra Content Status</CFormLabel>
                        <CFormSelect
                          value={formData.extraStatus}
                          onChange={(e) => setFormData(prev => ({ ...prev, extraStatus: e.target.value }))}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>

                {/* FAQ Section */}
                <CCard className="mb-4 mt-4">
                  <CCardHeader>
                    <h5 className="mb-0">FAQ (Frequently Asked Questions)</h5>
                  </CCardHeader>
                  <CCardBody>
                    {/* Add New FAQ */}
                    <CRow className="g-3 mb-4">
                      <CCol md={5}>
                        <CFormLabel>Question</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Enter question"
                          value={newFaq.question}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                        />
                      </CCol>
                      <CCol md={5}>
                        <CFormLabel>Answer</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Enter answer"
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                        />
                      </CCol>
                      <CCol md={2} className="d-flex align-items-end">
                        <CButton 
                          color="primary" 
                          onClick={handleAddFaq} 
                          disabled={!newFaq.question || !newFaq.answer}
                        >
                          <FaPlus className="me-1" /> Add FAQ
                        </CButton>
                      </CCol>
                    </CRow>

                    {/* Existing FAQs */}
                    {formData.faq.length === 0 ? (
                      <div className="text-center py-3 text-muted">
                        No FAQs added yet. Use the form above to add frequently asked questions.
                      </div>
                    ) : (
                      formData.faq.map((faq, index) => (
                        <CCard key={index} className="mb-3">
                          <CCardBody>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h6 className="mb-1">FAQ #{index + 1}</h6>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => handleRemoveFaq(index)}
                              >
                                <FaTrash />
                              </CButton>
                            </div>

                            <div className="mb-3">
                              <CFormLabel>Question</CFormLabel>
                              <CFormInput
                                type="text"
                                value={faq.question || ""}
                                onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                                placeholder="Question"
                              />
                            </div>

                            <div>
                              <CFormLabel>Answer</CFormLabel>
                              <CFormInput
                                type="text"
                                as="textarea"
                                rows={3}
                                value={faq.answer || ""}
                                onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                                placeholder="Answer"
                              />
                            </div>
                          </CCardBody>
                        </CCard>
                      ))
                    )}
                  </CCardBody>
                </CCard>

              </CModalBody>
              <CModalFooter className="bg-light">
                <CButton 
                  color="secondary" 
                  onClick={() => {
                    setShowModal(false)
                    setEditingId(null)
                    setFormData({ 
                      name: '', 
                      code: '', 
                      currency: '', 
                      status: 'Active', 
                      isFeatured: 'No',
                      flg: '',
                      sections: [],
                      extraStatus: 'Active',
                      faq: []
                    })
                    setImagePreview('')
                    setError('')
                  }}
                  className="px-4"
                >
                  Cancel
                </CButton>
                <CButton 
                  type="submit" 
                  color="primary"
                  disabled={uploadingImage}
                  className="px-4"
                >
                  {uploadingImage ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : editingId ? 'Update Country' : 'Create Country'}
                </CButton>
              </CModalFooter>
            </CForm>
          </CModal>

          {/* DELETE MODAL */}
          <CModal 
            visible={showDeleteModal} 
            onClose={() => setShowDeleteModal(false)}
            alignment="center"
          >
            <CModalHeader closeButton>
              <CModalTitle className="text-danger">
                <CIcon icon={cilTrash} className="me-2" />
                Confirm Deletion
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="text-center py-4">
              <CIcon icon={cilFlagAlt} size="3xl" className="text-danger mb-3" />
              <h5>Are you sure you want to delete this country?</h5>
              <p className="text-muted">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </CModalBody>
            <CModalFooter className="justify-content-center">
              <CButton 
                color="secondary" 
                onClick={() => setShowDeleteModal(false)}
                className="px-4"
              >
                Cancel
              </CButton>
              <CButton 
                color="danger" 
                onClick={handleDelete}
                className="px-4"
              >
                <CIcon icon={cilTrash} className="me-2" />
                Delete Country
              </CButton>
            </CModalFooter>
          </CModal>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Countries