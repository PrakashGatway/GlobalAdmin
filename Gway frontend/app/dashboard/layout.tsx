"use client"

import type React from "react"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { useIsMobile } from "@/hooks/use-mobile"
import { authApi, getUser } from "@/lib/api/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(useIsMobile()? false : true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if user exists in localStorage (tokenless check)
        const user = getUser()
        
        if (!user) {
          // No user found, redirect to login
          router.push('/login')
          return
        }

        // User exists in localStorage - check if token is available
        const hasToken = authApi.isAuthenticated()
        
        if (hasToken) {
          // Token exists - verify it with backend (optional, can skip if you want)
          try {
            await authApi.getMe(true) // Use localStorage first
            setIsAuthenticated(true)
          } catch (error) {
            // If token verification fails, still allow access if user exists
            // Or redirect to login if you want strict token validation
            setIsAuthenticated(true) // Allow access with localStorage user
          }
        } else {
          // No token but user exists - allow access (tokenless mode)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // On error, check localStorage user
        const user = getUser()
        if (user) {
          setIsAuthenticated(true) // Allow access if user exists
        } else {
          authApi.logout()
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking authentication
  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="pb-20 lg:pb-0">
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {children}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  )
}
