"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { Customer } from "@/lib/types"

export default function CustomersPage() {
  const customers = getStorageData<Customer>(STORAGE_KEYS.CUSTOMERS) || []

  const columns = [
    {
      header: "Customer ID",
      accessor: "id" as keyof Customer,
      cell: (value: unknown) => <span className="font-medium">{String(value)}</span>,
    },
    {
      header: "Name",
      accessor: "name" as keyof Customer,
    },
    {
      header: "Email",
      accessor: "email" as keyof Customer,
    },
    {
      header: "Phone",
      accessor: "phone" as keyof Customer,
    },
    {
      header: "Country",
      accessor: "country" as keyof Customer,
    },
    {
      header: "Credit Limit",
      accessor: "creditLimit" as keyof Customer,
      cell: (value: unknown) => `$${Number(value).toLocaleString()}`,
    },
  ]

  return (
    <AuthGuard allowedRoles={["admin", "manager", "sales"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Customers</h1>
                <p className="text-muted-foreground mt-1">View all customers and their information</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Customers ({customers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable data={customers} columns={columns} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}