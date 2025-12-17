// Authentication utilities
import { mockUsers } from "./mock-data"
import { getStorageData, STORAGE_KEYS } from "./storage"
import type { User } from "./types"

export function authenticateUser(username: string, password: string): User | null {
  try {
    // First check localStorage for any updated user data
    const storedUsers = getStorageData<User>(STORAGE_KEYS.USERS)
    
    // If we have stored users, use them; otherwise fall back to mock data
    const usersToCheck = storedUsers.length > 0 ? storedUsers : mockUsers
    
    const user = usersToCheck.find((u) => u.username === username && u.password === password && u.active)
    return user || null
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) return null

    const user = JSON.parse(userJson)
    
    // Validate that the user object has the required properties
    if (user && typeof user === 'object' && user.id && user.username && user.role) {
      return user
    }
    
    // If the user object is invalid, clear it
    localStorage.removeItem("currentUser")
    return null
  } catch (error) {
    console.error("Error getting current user:", error)
    // Clear invalid user data
    localStorage.removeItem("currentUser")
    return null
  }
}

export function setCurrentUser(user: User): void {
  try {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } catch (error) {
    console.error("Error setting current user:", error)
  }
}

export function clearCurrentUser(): void {
  try {
    localStorage.removeItem("currentUser")
  } catch (error) {
    console.error("Error clearing current user:", error)
  }
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}