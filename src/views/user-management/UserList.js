import React, { useState, useEffect } from 'react'
import {
  CAvatar,
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilFilter,
  cilReload,
} from '@coreui/icons'
import userService from '../../services/userService'

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'Active',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userService.getUsers()
      if (response.success) {
        setUsers(response.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  // Handle edit - populate form with user data
  const handleEdit = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      status: user.status || 'Active',
    })
    setEditingId(user._id || user.id)
    setError('')
    setShowModal(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (user) => {
    setDeletingId(user._id || user.id)
    setShowDeleteModal(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return

    setLoading(true)
    try {
      const response = await userService.deleteUser(deletingId)
      if (response.success) {
        setSuccess('User deleted successfully')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchUsers()
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        // Update user
        const response = await userService.updateUser(editingId, formData)
        if (response.success) {
          setSuccess('User updated successfully')
          setShowModal(false)
          setEditingId(null)
          fetchUsers()
        }
      } else {
        // Create user (if needed)
        setError('Add user functionality not implemented yet')
      }
    } catch (err) {
      setError(err.message || 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'Active',
    })
    setEditingId(null)
    setError('')
    setSuccess('')
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm),
  )

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
        <CCard className="mb-4 card-hover animate-fade-in">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <strong>User Management</strong>
              </h5>
              <small className="text-body-secondary">Manage and monitor all users</small>
            </div>
            <div>
              <CButton color="secondary" variant="outline" onClick={fetchUsers}>
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
                    placeholder="Search users by name, email, or phone..."
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
                    <CDropdownItem>All Users</CDropdownItem>
                    <CDropdownItem>Active</CDropdownItem>
                    <CDropdownItem>Inactive</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
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
                      <CIcon icon={cilUser} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Phone</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUsers.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="8" className="text-center py-5">
                        <div className="text-body-secondary">No users found</div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <CTableRow key={user._id || user.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <CTableDataCell className="text-center">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            <CAvatar size="md" color="primary" textColor="white">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </CAvatar>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{user.name}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{user.email}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{user.phone}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="info" className="text-capitalize">
                            {user.role || 'user'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={user.status === 'Active' ? 'success' : 'secondary'}>
                            {user.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : '-'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="primary"
                            variant="outline"
                            size="sm"
                            className="me-2 btn-animated"
                            onClick={() => handleEdit(user)}
                            title="Edit User"
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            className="btn-animated"
                            onClick={() => handleDeleteClick(user)}
                            title="Delete User"
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

        {/* Edit User Modal */}
        <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg" className="modal-animate">
          <CModalHeader>
            <CModalTitle>{editingId ? 'Edit User' : 'Add New User'}</CModalTitle>
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
                    <CFormLabel htmlFor="name">
                      Full Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="email">
                      Email Address <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                      disabled={!!editingId}
                      className={editingId ? 'bg-body-secondary' : ''}
                    />
                    {editingId && (
                      <small className="text-muted">Email cannot be changed</small>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="phone">
                      Phone Number <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="role">Role</CFormLabel>
                    <CFormSelect
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="user">User</option>
                      <option value="counsellor">Counsellor</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>
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
                  <option value="Suspended">Suspended</option>
                </CFormSelect>
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
                  'Update User'
                ) : (
                  'Add User'
                )}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="modal-animate">
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
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
            <CButton color="danger" onClick={handleDelete} disabled={loading} className="btn-animated">
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default UserList
