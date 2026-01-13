import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilAccountLogout, cilLockLocked } from '@coreui/icons'
import { useAuth } from '../../../context/AuthContext'
import authService from '../../../services/authService'

const Login = () => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { verifyOTP, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email || !role) {
      setError('Please enter email and select a role')
      setLoading(false)
      return
    }

    try {
      const response = await authService.sendOTP(email, role)
      setOtpSent(true)
      setSuccess(response.message || 'OTP sent to your email')
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!otp) {
      setError('Please enter OTP')
      setLoading(false)
      return
    }

    try {
      await verifyOTP(email, otp, role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    setOtpSent(false)
    setOtp('')
    setError('')
    setSuccess('')
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
          <CCol md={10} lg={8} xl={7}>
            <CCardGroup className="animate-fade-in shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <CCard className="p-4 border-0" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)'
              }}>
                <CCardBody className="p-4">
                  {!otpSent ? (
                    <CForm onSubmit={handleSendOTP}>
                      <div className="text-center mb-4">
                        <div className="mb-3" style={{ fontSize: '3rem' }}>🔐</div>
                        <h1 className="mb-2" style={{ fontWeight: '700', color: '#2c3e50' }}>Welcome Back</h1>
                        <p className="text-body-secondary mb-0">Enter your email to receive OTP</p>
                      </div>
                      
                      {error && (
                        <CAlert color="danger" className="mb-3 animate-fade-in" dismissible onClose={() => setError('')}>
                          <strong>Error:</strong> {error}
                        </CAlert>
                      )}

                      {success && (
                        <CAlert color="success" className="mb-3 animate-fade-in" dismissible onClose={() => setSuccess('')}>
                          <strong>Success:</strong> {success}
                        </CAlert>
                      )}

                      <CInputGroup className="mb-3" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <CInputGroupText style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                          <CIcon icon={cilUser} style={{ color: '#667eea' }} />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          placeholder="Enter your email address"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
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
                          <CIcon icon={cilAccountLogout} style={{ color: '#667eea' }} />
                        </CInputGroupText>
                        <CFormSelect
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          required
                          disabled={loading}
                          style={{ 
                            borderLeft: 'none',
                            padding: '12px 15px',
                            fontSize: '1rem'
                          }}
                          className="form-select-lg"
                        >
                          <option value="">Select Your Role</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="counsellor">Counsellor</option>
                         
                        </CFormSelect>
                      </CInputGroup>
                      <CRow>
                        <CCol xs={12}>
                          <CButton
                            color="primary"
                            className="px-4 w-100 btn-animated"
                            type="submit"
                            disabled={loading}
                            style={{ 
                              padding: '12px',
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none'
                            }}
                          >
                            {loading ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                Sending OTP...
                              </>
                            ) : (
                              'Send OTP'
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  ) : (
                    <CForm onSubmit={handleVerifyOTP}>
                      <div className="text-center mb-4">
                        <div className="mb-3" style={{ fontSize: '3rem' }}>✉️</div>
                        <h1 className="mb-2" style={{ fontWeight: '700', color: '#2c3e50' }}>Verify OTP</h1>
                        <p className="text-body-secondary mb-0">
                          Enter the 6-digit OTP sent to <strong>{email}</strong>
                        </p>
                      </div>
                      
                      {error && (
                        <CAlert color="danger" className="mb-3 animate-fade-in" dismissible onClose={() => setError('')}>
                          <strong>Error:</strong> {error}
                        </CAlert>
                      )}

                      {success && (
                        <CAlert color="info" className="mb-3 animate-fade-in" dismissible onClose={() => setSuccess('')}>
                          <strong>Info:</strong> {success}
                        </CAlert>
                      )}

                      <CInputGroup className="mb-4" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <CInputGroupText style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                          <CIcon icon={cilLockLocked} style={{ color: '#667eea' }} />
                        </CInputGroupText>
                        <CFormInput
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          required
                          disabled={loading}
                          autoFocus
                          style={{ 
                            borderLeft: 'none',
                            padding: '12px 15px',
                            fontSize: '1.5rem',
                            letterSpacing: '8px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                          className="form-control-lg"
                        />
                      </CInputGroup>
                      <CRow className="g-3">
                        <CCol xs={12} sm={6}>
                          <CButton
                            color="primary"
                            className="px-4 w-100 btn-animated"
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            style={{ 
                              padding: '12px',
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none'
                            }}
                          >
                            {loading ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                Verifying...
                              </>
                            ) : (
                              'Verify & Login'
                            )}
                          </CButton>
                        </CCol>
                        <CCol xs={12} sm={6}>
                          <CButton
                            color="secondary"
                            variant="outline"
                            className="px-4 w-100 btn-animated"
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading}
                            style={{ 
                              padding: '12px',
                              fontSize: '1rem',
                              fontWeight: '600',
                              borderRadius: '10px'
                            }}
                          >
                            Resend OTP
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  )}
                </CCardBody>
              </CCard>
              <CCard className="text-white border-0 d-none d-md-block" style={{ 
                width: '45%',
                background: '#000000',
                display: 'flex',
                alignItems: 'center'
              }}>
                <CCardBody className="text-center p-5">
                  <div className="mb-4" style={{ fontSize: '4rem' }}>🚀</div>
                  <h2 className="mb-3" style={{ fontWeight: '700' }}>New Here?</h2>
                  <p className="mb-4" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                    Join us today and get access to our powerful admin dashboard. Manage your system with ease and efficiency.
                  </p>
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <CButton 
                      color="light" 
                      className="mt-3 btn-animated" 
                      style={{ 
                        padding: '12px 30px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        borderRadius: '10px',
                        color: '#000000'
                      }}
                    >
                      Create Account
                    </CButton>
                  </Link>
                </CCardBody>
              </CCard>
            </CCardGroup>
            <div className="text-center mt-4 animate-fade-in">
              <p className="text-white mb-0" style={{ opacity: 0.9 }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#fff', fontWeight: '600', textDecoration: 'underline' }}>
                  Sign up here
                </Link>
              </p>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
