"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { SalesOrder, PurchaseOrder, Product } from "@/lib/types"
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ManagerDashboard() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    setSalesOrders(getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS))
    setPurchaseOrders(getStorageData<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS))
    setProducts(getStorageData<Product>(STORAGE_KEYS.PRODUCTS))
  }, [])

  const totalRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0)
  const totalProfit = salesOrders.reduce((sum, order) => sum + order.profit, 0)
  const pendingSales = salesOrders.filter((o) => o.status === "draft" || o.status === "approved").length
  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel).length

  const statusData = [
    { status: "Draft", count: salesOrders.filter((o) => o.status === "draft").length },
    { status: "Approved", count: salesOrders.filter((o) => o.status === "approved").length },
    { status: "Shipped", count: salesOrders.filter((o) => o.status === "shipped").length },
    { status: "Completed", count: salesOrders.filter((o) => o.status === "completed").length },
  ]

  return (
    <AuthGuard allowedRoles={["manager"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Manager Dashboard</h1>
                <p className="text-muted-foreground mt-1">Business overview and operational insights</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Total Revenue"
                  value={`$${totalRevenue.toLocaleString()}`}
                  description="All sales"
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
                <KpiCard title="Pending Orders" value={pendingSales} description="Need attention" icon={ShoppingCart} />
                <KpiCard
                  title="Low Stock Alert"
                  value={lowStockProducts}
                  description="Products to reorder"
                  icon={AlertTriangle}
                />
              </div>

              {lowStockProducts > 0 && (
                <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <p className="text-sm font-medium">
                        <span className="font-bold">{lowStockProducts}</span> product(s) are below reorder level.
                        Immediate action recommended.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Approvals Needed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesOrders
                        .filter((o) => o.status === "draft")
                        .slice(0, 5)
                        .map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${order.total.toLocaleString()}</p>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                Needs Approval
                              </span>
                            </div>
                          </div>
                        ))}
                      {salesOrders.filter((o) => o.status === "draft").length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No orders pending approval</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sales Orders</CardTitle>
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
                            <p className="text-sm text-green-600">+${order.profit.toLocaleString()} profit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Purchase Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {purchaseOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div>
                            <p className="font-medium">{order.poNumber}</p>
                            <p className="text-sm text-muted-foreground">{order.supplierName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.total.toLocaleString()}</p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full capitalize ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
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
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
