import React, { useState, useEffect } from 'react';
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CCard,
  CCardBody,
  CFormCheck,
  CBadge,
  CProgress,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilUser,
  cilEnvelopeOpen,
  cilPhone,
  cilLockLocked,
  cilCalendar,
  cilMap,
  cilWarning,
  cilSave,
  cilX,
  cilCheckCircle,
} from '@coreui/icons';

const UserForm = ({
  user,
  onSubmit,
  onCancel,
  error,
  submitting,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    status: 'Active',
    dateOfBirth: '',
    gender: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'User',
        status: user.status || 'Active',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Remove confirmPassword before submitting
    const { confirmPassword, ...submitData } = formData;
    
    // If editing and password is empty, remove it
    if (isEditing && !submitData.password) {
      delete submitData.password;
    }

    onSubmit(submitData);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    
    if (!isEditing && !formData.password) errors.password = 'Password is required';
    if (!isEditing && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.role) errors.role = 'Role is required';

    return errors;
  };

  const roleOptions = ['admin', 'manager', 'counsellor', 'user'];
  const statusOptions = ['Active', 'Inactive', 'Suspended'];
  const genderOptions = ['male', 'female', 'other'];
  const permissionOptions = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'delete', label: 'Delete' },
    { value: 'edit', label: 'Edit' },
    { value: 'manage_users', label: 'Manage Users' },
    { value: 'manage_content', label: 'Manage Content' },
  ];

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return 'success';
    if (passwordStrength >= 50) return 'info';
    if (passwordStrength >= 25) return 'warning';
    return 'danger';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength >= 75) return 'Strong';
    if (passwordStrength >= 50) return 'Good';
    if (passwordStrength >= 25) return 'Weak';
    return 'Very Weak';
  };

  return (
    <CForm onSubmit={handleSubmit}>
      {error && (
        <CAlert color="danger" className="mb-4 d-flex align-items-center">
          <CIcon icon={cilWarning} className="me-2 flex-shrink-0" />
          <div>{error}</div>
        </CAlert>
      )}

      <CRow className="g-3 mb-4">
        <CCol md={6}>
          <CFormLabel className="fw-semibold">
            Full Name <span className="text-danger">*</span>
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilUser} />
            </CInputGroupText>
            <CFormInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              invalid={!!formErrors.name}
              required
            />
          </CInputGroup>
          {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
        </CCol>

        <CCol md={6}>
          <CFormLabel className="fw-semibold">
            Email <span className="text-danger">*</span>
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilEnvelopeOpen} />
            </CInputGroupText>
            <CFormInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              invalid={!!formErrors.email}
              required
              disabled={isEditing}
            />
          </CInputGroup>
          {formErrors.email && <div className="invalid-feedback d-block">{formErrors.email}</div>}
        </CCol>
      </CRow>

      <CRow className="g-3 mb-4">
        <CCol md={6}>
          <CFormLabel className="fw-semibold">Phone</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilPhone} />
            </CInputGroupText>
            <CFormInput
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              disabled={isEditing}
            />
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CFormLabel className="fw-semibold">Gender</CFormLabel>
          <CFormSelect
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            {genderOptions.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </CFormSelect>
        </CCol>
      </CRow>

      <CRow className="g-3 mb-4">
        <CCol md={6}>
          <CFormLabel className="fw-semibold">Date of Birth</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilCalendar} />
            </CInputGroupText>
            <CFormInput
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CFormLabel className="fw-semibold">
            Role <span className="text-danger">*</span>
          </CFormLabel>
          <CFormSelect
            name="role"
            value={formData.role}
            onChange={handleChange}
            invalid={!!formErrors.role}
            required
          >
            <option value="">Select Role</option>
            {roleOptions.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </CFormSelect>
          {formErrors.role && <div className="invalid-feedback d-block">{formErrors.role}</div>}
        </CCol>
      </CRow>

      {!isEditing && (
        <CRow className="g-3 mb-4">
          <CCol md={6}>
            <CFormLabel className="fw-semibold">
              Password <span className="text-danger">*</span>
            </CFormLabel>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                invalid={!!formErrors.password}
                required={!isEditing}
              />
            </CInputGroup>
            {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}
            
            {formData.password && (
              <div className="mt-2">
                <div className="d-flex justify-content-between mb-1">
                  <small>Password Strength:</small>
                  <small className={`fw-semibold text-${getPasswordStrengthColor()}`}>
                    {getPasswordStrengthText()}
                  </small>
                </div>
                <CProgress 
                  value={passwordStrength} 
                  color={getPasswordStrengthColor()}
                  style={{ height: '5px' }}
                />
              </div>
            )}
          </CCol>

          <CCol md={6}>
            <CFormLabel className="fw-semibold">
              Confirm Password <span className="text-danger">*</span>
            </CFormLabel>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                invalid={!!formErrors.confirmPassword}
                required={!isEditing}
              />
            </CInputGroup>
            {formErrors.confirmPassword && (
              <div className="invalid-feedback d-block">{formErrors.confirmPassword}</div>
            )}
          </CCol>
        </CRow>
      )}

      {isEditing && (
        <CRow className="g-3 mb-4">
          <CCol md={6}>
            <CFormLabel className="fw-semibold">New Password (Leave blank to keep current)</CFormLabel>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                name="password"
                disabled={isEditing}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </CInputGroup>
            {formData.password && (
              <div className="mt-2">
                <div className="d-flex justify-content-between mb-1">
                  <small>Password Strength:</small>
                  <small className={`fw-semibold text-${getPasswordStrengthColor()}`}>
                    {getPasswordStrengthText()}
                  </small>
                </div>
                <CProgress 
                  value={passwordStrength} 
                  color={getPasswordStrengthColor()}
                  style={{ height: '5px' }}
                />
              </div>
            )}
          </CCol>

          <CCol md={6}>
            <CFormLabel className="fw-semibold">
              Status <span className="text-danger">*</span>
            </CFormLabel>
            <CFormSelect
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>
      )}
{/* 
      <CCard className="mb-4">
        <CCardBody>
          <h6 className="mb-3">
            <CIcon icon={cilMap} className="me-2" />
            Address Information
          </h6>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormLabel>Street Address</CFormLabel>
              <CFormInput
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="123 Main St"
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>City</CFormLabel>
              <CFormInput
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="New York"
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>State/Province</CFormLabel>
              <CFormInput
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="NY"
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Country</CFormLabel>
              <CFormInput
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                placeholder="USA"
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>ZIP/Postal Code</CFormLabel>
              <CFormInput
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                placeholder="10001"
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard> */}

      {/* <CCard className="mb-4">
        <CCardBody>
          <h6 className="mb-3">Permissions</h6>
          <CRow>
            {permissionOptions.map((permission) => (
              <CCol md={4} key={permission.value} className="mb-2">
                <CFormCheck
                  id={`permission-${permission.value}`}
                  label={permission.label}
                  checked={formData.permissions.includes(permission.value)}
                  onChange={() => handlePermissionChange(permission.value)}
                />
              </CCol>
            ))}
          </CRow>
          {formData.permissions.length > 0 && (
            <div className="mt-3">
              <small className="text-muted">Selected Permissions:</small>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {formData.permissions.map(perm => (
                  <CBadge key={perm} color="info" className="px-2 py-1">
                    {permissionOptions.find(p => p.value === perm)?.label || perm}
                  </CBadge>
                ))}
              </div>
            </div>
          )}
        </CCardBody>
      </CCard> */}

      <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
        <div>
          <small className="text-muted">
            Fields marked with <span className="text-danger">*</span> are required
          </small>
        </div>
        <div className="d-flex gap-2">
          <CButton 
            color="secondary" 
            onClick={onCancel} 
            disabled={submitting}
            variant="outline"
            className="d-flex align-items-center gap-1"
          >
            <CIcon icon={cilX} />
            Cancel
          </CButton>
          <CButton 
            type="submit" 
            color="primary" 
            disabled={submitting}
            className="d-flex align-items-center gap-1"
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <CIcon icon={isEditing ? cilSave : cilCheckCircle} />
                {isEditing ? 'Update User' : 'Create User'}
              </>
            )}
          </CButton>
        </div>
      </div>
    </CForm>
  );
};

export default UserForm;