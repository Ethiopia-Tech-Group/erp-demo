"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { SalesOrder } from "@/lib/types"

export default function ProfitAnalysisPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])

  useEffect(() => {
    setOrders(getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS))
  }, [])

  const columns = [
    {
      header: "Order Number",
      accessor: "orderNumber" as keyof SalesOrder,
      cell: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      header: "Customer",
      accessor: "customerName" as keyof SalesOrder,
    },
    {
      header: "Order Date",
      accessor: "orderDate" as keyof SalesOrder,
    },
    {
      header: "Revenue",
      accessor: "total" as keyof SalesOrder,
      cell: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      header: "Profit",
      accessor: "profit" as keyof SalesOrder,
      cell: (value: number) => <span className="text-green-600 font-medium">${value.toLocaleString()}</span>,
    },
    {
      header: "Margin %",
      accessor: ((order: SalesOrder) => (
        <span className="font-medium">{((order.profit / order.total) * 100).toFixed(1)}%</span>
      )) as any,
    },
    {
      header: "Status",
      accessor: "status" as keyof SalesOrder,
      cell: (value: string) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
            value === "completed"
              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
              : value === "shipped"
                ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                : value === "approved"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {value}
        </span>
      ),
    },
  ]

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0)
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0"

  return (
    <AuthGuard allowedRoles={["finance"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Profit Analysis</h1>
                <p className="text-muted-foreground mt-1">Detailed profitability breakdown by order</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgMargin}%</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Order Profitability ({orders.length} orders)</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable data={orders} columns={columns} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
