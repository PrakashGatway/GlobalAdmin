 import React, { createContext, useState, useEffect, useContext } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const token = authService.getToken()
        console.log('Stored token:', token)
        // const storedUser = authService.getUser()

        if (token) {
          try {
            // Verify token by getting current user
            const currentUser = await authService.getCurrentUser()
            setUser(currentUser)
            console.log('Authenticated user:', currentUser)
            setIsAuthenticated(true)
          } catch (error) {
            // Token is invalid, clear storage
            console.error('Auth check failed:', error)
            authService.logout()
            setUser(null)
            setIsAuthenticated(false)
          }
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const verifyOTP = async (email, otp, role) => {
    try {
      const response = await authService.verifyOTP(email, otp, role)
      setUser(response.data)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      setUser(response.data)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    // Navigation will be handled by the component calling logout
    window.location.href = '/login'
  }

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    verifyOTP,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
