"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { Supplier } from "@/lib/types"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    setSuppliers(getStorageData<Supplier>(STORAGE_KEYS.SUPPLIERS))
  }, [])

  const columns = [
    {
      header: "Supplier ID",
      accessor: "id" as keyof Supplier,
      cell: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      header: "Name",
      accessor: "name" as keyof Supplier,
    },
    {
      header: "Email",
      accessor: "email" as keyof Supplier,
    },
    {
      header: "Phone",
      accessor: "phone" as keyof Supplier,
    },
    {
      header: "Country",
      accessor: "country" as keyof Supplier,
    },
    {
      header: "Payment Terms",
      accessor: "paymentTerms" as keyof Supplier,
    },
  ]

  return (
    <AuthGuard allowedRoles={["admin", "manager", "procurement"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Suppliers</h1>
                <p className="text-muted-foreground mt-1">View all suppliers and their information</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Suppliers ({suppliers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable data={suppliers} columns={columns} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
