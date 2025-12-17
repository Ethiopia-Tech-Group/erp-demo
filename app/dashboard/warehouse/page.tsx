"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { StockMovement, Product } from "@/lib/types"
import { Package, ArrowUp, ArrowDown, Warehouse } from "lucide-react"

export default function WarehouseDashboard() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    setMovements(getStorageData<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS))
    setProducts(getStorageData<Product>(STORAGE_KEYS.PRODUCTS))
  }, [])

  const stockIn = movements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0)
  const stockOut = movements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0)
  const totalProducts = products.length

  return (
    <AuthGuard allowedRoles={["warehouse"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Warehouse Dashboard</h1>
                <p className="text-muted-foreground mt-1">Stock movements and inventory operations</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Total Stock In"
                  value={stockIn}
                  description="Units received"
                  icon={ArrowUp}
                  trend={{ value: 15, positive: true }}
                />
                <KpiCard
                  title="Total Stock Out"
                  value={stockOut}
                  description="Units issued"
                  icon={ArrowDown}
                  trend={{ value: 8, positive: true }}
                />
                <KpiCard title="Total Products" value={totalProducts} description="In inventory" icon={Package} />
                <KpiCard title="Transactions" value={movements.length} description="Stock movements" icon={Warehouse} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Stock Movements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {movements.slice(0, 10).map((movement) => (
                      <div key={movement.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          {movement.type === "in" ? (
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                              <ArrowUp className="h-4 w-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                              <ArrowDown className="h-4 w-4 text-orange-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{movement.productName}</p>
                            <p className="text-sm text-muted-foreground">{movement.reference}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {movement.type === "in" ? "+" : "-"}
                            {movement.quantity}
                          </p>
                          <p className="text-sm text-muted-foreground">{movement.date}</p>
                        </div>
                      </div>
                    ))}
                    {movements.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No stock movements yet</p>
                    )}
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
