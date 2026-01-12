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
  CBadge,
  CButton,
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
  cilWallet,
  cilArrowRight,
  cilArrowLeft,
  cilMagnifyingGlass,
  cilFilter,
  cilReload,
} from '@coreui/icons'

const UserWallets = () => {
  const [searchTerm, setSearchTerm] = useState('')

  // Sample wallet data - replace with actual API call
  const wallets = [
    {
      id: 1,
      userId: 1,
      userName: 'John Doe',
      balance: 1250.50,
      currency: 'USD',
      status: 'Active',
      lastTransaction: '2024-03-15',
      transactionType: 'Credit',
    },
    {
      id: 2,
      userId: 2,
      userName: 'Jane Smith',
      balance: 850.25,
      currency: 'USD',
      status: 'Active',
      lastTransaction: '2024-03-14',
      transactionType: 'Debit',
    },
    {
      id: 3,
      userId: 3,
      userName: 'Bob Johnson',
      balance: 3200.75,
      currency: 'USD',
      status: 'Active',
      lastTransaction: '2024-03-13',
      transactionType: 'Credit',
    },
    {
      id: 4,
      userId: 1,
      userName: 'John Doe',
      balance: 500.00,
      currency: 'EUR',
      status: 'Active',
      lastTransaction: '2024-03-12',
      transactionType: 'Credit',
    },
  ]

  const filteredWallets = wallets.filter(
    (wallet) =>
      wallet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.currency.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <strong>User Wallets</strong>
              </h5>
              <small className="text-body-secondary">Manage user wallet balances and transactions</small>
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
                    placeholder="Search by user name or currency..."
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
                    <CDropdownItem>All Wallets</CDropdownItem>
                    <CDropdownItem>Active</CDropdownItem>
                    <CDropdownItem>Inactive</CDropdownItem>
                    <CDropdownItem>USD</CDropdownItem>
                    <CDropdownItem>EUR</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CCol>
            </CRow>
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell className="text-center">
                    <CIcon icon={cilWallet} />
                  </CTableHeaderCell>
                  <CTableHeaderCell>User Name</CTableHeaderCell>
                  <CTableHeaderCell>Balance</CTableHeaderCell>
                  <CTableHeaderCell>Currency</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Last Transaction</CTableHeaderCell>
                  <CTableHeaderCell>Transaction Type</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredWallets.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="7" className="text-center py-5">
                      <div className="text-body-secondary">No wallets found</div>
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredWallets.map((wallet) => (
                  <CTableRow key={wallet.id}>
                    <CTableDataCell className="text-center">
                      <CIcon icon={cilWallet} size="lg" />
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{wallet.userName}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-bold">
                        {wallet.balance.toLocaleString('en-US', {
                          style: 'currency',
                          currency: wallet.currency,
                        })}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{wallet.currency}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={wallet.status === 'Active' ? 'success' : 'secondary'}>
                        {wallet.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{wallet.lastTransaction}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {wallet.transactionType === 'Credit' ? (
                        <CBadge color="success">
                          <CIcon icon={cilArrowRight} className="me-1" />
                          Credit
                        </CBadge>
                      ) : (
                        <CBadge color="danger">
                          <CIcon icon={cilArrowLeft} className="me-1" />
                          Debit
                        </CBadge>
                      )}
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

export default UserWallets
