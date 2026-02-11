import React, { useState, useEffect, useCallback } from 'react';
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
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
  CAlert,
  CPagination,
  CPaginationItem,
  CFormLabel,
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CTooltip,
  CFormCheck,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilFilter,
  cilFilterX,
  cilChevronBottom,
  cilChevronTop,
  cilOptions,
  cilUser,
  cilEnvelopeOpen,
  cilPhone,
  cilBan,
  cilCheckCircle,
  cilWarning
} from '@coreui/icons';
import UserForm from './UserForm';
import userService from '../../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    sort: '-createdAt',
    page: 1,
    limit: 10,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...filters,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
      };

      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const res = await userService.getUsers(params);
      if (res.success) {
        setUsers(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleSearchChange = (value) => {
    handleFilterChange('search', value);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setFilters(prev => ({ ...prev, limit: parseInt(limit), page: 1 }));
  };

  const handleSortChange = (sort) => {
    handleFilterChange('sort', sort);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
      sort: '-createdAt',
      page: 1,
      limit: 10,
    });
    setSelectedUsers([]);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const res = await userService.deleteUser(deletingId);
      if (res.success) {
        setSuccess('User deactivated successfully!');
        setShowDeleteModal(false);
        setDeletingId(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Delete failed');
      setShowDeleteModal(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      let res;
      if (editingUser) {
        res = await userService.updateUser(editingUser._id, data);
        if (res.success) setSuccess('User updated successfully!');
      } else {
        res = await userService.createUser(data);
        if (res.success) setSuccess('User created successfully!');
      }
      if (res.success) {
        setShowModal(false);
        setEditingUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action) => {
    try {
      if (action === 'activate') {
        await Promise.all(selectedUsers.map(id => userService.updateUserStatus(id, 'Active')));
        setSuccess('Selected users activated successfully!');
      } else if (action === 'deactivate') {
        await Promise.all(selectedUsers.map(id => userService.deleteUser(id)));
        setSuccess('Selected users deactivated successfully!');
      }
      setSelectedUsers([]);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Bulk action failed');
    }
  };

  const exportUsers = async () => {
    try {
      const blob = await userService.exportUsers(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Export failed');
    }
  };

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(key =>
    key !== 'page' &&
    key !== 'limit' &&
    key !== 'sort' &&
    filters[key] !== '' &&
    filters[key] !== null &&
    filters[key] !== undefined
  ).length;

  // Available options
  const roleOptions = ['admin', 'manager', 'counsellor', 'user'];
  const statusOptions = ['Active', 'Inactive', 'Suspended'];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: '-name', label: 'Name Z-A' },
    { value: 'email', label: 'Email A-Z' },
    { value: '-email', label: 'Email Z-A' },
  ];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'counsellor': return 'info';
      default: return 'primary';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'secondary';
      case 'Pending': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
        {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">User Management</h5>
              <small className="text-muted">Total: {total} users</small>
            </div>
            <div className="d-flex gap-2">
              <CDropdown>
                <CDropdownToggle color="secondary" variant="outline">
                  <CIcon icon={cilOptions} className="me-2" />
                  Sort
                </CDropdownToggle>
                <CDropdownMenu>
                  {sortOptions.map((option) => (
                    <CDropdownItem
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      active={filters.sort === option.value}
                    >
                      {option.label}
                    </CDropdownItem>
                  ))}
                </CDropdownMenu>
              </CDropdown>
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <CIcon icon={cilFilter} className="me-2" />
                Filters {activeFilterCount > 0 && <CBadge color="danger" className="ms-1">{activeFilterCount}</CBadge>}
                <CIcon icon={showFilters ? cilChevronTop : cilChevronBottom} className="ms-2" />
              </CButton>
              {/* <CButton
                color="success"
                variant="outline"
                onClick={exportUsers}
                disabled={loading}
              >
                
                Export
              </CButton> */}
              <CButton
                color="primary"
                onClick={() => {
                  setEditingUser(null);
                  setShowModal(true);
                }}
              >
                <CIcon icon={cilPlus} className="me-2" /> Add User
              </CButton>
            </div>
          </CCardHeader>

          {/* Filters Section */}
          {showFilters && (
            <CCardBody className="border-bottom">
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel>Search</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                    <CFormInput
                      placeholder="Search by name, email, or phone..."
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Role</CFormLabel>
                  <CFormSelect
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  >
                    <option value="">All Roles</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={12} className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <CFormSelect
                      style={{ width: '100px' }}
                      value={filters.limit}
                      onChange={(e) => handleLimitChange(e.target.value)}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </CFormSelect>
                    <span className="text-muted">per page</span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {/* {selectedUsers.length > 0 && (
                      <CDropdown className="me-2">
                        <CDropdownToggle color="warning" size="sm">
                          Bulk Actions ({selectedUsers.length})
                        </CDropdownToggle>
                        <CDropdownMenu>
                          <CDropdownItem onClick={() => handleBulkAction('activate')}>
                            <CIcon icon={cilCheckCircle} className="me-2 text-success" />
                            Activate Selected
                          </CDropdownItem>
                          <CDropdownItem onClick={() => handleBulkAction('deactivate')}>
                            <CIcon icon={cilBan} className="me-2 text-danger" />
                            Deactivate Selected
                          </CDropdownItem>
                        </CDropdownMenu>
                      </CDropdown>
                    )} */}
                    <CButton color="danger" variant="outline" onClick={clearAllFilters}>
                      <CIcon icon={cilFilterX} className="me-2" />
                      Clear Filters
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          )}

          <CCardBody>
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
                <div className="mt-2">Loading users...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-5">
                <CIcon icon={cilMagnifyingGlass} size="xxl" className="text-muted mb-3" />
                <h5>No users found</h5>
                <p className="text-muted">
                  {activeFilterCount > 0
                    ? 'Try changing your filters or clear them to see all users.'
                    : 'No users available. Create your first user.'}
                </p>
              </div>
            ) : (
              <>
                <CTable hover striped>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell width="50">
                        <CFormCheck
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={handleSelectAll}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Role</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Profile Status</CTableHeaderCell>
                      <CTableHeaderCell>Joined</CTableHeaderCell>
                      <CTableHeaderCell>Last Login</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {users.map((user) => (
                      <CTableRow key={user._id} className={!user.status || user.status === 'Inactive' ? 'text-muted' : ''}>
                        <CTableDataCell>
                          <CFormCheck
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <div className="avatar me-2">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.name}
                                  className="rounded-circle"
                                  width="32"
                                  height="32"
                                />
                              ) : (
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                  style={{ width: '32px', height: '32px' }}>
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="fw-semibold">{user.name}</div>
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <CIcon icon={cilEnvelopeOpen} className="me-2 text-muted" />
                            {user.email}
                          </div>
                          {user.phone ? (
                            <div className="d-flex align-items-center">
                              <CIcon icon={cilPhone} className="me-2 text-muted" />
                              {user.phone}
                            </div>
                          ) : '-'}

                        </CTableDataCell>

                        <CTableDataCell>
                          <CBadge color={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getStatusBadgeColor(user.status)}>
                            {user.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {(() => {
                            const completion = user?.profile?.profileCompletion ?? 0

                            return (
                              <div className="w-100">
                                <div className="progress" style={{ height: "20px" }}>
                                  <div
                                    className={`progress-bar ${completion >= 80
                                        ? "bg-success"
                                        : completion >= 40
                                          ? "bg-warning"
                                          : "bg-danger"
                                      }`}
                                    role="progressbar"
                                    style={{ width: `${completion}%` }}
                                  >
                                    {completion}%
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                        </CTableDataCell>

                        <CTableDataCell>
                          {user.lastLogin ? (
                            <div>
                              {formatDate(user.createdAt)}
                            </div>
                          ) : 'Never'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {user.lastLogin ? (
                            <div>
                              {formatDate(user.lastLogin)}
                            </div>
                          ) : 'Never'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CTooltip content="Edit User">
                              <CButton
                                size="sm"
                                color="warning"
                                variant="ghost"
                                onClick={() => handleEdit(user)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                            </CTooltip>
                            {user.status === 'Active' ? (
                              <CTooltip content="Deactivate User">
                                <CButton
                                  size="sm"
                                  color="danger"
                                  variant="ghost"
                                  onClick={() => handleDeleteClick(user._id)}
                                >
                                  <CIcon icon={cilBan} />
                                </CButton>
                              </CTooltip>
                            ) : (
                              <CTooltip content="Activate User">
                                <CButton
                                  size="sm"
                                  color="success"
                                  variant="ghost"
                                  onClick={() => null}
                                >
                                  <CIcon icon={cilCheckCircle} />
                                </CButton>
                              </CTooltip>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                {/* Pagination */}
                {totalPages > 1 && (
                  <CCardFooter className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                      {Math.min(filters.page * filters.limit, total)} of {total} entries
                    </div>
                    <CPagination>
                      <CPaginationItem
                        disabled={filters.page <= 1}
                        onClick={() => handlePageChange(filters.page - 1)}
                        style={{ cursor: filters.page > 1 ? 'pointer' : 'not-allowed' }}
                      >
                        Previous
                      </CPaginationItem>

                      {/* Show limited page numbers */}
                      {(() => {
                        const pages = [];
                        const maxVisible = 5;
                        let startPage = Math.max(1, filters.page - Math.floor(maxVisible / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                        if (endPage - startPage + 1 < maxVisible) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }

                        if (startPage > 1) {
                          pages.push(
                            <CPaginationItem
                              key={1}
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </CPaginationItem>
                          );
                          if (startPage > 2) {
                            pages.push(<CPaginationItem key="dots1" disabled>...</CPaginationItem>);
                          }
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <CPaginationItem
                              key={i}
                              active={filters.page === i}
                              onClick={() => handlePageChange(i)}
                            >
                              {i}
                            </CPaginationItem>
                          );
                        }

                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(<CPaginationItem key="dots2" disabled>...</CPaginationItem>);
                          }
                          pages.push(
                            <CPaginationItem
                              key={totalPages}
                              onClick={() => handlePageChange(totalPages)}
                            >
                              {totalPages}
                            </CPaginationItem>
                          );
                        }

                        return pages;
                      })()}

                      <CPaginationItem
                        disabled={filters.page >= totalPages}
                        onClick={() => handlePageChange(filters.page + 1)}
                        style={{ cursor: filters.page < totalPages ? 'pointer' : 'not-allowed' }}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </CCardFooter>
                )}
              </>
            )}
          </CCardBody>
        </CCard>

        {/* Add/Edit Modal */}
        <CModal
          visible={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
            setError('');
          }}
          size="lg"
          scrollable
        >
          <CModalHeader>
            <CModalTitle>
              {editingUser ? `Edit User: ${editingUser.name}` : 'Add New User'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody className="p-4">
            <UserForm
              user={editingUser}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowModal(false);
                setEditingUser(null);
              }}
              error={error}
              submitting={loading}
              isEditing={!!editingUser}
            />
          </CModalBody>
        </CModal>

        <CModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <CModalHeader>
            <CModalTitle>Confirm Deactivation</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CAlert color="warning" className="d-flex align-items-center">
              <CIcon icon={cilWarning} className="me-2 flex-shrink-0" size="lg" />
              <div>
                <h6>Are you sure you want to deactivate this user?</h6>
                <p className="mb-0">
                  The user will be marked as inactive and will not be able to log in.
                  This action can be reversed by activating the user later.
                </p>
              </div>
            </CAlert>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Deactivate User
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  );
};

export default Users;