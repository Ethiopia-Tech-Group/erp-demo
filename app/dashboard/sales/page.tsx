"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import type { SalesOrder } from "@/lib/types"
import { DollarSign, ShoppingCart, TrendingUp, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SalesDashboard() {
  const router = useRouter()
  const user = getCurrentUser()
  const allOrders = getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS) || []
  
  // Filter orders created by current user
  const myOrders = user?.name 
    ? allOrders.filter((o) => o?.createdBy === user.name)
    : []

  const totalRevenue = myOrders.reduce((sum, order) => sum + order.total, 0)
  const totalProfit = myOrders.reduce((sum, order) => sum + order.profit, 0)
  const pendingOrders = myOrders.filter((o) => o.status === "draft" || o.status === "approved").length

  return (
    <AuthGuard allowedRoles={["sales"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Sales Dashboard</h1>
                <p className="text-muted-foreground mt-1">Your sales performance and orders</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="My Total Sales"
                  value={`$${totalRevenue.toLocaleString()}`}
                  description="All time"
                  icon={DollarSign}
                />
                <KpiCard
                  title="Total Profit"
                  value={`$${totalProfit.toLocaleString()}`}
                  description="Generated profit"
                  icon={TrendingUp}
                />
                <KpiCard
                  title="My Orders"
                  value={myOrders.length}
                  description="Total orders created"
                  icon={ShoppingCart}
                />
                <KpiCard title="Pending Orders" value={pendingOrders} description="Awaiting processing" icon={Clock} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myOrders.slice(0, 10).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toLocaleString()}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${
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
                  <div className="mt-4">
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/sales">View All Orders</Link>
                    </Button>
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