"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import type { UserRole } from "@/lib/types"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser()

      // If no user is logged in, redirect to login
      if (!user) {
        router.push("/login")
        return
      }

      // If specific roles are required and user doesn't have access, redirect to unauthorized
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized")
        return
      }

      // User is authorized
      setIsAuthorized(true)
      setIsLoading(false)
    }

    // Check authorization immediately
    checkAuth()

    // Set up an interval to periodically check auth status
    const interval = setInterval(checkAuth, 5000)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [router, allowedRoles])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}