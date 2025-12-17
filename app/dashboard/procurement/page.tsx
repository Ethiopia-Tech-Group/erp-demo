"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { PurchaseOrder, Product } from "@/lib/types"
import { DollarSign, Package, TrendingDown, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProcurementDashboard() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    setPurchaseOrders(getStorageData<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS))
    setProducts(getStorageData<Product>(STORAGE_KEYS.PRODUCTS))
  }, [])

  const totalSpend = purchaseOrders.reduce((sum, order) => sum + (order?.total || 0), 0)
  const pendingOrders = purchaseOrders.filter((o) => o?.status && (o.status === "draft" || o.status === "ordered")).length
  const lowStockProducts = products.filter((p) => (p?.currentStock || 0) <= (p?.reorderLevel || 0)).length

  return (
    <AuthGuard allowedRoles={["procurement"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Procurement Dashboard</h1>
                <p className="text-muted-foreground mt-1">Supplier management and purchasing overview</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Total Spend"
                  value={`$${totalSpend.toLocaleString()}`}
                  description="All purchase orders"
                  icon={DollarSign}
                />
                <KpiCard title="Purchase Orders" value={purchaseOrders.length} description="Total POs" icon={Package} />
                <KpiCard
                  title="Pending Orders"
                  value={pendingOrders}
                  description="Awaiting delivery"
                  icon={TrendingDown}
                />
                <KpiCard
                  title="Low Stock Alert"
                  value={lowStockProducts}
                  description="Need reordering"
                  icon={AlertTriangle}
                />
              </div>

              {lowStockProducts > 0 && (
                <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <p className="text-sm font-medium">
                        <span className="font-bold">{lowStockProducts}</span> product(s) need reordering. Check
                        inventory levels.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseOrders.slice(0, 10).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{order.poNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.supplierName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toLocaleString()}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                : order.status === "received"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                  : order.status === "ordered"
                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
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
                      <Link href="/procurement">View All Purchase Orders</Link>
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
