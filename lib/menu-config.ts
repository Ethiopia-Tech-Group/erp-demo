// Menu configuration based on user roles
import type { UserRole } from "./types"
import { LayoutDashboard, Users, ShoppingCart, Package, Warehouse, DollarSign, FileText, Settings } from "lucide-react"

export interface MenuItem {
  label: string
  href: string
  icon: any
}

export const menuConfig: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/users", icon: Users },
    { label: "Sales Orders", href: "/sales", icon: ShoppingCart },
    { label: "Purchase Orders", href: "/procurement", icon: Package },
    { label: "Inventory", href: "/inventory", icon: Warehouse },
    { label: "Finance", href: "/finance", icon: DollarSign },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  manager: [
    { label: "Dashboard", href: "/dashboard/manager", icon: LayoutDashboard },
    { label: "Sales Orders", href: "/sales", icon: ShoppingCart },
    { label: "Purchase Orders", href: "/procurement", icon: Package },
    { label: "Inventory", href: "/inventory", icon: Warehouse },
    { label: "Finance", href: "/finance", icon: DollarSign },
    { label: "Reports", href: "/reports", icon: FileText },
  ],
  sales: [
    { label: "Dashboard", href: "/dashboard/sales", icon: LayoutDashboard },
    { label: "My Orders", href: "/sales", icon: ShoppingCart },
    { label: "Customers", href: "/sales/customers", icon: Users },
    { label: "Create Order", href: "/sales/create", icon: FileText },
  ],
  procurement: [
    { label: "Dashboard", href: "/dashboard/procurement", icon: LayoutDashboard },
    { label: "Purchase Orders", href: "/procurement", icon: Package },
    { label: "Suppliers", href: "/procurement/suppliers", icon: Users },
    { label: "Create PO", href: "/procurement/create", icon: FileText },
    { label: "Inventory", href: "/inventory", icon: Warehouse },
  ],
  warehouse: [
    { label: "Dashboard", href: "/dashboard/warehouse", icon: LayoutDashboard },
    { label: "Stock In", href: "/warehouse/stock-in", icon: Package },
    { label: "Stock Out", href: "/warehouse/stock-out", icon: ShoppingCart },
    { label: "Inventory", href: "/inventory", icon: Warehouse },
    { label: "Stock Movements", href: "/warehouse/movements", icon: FileText },
  ],
  finance: [
    { label: "Dashboard", href: "/dashboard/finance", icon: LayoutDashboard },
    { label: "Overview", href: "/finance", icon: DollarSign },
    { label: "Profit Analysis", href: "/finance/profit", icon: DollarSign },
    { label: "Cost Reports", href: "/finance/costing", icon: FileText },
    { label: "Reports", href: "/reports", icon: FileText },
  ],
}
