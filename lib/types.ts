// Core type definitions for the ERP system

export type UserRole = "admin" | "manager" | "sales" | "procurement" | "warehouse" | "finance"

export interface User {
  id: string
  username: string
  password: string // In production, this would be hashed
  name: string
  email: string
  role: UserRole
  active: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  country: string
  creditLimit: number
  createdAt: string
}

export interface Product {
  id: string
  code: string
  name: string
  category: string
  unit: string
  costPrice: number
  salePrice: number
  currentStock: number
  reorderLevel: number
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  country: string
  paymentTerms: string
  createdAt: string
}

export type OrderStatus = "draft" | "approved" | "shipped" | "delivered" | "completed"
export type PurchaseStatus = "draft" | "ordered" | "received" | "completed"

export interface SalesOrder {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  orderDate: string
  deliveryDate: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  profit: number
  createdBy: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  costPrice: number
  total: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDate: string
  status: PurchaseStatus
  items: PurchaseItem[]
  total: number
  createdBy: string
}

export interface PurchaseItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  costPrice?: number // Make costPrice optional for purchase items
  total: number
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "in" | "out"
  quantity: number
  reference: string
  date: string
  notes: string
  createdBy: string
}

export interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
}
