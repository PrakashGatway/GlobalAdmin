"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ArrowRight, Shield, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authApi, getUser } from "@/lib/api/auth"

type Role = 'admin' | 'manager' | 'counsellor' | 'user'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>('user')
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const user = getUser()
    if (user) {
      redirectBasedOnRole(user.role)
    }
  }, [])

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (otpTimer === 0 && step === 'otp') {
      setCanResend(true)
    }
  }, [otpTimer, step])

  const redirectBasedOnRole = (userRole: string) => {
    // Redirect based on role
    if (userRole === 'admin' || userRole === 'manager' || userRole === 'counsellor') {
      router.push('/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await authApi.sendOTP(email, role)
      
      // If OTP is provided in development mode, auto-fill it
      if (response.otp && response.isDevelopment) {
        setOtp(response.otp)
        setIsDevelopmentMode(true)
        setSuccess(`OTP generated: ${response.otp} (Development Mode - Email not configured)`)
      } else {
        setIsDevelopmentMode(false)
        setSuccess("OTP sent to your email successfully!")
      }
      
      setStep('otp')
      setOtpTimer(300) // 5 minutes
      setCanResend(false)
    } catch (err: any) {
      console.error('Send OTP error:', err)
      // Show more specific error messages
      if (err.message?.includes('Cannot connect') || err.message?.includes('endpoint not found')) {
        setError(`Backend server not reachable. Please ensure the backend is running on http://localhost:5000`)
      } else {
        setError(err.message || "Failed to send OTP. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      setLoading(false)
      return
    }

    try {
      const response = await authApi.verifyOTP(email, otp, role)
      
      if (response.success && response.data) {
        setSuccess("Login successful! Redirecting...")
        setTimeout(() => {
          redirectBasedOnRole(response.data!.role)
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.")
      setOtp("")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setSuccess("")
    setLoading(true)
    setCanResend(false)

    try {
      await authApi.sendOTP(email, role)
      setSuccess("OTP resent to your email!")
      setOtpTimer(300) // Reset timer
      setOtp("")
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.")
      setCanResend(true)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-lg shadow-lg p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              {step === 'email' ? 'Sign in to your account to continue' : 'Enter the OTP sent to your email'}
            </p>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email & Role Form */}
          {step === 'email' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSendOTP}
              className="space-y-6"
            >
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </motion.div>

              {/* Role Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <label className="block text-sm font-medium mb-2">Select Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-5 h-5 text-muted-foreground z-10" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all appearance-none cursor-pointer"
                    required
                    disabled={loading}
                  >
                    <option value="user">User</option>
                    <option value="counsellor">Counsellor</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading ? "Sending OTP..." : "Send OTP"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </motion.div>
            </motion.form>
          )}

          {/* OTP Verification Form */}
          {step === 'otp' && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              {/* Email Display */}
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{email}</p>
                <p className="text-muted-foreground mt-1">Role: <span className="capitalize font-medium">{role}</span></p>
              </div>

              {/* Development Mode Notice */}
              {isDevelopmentMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400"
                >
                  <p className="font-medium mb-1">⚠️ Development Mode</p>
                  <p className="text-xs">Email service is not configured. OTP has been auto-filled for testing.</p>
                </motion.div>
              )}

              {/* OTP Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <label className="block text-sm font-medium mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(value)
                  }}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all text-center text-2xl font-mono tracking-widest"
                  required
                  disabled={loading}
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {isDevelopmentMode 
                    ? "OTP auto-filled (Development Mode)" 
                    : "Enter the 6-digit code sent to your email"}
                </p>
              </motion.div>

              {/* Timer */}
              {otpTimer > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>OTP expires in {formatTime(otpTimer)}</span>
                </div>
              )}

              {/* Resend OTP */}
              {canResend && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp("")
                  setError("")
                  setSuccess("")
                  setOtpTimer(0)
                  setCanResend(false)
                  setIsDevelopmentMode(false)
                }}
                disabled={loading}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                ← Change email or role
              </button>

              {/* Verify Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full gap-2"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </motion.div>
            </motion.form>
          )}

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center text-sm"
          >
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}
