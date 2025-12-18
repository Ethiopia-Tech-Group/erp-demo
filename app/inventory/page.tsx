"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { DataTable } from "@/components/data-table"
import { ProductForm } from "@/components/product-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import type { Product } from "@/lib/types"
import { Search, AlertTriangle, Plus } from "lucide-react"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(() => getStorageData<Product>(STORAGE_KEYS.PRODUCTS) || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  
  const user = getCurrentUser()

  const loadProducts = () => {
    const updatedProducts = getStorageData<Product>(STORAGE_KEYS.PRODUCTS) || []
    setProducts(updatedProducts)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel)

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
      header: "Current Stock",
      accessor: ((product: Product) => (
        <div className="flex items-center gap-2">
          <span className={product.currentStock <= product.reorderLevel ? "text-orange-600 font-medium" : ""}>
            {product.currentStock} {product.unit}
          </span>
          {product.currentStock <= product.reorderLevel && <AlertTriangle className="h-4 w-4 text-orange-600" />}
        </div>
      )) as unknown as keyof Product,
    },
    {
      header: "Reorder Level",
      accessor: "reorderLevel" as keyof Product,
      cell: (value: unknown) => `${Number(value)}`,
    },
    {
      header: "Cost Price",
      accessor: "costPrice" as keyof Product,
      cell: (value: unknown) => `$${Number(value)}`,
    },
    {
      header: "Sale Price",
      accessor: "salePrice" as keyof Product,
      cell: (value: unknown) => `$${Number(value)}`,
    },
  ]

  // Check if user is admin or warehouse
  const canAddProducts = user?.role === "admin" || user?.role === "warehouse"

  return (
    <AuthGuard allowedRoles={["admin", "manager", "sales", "procurement", "warehouse"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Inventory Management</h1>
                  <p className="text-muted-foreground mt-1">Track product stock levels and reorder points</p>
                </div>
                
                {canAddProducts && (
                  <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {showForm ? "Cancel" : "Add Product"}
                  </Button>
                )}
              </div>

              {canAddProducts && showForm && (
                <ProductForm onProductAdded={loadProducts} />
              )}

              {lowStockProducts.length > 0 && (
                <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <p className="text-sm font-medium">
                        <span className="font-bold">{lowStockProducts.length}</span> product(s) are at or below reorder
                        level. Consider replenishing stock.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products by name, code, or category..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Products ({filteredProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable data={filteredProducts} columns={columns} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}