import React, { useState } from 'react'
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilInfo,
  cilCheckCircle,
  cilXCircle,
  cilClock,
  cilMagnifyingGlass,
  cilFilter,
  cilReload,
} from '@coreui/icons'

const Support = () => {
  const [searchTerm, setSearchTerm] = useState('')

  // Sample support tickets data - replace with actual API call
  const tickets = [
    {
      id: 1,
      ticketNumber: 'TKT-001',
      subject: 'Login Issue',
      user: 'John Doe',
      email: 'john.doe@example.com',
      status: 'Open',
      priority: 'High',
      createdAt: '2024-03-15',
      updatedAt: '2024-03-15',
    },
    {
      id: 2,
      ticketNumber: 'TKT-002',
      subject: 'Payment Problem',
      user: 'Jane Smith',
      email: 'jane.smith@example.com',
      status: 'In Progress',
      priority: 'Medium',
      createdAt: '2024-03-14',
      updatedAt: '2024-03-15',
    },
    {
      id: 3,
      ticketNumber: 'TKT-003',
      subject: 'Account Verification',
      user: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      status: 'Resolved',
      priority: 'Low',
      createdAt: '2024-03-13',
      updatedAt: '2024-03-14',
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <CIcon icon={cilClock} className="text-warning" />
      case 'In Progress':
        return <CIcon icon={cilInfo} className="text-info" />
      case 'Resolved':
        return <CIcon icon={cilCheckCircle} className="text-success" />
      case 'Closed':
        return <CIcon icon={cilXCircle} className="text-secondary" />
      default:
        return <CIcon icon={cilInfo} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'warning'
      case 'In Progress':
        return 'info'
      case 'Resolved':
        return 'success'
      case 'Closed':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'danger'
      case 'Medium':
        return 'warning'
      case 'Low':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <strong>Support Tickets</strong>
              </h5>
              <small className="text-body-secondary">Manage and track all support requests</small>
            </div>
            <CButton color="secondary" variant="outline">
              <CIcon icon={cilReload} />
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilMagnifyingGlass} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Search tickets by number, subject, user, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={6} className="text-end">
                <CDropdown>
                  <CDropdownToggle color="secondary" variant="outline">
                    <CIcon icon={cilFilter} className="me-2" />
                    Filter
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem>All Tickets</CDropdownItem>
                    <CDropdownItem>Open</CDropdownItem>
                    <CDropdownItem>In Progress</CDropdownItem>
                    <CDropdownItem>Resolved</CDropdownItem>
                    <CDropdownItem>High Priority</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CCol>
            </CRow>
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                  <CTableHeaderCell>Ticket Number</CTableHeaderCell>
                  <CTableHeaderCell>Subject</CTableHeaderCell>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Priority</CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  <CTableHeaderCell>Updated At</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredTickets.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="9" className="text-center py-5">
                      <div className="text-body-secondary">No tickets found</div>
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                  <CTableRow key={ticket.id}>
                    <CTableDataCell className="text-center">
                      {getStatusIcon(ticket.status)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-bold">{ticket.ticketNumber}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{ticket.subject}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{ticket.user}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{ticket.email}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{ticket.createdAt}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{ticket.updatedAt}</div>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CBadge color={getStatusColor(ticket.status)}>{ticket.status}</CBadge>
                    </CTableDataCell>
                  </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Support
