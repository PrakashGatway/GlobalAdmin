// PaymentManagement.jsx
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
    CSpinner,
    CAlert,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormLabel,
    CFormSelect,
    CPagination,
    CPaginationItem,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CFormTextarea
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilMagnifyingGlass,
    cilFilter,
    cilCloudDownload,
    cilReload,
    cilPencil,
    cilTrash,
    cilChartPie,
    cilWallet,
    cilDollar,
    cilBook
} from '@coreui/icons'
import adminPaymentService from '../../services/paymentService'
import userService from '../../services/userService'
import applicationService from '../../services/applicationService'
import ApplicationDetailModal from './ApplicationDetail'

const PaymentManagement = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [stats, setStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    })

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        paymentMethod: '',
        userId: '',
        applicationId: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    })

    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [statusUpdateData, setStatusUpdateData] = useState({
        status: '',
        reason: '',
        refundAmount: ''
    })

    // Dropdown data
    const [users, setUsers] = useState([])
    const [applications, setApplications] = useState([])

    // Status options
    const statusOptions = ['Pending', 'Completed', 'Cancelled', 'Refunded']
    const paymentMethodOptions = ['Credit Card', 'Debit Card', 'UPI', 'Wallet', 'Bank Transfer']

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

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        const colors = {
            'Pending': 'warning',
            'Completed': 'success',
            'Cancelled': 'secondary',
            'Refunded': 'danger'
        }
        return colors[status] || 'light'
    }

    // Fetch payments with pagination and filters
    const fetchPayments = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                sortBy,
                sortOrder,
                ...filters
            }

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (!params[key] && params[key] !== 0) {
                    delete params[key]
                }
            })

            const response = await adminPaymentService.getPayments(params)
            if (response.success) {
                setPayments(response.data || [])
                setPagination({
                    page: response.pagination?.page || 1,
                    limit: response.pagination?.limit || 10,
                    total: response.pagination?.total || 0,
                    pages: response.pagination?.pages || 0
                })
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch payments')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, sortBy, sortOrder, filters])

    // Fetch stats
    const fetchStats = useCallback(async () => {
        setStatsLoading(true)
        try {
            const params = {}
            if (filters.startDate) params.startDate = filters.startDate
            if (filters.endDate) params.endDate = filters.endDate

            const response = await adminPaymentService.getPaymentStats(params)
            if (response.success) {
                setStats(response.data)
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err)
        } finally {
            setStatsLoading(false)
        }
    }, [filters.startDate, filters.endDate])

    useEffect(() => {
        fetchPayments()
    }, [fetchPayments])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    // Fetch dropdown data
    const fetchDropdownData = async () => {
        try {
            const [usersRes] = await Promise.all([
                userService.getUsers({ limit: 100, role: 'user' })
            ])
            if (usersRes.success) setUsers(usersRes.data || [])
            //   if (applicationsRes.success) setApplications(applicationsRes.data || [])
        } catch (err) {
            console.error('Failed to fetch dropdown data:', err)
        }
    }

    useEffect(() => {
        fetchDropdownData()
    }, [])

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            status: '',
            paymentMethod: '',
            userId: '',
            applicationId: '',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: ''
        })
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    // Handle view details
    const handleViewDetails = (payment) => {
        setSelectedPayment(payment)
        setShowModal(true)
    }

    // Handle status update modal
    const handleStatusUpdate = (payment) => {
        setSelectedPayment(payment)
        setStatusUpdateData({
            status: payment.status,
            reason: '',
            refundAmount: payment.amount
        })
        setShowStatusModal(true)
    }

    // Submit status update
    const submitStatusUpdate = async () => {
        if (!selectedPayment) return
        setLoading(true)
        try {
            const payload = { ...statusUpdateData }
            if (statusUpdateData.status !== 'Refunded') {
                delete payload.refundAmount
            }
            const response = await adminPaymentService.updatePaymentStatus(
                selectedPayment._id,
                payload
            )
            if (response.success) {
                setSuccess(response.message)
                setShowStatusModal(false)
                fetchPayments()
                fetchStats()
            }
        } catch (err) {
            setError(err.message || 'Failed to update payment status')
        } finally {
            setLoading(false)
        }
    }

    // Export to CSV
    const convertToCSV = (data) => {
        const headers = [
            'Transaction ID',
            'User Name',
            'User Email',
            'Application Number',
            'Amount',
            'GST',
            'Discount',
            'Payment Method',
            'Status',
            'Created At'
        ]

        const rows = data.map((p) => [
            p.transactionId || '',
            p.user?.name || '',
            p.user?.email || '',
            p.application?.applicationNumber || (p.isService ? p.serviceName : 'N/A'),
            p.amount || 0,
            p.gst || 0,
            p.couponDiscount || 0,
            p.paymentMethod || '',
            p.status || '',
            formatDate(p.createdAt)
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
        ].join('\n')
        return csvContent
    }

    const downloadCSV = () => {
        const csvContent = convertToCSV(payments)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Refresh all data
    const handleRefresh = () => {
        fetchPayments()
        fetchStats()
    }

    return (
        <CRow>
            <CCol xs={12}>
                {/* Alerts */}
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

                {/* Stats Cards */}
                <CRow className="mb-4">
                    <CCol xl={3} md={6}>
                        <CCard className="text-white bg-primary">
                            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="fs-4 fw-semibold">{stats?.overview?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
                                    <div>Total Revenue</div>
                                </div>
                                <CIcon icon={cilDollar} size="xl" />
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol xl={3} md={6}>
                        <CCard className="text-white bg-success">
                            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="fs-4 fw-semibold">{stats?.overview?.completedCount || 0}</div>
                                    <div>Completed Payments</div>
                                </div>
                                <CIcon icon={cilChartPie} size="xl" />
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol xl={3} md={6}>
                        <CCard className="text-white bg-warning">
                            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="fs-4 fw-semibold">{stats?.overview?.pendingCount || 0}</div>
                                    <div>Pending Payments</div>
                                </div>
                                <CIcon icon={cilWallet} size="xl" />
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol xl={3} md={6}>
                        <CCard className="text-white bg-info">
                            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="fs-4 fw-semibold">{formatCurrency(stats?.overview?.avgTransactionValue || 0)}</div>
                                    <div>Avg. Transaction</div>
                                </div>
                                <CIcon icon={cilMagnifyingGlass} size="xl" />
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>

                {/* Main Card */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h5 className="mb-0"><strong>Payment Management</strong></h5>
                        <div className="d-flex gap-2">
                            <CButton color="success" variant="outline" onClick={downloadCSV}>
                                <CIcon icon={cilCloudDownload} className="me-2" />
                                Export CSV
                            </CButton>
                            <CButton color="secondary" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                                <CIcon icon={cilFilter} className="me-2" />
                                Filters
                            </CButton>
                            <CButton color="secondary" variant="outline" size="sm" onClick={handleRefresh}>
                                <CIcon icon={cilReload} />
                            </CButton>
                        </div>
                    </CCardHeader>

                    <CCardBody>
                        {/* Search Bar */}
                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CInputGroup>
                                    <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                                    <CFormInput
                                        placeholder="Search by transaction ID, ref ID, coupon..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <CCard className="mb-3 bg-light">
                                <CCardBody>
                                    <CRow className="g-3">
                                        <CCol md={3}>
                                            <CFormLabel>Status</CFormLabel>
                                            <CFormSelect
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                            >
                                                <option value="">All Status</option>
                                                {statusOptions.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>
                                        <CCol md={3}>
                                            <CFormLabel>Payment Method</CFormLabel>
                                            <CFormSelect
                                                value={filters.paymentMethod}
                                                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                            >
                                                <option value="">All Methods</option>
                                                {paymentMethodOptions.map(method => (
                                                    <option key={method} value={method}>{method}</option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>
                                        <CCol md={3}>
                                            <CFormLabel>User</CFormLabel>
                                            <CFormSelect
                                                value={filters.userId}
                                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                                            >
                                                <option value="">All Users</option>
                                                {users.map(user => (
                                                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>
                                        <CCol md={3}>
                                            <CFormLabel>Application</CFormLabel>
                                            <CFormSelect
                                                value={filters.applicationId}
                                                onChange={(e) => handleFilterChange('applicationId', e.target.value)}
                                            >
                                                <option value="">All Applications</option>
                                                {applications.map(app => (
                                                    <option key={app._id} value={app._id}>
                                                        {app.applicationNumber} - {app.course?.name}
                                                    </option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>
                                        <CCol md={3}>
                                            <CFormLabel>Min Amount (₹)</CFormLabel>
                                            <CFormInput
                                                type="number"
                                                placeholder="0"
                                                value={filters.minAmount}
                                                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                            />
                                        </CCol>
                                        <CCol md={3}>
                                            <CFormLabel>Max Amount (₹)</CFormLabel>
                                            <CFormInput
                                                type="number"
                                                placeholder="10000"
                                                value={filters.maxAmount}
                                                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                            />
                                        </CCol>
                                        <CCol md={3}>
                                            <CFormLabel>Start Date</CFormLabel>
                                            <CFormInput
                                                type="date"
                                                value={filters.startDate}
                                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                            />
                                        </CCol>
                                        <CCol md={3}>
                                            <CFormLabel>End Date</CFormLabel>
                                            <CFormInput
                                                type="date"
                                                value={filters.endDate}
                                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                            />
                                        </CCol>
                                        <CCol md={12}>
                                            <CButton color="secondary" size="sm" onClick={resetFilters}>
                                                Reset Filters
                                            </CButton>
                                        </CCol>
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        )}

                        {/* Payments Table */}
                        {loading ? (
                            <div className="text-center py-5"><CSpinner /></div>
                        ) : (
                            <>
                                <CTable align="middle" className="mb-0 border" hover responsive>
                                    <CTableHead color="light">
                                        <CTableRow>
                                            <CTableHeaderCell>Transaction ID</CTableHeaderCell>
                                            <CTableHeaderCell>User</CTableHeaderCell>
                                            <CTableHeaderCell>Application</CTableHeaderCell>
                                            <CTableHeaderCell>Amount</CTableHeaderCell>
                                            <CTableHeaderCell>Method</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Date</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {payments.length === 0 ? (
                                            <CTableRow>
                                                <CTableDataCell colSpan="8" className="text-center py-5">
                                                    <div className="text-body-secondary">No payments found</div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ) : (
                                            payments.map((payment) => (
                                                <CTableRow key={payment._id}>
                                                    <CTableDataCell>
                                                        <small className="d-block text-truncate" style={{ maxWidth: '120px' }} title={payment.transactionId}>
                                                            {payment.transactionId?.slice(-8) || 'N/A'}
                                                        </small>
                                                        {payment.couponCode && (
                                                            <CBadge color="info" className="mt-1">{payment.couponCode}</CBadge>
                                                        )}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <div>
                                                            <strong>{payment.user?.name || 'N/A'}</strong>
                                                            <br />
                                                            <small className="text-body-secondary">{payment.user?.email || 'N/A'}</small>
                                                        </div>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {payment.application ? (
                                                            <div>
                                                                <strong>{payment.application.applicationNumber}</strong>
                                                                <br />
                                                                <small className="text-body-secondary">
                                                                    {payment.application.course?.name?.slice(0, 20)}...
                                                                </small>
                                                            </div>
                                                        ) : payment.isService ? (
                                                            <span className="text-body-secondary">{payment.serviceName}</span>
                                                        ) : (
                                                            <span className="text-body-secondary">N/A</span>
                                                        )}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <div>
                                                            <strong>{formatCurrency(payment.amount)}</strong>
                                                            {payment.couponDiscount > 0 && (
                                                                <div className="text-success small">
                                                                    -{formatCurrency(payment.couponDiscount)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <small>{payment.paymentMethod || '-'}</small>
                                                        {payment.isWalletUsed && payment.walletPointsUsed > 0 && (
                                                            <div>
                                                                <CBadge color="info" className="mt-1">
                                                                    Wallet: {payment.walletPointsUsed} pts
                                                                </CBadge>
                                                            </div>
                                                        )}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CBadge color={getStatusBadgeColor(payment.status)}>
                                                            {payment.status}
                                                        </CBadge>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <small>{formatDate(payment.createdAt)}</small>
                                                    </CTableDataCell>
                                                    <CTableDataCell className="text-center">
                                                        <CButton
                                                            color="info"
                                                            variant="outline"
                                                            size="sm"
                                                            className="me-1"
                                                            title="View Details"
                                                            onClick={() => handleViewDetails(payment)}
                                                        >
                                                            <CIcon icon={cilBook} />
                                                        </CButton>
                                                        {payment.status === 'Pending' && (
                                                            <CButton
                                                                color="warning"
                                                                variant="outline"
                                                                size="sm"
                                                                className="me-1"
                                                                title="Update Status"
                                                                onClick={() => handleStatusUpdate(payment)}
                                                            >
                                                                <CIcon icon={cilPencil} />
                                                            </CButton>
                                                        )}
                                                        {payment.status === 'Completed' && (
                                                            <CButton
                                                                color="danger"
                                                                variant="outline"
                                                                size="sm"
                                                                title="Refund"
                                                                onClick={() => handleStatusUpdate(payment)}
                                                            >
                                                                <CIcon icon={cilTrash} />
                                                            </CButton>
                                                        )}
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        )}
                                    </CTableBody>
                                </CTable>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="d-flex justify-content-center mt-3">
                                        <CPagination>
                                            <CPaginationItem
                                                disabled={pagination.page === 1}
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            >
                                                Previous
                                            </CPaginationItem>
                                            {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                                                let pageNum
                                                if (pagination.pages <= 5) pageNum = i + 1
                                                else if (pagination.page <= 3) pageNum = i + 1
                                                else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                                                else pageNum = pagination.page - 2 + i
                                                return (
                                                    <CPaginationItem
                                                        key={pageNum}
                                                        active={pageNum === pagination.page}
                                                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                                    >
                                                        {pageNum}
                                                    </CPaginationItem>
                                                )
                                            })}
                                            <CPaginationItem
                                                disabled={pagination.page === pagination.pages}
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            >
                                                Next
                                            </CPaginationItem>
                                        </CPagination>
                                    </div>
                                )}
                            </>
                        )}
                    </CCardBody>
                </CCard>

                {/* Payment Detail Modal */}
                {showModal && selectedPayment && (
                    <ApplicationDetailModal
                        visible={showModal}
                        application={selectedPayment}  // ← Payment object passed here
                        onClose={() => {
                            setShowModal(false)
                            setSelectedPayment(null)
                        }}
                        onUpdate={handleRefresh}
                        isPaymentDetail={true}  // ← Enable payment detail mode
                    />
                )}

                {/* Status Update Modal */}
                <CModal visible={showStatusModal} onClose={() => setShowStatusModal(false)} size="lg">
                    <CModalHeader>
                        <CModalTitle>Update Payment Status</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        {selectedPayment && (
                            <>
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <strong>Transaction:</strong> {selectedPayment.transactionId}
                                    </CCol>
                                    <CCol md={6}>
                                        <strong>Current Status:</strong>{' '}
                                        <CBadge color={getStatusBadgeColor(selectedPayment.status)}>
                                            {selectedPayment.status}
                                        </CBadge>
                                    </CCol>
                                </CRow>
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}
                                    </CCol>
                                    <CCol md={6}>
                                        <strong>User:</strong> {selectedPayment.user?.name}
                                    </CCol>
                                </CRow>

                                <CForm>
                                    <CRow className="mb-3">
                                        <CCol md={6}>
                                            <CFormLabel>New Status *</CFormLabel>
                                            <CFormSelect
                                                value={statusUpdateData.status}
                                                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, status: e.target.value }))}
                                            >
                                                {statusOptions.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormLabel>Reason</CFormLabel>
                                            <CFormInput
                                                placeholder="Enter reason for status change"
                                                value={statusUpdateData.reason}
                                                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, reason: e.target.value }))}
                                            />
                                        </CCol>
                                    </CRow>
                                    {statusUpdateData.status === 'Refunded' && (
                                        <CRow className="mb-3">
                                            <CCol md={6}>
                                                <CFormLabel>Refund Amount (₹) *</CFormLabel>
                                                <CFormInput
                                                    type="number"
                                                    min="0"
                                                    max={selectedPayment.amount}
                                                    value={statusUpdateData.refundAmount}
                                                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, refundAmount: e.target.value }))}
                                                />
                                                <small className="text-body-secondary">
                                                    Max: {formatCurrency(selectedPayment.amount)}
                                                </small>
                                            </CCol>
                                        </CRow>
                                    )}
                                </CForm>
                            </>
                        )}
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowStatusModal(false)}>
                            Cancel
                        </CButton>
                        <CButton color="primary" onClick={submitStatusUpdate} disabled={loading}>
                            {loading ? <CSpinner size="sm" /> : 'Update Status'}
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCol>
        </CRow>
    )
}

export default PaymentManagement