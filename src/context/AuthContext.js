import React, { createContext, useState, useEffect, useContext } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)


  const checkAuth = async () => {
    try {
      const token = authService.getToken()
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser()
          if (currentUser.role != "user") {
            setIsAuthenticated(true)
          }
          setUser(currentUser)
        } catch (error) {
          authService.logout()
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    checkAuth()
  }, [])

  const verifyOTP = async (email, otp, role) => {
    try {
      const response = await authService.verifyOTP(email, otp, role)
      checkAuth()
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
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
