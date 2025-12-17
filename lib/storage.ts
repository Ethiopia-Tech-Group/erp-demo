// LocalStorage utilities for data persistence
import {
  mockUsers,
  mockCustomers,
  mockProducts,
  mockSuppliers,
  mockSalesOrders,
  mockPurchaseOrders,
  mockWarehouses,
} from "./mock-data"

const STORAGE_KEYS = {
  USERS: "erp_users",
  CUSTOMERS: "erp_customers",
  PRODUCTS: "erp_products",
  SUPPLIERS: "erp_suppliers",
  SALES_ORDERS: "erp_sales_orders",
  PURCHASE_ORDERS: "erp_purchase_orders",
  WAREHOUSES: "erp_warehouses",
  STOCK_MOVEMENTS: "erp_stock_movements",
}

export function initializeStorage() {
  if (typeof window === "undefined") return

  // Initialize with mock data if not already present
  try {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers))
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(mockCustomers))
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts))
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(mockSuppliers))
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES_ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.SALES_ORDERS, JSON.stringify(mockSalesOrders))
    }
    if (!localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(mockPurchaseOrders))
    }
    if (!localStorage.getItem(STORAGE_KEYS.WAREHOUSES)) {
      localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(mockWarehouses))
    }
    if (!localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify([]))
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error)
  }
}

export function getStorageData<T>(key: string): T[] {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(key)
    if (!data) return []

    return JSON.parse(data)
  } catch (error) {
    console.error(`Failed to parse storage data for key ${key}:`, error)
    return []
  }
}

export function setStorageData<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to set storage data for key ${key}:`, error)
  }
}

export { STORAGE_KEYS }