"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api/auth"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear errors when user starts typing
    if (error) setError("")
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required")
      return
    }

    setLoading(true)

    try {
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      if (response.success) {
        setSuccess("Account created successfully! Redirecting...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join Global Way and start your journey</p>
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

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name Input */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all"
                  required
                />
              </div>
            </motion.div>

            {/* Email Input */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </motion.div>

            {/* Phone Input */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.175 }}>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </motion.div>

            {/* Terms */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 text-sm"
            >
              <input type="checkbox" className="w-4 h-4 rounded border-border mt-0.5 flex-shrink-0" required />
              <span>
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </motion.div>

            {/* Submit Button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              <Button type="submit" disabled={loading || !!success} className="w-full gap-2">
                {loading ? "Creating account..." : success ? "Account Created!" : "Create Account"}
                {!loading && !success && <ArrowRight className="w-4 h-4" />}
              </Button>
            </motion.div>
          </form>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm"
          >
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}
