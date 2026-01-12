import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTag,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilReload,
} from '@coreui/icons'
import couponService from '../../services/couponService'

const Coupons = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    applicableTo: 'all',
    applicableItems: [],
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const response = await couponService.getCoupons()
      if (response.success) {
        setCoupons(response.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  // Handle edit - populate form with coupon data
  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue?.toString() || '',
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      validFrom: coupon.validFrom
        ? new Date(coupon.validFrom).toISOString().split('T')[0]
        : '',
      validTo: coupon.validTo
        ? new Date(coupon.validTo).toISOString().split('T')[0]
        : '',
      usageLimit: coupon.usageLimit?.toString() || '',
      applicableTo: coupon.applicableTo || 'all',
      applicableItems: coupon.applicableItems || [],
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

    if (!formData.code || !formData.discountValue || !formData.validTo) {
      setError('Please fill in all required fields')
      return
    }

    // Validate discount value
    const discountValue = parseFloat(formData.discountValue)
    if (isNaN(discountValue) || discountValue <= 0) {
      setError('Discount value must be a positive number')
      return
    }

    if (formData.discountType === 'percentage' && discountValue > 100) {
      setError('Percentage discount cannot exceed 100%')
      return
    }

    // Validate dates
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
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: discountValue,
        minPurchaseAmount: formData.minPurchaseAmount
          ? parseFloat(formData.minPurchaseAmount)
          : 0,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : null,
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        applicableTo: formData.applicableTo,
      }

      if (editingId) {
        // Update coupon
        const response = await couponService.updateCoupon(editingId, couponData)
        if (response.success) {
          setSuccess('Coupon updated successfully')
          setShowModal(false)
          setEditingId(null)
          fetchCoupons()
        }
      } else {
        // Create coupon
        const response = await couponService.createCoupon(couponData)
        if (response.success) {
          setSuccess('Coupon created successfully')
          setShowModal(false)
          handleReset()
          fetchCoupons()
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save coupon')
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchaseAmount: '',
      maxDiscountAmount: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      applicableTo: 'all',
      applicableItems: [],
    })
    setEditingId(null)
    setError('')
    setSuccess('')
  }

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (coupon) => {
    const now = new Date()
    const validTo = new Date(coupon.validTo)

    if (coupon.status === 'Inactive') {
      return <CBadge color="secondary">Inactive</CBadge>
    }

    if (now > validTo) {
      return <CBadge color="danger">Expired</CBadge>
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <CBadge color="warning">Limit Reached</CBadge>
    }

    return <CBadge color="success">Active</CBadge>
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
                <strong>Coupon Management</strong>
              </h5>
              <small className="text-body-secondary">Manage discount coupons</small>
            </div>
            <div>
              <CButton
                color="primary"
                className="me-2"
                onClick={() => {
                  handleReset()
                  setShowModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add Coupon
              </CButton>
              <CButton color="secondary" variant="outline" onClick={fetchCoupons}>
                <CIcon icon={cilReload} />
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilMagnifyingGlass} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Search coupons by code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
            </CRow>
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
              </div>
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell className="text-center">
                      <CIcon icon={cilTag} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Code</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Discount</CTableHeaderCell>
                    <CTableHeaderCell>Applicable To</CTableHeaderCell>
                    <CTableHeaderCell>Usage</CTableHeaderCell>
                    <CTableHeaderCell>Valid Until</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredCoupons.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="9" className="text-center py-5">
                        <div className="text-body-secondary">No coupons found</div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <CTableRow key={coupon._id || coupon.id}>
                        <CTableDataCell className="text-center">
                          <CBadge color="info">{coupon.code?.charAt(0) || 'C'}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>{coupon.code}</strong>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{coupon.description || '-'}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}%`
                              : `₹${coupon.discountValue}`}
                            {coupon.maxDiscountAmount &&
                              coupon.discountType === 'percentage' && (
                                <small className="text-muted d-block">
                                  Max: ₹{coupon.maxDiscountAmount}
                                </small>
                              )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="secondary" className="text-capitalize">
                            {coupon.applicableTo || 'all'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {coupon.usedCount || 0} /{' '}
                            {coupon.usageLimit ? coupon.usageLimit : '∞'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {coupon.validTo
                              ? new Date(coupon.validTo).toLocaleDateString()
                              : '-'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{getStatusBadge(coupon)}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="primary"
                            variant="outline"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(coupon)}
                            title="Edit Coupon"
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(coupon)}
                            title="Delete Coupon"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>

        {/* Add/Edit Coupon Modal */}
        <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
          <CModalHeader>
            <CModalTitle>{editingId ? 'Edit Coupon' : 'Add New Coupon'}</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              {error && (
                <CAlert color="danger" className="mb-3">
                  {error}
                </CAlert>
              )}
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="code">
                      Coupon Code <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="e.g., SAVE20"
                      required
                      disabled={!!editingId}
                      className={editingId ? 'bg-body-secondary' : ''}
                    />
                    {editingId && (
                      <small className="text-muted">Code cannot be changed</small>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="applicableTo">Applicable To</CFormLabel>
                    <CFormSelect
                      id="applicableTo"
                      name="applicableTo"
                      value={formData.applicableTo}
                      onChange={handleInputChange}
                    >
                      <option value="all">All (Courses & Programs)</option>
                      <option value="courses">Courses Only</option>
                      <option value="programs">Programs Only</option>
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
                  onChange={handleInputChange}
                  placeholder="Enter coupon description (optional)"
                  rows="2"
                />
              </div>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="discountType">Discount Type</CFormLabel>
                    <CFormSelect
                      id="discountType"
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="discountValue">
                      Discount Value <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      id="discountValue"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      step="0.01"
                      required
                    />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="minPurchaseAmount">Minimum Purchase (₹)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="minPurchaseAmount"
                      name="minPurchaseAmount"
                      value={formData.minPurchaseAmount}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="maxDiscountAmount">
                      Max Discount (₹) {formData.discountType === 'percentage' && '(Optional)'}
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      id="maxDiscountAmount"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      placeholder="No limit"
                      min="0"
                      step="0.01"
                      disabled={formData.discountType === 'fixed'}
                      className={formData.discountType === 'fixed' ? 'bg-body-secondary' : ''}
                    />
                    {formData.discountType === 'fixed' && (
                      <small className="text-muted">Not applicable for fixed discount</small>
                    )}
                  </div>
                </CCol>
              </CRow>
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
              <div className="mb-3">
                <CFormLabel htmlFor="usageLimit">Usage Limit (Optional)</CFormLabel>
                <CFormInput
                  type="number"
                  id="usageLimit"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="Unlimited"
                  min="1"
                />
                <small className="text-muted">Leave empty for unlimited usage</small>
              </div>
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
                  'Update Coupon'
                ) : (
                  'Create Coupon'
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
            <p>Are you sure you want to delete this coupon? This action cannot be undone.</p>
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
                'Delete Coupon'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Coupons
