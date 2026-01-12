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
      // In development, show OTP in console if available
      if (response.otp) {
        console.log('OTP for testing:', response.otp)
        setSuccess(`OTP sent! Check console for OTP: ${response.otp}`)
      }
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
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  {!otpSent ? (
                    <CForm onSubmit={handleSendOTP}>
                      <h1>Login</h1>
                      <p className="text-body-secondary">Enter your email to receive OTP</p>
                      
                      {error && (
                        <CAlert color="danger" className="mb-3">
                          {error}
                        </CAlert>
                      )}

                      {success && (
                        <CAlert color="success" className="mb-3">
                          {success}
                        </CAlert>
                      )}

                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          placeholder="Email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </CInputGroup>
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilAccountLogout} />
                        </CInputGroupText>
                        <CFormSelect
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          required
                          disabled={loading}
                        >
                          <option value="">Select Role</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="counsellor">Counsellor</option>
                        </CFormSelect>
                      </CInputGroup>
                      <CRow>
                        <CCol xs={12}>
                          <CButton
                            color="primary"
                            className="px-4 w-100"
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? <CSpinner size="sm" /> : 'Send OTP'}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  ) : (
                    <CForm onSubmit={handleVerifyOTP}>
                      <h1>Verify OTP</h1>
                      <p className="text-body-secondary">Enter the OTP sent to {email}</p>
                      
                      {error && (
                        <CAlert color="danger" className="mb-3">
                          {error}
                        </CAlert>
                      )}

                      {success && (
                        <CAlert color="info" className="mb-3">
                          {success}
                        </CAlert>
                      )}

                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
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
                        />
                      </CInputGroup>
                      <CRow>
                        <CCol xs={6}>
                          <CButton
                            color="primary"
                            className="px-4"
                            type="submit"
                            disabled={loading || otp.length !== 6}
                          >
                            {loading ? <CSpinner size="sm" /> : 'Verify & Login'}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-right">
                          <CButton
                            color="secondary"
                            variant="outline"
                            className="px-4"
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading}
                          >
                            Resend OTP
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  )}
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Don't have an account? Register now to access the admin dashboard and manage
                      your system.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
