"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { SalesOrder, PurchaseOrder } from "@/lib/types"
import { DollarSign, TrendingUp, ShoppingCart, Package } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"

export default function FinanceDashboard() {
  const salesOrders = getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS) || []
  const purchaseOrders = getStorageData<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS) || []

  const totalRevenue = salesOrders.reduce((sum, order) => sum + (order?.total || 0), 0)
  const totalProfit = salesOrders.reduce((sum, order) => sum + (order?.profit || 0), 0)
  const totalCost = purchaseOrders.reduce((sum, order) => sum + (order?.total || 0), 0)
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0"

  // Monthly profit data
  const monthlyData = [
    { month: "Jul", revenue: 45000, cost: 28000, profit: 17000 },
    { month: "Aug", revenue: 52000, cost: 31000, profit: 21000 },
    { month: "Sep", revenue: 48000, cost: 29000, profit: 19000 },
    { month: "Oct", revenue: 61000, cost: 36000, profit: 25000 },
    { month: "Nov", revenue: 55000, cost: 33000, profit: 22000 },
    { month: "Dec", revenue: totalRevenue, cost: totalCost, profit: totalProfit },
  ]

  // Product profitability
  const productProfitData = [
    { product: "T-Shirts", profit: 4500 },
    { product: "Jeans", profit: 6800 },
    { product: "LED Bulbs", profit: 3200 },
    { product: "Power Banks", profit: 2800 },
    { product: "Chairs", profit: 3500 },
  ]

  return (
    <AuthGuard allowedRoles={["finance"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Finance Dashboard</h1>
                <p className="text-muted-foreground mt-1">Financial overview and profitability analysis</p>
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
                  trend={{ value: 15.3, positive: true }}
                />
                <KpiCard
                  title="Profit Margin"
                  value={`${profitMargin}%`}
                  description="Average margin"
                  icon={TrendingUp}
                />
                <KpiCard
                  title="Total Cost"
                  value={`$${totalCost.toLocaleString()}`}
                  description="Procurement costs"
                  icon={Package}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Profit Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Profitability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={productProfitData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="product" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="profit" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Profitable Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesOrders
                        .sort((a, b) => b.profit - a.profit)
                        .slice(0, 5)
                        .map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600">${order.profit.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                {((order.profit / order.total) * 100).toFixed(1)}% margin
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Total Sales Orders</span>
                        </div>
                        <span className="font-bold">{salesOrders.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-orange-600" />
                          <span className="font-medium">Total Purchase Orders</span>
                        </div>
                        <span className="font-bold">{purchaseOrders.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Average Order Value</span>
                        </div>
                        <span className="font-bold">
                          ${salesOrders.length > 0 ? (totalRevenue / salesOrders.length).toLocaleString() : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="font-medium">Average Profit per Order</span>
                        </div>
                        <span className="font-bold text-green-600">
                          ${salesOrders.length > 0 ? (totalProfit / salesOrders.length).toLocaleString() : 0}
                        </span>
                      </div>
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