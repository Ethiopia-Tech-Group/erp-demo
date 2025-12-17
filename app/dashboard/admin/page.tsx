"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { SalesOrder, User, Product } from "@/lib/types"
import { DollarSign, ShoppingCart, Package, TrendingUp, Users } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function AdminDashboard() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    setSalesOrders(getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS))
    setUsers(getStorageData<User>(STORAGE_KEYS.USERS))
    setProducts(getStorageData<Product>(STORAGE_KEYS.PRODUCTS))
  }, [])

  // Calculate KPIs
  const totalRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0)
  const totalProfit = salesOrders.reduce((sum, order) => sum + order.profit, 0)
  const totalOrders = salesOrders.length
  const activeUsers = users.filter((u) => u.active).length
  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel).length

  // Monthly sales data
  const monthlySales = [
    { month: "Jul", sales: 45000 },
    { month: "Aug", sales: 52000 },
    { month: "Sep", sales: 48000 },
    { month: "Oct", sales: 61000 },
    { month: "Nov", sales: 55000 },
    { month: "Dec", sales: totalRevenue },
  ]

  // Order status data
  const orderStatusData = [
    { name: "Draft", value: salesOrders.filter((o) => o?.status === "draft").length, color: "#94a3b8" },
    { name: "Approved", value: salesOrders.filter((o) => o?.status === "approved").length, color: "#3b82f6" },
    { name: "Shipped", value: salesOrders.filter((o) => o?.status === "shipped").length, color: "#f59e0b" },
    { name: "Delivered", value: salesOrders.filter((o) => o?.status === "delivered").length, color: "#8b5cf6" },
    { name: "Completed", value: salesOrders.filter((o) => o?.status === "completed").length, color: "#10b981" },
  ]

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">System overview and key performance indicators</p>
              </div>

              {/* KPI Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Total Revenue"
                  value={`$${totalRevenue.toLocaleString()}`}
                  description="All time sales"
                  icon={DollarSign}
                  trend={{ value: 12.5, positive: true }}
                />
                <KpiCard
                  title="Total Profit"
                  value={`$${totalProfit.toLocaleString()}`}
                  description="Gross profit"
                  icon={TrendingUp}
                  trend={{ value: 8.2, positive: true }}
                />
                <KpiCard title="Total Orders" value={totalOrders} description="All sales orders" icon={ShoppingCart} />
                <KpiCard
                  title="Active Users"
                  value={activeUsers}
                  description={`${users.length} total users`}
                  icon={Users}
                />
              </div>

              {/* Alerts */}
              {lowStockProducts > 0 && (
                <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-orange-600" />
                      <p className="text-sm font-medium">
                        <span className="font-bold">{lowStockProducts}</span> product(s) are below reorder level. Review
                        inventory management.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charts */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Monthly Sales Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Order Status Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toLocaleString()}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                : order.status === "shipped"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                                  : order.status === "approved"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
