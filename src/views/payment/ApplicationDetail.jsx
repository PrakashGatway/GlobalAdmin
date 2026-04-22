// ApplicationDetailModal.jsx
import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CFormInput,
  CBadge,
  CSpinner,
  CAlert,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CListGroup,
  CListGroupItem,
  CProgress,
  CProgressBar
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilX,
  cilPencil,
  cilSave,
  cilCloudDownload,
  cilExternalLink,
  cilCalendar,
  cilUser,
  cilLocationPin,
  cilBook,
  cilCreditCard,
  cilWallet,
  cilNotes,
  cilPaperclip,
  cilHistory,
  cilCheckCircle,
  cilWarning,
  cilInfo
} from '@coreui/icons'
import applicationService from '../../services/applicationService'
import adminPaymentService from '../../services/paymentService'

const ApplicationDetailModal = ({
  visible,
  application,
  onClose,
  onUpdate,
  isPaymentDetail = false
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  
  // Payment detail specific state
  const [paymentDetails, setPaymentDetails] = useState(null)

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Status badge colors
  const getStatusBadgeColor = (status, type = 'primary') => {
    const colors = {
      primary: {
        'Pending': 'warning',
        'Started': 'info',
        'ReviewbyOoshas': 'primary',
        'SubmitToSchool': 'secondary',
        'AwaitingSchoolResponse': 'dark',
        'AdmissionProcessing': 'info',
        'Refused': 'danger',
        'Withdrawn': 'secondary',
        'PreArrival': 'success',
        'Arrived': 'success',
        'Completed': 'success'
      },
      payment: {
        'Pending': 'warning',
        'Completed': 'success',
        'Cancelled': 'secondary',
        'Refunded': 'danger'
      }
    }
    return colors[type]?.[status] || 'light'
  }

  // Initialize edit data when application changes
  useEffect(() => {
    if (application) {
      if (isPaymentDetail) {
        setPaymentDetails(application)
        setEditData({
          status: application.status,
          reason: application.reason || '',
          refundAmount: application.refund?.refundAmount || application.amount
        })
      } else {
        setEditData({
          primaryStatus: application.primaryStatus,
          paymentStatus: application.paymentStatus,
          userNotes: application.userNotes || '',
          adminNotes: application.adminNotes || '',
          intake: application.intake,
          country: application.country
        })
      }
    }
  }, [application, isPaymentDetail])

  // Handle tab change
  const handleTabChange = (index) => {
    setActiveTab(index)
  }

  // Handle edit toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    setError('')
    setSuccess('')
  }

  // Handle input change for edit form
  const handleEditChange = (key, value) => {
    setEditData(prev => ({ ...prev, [key]: value }))
  }

  // Save application changes
  const handleSaveApplication = async () => {
    if (!application?._id) return
    setLoading(true)
    setError('')
    try {
      const response = await applicationService.updateApplication(
        application._id,
        editData
      )
      if (response.success) {
        setSuccess('Application updated successfully')
        setIsEditing(false)
        if (onUpdate) onUpdate()
      }
    } catch (err) {
      setError(err.message || 'Failed to update application')
    } finally {
      setLoading(false)
    }
  }

  // Save payment status changes
  const handleSavePayment = async () => {
    if (!paymentDetails?._id) return
    setLoading(true)
    setError('')
    try {
      const payload = { ...editData }
      if (editData.status !== 'Refunded') {
        delete payload.refundAmount
      }
      const response = await adminPaymentService.updatePaymentStatus(
        paymentDetails._id,
        payload
      )
      if (response.success) {
        setSuccess(response.message)
        setIsEditing(false)
        if (onUpdate) onUpdate()
      }
    } catch (err) {
      setError(err.message || 'Failed to update payment')
    } finally {
      setLoading(false)
    }
  }

  // Download document handler
  const handleDownloadDocument = (docUrl, fileName) => {
    if (!docUrl) return
    window.open(docUrl, '_blank')
  }

  // Tab definitions based on detail type
  const getTabs = () => {
    if (isPaymentDetail) {
      return [
        { label: 'Overview', icon: cilInfo },
        { label: 'Payment Breakdown', icon: cilCreditCard },
        { label: 'Refund Info', icon: cilWallet },
        { label: 'History', icon: cilHistory }
      ]
    }
    return [
      { label: 'Overview', icon: cilInfo },
      { label: 'Documents', icon: cilPaperclip },
      { label: 'Notes', icon: cilNotes },
      { label: 'Timeline', icon: cilHistory }
    ]
  }

  const tabs = getTabs()

  // Render payment detail content
  const renderPaymentDetailContent = () => {
    if (!paymentDetails) return null

    return (
      <>
        {/* Tab Navigation */}
        <CNav variant="tabs" className="mb-4">
          {tabs.map((tab, index) => (
            <CNavItem key={index}>
              <CNavLink
                active={activeTab === index}
                onClick={() => handleTabChange(index)}
                className="d-flex align-items-center gap-2"
              >
                <CIcon icon={tab.icon} />
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        {/* Tab Content */}
        <CTabContent>
          {/* Overview Tab */}
          <CTabPane visible={activeTab === 0} className="p-3">
            <CRow className="g-4">
              {/* Transaction Info */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader className="fw-bold">Transaction Details</CCardHeader>
                  <CCardBody>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Transaction ID:</strong></CCol>
                      <CCol md={7} className="text-break">
                        {paymentDetails.transactionId || 'N/A'}
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Reference ID:</strong></CCol>
                      <CCol md={7}>{paymentDetails.refId || '-'}</CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Status:</strong></CCol>
                      <CCol md={7}>
                        <CBadge color={getStatusBadgeColor(paymentDetails.status, 'payment')}>
                          {paymentDetails.status}
                        </CBadge>
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Payment Method:</strong></CCol>
                      <CCol md={7}>{paymentDetails.paymentMethod || '-'}</CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Created:</strong></CCol>
                      <CCol md={7}>{formatDate(paymentDetails.createdAt)}</CCol>
                    </CRow>
                    <CRow>
                      <CCol md={5}><strong>Updated:</strong></CCol>
                      <CCol md={7}>{formatDate(paymentDetails.updatedAt)}</CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* User & Application Info */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader className="fw-bold">
                    {paymentDetails.application ? 'Application' : 'Service'} Details
                  </CCardHeader>
                  <CCardBody>
                    {paymentDetails.application ? (
                      <>
                        <CRow className="mb-2">
                          <CCol md={5}><strong>Application #:</strong></CCol>
                          <CCol md={7}>
                            <strong>{paymentDetails.application.applicationNumber}</strong>
                          </CCol>
                        </CRow>
                        <CRow className="mb-2">
                          <CCol md={5}><strong>Course:</strong></CCol>
                          <CCol md={7}>
                            {paymentDetails.application.course?.name || 'N/A'}
                          </CCol>
                        </CRow>
                        <CRow className="mb-2">
                          <CCol md={5}><strong>University:</strong></CCol>
                          <CCol md={7}>
                            {paymentDetails.application.course?.university?.name || 'N/A'}
                          </CCol>
                        </CRow>
                        <CRow className="mb-2">
                          <CCol md={5}><strong>Student:</strong></CCol>
                          <CCol md={7}>
                            {paymentDetails.application.student?.name || 'N/A'}
                            <div className="text-body-secondary small">
                              {paymentDetails.application.student?.email}
                            </div>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol md={5}><strong>Intake:</strong></CCol>
                          <CCol md={7}>{paymentDetails.application.intake || '-'}</CCol>
                        </CRow>
                      </>
                    ) : (
                      <>
                        <CRow className="mb-2">
                          <CCol md={5}><strong>Service:</strong></CCol>
                          <CCol md={7}>{paymentDetails.serviceName || 'N/A'}</CCol>
                        </CRow>
                        <CRow>
                          <CCol md={5}><strong>Type:</strong></CCol>
                          <CCol md={7}>
                            <CBadge color="info">Service Payment</CBadge>
                          </CCol>
                        </CRow>
                      </>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Amount Summary */}
              <CCol md={12}>
                <CCard className="bg-light">
                  <CCardBody>
                    <CRow className="text-center">
                      <CCol md={3} className="border-end">
                        <div className="text-body-secondary small">Original Amount</div>
                        <div className="fs-5 fw-bold">{formatCurrency(paymentDetails.originalAmount)}</div>
                      </CCol>
                      <CCol md={3} className="border-end">
                        <div className="text-body-secondary small">Discount</div>
                        <div className="fs-5 fw-bold text-success">
                          -{formatCurrency(paymentDetails.couponDiscount)}
                        </div>
                        {paymentDetails.couponCode && (
                          <CBadge color="info" className="mt-1">{paymentDetails.couponCode}</CBadge>
                        )}
                      </CCol>
                      <CCol md={3} className="border-end">
                        <div className="text-body-secondary small">GST</div>
                        <div className="fs-5 fw-bold">{formatCurrency(paymentDetails.gst)}</div>
                      </CCol>
                      <CCol md={3}>
                        <div className="text-body-secondary small">Final Amount</div>
                        <div className="fs-4 fw-bold text-primary">
                          {formatCurrency(paymentDetails.amount)}
                        </div>
                      </CCol>
                    </CRow>
                    
                    {/* Wallet Usage */}
                    {paymentDetails.isWalletUsed && paymentDetails.walletPointsUsed > 0 && (
                      <CRow className="mt-3 pt-3 border-top">
                        <CCol className="text-center">
                          <CBadge color="info" className="me-2">
                            <CIcon icon={cilWallet} className="me-1" />
                            Wallet Used: {paymentDetails.walletPointsUsed} points
                          </CBadge>
                          <small className="text-body-secondary">
                            (₹{Math.round(paymentDetails.walletPointsUsed / 10)})
                          </small>
                        </CCol>
                      </CRow>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CTabPane>

          {/* Payment Breakdown Tab */}
          <CTabPane visible={activeTab === 1} className="p-3">
            <CCard>
              <CCardHeader className="fw-bold d-flex justify-content-between">
                <span>Payment Breakdown</span>
                {isEditing && (
                  <CButton color="primary" size="sm" onClick={handleSavePayment} disabled={loading}>
                    {loading ? <CSpinner size="sm" /> : <><CIcon icon={cilSave} className="me-1" /> Save</>}
                  </CButton>
                )}
              </CCardHeader>
              <CCardBody>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Component</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow>
                      <CTableDataCell>Application/Service Fee</CTableDataCell>
                      <CTableDataCell className="text-end">{formatCurrency(paymentDetails.originalAmount)}</CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell>
                        Coupon Discount {paymentDetails.couponCode && `(${paymentDetails.couponCode})`}
                      </CTableDataCell>
                      <CTableDataCell className="text-end text-success">
                        -{formatCurrency(paymentDetails.couponDiscount)}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell>
                        Wallet Points Used {paymentDetails.walletPointsUsed > 0 && `(${paymentDetails.walletPointsUsed} pts)`}
                      </CTableDataCell>
                      <CTableDataCell className="text-end text-info">
                        -{formatCurrency(paymentDetails.walletPointsUsed / 10)}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell>GST (18%)</CTableDataCell>
                      <CTableDataCell className="text-end">{formatCurrency(paymentDetails.gst)}</CTableDataCell>
                    </CTableRow>
                    <CTableRow className="fw-bold">
                      <CTableDataCell>Net Payable</CTableDataCell>
                      <CTableDataCell className="text-end text-primary">
                        {formatCurrency(paymentDetails.amount)}
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>

                {/* Edit Mode: Status Update */}
                {isEditing && (
                  <CForm className="mt-4 p-3 bg-light rounded">
                    <CRow className="g-3">
                      <CCol md={6}>
                        <CFormLabel>Update Status *</CFormLabel>
                        <CFormSelect
                          value={editData.status}
                          onChange={(e) => handleEditChange('status', e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Refunded">Refunded</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Reason</CFormLabel>
                        <CFormInput
                          placeholder="Enter reason for status change"
                          value={editData.reason}
                          onChange={(e) => handleEditChange('reason', e.target.value)}
                        />
                      </CCol>
                      {editData.status === 'Refunded' && (
                        <CCol md={6}>
                          <CFormLabel>Refund Amount (₹) *</CFormLabel>
                          <CFormInput
                            type="number"
                            min="0"
                            max={paymentDetails.amount}
                            value={editData.refundAmount}
                            onChange={(e) => handleEditChange('refundAmount', e.target.value)}
                          />
                          <small className="text-body-secondary">
                            Max refund: {formatCurrency(paymentDetails.amount)}
                          </small>
                        </CCol>
                      )}
                    </CRow>
                  </CForm>
                )}
              </CCardBody>
            </CCard>
          </CTabPane>

          {/* Refund Info Tab */}
          <CTabPane visible={activeTab === 2} className="p-3">
            <CCard>
              <CCardHeader className="fw-bold">Refund Information</CCardHeader>
              <CCardBody>
                {paymentDetails.refund?.refundId ? (
                  <>
                    <CRow className="mb-3">
                      <CCol md={4}><strong>Refund ID:</strong></CCol>
                      <CCol md={8}>{paymentDetails.refund.refundId}</CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol md={4}><strong>Refund Amount:</strong></CCol>
                      <CCol md={8} className="text-danger fw-bold">
                        {formatCurrency(paymentDetails.refund.refundAmount)}
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol md={4}><strong>Refund Date:</strong></CCol>
                      <CCol md={8}>{formatDate(paymentDetails.refund.refundDate)}</CCol>
                    </CRow>
                    <CRow>
                      <CCol md={4}><strong>Reason:</strong></CCol>
                      <CCol md={8}>{paymentDetails.refund.reason || '-'}</CCol>
                    </CRow>
                    
                    {/* Refund Progress */}
                    <div className="mt-4">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Refund Progress</small>
                        <small className="fw-bold">100%</small>
                      </div>
                      <CProgress thin>
                        <CProgressBar value={100} color="success" />
                      </CProgress>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-5 text-body-secondary">
                    <CIcon icon={cilWallet} size="3xl" className="mb-3" />
                    <p>No refund has been processed for this payment.</p>
                    {paymentDetails.status === 'Completed' && !isEditing && (
                      <CButton color="danger" variant="outline" onClick={handleEditToggle}>
                        <CIcon icon={cilPencil} className="me-2" />
                        Process Refund
                      </CButton>
                    )}
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CTabPane>

          {/* History Tab */}
          <CTabPane visible={activeTab === 3} className="p-3">
            <CCard>
              <CCardHeader className="fw-bold">Payment History</CCardHeader>
              <CCardBody>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Event</CTableHeaderCell>
                      <CTableHeaderCell>Details</CTableHeaderCell>
                      <CTableHeaderCell>By</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow>
                      <CTableDataCell>{formatDate(paymentDetails.createdAt)}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="success">Payment Initiated</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {paymentDetails.paymentMethod} payment of {formatCurrency(paymentDetails.amount)}
                      </CTableDataCell>
                      <CTableDataCell>{paymentDetails.user?.name || 'System'}</CTableDataCell>
                    </CTableRow>
                    {paymentDetails.status === 'Completed' && (
                      <CTableRow>
                        <CTableDataCell>{formatDate(paymentDetails.updatedAt)}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="success">Payment Completed</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>Transaction verified and confirmed</CTableDataCell>
                        <CTableDataCell>System</CTableDataCell>
                      </CTableRow>
                    )}
                    {paymentDetails.refund?.refundId && (
                      <CTableRow>
                        <CTableDataCell>{formatDate(paymentDetails.refund.refundDate)}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="danger">Refund Processed</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {paymentDetails.refund.reason || 'Refund requested'}
                        </CTableDataCell>
                        <CTableDataCell>Admin</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CTabPane>
        </CTabContent>
      </>
    )
  }

  // Render application detail content
  const renderApplicationDetailContent = () => {
    if (!application) return null

    return (
      <>
        {/* Tab Navigation */}
        <CNav variant="tabs" className="mb-4">
          {tabs.map((tab, index) => (
            <CNavItem key={index}>
              <CNavLink
                active={activeTab === index}
                onClick={() => handleTabChange(index)}
                className="d-flex align-items-center gap-2"
              >
                <CIcon icon={tab.icon} />
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        {/* Tab Content */}
        <CTabContent>
          {/* Overview Tab */}
          <CTabPane visible={activeTab === 0} className="p-3">
            <CRow className="g-4">
              {/* Application Info */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader className="fw-bold d-flex justify-content-between">
                    <span>Application Details</span>
                    {isEditing && (
                      <CButton color="primary" size="sm" onClick={handleSaveApplication} disabled={loading}>
                        {loading ? <CSpinner size="sm" /> : <><CIcon icon={cilSave} className="me-1" /> Save</>}
                      </CButton>
                    )}
                  </CCardHeader>
                  <CCardBody>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Application #:</strong></CCol>
                      <CCol md={7}>
                        <strong className="text-primary">{application.applicationNumber}</strong>
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Primary Status:</strong></CCol>
                      <CCol md={7}>
                        {isEditing ? (
                          <CFormSelect
                            size="sm"
                            value={editData.primaryStatus}
                            onChange={(e) => handleEditChange('primaryStatus', e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Started">Started</option>
                            <option value="ReviewbyOoshas">Review by Ooshas</option>
                            <option value="SubmitToSchool">Submit to School</option>
                            <option value="AwaitingSchoolResponse">Awaiting Response</option>
                            <option value="AdmissionProcessing">Processing</option>
                            <option value="Refused">Refused</option>
                            <option value="Withdrawn">Withdrawn</option>
                            <option value="PreArrival">Pre-Arrival</option>
                            <option value="Arrived">Arrived</option>
                            <option value="Completed">Completed</option>
                          </CFormSelect>
                        ) : (
                          <CBadge color={getStatusBadgeColor(application.primaryStatus)}>
                            {application.primaryStatus}
                          </CBadge>
                        )}
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Payment Status:</strong></CCol>
                      <CCol md={7}>
                        {isEditing ? (
                          <CFormSelect
                            size="sm"
                            value={editData.paymentStatus}
                            onChange={(e) => handleEditChange('paymentStatus', e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                          </CFormSelect>
                        ) : (
                          <CBadge color={getStatusBadgeColor(application.paymentStatus, 'payment')}>
                            {application.paymentStatus}
                          </CBadge>
                        )}
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Intake:</strong></CCol>
                      <CCol md={7}>
                        {isEditing ? (
                          <CFormInput
                            size="sm"
                            value={editData.intake}
                            onChange={(e) => handleEditChange('intake', e.target.value)}
                            placeholder="e.g., September 2025"
                          />
                        ) : (
                          application.intake || '-'
                        )}
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol md={5}><strong>Country:</strong></CCol>
                      <CCol md={7}>
                        {isEditing ? (
                          <CFormInput
                            size="sm"
                            value={editData.country}
                            onChange={(e) => handleEditChange('country', e.target.value)}
                          />
                        ) : (
                          application.country || '-'
                        )}
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Student & Course Info */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader className="fw-bold">Student & Course</CCardHeader>
                  <CCardBody>
                    <CRow className="mb-3">
                      <CCol md={12}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                            <CIcon icon={cilUser} size="lg" />
                          </div>
                          <div>
                            <strong className="d-block">{application.student?.name || 'N/A'}</strong>
                            <small className="text-body-secondary">{application.student?.email}</small>
                            {application.student?.phone && (
                              <div className="text-body-secondary small">{application.student.phone}</div>
                            )}
                          </div>
                        </div>
                      </CCol>
                    </CRow>
                    <hr />
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Course:</strong></CCol>
                      <CCol md={7}>{application.course?.name || 'N/A'}</CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>University:</strong></CCol>
                      <CCol md={7}>
                        {application.course?.university?.name || 'N/A'}
                        {application.course?.university?.uni_logo && (
                          <img 
                            src={application.course.university.uni_logo} 
                            alt="University" 
                            className="ms-2" 
                            style={{ height: '24px', borderRadius: '4px' }}
                          />
                        )}
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol md={5}><strong>Application Fee:</strong></CCol>
                      <CCol md={7} className="fw-bold">
                        {formatCurrency(application.course?.applicationFee || 0)}
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol md={5}><strong>Created:</strong></CCol>
                      <CCol md={7}>{formatDate(application.createdAt)}</CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Quick Stats */}
              <CCol md={12}>
                <CRow className="g-3">
                  <CCol md={4}>
                    <CCard className="text-center h-100">
                      <CCardBody>
                        <CIcon icon={cilPaperclip} size="xl" className="text-primary mb-2" />
                        <div className="fs-4 fw-bold">
                          {[...(application.documents || []), ...(application.OoshasDocuments || [])].length}
                        </div>
                        <small className="text-body-secondary">Documents Uploaded</small>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  <CCol md={4}>
                    <CCard className="text-center h-100">
                      <CCardBody>
                        <CIcon icon={cilNotes} size="xl" className="text-info mb-2" />
                        <div className="fs-4 fw-bold">
                          {(application.userNotes?.length || 0) + (application.adminNotes?.length || 0) > 0 ? 'Yes' : 'No'}
                        </div>
                        <small className="text-body-secondary">Notes Added</small>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  <CCol md={4}>
                    <CCard className="text-center h-100">
                      <CCardBody>
                        <CIcon icon={cilCalendar} size="xl" className="text-success mb-2" />
                        <div className="fs-4 fw-bold">
                          {application.updatedAt ? 'Yes' : 'No'}
                        </div>
                        <small className="text-body-secondary">Recently Updated</small>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CTabPane>

          {/* Documents Tab */}
          <CTabPane visible={activeTab === 1} className="p-3">
            <CCard>
              <CCardHeader className="fw-bold">Uploaded Documents</CCardHeader>
              <CCardBody>
                {/* User Documents */}
                <h6 className="mb-3">Student Uploaded Documents</h6>
                {application.documents?.length > 0 ? (
                  <CTable hover responsive small>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Document Name</CTableHeaderCell>
                        <CTableHeaderCell>Type</CTableHeaderCell>
                        <CTableHeaderCell>Uploaded</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {application.documents.map((doc, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <CIcon icon={cilPaperclip} className="me-2" />
                            {doc.name || doc.fileName || 'Document'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="secondary">{doc.type || 'PDF'}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{formatDate(doc.uploadedAt || application.createdAt)}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton 
                              color="info" 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadDocument(doc.url, doc.name)}
                            >
                              <CIcon icon={cilCloudDownload} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                ) : (
                  <div className="text-center py-3 text-body-secondary">
                    No documents uploaded by student
                  </div>
                )}

                {/* Ooshas Documents */}
                <h6 className="mb-3 mt-4">Ooshas Team Documents</h6>
                {application.OoshasDocuments?.length > 0 ? (
                  <CTable hover responsive small>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Document Name</CTableHeaderCell>
                        <CTableHeaderCell>Added By</CTableHeaderCell>
                        <CTableHeaderCell>Added</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {application.OoshasDocuments.map((doc, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <CIcon icon={cilPaperclip} className="me-2" />
                            {doc.name || doc.fileName || 'Document'}
                          </CTableDataCell>
                          <CTableDataCell>{doc.addedBy?.name || 'Admin'}</CTableDataCell>
                          <CTableDataCell>{formatDate(doc.uploadedAt)}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton 
                              color="info" 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadDocument(doc.url, doc.name)}
                            >
                              <CIcon icon={cilCloudDownload} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                ) : (
                  <div className="text-center py-3 text-body-secondary">
                    No documents added by Ooshas team
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CTabPane>

          {/* Notes Tab */}
          <CTabPane visible={activeTab === 2} className="p-3">
            <CRow className="g-4">
              {/* User Notes */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader className="fw-bold d-flex justify-content-between">
                    <span>Student Notes</span>
                    {isEditing && <CBadge color="info">Editable</CBadge>}
                  </CCardHeader>
                  <CCardBody>
                    {isEditing ? (
                      <CFormTextarea
                        rows={8}
                        value={editData.userNotes}
                        onChange={(e) => handleEditChange('userNotes', e.target.value)}
                        placeholder="Add notes visible to student..."
                      />
                    ) : (
                      <div className="text-break">
                        {application.userNotes || (
                          <span className="text-body-secondary">No notes added</span>
                        )}
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Admin Notes */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader className="fw-bold d-flex justify-content-between">
                    <span>Admin Notes (Internal)</span>
                    {isEditing && <CBadge color="warning">Private</CBadge>}
                  </CCardHeader>
                  <CCardBody>
                    {isEditing ? (
                      <CFormTextarea
                        rows={8}
                        value={editData.adminNotes}
                        onChange={(e) => handleEditChange('adminNotes', e.target.value)}
                        placeholder="Add internal admin notes..."
                      />
                    ) : (
                      <div className="text-break">
                        {application.adminNotes || (
                          <span className="text-body-secondary">No internal notes</span>
                        )}
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CTabPane>

          {/* Timeline Tab */}
          <CTabPane visible={activeTab === 3} className="p-3">
            <CCard>
              <CCardHeader className="fw-bold">Application Timeline</CCardHeader>
              <CCardBody>
                <CListGroup flush>
                  <CListGroupItem className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>Application Created</strong>
                      <div className="text-body-secondary small">
                        {formatDate(application.createdAt)}
                      </div>
                    </div>
                    <CBadge color="primary">Start</CBadge>
                  </CListGroupItem>
                  
                  {application.paymentStatus === 'Completed' && (
                    <CListGroupItem className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>Payment Completed</strong>
                        <div className="text-body-secondary small">
                          {formatDate(application.updatedAt)}
                        </div>
                      </div>
                      <CBadge color="success">
                        <CIcon icon={cilCheckCircle} className="me-1" />
                        Paid
                      </CBadge>
                    </CListGroupItem>
                  )}

                  {application.primaryStatus !== 'Pending' && (
                    <CListGroupItem className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>Status: {application.primaryStatus}</strong>
                        <div className="text-body-secondary small">
                          Updated {formatDate(application.updatedAt)}
                        </div>
                      </div>
                      <CBadge color={getStatusBadgeColor(application.primaryStatus)}>
                        Current
                      </CBadge>
                    </CListGroupItem>
                  )}

                  {application.isWithdrawn && (
                    <CListGroupItem className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong className="text-danger">Application Withdrawn</strong>
                        <div className="text-body-secondary small">
                          {formatDate(application.updatedAt)}
                        </div>
                      </div>
                      <CBadge color="danger">
                        <CIcon icon={cilWarning} className="me-1" />
                        Withdrawn
                      </CBadge>
                    </CListGroupItem>
                  )}

                  {/* Additional timeline events can be added here based on your backend */}
                </CListGroup>
              </CCardBody>
            </CCard>
          </CTabPane>
        </CTabContent>
      </>
    )
  }

  // Determine which content to render
  const detailContent = isPaymentDetail 
    ? renderPaymentDetailContent() 
    : renderApplicationDetailContent()

  // Modal title
  const modalTitle = isPaymentDetail 
    ? `Payment Details - ${paymentDetails?.transactionId?.slice(-8) || 'N/A'}`
    : `Application #${application?.applicationNumber || 'N/A'}`

  return (
    <CModal 
      visible={visible} 
      onClose={onClose} 
      size="xl" 
      scrollable
      backdrop="static"
    >
      <CModalHeader className="d-flex justify-content-between align-items-center">
        <CModalTitle>{modalTitle}</CModalTitle>
        <div className="d-flex gap-2">
          {!isPaymentDetail && !isEditing && (
            <CButton 
              color="primary" 
              variant="outline" 
              size="sm"
              onClick={handleEditToggle}
            >
              <CIcon icon={cilPencil} className="me-1" />
              Edit
            </CButton>
          )}
          {isEditing && (
            <>
              <CButton 
                color="secondary" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setError('')
                  setSuccess('')
                }}
              >
                Cancel
              </CButton>
            </>
          )}
          <CButton 
            color="danger" 
            variant="ghost" 
            size="sm"
            onClick={onClose}
          >
            <CIcon icon={cilX} />
          </CButton>
        </div>
      </CModalHeader>

      <CModalBody>
        {/* Alerts */}
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')} className="mb-3">
            {error}
          </CAlert>
        )}
        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess('')} className="mb-3">
            {success}
          </CAlert>
        )}

        {/* Loading State */}
        {loading && !detailContent && (
          <div className="text-center py-5">
            <CSpinner />
            <div className="mt-2">Loading details...</div>
          </div>
        )}

        {/* Detail Content */}
        {detailContent}
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
        {!isPaymentDetail && isEditing && (
          <CButton 
            color="primary" 
            onClick={handleSaveApplication}
            disabled={loading}
          >
            {loading ? <CSpinner size="sm" /> : 'Save Changes'}
          </CButton>
        )}
        {isPaymentDetail && isEditing && (
          <CButton 
            color="primary" 
            onClick={handleSavePayment}
            disabled={loading}
          >
            {loading ? <CSpinner size="sm" /> : 'Update Status'}
          </CButton>
        )}
      </CModalFooter>
    </CModal>
  )
}

export default ApplicationDetailModal