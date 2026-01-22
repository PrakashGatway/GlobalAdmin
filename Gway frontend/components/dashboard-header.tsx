"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Bell, User, Menu, Settings } from "lucide-react"
import { getUser } from "@/lib/api/auth"

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchFocus, setSearchFocus] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 gap-4">
        {/* Left - Menu Button & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <motion.div animate={{ width: searchFocus ? "100%" : "auto" }} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background"
            />
          </motion.div>
        </div>

        {/* Right - Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-muted rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive"></span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer"
            title={user?.name || "User"}
          >
            <User className="w-4 h-4 text-primary" />
            {user && (
              <div className="hidden md:block text-sm">
                <p className="font-medium text-foreground">{user.name?.split(' ')[0] || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  )
}
