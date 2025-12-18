"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  FileText, 
  BarChart,
  PieChart,
  LineChart,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { SalesOrder, PurchaseOrder } from "@/lib/types"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts"
import { useRouter } from "next/navigation"

export default function FinancePage() {
  const router = useRouter()
  const salesOrders = getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS) || []
  const purchaseOrders = getStorageData<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS) || []

  const totalRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0)
  const totalProfit = salesOrders.reduce((sum, order) => sum + order.profit, 0)
  const totalCost = purchaseOrders.reduce((sum, order) => sum + order.total, 0)
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0"

  // Monthly data for charts
  const monthlyData = [
    { month: "Jul", revenue: 45000, cost: 28000, profit: 17000 },
    { month: "Aug", revenue: 52000, cost: 31000, profit: 21000 },
    { month: "Sep", revenue: 48000, cost: 29000, profit: 19000 },
    { month: "Oct", revenue: 61000, cost: 36000, profit: 25000 },
    { month: "Nov", revenue: 55000, cost: 33000, profit: 22000 },
    { month: "Dec", revenue: totalRevenue, cost: totalCost, profit: totalProfit },
  ]

  // Product profitability data
  const productProfitData = [
    { name: "Coffee Beans", value: 35, color: "#0088FE" },
    { name: "Sesame Seeds", value: 25, color: "#00C49F" },
    { name: "Leather Goods", value: 20, color: "#FFBB28" },
    { name: "Jewelry", value: 15, color: "#FF8042" },
    { name: "Spices", value: 5, color: "#8884D8" },
  ]

  return (
    <AuthGuard allowedRoles={["admin", "manager", "finance"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Finance Overview</h1>
                  <p className="text-muted-foreground mt-1">Financial performance and analytics dashboard</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/finance/profit">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Profit Analysis
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/finance/costing">
                      <FileText className="h-4 w-4 mr-2" />
                      Cost Reports
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+15.3% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profitMargin}%</div>
                    <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Profit Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Profitability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={productProfitData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {productProfitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                        <div>
                          <h3 className="font-medium">Strong Profit Growth</h3>
                          <p className="text-sm text-muted-foreground">
                            Profit increased by 15.3% compared to last month, driven by higher sales volume.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                        <div>
                          <h3 className="font-medium">Cost Optimization</h3>
                          <p className="text-sm text-muted-foreground">
                            Procurement costs remained stable despite increased order volume.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div>
                          <h3 className="font-medium">Margin Improvement</h3>
                          <p className="text-sm text-muted-foreground">
                            Average profit margin improved to {profitMargin}% through better pricing strategies.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/finance/profit">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Detailed Profit Analysis
                        </Link>
                      </Button>
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/finance/costing">
                          <FileText className="h-4 w-4 mr-2" />
                          Cost Breakdown Reports
                        </Link>
                      </Button>
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/reports">
                          <PieChart className="h-4 w-4 mr-2" />
                          Generate Custom Reports
                        </Link>
                      </Button>
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/settings">
                          <LineChart className="h-4 w-4 mr-2" />
                          Configure Financial Settings
                        </Link>
                      </Button>
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