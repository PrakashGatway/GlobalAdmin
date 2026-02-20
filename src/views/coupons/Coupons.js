import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CAlert,
  CSpinner,
  CPagination,
  CPaginationItem,
  CCardFooter,
  CRow as FlexRow,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTag,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilReload,
  cilFilter,
  cilFilterX,
  cilCalendar,
  cilMoney,
  cilUser,
  cilCode,
  cilDescription,
  cilGift,
  cilWallet,
} from '@coreui/icons'
import couponService from '../../services/couponService'

const Coupons = () => {
  // State for coupons data
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [couponsList, setCouponsList] = useState([]) // For reward coupon selection
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    discountType: '',
    applicableTo: '',
    dateRange: {
      start: '',
      end: ''
    }
  })
  
  // UI state
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state - updated to handle both coupon and reward types
  const [formData, setFormData] = useState({
    type: 'coupon', // 'coupon' or 'reward'
    code: '',
    title: '',
    description: '',
    // Coupon specific fields
    couponData: {
      discountType: 'percentage',
      discountValue: '',
      minPurchaseAmount: 0,
      maxDiscountAmount: null,
      applicableTo: 'all',
      applicableItems: [],
      isUserSpecific: false,
      users: []
    },
    // Reward specific fields
    rewardData: {
      rewardType: 'WALLET', // COUPON, WALLET, CASH, NOTHING
      rewardValue: 0,
      couponId: null,
      probability: 0
    },
    validFrom: '',
    validTo: '',
    usageLimit: '',
    status: 'Active'
  })

  // Fetch coupons for reward selection
  const fetchAllCoupons = useCallback(async () => {
    try {
      const response = await couponService.getCoupons({ limit: 100 })
      if (response.success) {
        setCouponsList(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch coupons list:', err)
    }
  }, [])

  // Fetch coupons with filters and pagination
  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    setError('')
    
    try {
      const queryParams = {
        page: currentPage,
        limit: pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { code: filters.search }),
        ...(filters.discountType && { discountType: filters.discountType }),
        ...(filters.applicableTo && { applicableTo: filters.applicableTo }),
        ...(filters.dateRange.start && { startDate: filters.dateRange.start }),
        ...(filters.dateRange.end && { endDate: filters.dateRange.end })
      }

      const response = await couponService.getCoupons(queryParams)
      
      if (response.success) {
        setCoupons(response.data || [])
        setTotalCount(response.total || 0)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch coupons')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, filters])

  // Initial fetch
  useEffect(() => {
    fetchCoupons()
    fetchAllCoupons()
  }, [fetchCoupons, fetchAllCoupons])

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handle date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [name]: value
      }
    }))
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      discountType: '',
      applicableTo: '',
      dateRange: {
        start: '',
        end: ''
      }
    })
    setCurrentPage(1)
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('couponData.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        couponData: {
          ...prev.couponData,
          [field]: type === 'checkbox' ? checked : value
        }
      }))
    } else if (name.startsWith('rewardData.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        rewardData: {
          ...prev.rewardData,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    setError('')
  }

  // Handle type change
  const handleTypeChange = (e) => {
    const type = e.target.value
    setFormData(prev => ({
      ...prev,
      type,
      // Reset the other type's data
      ...(type === 'coupon' ? {
        rewardData: {
          rewardType: 'WALLET',
          rewardValue: 0,
          couponId: null,
          probability: 0
        }
      } : {
        couponData: {
          discountType: 'percentage',
          discountValue: '',
          minPurchaseAmount: 0,
          maxDiscountAmount: null,
          applicableTo: 'all',
          applicableItems: [],
          isUserSpecific: false,
          users: []
        }
      })
    }))
  }

  // Handle edit - populate form with coupon data
  const handleEdit = (coupon) => {
    setFormData({
      type: coupon.type || 'coupon',
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      couponData: {
        discountType: coupon.couponData?.discountType || 'percentage',
        discountValue: coupon.couponData?.discountValue?.toString() || '',
        minPurchaseAmount: coupon.couponData?.minPurchaseAmount?.toString() || '0',
        maxDiscountAmount: coupon.couponData?.maxDiscountAmount?.toString() || '',
        applicableTo: coupon.couponData?.applicableTo || 'all',
        applicableItems: coupon.couponData?.applicableItems || [],
        isUserSpecific: coupon.couponData?.isUserSpecific || false,
        users: coupon.couponData?.users || []
      },
      rewardData: {
        rewardType: coupon.rewardData?.rewardType || 'WALLET',
        rewardValue: coupon.rewardData?.rewardValue || 0,
        couponId: coupon.rewardData?.couponId || null,
        probability: coupon.rewardData?.probability || 0
      },
      validFrom: coupon.validFrom
        ? new Date(coupon.validFrom).toISOString().split('T')[0]
        : '',
      validTo: coupon.validTo
        ? new Date(coupon.validTo).toISOString().split('T')[0]
        : '',
      usageLimit: coupon.usageLimit?.toString() || '',
      status: coupon.status || 'Active'
    })
    setEditingId(coupon._id || coupon.id)
    setError('')
    setShowModal(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (coupon) => {
    setDeletingId(coupon._id || coupon.id)
    setShowDeleteModal(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return

    setLoading(true)
    try {
      const response = await couponService.deleteCoupon(deletingId)
      if (response.success) {
        setSuccess('Coupon deleted successfully')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchCoupons()
      }
    } catch (err) {
      setError(err.message || 'Failed to delete coupon')
    } finally {
      setLoading(false)
    }
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Common validation
    if (!formData.code || !formData.validTo) {
      setError('Please fill in all required fields')
      return
    }

    // Type-specific validation
    if (formData.type === 'coupon') {
      if (!formData.couponData.discountValue) {
        setError('Discount value is required for coupons')
        return
      }

      const discountValue = parseFloat(formData.couponData.discountValue)
      if (isNaN(discountValue) || discountValue <= 0) {
        setError('Discount value must be a positive number')
        return
      }

      if (formData.couponData.discountType === 'percentage' && discountValue > 100) {
        setError('Percentage discount cannot exceed 100%')
        return
      }
    } else if (formData.type === 'reward') {
      if (!formData.rewardData.rewardType) {
        setError('Reward type is required')
        return
      }

      if (formData.rewardData.rewardType === 'COUPON' && !formData.rewardData.couponId) {
        setError('Please select a coupon for COUPON reward type')
        return
      }

      if (['WALLET', 'CASH'].includes(formData.rewardData.rewardType)) {
        const rewardValue = parseFloat(formData.rewardData.rewardValue)
        if (isNaN(rewardValue) || rewardValue <= 0) {
          setError('Reward value must be a positive number')
          return
        }
      }

      const probability = parseFloat(formData.rewardData.probability)
      if (isNaN(probability) || probability < 0 || probability > 100) {
        setError('Probability must be between 0 and 100')
        return
      }
    }

    // Date validation
    const validFrom = formData.validFrom
      ? new Date(formData.validFrom)
      : new Date()
    const validTo = new Date(formData.validTo)

    if (validTo <= validFrom) {
      setError('Valid to date must be after valid from date')
      return
    }

    setLoading(true)
    try {
      const couponData = {
        type: formData.type,
        code: formData.code.toUpperCase(),
        title: formData.title,
        description: formData.description,
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        status: formData.status
      }

      // Add type-specific data
      if (formData.type === 'coupon') {
        couponData.couponData = {
          discountType: formData.couponData.discountType,
          discountValue: parseFloat(formData.couponData.discountValue),
          minPurchaseAmount: formData.couponData.minPurchaseAmount
            ? parseFloat(formData.couponData.minPurchaseAmount)
            : 0,
          maxDiscountAmount: formData.couponData.maxDiscountAmount
            ? parseFloat(formData.couponData.maxDiscountAmount)
            : null,
          applicableTo: formData.couponData.applicableTo,
          applicableItems: formData.couponData.applicableItems || [],
          isUserSpecific: formData.couponData.isUserSpecific || false,
          users: formData.couponData.users || []
        }
      } else {
        couponData.rewardData = {
          rewardType: formData.rewardData.rewardType,
          rewardValue: parseFloat(formData.rewardData.rewardValue) || 0,
          couponId: formData.rewardData.couponId || null,
          probability: parseFloat(formData.rewardData.probability) || 0
        }
      }

      let response
      if (editingId) {
        response = await couponService.updateCoupon(editingId, couponData)
      } else {
        response = await couponService.createCoupon(couponData)
      }

      if (response.success) {
        setSuccess(editingId ? 'Updated successfully' : 'Created successfully')
        setShowModal(false)
        handleReset()
        fetchCoupons()
      }
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      type: 'coupon',
      code: '',
      title: '',
      description: '',
      couponData: {
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: 0,
        maxDiscountAmount: null,
        applicableTo: 'all',
        applicableItems: [],
        isUserSpecific: false,
        users: []
      },
      rewardData: {
        rewardType: 'WALLET',
        rewardValue: 0,
        couponId: null,
        probability: 0
      },
      validFrom: '',
      validTo: '',
      usageLimit: '',
      status: 'Active'
    })
    setEditingId(null)
    setError('')
  }

  // Get status badge
  const getStatusBadge = (coupon) => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validTo = new Date(coupon.validTo)

    if (coupon.status === 'Inactive') {
      return <CBadge color="secondary">Inactive</CBadge>
    }

    if (now < validFrom) {
      return <CBadge color="info">Scheduled</CBadge>
    }

    if (now > validTo) {
      return <CBadge color="danger">Expired</CBadge>
    }

    if (coupon.type === 'coupon' && coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <CBadge color="warning">Limit Reached</CBadge>
    }

    return <CBadge color="success">Active</CBadge>
  }

  // Format discount display
  const formatDiscount = (coupon) => {
    if (coupon.type === 'reward') {
      return (
        <div>
          <CBadge color="warning">
            <CIcon icon={cilGift} className="me-1" />
            Reward
          </CBadge>
          <small className="d-block text-muted">
            {coupon.rewardData?.rewardType} {coupon.rewardData?.rewardValue > 0 ? `- ₹${coupon.rewardData.rewardValue}` : ''}
          </small>
        </div>
      )
    }
    
    if (!coupon.couponData) return '-'
    
    const { discountType, discountValue, maxDiscountAmount } = coupon.couponData
    
    if (discountType === 'percentage') {
      return (
        <div>
          <strong>{discountValue}%</strong>
          {maxDiscountAmount && (
            <small className="text-muted d-block">
              Max: ₹{maxDiscountAmount}
            </small>
          )}
        </div>
      )
    } else {
      return <strong>₹{discountValue}</strong>
    }
  }

  // Get type badge
  const getTypeBadge = (type) => {
    if (type === 'reward') {
      return <CBadge color="warning">Reward</CBadge>
    }
    return <CBadge color="primary">Coupon</CBadge>
  }

  return (
    <CRow>
      <CCol xs={12}>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')}>
            {error}
          </CAlert>
        )}
        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </CAlert>
        )}
        
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <strong>Coupon & Reward Management</strong>
              </h5>
              <small className="text-body-secondary">
                Total {totalCount} items
              </small>
            </div>
            <div>
              <CButton
                color="secondary"
                variant="outline"
                className="me-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <CIcon icon={showFilters ? cilFilterX : cilFilter} className="me-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </CButton>
              <CButton
                color="primary"
                className="me-2"
                onClick={() => {
                  handleReset()
                  setShowModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add New
              </CButton>
              <CButton color="secondary" variant="outline" onClick={fetchCoupons}>
                <CIcon icon={cilReload} />
              </CButton>
            </div>
          </CCardHeader>
          
          <CCardBody>
            {/* Filters Section */}
            {showFilters && (
              <CCard className="mb-4 bg-light">
                <CCardBody>
                  <CRow className="g-3">
                    <CCol md={3}>
                      <CInputGroup>
                        <CInputGroupText>
                          <CIcon icon={cilMagnifyingGlass} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Search by code"
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                        />
                      </CInputGroup>
                    </CCol>
                    
                    <CCol md={2}>
                      <CFormSelect
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Expired">Expired</option>
                      </CFormSelect>
                    </CCol>
                    
                    <CCol md={2}>
                      <CFormSelect
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Types</option>
                        <option value="coupon">Coupon</option>
                        <option value="reward">Reward</option>
                      </CFormSelect>
                    </CCol>
                    
                    <CCol md={2}>
                      <CFormSelect
                        name="discountType"
                        value={filters.discountType}
                        onChange={handleFilterChange}
                        disabled={filters.type === 'reward'}
                      >
                        <option value="">All Discounts</option>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                      </CFormSelect>
                    </CCol>
                    
                    <CCol md={2}>
                      <CFormSelect
                        name="applicableTo"
                        value={filters.applicableTo}
                        onChange={handleFilterChange}
                        disabled={filters.type === 'reward'}
                      >
                        <option value="">Applicable To</option>
                        <option value="all">All</option>
                        <option value="courses">Courses</option>
                        <option value="programs">Programs</option>
                      </CFormSelect>
                    </CCol>
                    
                    {/* <CCol md={2}>
                      <CFormInput
                        type="date"
                        name="start"
                        value={filters.dateRange.start}
                        onChange={handleDateChange}
                        placeholder="From Date"
                      />
                    </CCol>
                    
                    <CCol md={2}>
                      <CFormInput
                        type="date"
                        name="end"
                        value={filters.dateRange.end}
                        onChange={handleDateChange}
                        placeholder="To Date"
                      />
                    </CCol> */}
                    
                    <CCol md={1}>
                      <CButton 
                        color="danger" 
                        variant="outline" 
                        size="sm"
                        onClick={clearFilters}
                      >
                        <CIcon icon={cilFilterX} className="me-2" />
                        Clear
                      </CButton>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            )}

            {/* Table */}
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
              </div>
            ) : (
              <>
                <CTable align="middle" className="mb-0 border" hover responsive>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
                      <CTableHeaderCell>Code</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Title/Description</CTableHeaderCell>
                      <CTableHeaderCell>Value</CTableHeaderCell>
                      <CTableHeaderCell>Details</CTableHeaderCell>
                      <CTableHeaderCell>Usage</CTableHeaderCell>
                      <CTableHeaderCell>Valid Period</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '120px' }}>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {coupons.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="10" className="text-center py-5">
                          <div className="text-body-secondary">No items found</div>
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      coupons.map((coupon, index) => (
                        <CTableRow key={coupon._id}>
                          <CTableDataCell>
                            <CBadge color="info">
                              {(currentPage - 1) * pageSize + index + 1}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <strong>{coupon.code}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            {getTypeBadge(coupon.type)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              {coupon.title && <div><strong>{coupon.title}</strong></div>}
                              <small className="text-muted">{coupon.description || '-'}</small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            {formatDiscount(coupon)}
                          </CTableDataCell>
                          <CTableDataCell>
                            {coupon.type === 'coupon' ? (
                              <>
                                {coupon.couponData?.minPurchaseAmount > 0 && (
                                  <small className="d-block">
                                    Min: ₹{coupon.couponData.minPurchaseAmount}
                                  </small>
                                )}
                                <CBadge color="info" className="text-capitalize">
                                  {coupon.couponData?.applicableTo}
                                </CBadge>
                              </>
                            ) : (
                              <>
                                <small className="d-block">
                                  Type: {coupon.rewardData?.rewardType}
                                </small>
                                <small className="d-block">
                                  Probability: {coupon.rewardData?.probability}%
                                </small>
                              </>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>
                              {coupon.usedCount || 0} /{' '}
                              {coupon.usageLimit ? coupon.usageLimit : '∞'}
                            </small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>
                              <CIcon icon={cilCalendar} className="me-1" />
                              {new Date(coupon.validFrom).toLocaleDateString()}
                              <br />
                              <CIcon icon={cilCalendar} className="me-1" />
                              {new Date(coupon.validTo).toLocaleDateString()}
                            </small>
                          </CTableDataCell>
                          <CTableDataCell>
                            {getStatusBadge(coupon)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="primary"
                              variant="ghost"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(coupon)}
                              title="Edit"
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(coupon)}
                              title="Delete"
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>

                {/* Pagination */}
                {totalCount > 0 && (
                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">
                        Showing {(currentPage - 1) * pageSize + 1} to{' '}
                        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                      </small>
                    </div>
                    <CPagination className="mb-0" aria-label="Page navigation">
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        Previous
                      </CPaginationItem>
                      
                      {[...Array(Math.ceil(totalCount / pageSize)).keys()].map(page => (
                        <CPaginationItem
                          key={page + 1}
                          active={currentPage === page + 1}
                          onClick={() => setCurrentPage(page + 1)}
                        >
                          {page + 1}
                        </CPaginationItem>
                      ))}
                      
                      <CPaginationItem
                        disabled={currentPage === Math.ceil(totalCount / pageSize)}
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                    
                    <CFormSelect
                      size="sm"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      style={{ width: '80px' }}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </CFormSelect>
                  </div>
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
            handleReset()
          }} 
          size="lg"
        >
          <CModalHeader>
            <CModalTitle>
              {editingId ? 'Edit' : 'Add New'} {formData.type === 'coupon' ? 'Coupon' : 'Reward'}
            </CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              {error && (
                <CAlert color="danger" className="mb-3">
                  {error}
                </CAlert>
              )}
              
              {/* Type Selection */}
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Type <span className="text-danger">*</span></CFormLabel>
                  <div className="d-flex gap-3">
                    <CFormCheck
                      type="radio"
                      name="type"
                      id="typeCoupon"
                      value="coupon"
                      label="Coupon"
                      checked={formData.type === 'coupon'}
                      onChange={handleTypeChange}
                      disabled={!!editingId}
                    />
                    <CFormCheck
                      type="radio"
                      name="type"
                      id="typeReward"
                      value="reward"
                      label="Reward"
                      checked={formData.type === 'reward'}
                      onChange={handleTypeChange}
                      disabled={!!editingId}
                    />
                  </div>
                  {editingId && (
                    <small className="text-muted">Type cannot be changed</small>
                  )}
                </CCol>
              </CRow>

              {/* Common Fields */}
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="code">
                      Code <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder={formData.type === 'coupon' ? 'e.g., SAVE20' : 'e.g., REWARD123'}
                      required
                      disabled={!!editingId}
                      className={editingId ? 'bg-light' : ''}
                    />
                    {editingId && (
                      <small className="text-muted">Code cannot be changed</small>
                    )}
                  </div>
                </CCol>
                
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="title">Title</CFormLabel>
                    <CFormInput
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder={formData.type === 'coupon' ? 'e.g., Summer Sale' : 'e.g., Welcome Reward'}
                    />
                  </div>
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel htmlFor="description">Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows="2"
                />
              </div>

              {/* Coupon Specific Fields */}
              {formData.type === 'coupon' && (
                <>
                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="couponData.discountType">
                          Discount Type <span className="text-danger">*</span>
                        </CFormLabel>
                        <CFormSelect
                          id="couponData.discountType"
                          name="couponData.discountType"
                          value={formData.couponData.discountType}
                          onChange={handleInputChange}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </CFormSelect>
                      </div>
                    </CCol>
                    
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="couponData.discountValue">
                          Discount Value <span className="text-danger">*</span>
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          id="couponData.discountValue"
                          name="couponData.discountValue"
                          value={formData.couponData.discountValue}
                          onChange={handleInputChange}
                          placeholder={formData.couponData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                          min="0"
                          max={formData.couponData.discountType === 'percentage' ? '100' : undefined}
                          step="0.01"
                          required
                        />
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="couponData.minPurchaseAmount">
                          Minimum Purchase (₹)
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          id="couponData.minPurchaseAmount"
                          name="couponData.minPurchaseAmount"
                          value={formData.couponData.minPurchaseAmount}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </CCol>
                    
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="couponData.maxDiscountAmount">
                          Max Discount (₹)
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          id="couponData.maxDiscountAmount"
                          name="couponData.maxDiscountAmount"
                          value={formData.couponData.maxDiscountAmount}
                          onChange={handleInputChange}
                          placeholder="No limit"
                          min="0"
                          step="0.01"
                          disabled={formData.couponData.discountType === 'fixed'}
                          className={formData.couponData.discountType === 'fixed' ? 'bg-light' : ''}
                        />
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="couponData.applicableTo">
                          Applicable To
                        </CFormLabel>
                        <CFormSelect
                          id="couponData.applicableTo"
                          name="couponData.applicableTo"
                          value={formData.couponData.applicableTo}
                          onChange={handleInputChange}
                        >
                          <option value="all">All Items</option>
                          <option value="courses">Courses Only</option>
                          <option value="programs">Programs Only</option>
                        </CFormSelect>
                      </div>
                    </CCol>
                    
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="couponData.isUserSpecific">
                          <CFormCheck
                            type="checkbox"
                            id="couponData.isUserSpecific"
                            name="couponData.isUserSpecific"
                            checked={formData.couponData.isUserSpecific}
                            onChange={handleInputChange}
                            label="User Specific Coupon"
                          />
                        </CFormLabel>
                      </div>
                    </CCol>
                  </CRow>
                </>
              )}

              {/* Reward Specific Fields */}
              {formData.type === 'reward' && (
                <>
                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="rewardData.rewardType">
                          Reward Type <span className="text-danger">*</span>
                        </CFormLabel>
                        <CFormSelect
                          id="rewardData.rewardType"
                          name="rewardData.rewardType"
                          value={formData.rewardData.rewardType}
                          onChange={handleInputChange}
                        >
                          <option value="WALLET">Wallet Balance</option>
                          <option value="COUPON">Coupon</option>
                          <option value="CASH">Cash</option>
                          <option value="NOTHING">Nothing (Try Again)</option>
                        </CFormSelect>
                      </div>
                    </CCol>
                    
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="rewardData.probability">
                          Probability (%) <span className="text-danger">*</span>
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          id="rewardData.probability"
                          name="rewardData.probability"
                          value={formData.rewardData.probability}
                          onChange={handleInputChange}
                          placeholder="e.g., 30"
                          min="0"
                          max="100"
                          step="0.1"
                          required
                        />
                      </div>
                    </CCol>
                  </CRow>

                  {/* Conditional fields based on reward type */}
                  {['WALLET', 'CASH'].includes(formData.rewardData.rewardType) && (
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="rewardData.rewardValue">
                            Reward Value (₹) <span className="text-danger">*</span>
                          </CFormLabel>
                          <CFormInput
                            type="number"
                            id="rewardData.rewardValue"
                            name="rewardData.rewardValue"
                            value={formData.rewardData.rewardValue}
                            onChange={handleInputChange}
                            placeholder="e.g., 100"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </CCol>
                    </CRow>
                  )}

                  {formData.rewardData.rewardType === 'COUPON' && (
                    <CRow>
                      <CCol md={12}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="rewardData.couponId">
                            Select Coupon <span className="text-danger">*</span>
                          </CFormLabel>
                          <CFormSelect
                            id="rewardData.couponId"
                            name="rewardData.couponId"
                            value={formData.rewardData.couponId || ''}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select a coupon...</option>
                            {couponsList
                              .filter(c => c.type === 'coupon' && c.status === 'Active')
                              .map(coupon => (
                                <option key={coupon._id} value={coupon._id}>
                                  {coupon.code} - {coupon.title || coupon.description || ''} ({coupon.couponData?.discountValue}{coupon.couponData?.discountType === 'percentage' ? '%' : '₹'})
                                </option>
                              ))}
                          </CFormSelect>
                        </div>
                      </CCol>
                    </CRow>
                  )}
                </>
              )}

              {/* Common Date Fields */}
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="validFrom">Valid From</CFormLabel>
                    <CFormInput
                      type="date"
                      id="validFrom"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                    />
                  </div>
                </CCol>
                
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="validTo">
                      Valid To <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="date"
                      id="validTo"
                      name="validTo"
                      value={formData.validTo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CCol>
              </CRow>

              {/* Usage Limit and Status */}
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="usageLimit">Usage Limit</CFormLabel>
                    <CFormInput
                      type="number"
                      id="usageLimit"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      placeholder={formData.type === 'coupon' ? 'Unlimited' : 'Usually 1 for rewards'}
                      min="1"
                    />
                    <small className="text-muted">Leave empty for unlimited</small>
                  </div>
                </CCol>
                
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="status">Status</CFormLabel>
                    <CFormSelect
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>
            </CModalBody>
            
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => {
                  setShowModal(false)
                  handleReset()
                }}
              >
                Cancel
              </CButton>
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : editingId ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => {
                setShowDeleteModal(false)
                setDeletingId(null)
              }}
            >
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete} disabled={loading}>
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Coupons