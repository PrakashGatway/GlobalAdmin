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
  CFormCheck,
  CTooltip,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilReload,
  cilUser,
  cilUserX,
  cilCalendar,
  cilClock,
  cilCheck,
  cilX,
  cilFilter,
  cilSortAscending,
  cilSortDescending,
  cilViewModule,
  cilViewQuilt,
  cilSearch,
  cilViewStream,
} from '@coreui/icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, formatDistanceToNow, isValid } from 'date-fns'
import notificationService from '../../services/notificationService'

// Zod validation schema
const notificationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message too long'),
  type: z.enum([
    'system', 'admin', 'missing_requirement', 'note', 'application_status',
    'deadline_reminder', 'payment_update', 'appointment_reminder'
  ]),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  userId: z.string().optional().or(z.literal('')),
  userIds: z.string().optional().or(z.literal('')),
  redirectUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  coverImage: z.string().url('Invalid URL format').optional().or(z.literal('')),
  validFrom: z.string().optional().or(z.literal('')),
  validTo: z.string().refine((val) => !val || isValid(new Date(val)), 'Invalid date'),
  usageLimit: z.string().optional().or(z.literal('')),
  sendEmail: z.boolean().default(false),
  sendPush: z.boolean().default(false),
  targetRoles: z.array(z.string()).optional(),
  targetStatuses: z.array(z.string()).optional(),
}).refine((data) => {
  // Custom validation: validTo must be after validFrom
  if (data.validFrom && data.validTo) {
    return new Date(data.validTo) > new Date(data.validFrom)
  }
  return true
}, {
  message: 'Valid To must be after Valid From',
  path: ['validTo']
})

const AdminNotifications = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [notificationMode, setNotificationMode] = useState('single') // single, bulk, global
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(15)
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    status: '',
    dateRange: ''
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // React Hook Form setup
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'system',
      priority: 'medium',
      userId: '',
      userIds: '',
      redirectUrl: '',
      coverImage: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      sendEmail: false,
      sendPush: false,
      targetRoles: [],
      targetStatuses: [],
    }
  })

  const watchType = watch('type')
  const watchDiscountType = watch('discountType') // for conditional fields

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: itemsPerPage,
        search: searchTerm,
        ...filters,
        sortBy,
        sortOrder
      }
      
      const response = await notificationService.getNotifications(params)
      if (response.success) {
        setNotifications(response.data?.notifications || [])
        setTotalPages(response.data?.pagination?.pages || 1)
        setTotalItems(response.data?.pagination?.total || 0)
        setCurrentPage(page)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filters, sortBy, sortOrder, itemsPerPage])

  // Initial fetch + refresh on filter change
  useEffect(() => {
    fetchNotifications(1)
  }, [fetchNotifications])

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchNotifications(page)
    }
  }

  // Handle form input change for non-controlled fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setValue(name, type === 'checkbox' ? checked : value, { shouldValidate: true })
    clearErrors(name)
  }

  // Handle edit - populate form with notification data
  const handleEdit = (notification) => {
    setNotificationMode(notification.isGlobal ? 'global' : notification.userIds?.length > 1 ? 'bulk' : 'single')
    
    reset({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'system',
      priority: notification.priority || 'medium',
      userId: notification.recipient || '',
      userIds: notification.userIds?.join(', ') || '',
      redirectUrl: notification.redirectUrl || '',
      coverImage: notification.coverImage || '',
      validFrom: notification.validFrom ? format(new Date(notification.validFrom), 'yyyy-MM-dd') : '',
      validTo: notification.validTo ? format(new Date(notification.validTo), 'yyyy-MM-dd') : '',
      usageLimit: notification.usageLimit?.toString() || '',
      sendEmail: notification.channels?.email || false,
      sendPush: notification.channels?.push || false,
      targetRoles: notification.targetFilters?.roles || [],
      targetStatuses: notification.targetFilters?.statuses || [],
    })
    
    setEditingId(notification._id || notification.id)
    setError('')
    setShowModal(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (notification) => {
    setDeletingId(notification._id || notification.id)
    setShowDeleteModal(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return

    setLoading(true)
    try {
      const response = await notificationService.deleteNotification(deletingId)
      if (response.success) {
        setSuccess('Notification deleted successfully')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchNotifications(currentPage)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete notification')
    } finally {
      setLoading(false)
    }
  }

  // Handle form submit
  const onSubmit = async (data) => {
    setError('')
    setSuccess('')

    try {
      const basePayload = {
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type,
        priority: data.priority,
        redirectUrl: data.redirectUrl || undefined,
        coverImage: data.coverImage || undefined,
        validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : undefined,
        validTo: data.validTo ? new Date(data.validTo).toISOString() : undefined,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : undefined,
        channels: {
          inApp: true,
          email: data.sendEmail,
          push: data.sendPush,
        },
        metadata: {
          sentBy: 'admin',
          sentAt: new Date().toISOString(),
        },
        _id: editingId
      }

      let response

      if (notificationMode === 'single') {
        if (!data.userId) throw new Error('User ID is required for single user notification')
        response = await notificationService.sendToUser({
          ...basePayload,
          userId: data.userId,

        })
      } else if (notificationMode === 'bulk') {
        const userIds = data.userIds
          ?.split(',')
          .map(id => id.trim())
          .filter(id => id)
        
        if (!userIds || userIds.length === 0) throw new Error('At least one user ID is required')
        
        response = await notificationService.sendToUsers({
          ...basePayload,
          userIds,
        })
      } else {
        // Global notification
        const globalPayload = { ...basePayload }
        if (data.targetRoles?.length > 0) {
          globalPayload.targetFilters = { 
            ...globalPayload.targetFilters, 
            roles: data.targetRoles 
          }
        }
        if (data.targetStatuses?.length > 0) {
          globalPayload.targetFilters = { 
            ...globalPayload.targetFilters, 
            statuses: data.targetStatuses 
          }
        }
        response = await notificationService.sendGlobal(globalPayload)
      }

      if (response.success) {
        setSuccess(response.message || 'Notification sent successfully')
        setShowModal(false)
        reset()
        setEditingId(null)
        fetchNotifications(1) // Reset to first page after creating
      }
    } catch (err) {
      setError(err.message || 'Failed to send notification')
    }
  }

  // Handle view details
  const handleViewDetails = (notification) => {
    setSelectedNotification(notification)
    setShowDetailsModal(true)
  }

  // Handle mark as read/unread
  const handleToggleRead = async (notificationId, recipientId, currentRead) => {
    try {
      const response = await notificationService.toggleReadStatus(recipientId, !currentRead)
      if (response.success) {
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: !currentRead } : n
        ))
        setSuccess(`Marked as ${!currentRead ? 'read' : 'unread'}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to update status')
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchNotifications(currentPage)
    setSuccess('Notifications refreshed')
    setTimeout(() => setSuccess(''), 3000)
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({ type: '', priority: '', status: '', dateRange: '' })
    setSearchTerm('')
    setCurrentPage(1)
    fetchNotifications(1)
  }

  // Get status badge
  const getStatusBadge = (notification) => {
    const now = new Date()
    const validTo = notification.validTo ? new Date(notification.validTo) : null

    if (notification.isGlobal) {
      return <CBadge color="primary">Global</CBadge>
    }

    if (validTo && now > validTo) {
      return <CBadge color="danger">Expired</CBadge>
    }

    if (notification.usageLimit && notification.usedCount >= notification.usageLimit) {
      return <CBadge color="warning">Limit Reached</CBadge>
    }

    return <CBadge color="success">Active</CBadge>
  }

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const config = {
      high: { color: 'danger', label: 'High' },
      medium: { color: 'warning', label: 'Medium' },
      low: { color: 'success', label: 'Low' }
    }
    const { color, label } = config[priority] || config.medium
    return <CBadge color={color}>{label}</CBadge>
  }

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      system: cilBell,
      admin: cilBell,
      missing_requirement: cilX,
      note: cilPencil,
      application_status: cilCheck,
      deadline_reminder: cilClock,
      payment_update: cilCalendar,
      appointment_reminder: cilCalendar,
    }
    return icons[type] || cilBell
  }

  // Filter and search notifications (client-side for display)
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipient?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !filters.type || notification.type === filters.type
    const matchesPriority = !filters.priority || notification.priority === filters.priority
    const matchesStatus = !filters.status || 
      (filters.status === 'active' && !notification.isRead) ||
      (filters.status === 'read' && notification.isRead)

    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  return (
    <CRow>
      <CCol xs={12}>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')} className="animate-fade-in">
            {error}
          </CAlert>
        )}
        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess('')} className="animate-fade-in">
            {success}
          </CAlert>
        )}

        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="mb-0">
                <strong>
                  Notification Management
                </strong>
              </h5>
              <small className="text-body-secondary">Create and manage system notifications</small>
            </div>
            <div className="d-flex gap-2">
              <CButton
                color="primary"
                className="btn-animated"
                onClick={() => {
                  reset()
                  setEditingId(null)
                  setNotificationMode('single')
                  setShowModal(true)
                }}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Create Notification
              </CButton>
              <CTooltip content="Refresh">
                <CButton 
                  color="secondary" 
                  variant="outline" 
                  className="btn-animated" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <CIcon icon={cilReload} className={loading ? 'spin' : ''} />
                </CButton>
              </CTooltip>
            </div>
          </CCardHeader>

          <CCardBody>
            {/* Search and Filters */}
            <CRow className="mb-3 g-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilMagnifyingGlass} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Search by title, message, or user..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </CInputGroup>
              </CCol>
              
              <CCol md={2}>
                <CFormSelect
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="system">System</option>
                  <option value="admin">Admin</option>
                  <option value="missing_requirement">Missing Requirement</option>
                  <option value="note">Note</option>
                  <option value="application_status">Application Status</option>
                  <option value="deadline_reminder">Deadline Reminder</option>
                  <option value="payment_update">Payment Update</option>
                </CFormSelect>
              </CCol>
              
              <CCol md={2}>
                <CFormSelect
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </CFormSelect>
              </CCol>
              
              <CCol md={2}>
                <CFormSelect
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Unread</option>
                  <option value="read">Read</option>
                  <option value="expired">Expired</option>
                </CFormSelect>
              </CCol>
              
              <CCol md={2} className="d-flex gap-2">
                <CButton 
                  color="info" 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  className="flex-grow-1"
                >
                  Clear
                </CButton>
                <CDropdown>
                  <CDropdownToggle color="secondary" variant="outline" size="sm" caret>
                    <CIcon icon={cilFilter} />
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={() => handleSort('createdAt')}>
                      Sort by Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleSort('priority')}>
                      Sort by Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleSort('type')}>
                      Sort by Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CCol>
            </CRow>

            {/* Notifications Table */}
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
                <div className="mt-2 text-body-secondary">Loading notifications...</div>
              </div>
            ) : (
              <>
                <CTable align="middle" className="mb-0 border" >
                  <CTableHead color="light" className=''>
                    <CTableRow>
                   
                      <CTableHeaderCell 
                        className="cursor-pointer"
                        onClick={() => handleSort('title')}
                      >
                        Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell 
                        className="cursor-pointer"
                        onClick={() => handleSort('priority')}
                      >
                        Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Recipient</CTableHeaderCell>
                      <CTableHeaderCell 
                        className="cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredNotifications.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="text-center py-5">
                          <div className="text-body-secondary">
                            <CIcon icon={cilBell} size="3xl" className="mb-3 opacity-50" />
                            <div>No notifications found</div>
                            <small>Try adjusting your search or filters</small>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      filteredNotifications.map((notification, index) => (
                        <CTableRow 
                          key={notification._id || notification.id} 
                          className={`table-row-hover animate-fade-in ${!notification.isRead ? 'fw-bold' : ''}`}
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <strong>{notification.title}</strong>
                                {notification.message && (
                                  <small className="text-body-secondary d-block text-truncate" style={{ maxWidth: '250px' }}>
                                    {notification.message}
                                  </small>
                                )}
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="info" className="text-capitalize">
                              {notification.type?.replace('_', ' ')}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {getPriorityBadge(notification.priority)}
                          </CTableDataCell>
                          <CTableDataCell>
                            {notification.isGlobal ? (
                              <CBadge color="primary">
                                <CIcon icon={cilSearch} className="me-1" />
                                Global
                              </CBadge>
                            ) : notification.userIds?.length > 1 ? (
                              <CBadge color="info">
                                <CIcon icon={cilUserX} className="me-1" />
                                {notification.userIds.length} Users
                              </CBadge>
                            ) : (
                              <span className="text-truncate d-block" style={{ maxWidth: '150px' }}>
                                {notification.recipient?.email || notification.recipient || '-'}
                              </span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <div>{notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : '-'}</div>
                              <small className="text-body-secondary">
                                {notification.createdAt ? format(new Date(notification.createdAt), 'MMM dd, yyyy') : ''}
                              </small>
                            </div>
                          </CTableDataCell>
                         
                          <CTableDataCell>
                            {getStatusBadge(notification)}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <div className="d-flex justify-content-center gap-1">
                              <CTooltip content="View Details">
                                <CButton
                                  color="info"
                                  variant="outline"
                                  size="sm"
                                  className="btn-animated"
                                  onClick={() => handleViewDetails(notification)}
                                >
                                  <CIcon icon={cilViewStream} />
                                </CButton>
                              </CTooltip>
                             
                              <CTooltip content="Edit">
                                <CButton
                                  color="primary"
                                  variant="outline"
                                  size="sm"
                                  className="btn-animated"
                                  onClick={() => handleEdit(notification)}
                                >
                                  <CIcon icon={cilPencil} />
                                </CButton>
                              </CTooltip>
                              <CTooltip content="Delete">
                                <CButton
                                  color="danger"
                                  variant="outline"
                                  size="sm"
                                  className="btn-animated"
                                  onClick={() => handleDeleteClick(notification)}
                                >
                                  <CIcon icon={cilTrash} />
                                </CButton>
                              </CTooltip>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                    <small className="text-body-secondary">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                    </small>
                    <CPagination align="end">
                      <CPaginationItem 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </CPaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <CPaginationItem
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </CPaginationItem>
                        )
                      })}
                      
                      <CPaginationItem 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
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

        {/* Create/Edit Notification Modal */}
        <CModal 
          visible={showModal} 
          onClose={() => {
            setShowModal(false)
            reset()
            setEditingId(null)
          }} 
          size="xl" 
          className="modal-animate"
          scrollable
        >
          <CModalHeader closeButton>
            <CModalTitle>
              {editingId ? 'Edit Notification' : 'Create New Notification'}
            </CModalTitle>
          </CModalHeader>
          
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <CModalBody className='' style={{overflow:"auto", maxHeight:"70vh"}}>
              {/* Mode Selection */}
              <div className="mb-4">
                <CFormLabel className="fw-bold">Notification Scope</CFormLabel>
                <div className="d-flex gap-2 flex-wrap">
                  {[
                    { id: 'single', label: 'Single User', icon: cilUser, desc: 'Send to one specific user' },
                    { id: 'bulk', label: 'Multiple Users', icon: cilUserX, desc: 'Send to multiple specific users' },
                    { id: 'global', label: 'Global', icon: cilSearch, desc: 'Send to all users (with optional filters)' },
                  ].map((mode) => (
                    <CFormCheck
                      key={mode.id}
                      type="radio"
                      id={`mode-${mode.id}`}
                      name="notificationMode"
                      label={
                        <span className="d-flex align-items-start gap-2">
                          <div>
                            <div className="fw-medium">{mode.label}</div>
                            <small className="text-body-secondary">{mode.desc}</small>
                          </div>
                        </span>
                      }
                      checked={notificationMode === mode.id}
                      onChange={() => {
                        setNotificationMode(mode.id)
                        clearErrors(['userId', 'userIds'])
                      }}
                      inline
                      className="me-3"
                    />
                  ))}
                </div>
              </div>

              {/* User Selection based on mode */}
              {notificationMode === 'single' && (
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="userId">
                      User ID <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="userId"
                      {...register('userId', { 
                        required: notificationMode === 'single' ? 'User ID is required' : false 
                      })}
                      placeholder="Enter user's ObjectId"
                      invalid={!!errors.userId}
                    />
                    {errors.userId && (
                      <div className="invalid-feedback d-block">{errors.userId.message}</div>
                    )}
                    <small className="text-muted">Find the user ID from the Users management page</small>
                  </CCol>
                </CRow>
              )}

              {notificationMode === 'bulk' && (
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="userIds">
                      User IDs (comma-separated) <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormTextarea
                      id="userIds"
                      {...register('userIds', { 
                        required: notificationMode === 'bulk' ? 'At least one user ID is required' : false,
                        validate: (value) => {
                          if (notificationMode !== 'bulk') return true
                          const ids = value?.split(',').map(id => id.trim()).filter(id => id)
                          return ids.length > 0 || 'At least one user ID is required'
                        }
                      })}
                      placeholder="id1, id2, id3..."
                      rows="3"
                      invalid={!!errors.userIds}
                      className="font-monospace"
                    />
                    {errors.userIds && (
                      <div className="invalid-feedback d-block">{errors.userIds.message}</div>
                    )}
                    <small className="text-muted">Enter MongoDB ObjectIds separated by commas</small>
                  </CCol>
                </CRow>
              )}

              {notificationMode === 'global' && (
                <CRow className="mb-3 p-3 bg-body-tertiary rounded">
                  <CCol md={12}>
                    <CFormLabel className="fw-bold">
                      <CIcon icon={cilFilter} className="me-2" />
                      Target Filters (Optional)
                    </CFormLabel>
                    <small className="text-muted d-block mb-3">
                      Leave empty to send to all users, or select specific roles/statuses
                    </small>
                    
                    <CRow>
                      <CCol md={6}>
                        <CFormLabel>Roles</CFormLabel>
                        <div className="d-flex flex-column gap-2">
                          {['user', 'counselor', 'admin', 'manager'].map((role) => (
                            <CFormCheck
                              key={role}
                              id={`role-${role}`}
                              label={role.charAt(0).toUpperCase() + role.slice(1)}
                              value={role}
                              checked={watch('targetRoles')?.includes(role)}
                              onChange={(e) => {
                                const current = watch('targetRoles') || []
                                const updated = e.target.checked
                                  ? [...current, role]
                                  : current.filter(r => r !== role)
                                setValue('targetRoles', updated)
                              }}
                            />
                          ))}
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Statuses</CFormLabel>
                        <div className="d-flex flex-column gap-2">
                          {['Active', 'Inactive', 'Suspended'].map((status) => (
                            <CFormCheck
                              key={status}
                              id={`status-${status}`}
                              label={status.charAt(0).toUpperCase() + status.slice(1)}
                              value={status}
                              checked={watch('targetStatuses')?.includes(status)}
                              onChange={(e) => {
                                const current = watch('targetStatuses') || []
                                const updated = e.target.checked
                                  ? [...current, status]
                                  : current.filter(s => s !== status)
                                setValue('targetStatuses', updated)
                              }}
                            />
                          ))}
                        </div>
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>
              )}

              {/* Common Fields */}
              <CRow className="mb-3">
                <CCol md={8}>
                  <CFormLabel htmlFor="title">
                    Title <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="title"
                    {...register('title')}
                    placeholder="Enter notification title"
                    invalid={!!errors.title}
                  />
                  {errors.title && (
                    <div className="invalid-feedback d-block">{errors.title.message}</div>
                  )}
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="priority">Priority</CFormLabel>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <CFormSelect {...field}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </CFormSelect>
                    )}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel htmlFor="message">
                    Message <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormTextarea
                    id="message"
                    {...register('message')}
                    placeholder="Enter notification message"
                    rows="4"
                    invalid={!!errors.message}
                  />
                  {errors.message && (
                    <div className="invalid-feedback d-block">{errors.message.message}</div>
                  )}
                  <small className="text-muted">
                    {watch('message')?.length || 0}/500 characters
                  </small>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="type">Notification Type</CFormLabel>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <CFormSelect {...field}>
                        <option value="system">System</option>
                        <option value="admin">Admin</option>
                        <option value="missing_requirement">Missing Requirement</option>
                        <option value="note">Note</option>
                        <option value="application_status">Application Status</option>
                        <option value="deadline_reminder">Deadline Reminder</option>
                        <option value="payment_update">Payment Update</option>
                        <option value="appointment_reminder">Appointment Reminder</option>
                      </CFormSelect>
                    )}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="redirectUrl">Redirect URL (Optional)</CFormLabel>
                  <CFormInput
                    type="url"
                    id="redirectUrl"
                    {...register('redirectUrl')}
                    placeholder="https://..."
                    invalid={!!errors.redirectUrl}
                  />
                  {errors.redirectUrl && (
                    <div className="invalid-feedback d-block">{errors.redirectUrl.message}</div>
                  )}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="validFrom">Valid From</CFormLabel>
                  <CFormInput
                    type="date"
                    id="validFrom"
                    {...register('validFrom')}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="validTo">Valid To</CFormLabel>
                  <CFormInput
                    type="date"
                    id="validTo"
                    {...register('validTo')}
                    invalid={!!errors.validTo}
                  />
                  {errors.validTo && (
                    <div className="invalid-feedback d-block">{errors.validTo.message}</div>
                  )}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="usageLimit">Usage Limit (Optional)</CFormLabel>
                  <CFormInput
                    type="number"
                    id="usageLimit"
                    {...register('usageLimit')}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                  <small className="text-muted">Number of times this notification can be shown</small>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Delivery Channels</CFormLabel>
                  <div className="d-flex gap-4">
                    <Controller
                      name="sendEmail"
                      control={control}
                      render={({ field }) => (
                        <CFormCheck
                          {...field}
                          id="sendEmail"
                          label="Email"
                          value={undefined}
                          checked={field.value}
                        />
                      )}
                    />
                    <Controller
                      name="sendPush"
                      control={control}
                      render={({ field }) => (
                        <CFormCheck
                          {...field}
                          id="sendPush"
                          label="Push Notification"
                          value={undefined}
                          checked={field.value}
                        />
                      )}
                    />
                  </div>
                  <small className="text-muted">In-app notification is always enabled</small>
                </CCol>
              </CRow>

              {/* Preview Section */}
              <div className="mt-4 p-3 bg-body-tertiary rounded">
                <CFormLabel className="fw-bold mb-2">Preview</CFormLabel>
                <div className="border rounded p-3 bg-white">
                  <div className="d-flex align-items-start gap-3">
                    <CBadge color="primary" className="p-2">
                      <CIcon icon={getTypeIcon(watch('type'))} />
                    </CBadge>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <strong>{watch('title') || 'Notification Title'}</strong>
                        {getPriorityBadge(watch('priority'))}
                      </div>
                      <p className="text-body-secondary mb-2 small">
                        {watch('message') || 'Notification message will appear here...'}
                      </p>
                      {watch('redirectUrl') && (
                        <small className="text-primary">
                          🔗 {watch('redirectUrl')}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CModalBody>
            
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => {
                  setShowModal(false)
                  reset()
                  setEditingId(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </CButton>
              <CButton 
                color="primary" 
                type="submit" 
                disabled={isSubmitting}
                className="btn-animated"
              >
                {isSubmitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : editingId ? (
                  'Update Notification'
                ) : (
                  'Send Notification'
                )}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal 
          visible={showDeleteModal} 
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingId(null)
          }} 
          className="modal-animate"
        >
          <CModalHeader closeButton>
            <CModalTitle>
              <CIcon icon={cilTrash} className="me-2 text-danger" />
              Confirm Delete
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>Are you sure you want to delete this notification?</p>
            <p className="text-body-secondary small">
              This action cannot be undone. The notification will be permanently removed from all user inboxes.
            </p>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => {
                setShowDeleteModal(false)
                setDeletingId(null)
              }}
              disabled={loading}
            >
              Cancel
            </CButton>
            <CButton 
              color="danger" 
              onClick={handleDelete} 
              disabled={loading}
              className="btn-animated"
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <CIcon icon={cilTrash} className="me-2" />
                  Delete Notification
                </>
              )}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* View Details Modal */}
        <CModal 
          visible={showDetailsModal} 
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedNotification(null)
          }} 
          size="lg"
          className="modal-animate"
        >
          <CModalHeader closeButton>
            <CModalTitle>
              <CIcon icon={cilViewModule} className="me-2" />
              Notification Details
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedNotification && (
              <div className="notification-details">
                <CRow className="mb-3">
                  <CCol md={8}>
                    <h5 className="mb-1">{selectedNotification.title}</h5>
                    <div className="d-flex gap-2 mb-2">
                      <CBadge color="info" className="text-capitalize">
                        {selectedNotification.type?.replace('_', ' ')}
                      </CBadge>
                      {getPriorityBadge(selectedNotification.priority)}
                      {getStatusBadge(selectedNotification)}
                    </div>
                  </CCol>
                  <CCol md={4} className="text-end">
                    <small className="text-body-secondary">
                      Created: {selectedNotification.createdAt ? format(new Date(selectedNotification.createdAt), 'PPP p') : '-'}
                    </small>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel className="text-muted small">Message</CFormLabel>
                    <p className="border rounded p-3 bg-body-tertiary">
                      {selectedNotification.message || 'No message content'}
                    </p>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel className="text-muted small">Recipient</CFormLabel>
                    <div>
                      {selectedNotification.isGlobal ? (
                        <CBadge color="primary">
                          <CIcon icon={cilSearch} className="me-1" />
                          All Users
                        </CBadge>
                      ) : selectedNotification.userIds?.length > 1 ? (
                        <CBadge color="info">
                          <CIcon icon={cilUserX} className="me-1" />
                          {selectedNotification.userIds.length} Specific Users
                        </CBadge>
                      ) : (
                        <span>{selectedNotification.recipient?.email || selectedNotification.recipient || 'Unknown'}</span>
                      )}
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="text-muted small">Delivery Channels</CFormLabel>
                    <div className="d-flex gap-2">
                      <CBadge color="success">In-App ✓</CBadge>
                      {selectedNotification.channels?.email && <CBadge color="info">Email ✓</CBadge>}
                      {selectedNotification.channels?.push && <CBadge color="warning">Push ✓</CBadge>}
                    </div>
                  </CCol>
                </CRow>

                {selectedNotification.redirectUrl && (
                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CFormLabel className="text-muted small">Redirect URL</CFormLabel>
                      <a 
                        href={selectedNotification.redirectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        {selectedNotification.redirectUrl}
                      </a>
                    </CCol>
                  </CRow>
                )}

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel className="text-muted small">Valid From</CFormLabel>
                    <div>{selectedNotification.validFrom ? format(new Date(selectedNotification.validFrom), 'PPP') : 'Immediate'}</div>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="text-muted small">Valid To</CFormLabel>
                    <div>
                      {selectedNotification.validTo ? (
                        <>
                          {format(new Date(selectedNotification.validTo), 'PPP')}
                          {new Date(selectedNotification.validTo) < new Date() && (
                            <CBadge color="danger" className="ms-2">Expired</CBadge>
                          )}
                        </>
                      ) : (
                        'No expiry'
                      )}
                    </div>
                  </CCol>
                </CRow>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default AdminNotifications