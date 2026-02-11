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
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {  cilLockLocked, cilArrowRight, cilReload, cilUser } from '@coreui/icons'
import { useAuth } from '../../../context/AuthContext'
import authService from '../../../services/authService'

const Login = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const { verifyOTP, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const response = await authService.sendOTP(email)
      setOtpSent(true)
      setSuccess('OTP has been sent to your email')
      setTimer(60) // 60 seconds countdown
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

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      await verifyOTP(email, otpString)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.')
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await authService.sendOTP(email)
      setSuccess('New OTP has been sent to your email')
      setTimer(60)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return // Only allow numbers
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }

    // Auto submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.length === 6) {
      // Small delay to let user see the last digit
      setTimeout(() => {
        document.getElementById('verify-otp-btn')?.click()
      }, 100)
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move focus to previous input on backspace
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtp(digits)
      document.getElementById(`otp-5`)?.focus()
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ 
      backgroundColor: '#f8f9fa'
    }}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <CCard className="border-0 shadow-sm">
              <CCardBody className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <div >
                      <img className="img-fluid" src={"https://ooshasglobal.com/images/newlogo3.png"} width="200px" height="40px" alt="Logo" />
                    </div>
                  </div>
                  <h2 className="mb-1">Welcome Back</h2>
                  <p className="text-muted mb-4">
                    {!otpSent ? 'Enter your email to continue' : 'Enter OTP to login'}
                  </p>
                </div>

                {error && (
                  <CAlert color="danger" className="mb-3" dismissible onClose={() => setError('')}>
                    {error}
                  </CAlert>
                )}

                {success && (
                  <CAlert color="success" className="mb-3" dismissible onClose={() => setSuccess('')}>
                    {success}
                  </CAlert>
                )}

                {!otpSent ? (
                  <CForm onSubmit={handleSendOTP}>
                    <div className="mb-3">
                      <CFormLabel className="fw-medium mb-2">Email Address</CFormLabel>
                      <CInputGroup className="mb-3">
                        <CInputGroupText className="bg-light">
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </CInputGroup>
                    </div>

                    <div className="d-grid gap-2">
                      <CButton
                        color="primary"
                        type="submit"
                        disabled={loading || !email}
                      >
                        {loading ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            Send OTP
                            <CIcon icon={cilArrowRight} className="ms-2" />
                          </>
                        )}
                      </CButton>
                    </div>
                  </CForm>
                ) : (
                  <CForm onSubmit={handleVerifyOTP}>
                    <div className="mb-4 text-center">
                      <p className="text-muted mb-1">Enter the 6-digit OTP sent to</p>
                      <p className="fw-bold mb-3">{email}</p>
                      
                      <div className="d-flex justify-content-center gap-2 mb-4">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handlePaste}
                            disabled={loading}
                            className="form-control text-center"
                            style={{
                              width: '50px',
                              height: '60px',
                              fontSize: '1.5rem',
                              fontWeight: '600',
                            }}
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>

                      <div className="mb-4">
                        {timer > 0 ? (
                          <p className="text-muted">
                            Resend OTP in <span className="fw-bold">{timer}</span> seconds
                          </p>
                        ) : (
                          <CButton
                            color="link"
                            size="sm"
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="p-0"
                          >
                            <CIcon icon={cilReload} className="me-1" />
                            Resend OTP
                          </CButton>
                        )}
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <CButton
                        id="verify-otp-btn"
                        color="primary"
                        type="submit"
                        disabled={loading || otp.some(digit => digit === '')}
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

                      <CButton
                        color="secondary"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp(['', '', '', '', '', ''])
                          setError('')
                          setSuccess('')
                        }}
                        disabled={loading}
                      >
                        Change Email
                      </CButton>
                    </div>
                  </CForm>
                )}

                <div className="text-center mt-4 pt-3 border-top">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="fw-medium text-decoration-none">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CCardBody>
            </CCard>
            
            <div className="text-center mt-4">
              <p className="text-muted small">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login