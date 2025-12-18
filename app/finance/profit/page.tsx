"use client"

import { ReactNode, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { SalesOrder } from "@/lib/types"
import type { Column } from "@/lib/data-type"


export default function ProfitAnalysisPage() {
  const orders = getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS) || []


  const columns: Column<SalesOrder>[] = [
    {
      header: "Order Number",
      accessor: "orderNumber",
      cell: (value): ReactNode => (
        <span className="font-medium">{value as string}</span>
      ),
    },
    {
      header: "Customer",
      accessor: "customerName",
    },
    {
      header: "Order Date",
      accessor: "orderDate",
    },
    {
      header: "Revenue",
      accessor: "total",
      cell: (value): ReactNode =>
        `$${(value as number).toLocaleString()}`,
    },
    {
      header: "Profit",
      accessor: "profit",
      cell: (value): ReactNode => (
        <span className="text-green-600 font-medium">
          ${(value as number).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Margin %",
      accessor: (row) => row,
      cell: (_value, row): ReactNode => {
        if (!row || row.total === 0) return "0.0%"
        return (
          <span className="font-medium">
            {((row.profit / row.total) * 100).toFixed(1)}%
          </span>
        )
      },
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value): ReactNode => {
        const status = value as string
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
              status === "completed"
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                : status === "shipped"
                ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                : status === "approved"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {status}
          </span>
        )
      },
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