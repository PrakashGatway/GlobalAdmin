import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CBadge,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CAlert,
  CSpinner,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormTextarea,
  CRow as FlexRow,
  CCardTitle,
  CCardText,
  CRow as GridRow,
  CCol as GridCol,
  CListGroup,
  CListGroupItem,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CRow as StatsRow,
  CCol as StatsCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMagnifyingGlass,
  cilReload,
  cilFilter,
  cilFilterX,
  cilCalendar,
  cilUser,
  cilEnvelopeClosed,
  cilTag,
  cilClock,
  cilCheck,
  cilX,
  cilSend,
  cilDescription,
  cilStar,
  cilInfo,
  cilPlus,
  cilChatBubble,
  cilHistory,
  cilSettings,
} from '@coreui/icons'
import supportService from '../../services/supportService'
import { formatDistanceToNow, format } from 'date-fns'

const Support = () => {
  // State for tickets data
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketDetails, setTicketDetails] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    user: '',
    dateRange: {
      start: '',
      end: ''
    },
    sortBy: 'createdAt',
    order: 'desc'
  })

  // UI state
  const [showFilters, setShowFilters] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    pending: 0,
    resolved: 0,
    closed: 0,
    highPriority: 0
  })

  // Categories and priorities
  const categories = ['Technical', 'Billing', 'Account', 'General', 'Other']
  const priorities = ['Low', 'Medium', 'High', 'Critical']
  const statuses = ['open', 'pending', 'resolved', 'closed']

  // Fetch tickets with filters and pagination
  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const queryParams = {
        page: currentPage,
        limit: pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.user && { user: filters.user }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateRange.start && { fromDate: filters.dateRange.start }),
        ...(filters.dateRange.end && { toDate: filters.dateRange.end }),
        sortBy: filters.sortBy,
        order: filters.order
      }

      const response = await supportService.getTickets(queryParams)

      if (response.success) {
        setTickets(response.data || [])
        setTotalCount(response.pagination?.total || 0)

        // Calculate stats
        const data = response.data || []
        setStats({
          total: response.pagination?.total || 0,
          open: data.filter(t => t.status === 'open').length,
          pending: data.filter(t => t.status === 'pending').length,
          resolved: data.filter(t => t.status === 'resolved').length,
          closed: data.filter(t => t.status === 'closed').length,
          highPriority: data.filter(t => t.priority === 'High' || t.priority === 'Critical').length
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, filters])

  // Initial fetch
  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setCurrentPage(1)
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
      category: '',
      priority: '',
      user: '',
      dateRange: {
        start: '',
        end: ''
      },
      sortBy: 'createdAt',
      order: 'desc'
    })
    setCurrentPage(1)
  }

  // Handle view ticket details
  const handleViewTicket = async (ticket) => {
    setSelectedTicket(ticket)
    setTicketDetails(ticket)
    setActiveTab('details')
    setReplyText('')
    setShowTicketModal(true)
  }

  // Handle reply to ticket
  const handleReply = async () => {
    if (!replyText.trim()) {
      setError('Please enter a reply')
      return
    }

    setReplying(true)
    setError('')

    try {
      const response = await supportService.replyToTicket(selectedTicket._id, replyText)

      if (response.success) {
        setSuccess('Reply sent successfully')
        setReplyText('')

        // Update the ticket details with new reply
        setTicketDetails(response.data)
        setSelectedTicket(response.data)

        // Refresh tickets list
        fetchTickets()
      }
    } catch (err) {
      setError(err.message || 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  // Handle update ticket status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return

    try {
      const response = await supportService.updateTicket(selectedTicket._id, { status: newStatus })

      if (response.success) {
        setSuccess(`Ticket status updated to ${newStatus}`)
        setTicketDetails(response.data)
        setSelectedTicket(response.data)
        fetchTickets()
      }
    } catch (err) {
      setError(err.message || 'Failed to update status')
    }
  }

  // Handle delete confirmation
  const handleDeleteClick = (ticket) => {
    setDeletingId(ticket._id)
    setShowDeleteModal(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return

    setLoading(true)
    try {
      const response = await supportService.deleteTicket(deletingId)
      if (response.success) {
        setSuccess('Ticket deleted successfully')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchTickets()
      }
    } catch (err) {
      setError(err.message || 'Failed to delete ticket')
    } finally {
      setLoading(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const colors = {
      open: 'info',
      pending: 'warning',
      resolved: 'success',
      closed: 'secondary'
    }
    return <CBadge color={colors[status] || 'primary'}>{status.toUpperCase()}</CBadge>
  }

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const colors = {
      Low: 'success',
      Medium: 'info',
      High: 'warning',
      Critical: 'danger'
    }
    return <CBadge color={colors[priority] || 'secondary'}>{priority}</CBadge>
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

        {/* Stats Cards */}
        {/* <CRow className="mb-4">
          <CCol sm={6} lg={2}>
            <CCard className="text-white bg-info">
              <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis-inverse">Total</div>
                  <div className="fs-4 fw-semibold">{stats.total}</div>
                </div>
                <CIcon icon={cilTag} size="xl" className="opacity-25" />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={2}>
            <CCard className="text-white bg-primary">
              <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis-inverse">Open</div>
                  <div className="fs-4 fw-semibold">{stats.open}</div>
                </div>
                <CIcon icon={cilEnvelopeClosed} size="xl" className="opacity-25" />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={2}>
            <CCard className="text-white bg-warning">
              <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis-inverse">Pending</div>
                  <div className="fs-4 fw-semibold">{stats.pending}</div>
                </div>
                <CIcon icon={cilClock} size="xl" className="opacity-25" />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={2}>
            <CCard className="text-white bg-success">
              <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis-inverse">Resolved</div>
                  <div className="fs-4 fw-semibold">{stats.resolved}</div>
                </div>
                <CIcon icon={cilCheck} size="xl" className="opacity-25" />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={2}>
            <CCard className="text-white bg-secondary">
              <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis-inverse">Closed</div>
                  <div className="fs-4 fw-semibold">{stats.closed}</div>
                </div>
                <CIcon icon={cilX} size="xl" className="opacity-25" />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={2}>
            <CCard className="text-white bg-danger">
              <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis-inverse">High Priority</div>
                  <div className="fs-4 fw-semibold">{stats.highPriority}</div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow> */}

        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <strong>Support Tickets</strong>
              </h5>
              <small className="text-body-secondary">
                Total {totalCount} tickets
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
              <CButton color="secondary" variant="outline" onClick={fetchTickets}>
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
                          placeholder="Search tickets..."
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
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    <CCol md={2}>
                      <CFormSelect
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    {/* <CCol md={2}>
                      <CFormSelect
                        name="priority"
                        value={filters.priority}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Priorities</option>
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </CFormSelect>
                    </CCol> */}

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

                    <CCol md={2}>
                      <CFormSelect
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                      >
                        <option value="createdAt">Sort by Date</option>
                        <option value="ticketNumber">Sort by Ticket #</option>
                        <option value="priority">Sort by Priority</option>
                        <option value="status">Sort by Status</option>
                      </CFormSelect>
                    </CCol>

                    <CCol md={2}>
                      <CFormSelect
                        name="order"
                        value={filters.order}
                        onChange={handleFilterChange}
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </CFormSelect>
                    </CCol>

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

            {/* Tickets List */}
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
              </div>
            ) : (
              <>
                <CListGroup flush className="border">
                  {tickets.length === 0 ? (
                    <CListGroupItem className="text-center py-5">
                      <div className="text-body-secondary">No tickets found</div>
                    </CListGroupItem>
                  ) : (
                    tickets.map((ticket, index) => (
                      <CListGroupItem
                        key={ticket._id}
                        className="ticket-item"
                        onClick={() => handleViewTicket(ticket)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CRow className="align-items-center">
                          <CCol md={2}>
                            <small className="text-muted">#{ticket.ticketNumber}</small>
                          </CCol>
                          <CCol md={3}>
                            <div className="fw-semibold">{ticket.subject}</div>

                          </CCol>
                          <CCol md={2}>
                            <CBadge color="secondary">{ticket.category}</CBadge>
                          </CCol>
                          <CCol md={2}>
                            {getPriorityBadge(ticket.priority)}
                          </CCol>
                          <CCol md={2}>
                            {getStatusBadge(ticket.status)}
                          </CCol>
                          <CCol md={1}>
                            <small className="text-muted">
                              {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </small>
                          </CCol>
                        </CRow>
                        {ticket.reply?.length > 0 && (
                          <CRow className="">
                            <CCol>
                              <small className="text-primary">
                                <CIcon icon={cilChatBubble} size="sm" className="me-1" />
                                {ticket.reply.length} {ticket.reply.length === 1 ? 'reply' : 'replies'}
                              </small>
                            </CCol>
                          </CRow>
                        )}
                      </CListGroupItem>
                    ))
                  )}
                </CListGroup>

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

        {/* Ticket Details Modal */}
        <CModal
          visible={showTicketModal}
          onClose={() => {
            setShowTicketModal(false)
            setSelectedTicket(null)
            setTicketDetails(null)
          }}
          size="lg"
        >
          <CModalHeader>
            <CModalTitle>
              Ticket #{ticketDetails?.ticketNumber}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CNav variant="tabs" className="mb-3">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'details'}
                  onClick={() => setActiveTab('details')}
                >
                  <CIcon icon={cilInfo} className="me-2" />
                  Details
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'conversation'}
                  onClick={() => setActiveTab('conversation')}
                >
                  <CIcon icon={cilChatBubble} className="me-2" />
                  Conversation ({ticketDetails?.reply?.length || 0})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'history'}
                  onClick={() => setActiveTab('history')}
                >
                  <CIcon icon={cilHistory} className="me-2" />
                  History
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              {/* Details Tab */}
              <CTabPane visible={activeTab === 'details'}>
                {ticketDetails && (
                  <>
                    <CRow className="mb-3">
                      <CCol md={6}>
                        <p><strong>Subject:</strong> {ticketDetails.subject}</p>
                        <p><strong>Category:</strong> {ticketDetails.category}</p>
                        <p><strong>Priority:</strong> {getPriorityBadge(ticketDetails.priority)}</p>
                      </CCol>
                      <CCol md={6}>
                        <p><strong>Status:</strong> {getStatusBadge(ticketDetails.status)}</p>
                        <p><strong>Email:</strong> {ticketDetails.email || 'N/A'}</p>
                        <p><strong>Created:</strong> {format(new Date(ticketDetails.createdAt), 'PPpp')}</p>
                      </CCol>
                    </CRow>

                    <div className="mb-3">
                      <strong>Description:</strong>
                      <p className="mt-2 p-3 bg-light rounded">
                        {ticketDetails.description || 'No description provided'}
                      </p>
                    </div>

                    {ticketDetails.relatedIssue && (
                      <div className="mb-3">
                        <strong>Related Issue:</strong>
                        <p className="mt-2">{ticketDetails.relatedIssue}</p>
                      </div>
                    )}

                    {ticketDetails.resolution && (
                      <div className="mb-3">
                        <strong>Resolution:</strong>
                        <p className="mt-2 p-3 bg-success bg-opacity-10 rounded">
                          {ticketDetails.resolution}
                        </p>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="mt-4">
                      <strong>Update Status:</strong>
                      <div className="d-flex gap-2 mt-2">
                        {statuses.map(status => (
                          <CButton
                            key={status}
                            color={status === ticketDetails.status ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleUpdateStatus(status)}
                            disabled={status === ticketDetails.status}
                          >
                            {status}
                          </CButton>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CTabPane>

              {/* Conversation Tab */}
              <CTabPane visible={activeTab === 'conversation'}>
                {ticketDetails && (
                  <>

                    {ticketDetails.reply && ticketDetails.reply.length > 0 && (
                      <div className="mb-4">
                        <div
                          style={{
                            height: "300px",
                            overflowY: "auto",
                            padding: "15px",
                            backgroundColor: "#efeae2",
                            borderRadius: "10px",
                          }}
                        >
                          {ticketDetails.reply.map((reply, index) => {
                            const isUser = reply.user === ticketDetails.user;

                            return (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  justifyContent: isUser ? "flex-start" : "flex-end",
                                  marginBottom: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    maxWidth: "70%",
                                    backgroundColor: isUser ? "#ffffff" : "#d9fdd3",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    borderTopLeftRadius: isUser ? "0px" : "10px",
                                    borderTopRightRadius: isUser ? "10px" : "0px",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                                    position: "relative",
                                  }}
                                >
                                 

                                  {/* Message */}
                                  <div
                                    style={{
                                      fontSize: "14px",
                                      color: "#111b21",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {reply.description}
                                  </div>

                                  {/* Time */}
                                  <div
                                    style={{
                                      fontSize: "9px",
                                      color: "#667781",
                                      textAlign: "right",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Reply Form */}
                    <div className="d-flex gap-1">
                      <CFormInput
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className=""
                      />
                      <CButton
                        color="primary"
                        onClick={handleReply}
                        disabled={replying || !replyText.trim()}
                      >
                        {replying ? (
                          <>
                            <CSpinner size="sm" className="" />
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilSend} className="" />
                          </>
                        )}
                      </CButton>
                    </div>
                  </>
                )}
              </CTabPane>

              {/* History Tab */}
              <CTabPane visible={activeTab === 'history'}>
                <p className="text-muted text-center py-5">
                  Activity history will be shown here
                </p>
              </CTabPane>
            </CTabContent>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="danger"
              variant="outline"
              onClick={() => handleDeleteClick(ticketDetails)}
            >
              Delete Ticket
            </CButton>
            <CButton
              color="secondary"
              onClick={() => {
                setShowTicketModal(false)
                setSelectedTicket(null)
                setTicketDetails(null)
              }}
            >
              Close
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>Are you sure you want to delete this ticket? This action cannot be undone.</p>
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
                'Delete Ticket'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Support