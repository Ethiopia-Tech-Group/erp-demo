"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { StockMovement } from "@/lib/types"
import { ArrowUp, ArrowDown, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function StockMovementsPage() {
  const router = useRouter()
  const allMovements = getStorageData<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS) || []
  // Sort by date descending
  const movements = allMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const columns = [
    {
      header: "Date",
      accessor: "date" as keyof StockMovement,
    },
    {
      header: "Type",
      accessor: "type" as keyof StockMovement,
      cell: (_value, row) => (
        row ? (
          <div className="flex items-center gap-2">
            {row.type === "in" ? (
              <ArrowUp className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDown className="h-4 w-4 text-orange-600" />
            )}
            <span className="capitalize font-medium">{row.type}</span>
          </div>
        ) : null
      ),
    },
    {
      header: "Product",
      accessor: "productName" as keyof StockMovement,
    },
    {
      header: "Quantity",
      accessor: "quantity" as keyof StockMovement,
      cell: (value: unknown) => <span className="font-medium">{Number(value)}</span>,
    },
    {
      header: "Reference",
      accessor: "reference" as keyof StockMovement,
    },
    {
      header: "Created By",
      accessor: "createdBy" as keyof StockMovement,
    },
    {
      header: "Notes",
      accessor: "notes" as keyof StockMovement,
      cell: (value: unknown) => <span className="text-sm text-muted-foreground">{String(value) || "-"}</span>,
    },
  ]

  return (
    <AuthGuard allowedRoles={["admin", "warehouse"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">Stock Movements</h1>
                  <p className="text-muted-foreground mt-1">View all inventory transactions and movement history</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Movements ({movements.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable data={movements} columns={columns} emptyMessage="No stock movements recorded yet" />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}