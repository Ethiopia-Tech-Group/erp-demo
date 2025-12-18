"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { Product } from "@/lib/types"

export default function CostingPage() {
  const products = getStorageData<Product>(STORAGE_KEYS.PRODUCTS) || []

  const columns = [
    {
      header: "Product Code",
      accessor: "code" as keyof Product,
      cell: (value: unknown) => <span className="font-medium">{String(value)}</span>,
    },
    {
      header: "Product Name",
      accessor: "name" as keyof Product,
    },
    {
      header: "Category",
      accessor: "category" as keyof Product,
    },
    {
      header: "Cost Price",
      accessor: "costPrice" as keyof Product,
      cell: (value: unknown) => `$${Number(value).toLocaleString()}`,
    },
    {
      header: "Sale Price",
      accessor: "salePrice" as keyof Product,
      cell: (value: unknown) => `$${Number(value).toLocaleString()}`,
    },
    {
      header: "Profit per Unit",
      accessor: ((product: Product) => (
        <span className="text-green-600 font-medium">${(product.salePrice - product.costPrice).toLocaleString()}</span>
      )) as unknown as keyof Product,
    },
    {
      header: "Margin %",
      accessor: ((product: Product) => (
        <span className="font-medium">
          {(((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)}%
        </span>
      )) as unknown as keyof Product,
    },
    {
      header: "Stock Value",
      accessor: ((product: Product) => (
        <span className="font-medium">${(product.currentStock * product.costPrice).toLocaleString()}</span>
      )) as unknown as keyof Product,
    },
  ]

  const totalStockValue = products.reduce((sum, product) => sum + product.currentStock * product.costPrice, 0)
  const avgMargin =
    products.length > 0
      ? products.reduce((sum, product) => sum + ((product.salePrice - product.costPrice) / product.salePrice) * 100, 0) /
        products.length
      : 0

  return (
    <AuthGuard allowedRoles={["finance"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Product Costing</h1>
                <p className="text-muted-foreground mt-1">Cost analysis and pricing breakdown by product</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalStockValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">At cost price</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{avgMargin.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all products</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{products.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active products</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Product Costing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable data={products} columns={columns} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}