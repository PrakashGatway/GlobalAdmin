import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilPhone } from '@coreui/icons'
import { useAuth } from '../../../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center position-relative" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'float 20s ease-in-out infinite',
        opacity: 0.3
      }}></div>
      
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4 border-0 shadow-lg animate-fade-in" style={{ 
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)'
            }}>
              <CCardBody className="p-5">
                <CForm onSubmit={handleSubmit}>
                  <div className="text-center mb-4">
                    <div className="mb-3" style={{ fontSize: '3rem' }}>👋</div>
                    <h1 className="mb-2" style={{ fontWeight: '700', color: '#2c3e50' }}>Create Account</h1>
                    <p className="text-body-secondary mb-0">Fill in your details to get started</p>
                  </div>

                  {error && (
                    <CAlert color="danger" className="mb-3 animate-fade-in" dismissible onClose={() => setError('')}>
                      <strong>Error:</strong> {error}
                    </CAlert>
                  )}

                  <CInputGroup className="mb-3" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <CInputGroupText style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                      <CIcon icon={cilUser} style={{ color: '#667eea' }} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Enter your full name"
                      autoComplete="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{ 
                        borderLeft: 'none',
                        padding: '12px 15px',
                        fontSize: '1rem'
                      }}
                      className="form-control-lg"
                    />
                  </CInputGroup>
                  
                  <CInputGroup className="mb-3" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <CInputGroupText style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                      <span style={{ color: '#667eea', fontWeight: 'bold' }}>@</span>
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Enter your email address"
                      autoComplete="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ 
                        borderLeft: 'none',
                        padding: '12px 15px',
                        fontSize: '1rem'
                      }}
                      className="form-control-lg"
                    />
                  </CInputGroup>
                  
                  <CInputGroup className="mb-3" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <CInputGroupText style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                      <CIcon icon={cilPhone} style={{ color: '#667eea' }} />
                    </CInputGroupText>
                    <CFormInput
                      type="tel"
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      style={{ 
                        borderLeft: 'none',
                        padding: '12px 15px',
                        fontSize: '1rem'
                      }}
                      className="form-control-lg"
                    />
                  </CInputGroup>
                  
                  <CInputGroup className="mb-3" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <CInputGroupText style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                      <CIcon icon={cilLockLocked} style={{ color: '#667eea' }} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      autoComplete="new-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{ 
                        borderLeft: 'none',
                        padding: '12px 15px',
                        fontSize: '1rem'
                      }}
                      className="form-control-lg"
                    />
                  </CInputGroup>
                  
                  <CInputGroup className="mb-4" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <CInputGroupText style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                      <CIcon icon={cilLockLocked} style={{ color: '#667eea' }} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      style={{ 
                        borderLeft: 'none',
                        padding: '12px 15px',
                        fontSize: '1rem'
                      }}
                      className="form-control-lg"
                    />
                  </CInputGroup>
                  
                  <div className="d-grid mb-3">
                    <CButton 
                      color="success" 
                      type="submit" 
                      disabled={loading} 
                      className="btn-animated"
                      style={{ 
                        padding: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        border: 'none'
                      }}
                    >
                      {loading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </CButton>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-body-secondary mb-2">
                      Already have an account?{' '}
                      <Link to="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
                        Login here
                      </Link>
                    </p>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
