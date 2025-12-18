"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageData, setStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { SalesOrder, OrderItem } from "@/lib/types"
import { ArrowLeft, Printer, Download, Package, Truck, CheckCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SalesOrderDetailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<SalesOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      const orders = getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS)
      const foundOrder = orders.find(o => o.id === orderId) || null
      setOrder(foundOrder)
      setLoading(false)
    }
  }, [orderId])

  const handleStatusChange = (newStatus: SalesOrder["status"]) => {
    if (!order) return
    
    const orders = getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS)
    const updatedOrders = orders.map(o => 
      o.id === order.id ? { ...o, status: newStatus } : o
    )
    
    setStorageData(STORAGE_KEYS.SALES_ORDERS, updatedOrders)
    setOrder({ ...order, status: newStatus })
    
    toast({
      title: "Status Updated",
      description: `Order status has been updated to ${newStatus}.`,
    })
  }

  const getStatusBadge = (status: SalesOrder["status"]) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
      approved: { label: "Approved", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
      shipped: { label: "Shipped", className: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
      delivered: { label: "Delivered", className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
      completed: { label: "Completed", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
    }
    
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["admin", "manager", "sales"]}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!order) {
    return (
      <AuthGuard allowedRoles={["admin", "manager", "sales"]}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Order Not Found</h2>
            <p className="mt-2 text-muted-foreground">The requested order could not be found.</p>
            <Button onClick={() => router.push("/sales")} className="mt-4">
              Back to Orders
            </Button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["admin", "manager", "sales"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold">Order Details</h1>
                    <p className="text-muted-foreground mt-1">View and manage sales order #{order.orderNumber}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Order Number</h3>
                      <p className="font-medium mt-1">{order.orderNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                      <p className="font-medium mt-1">{order.customerName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <div className="mt-1">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
                      <p className="font-medium mt-1">{order.orderDate}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Delivery Date</h3>
                      <p className="font-medium mt-1">{order.deliveryDate}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                      <p className="font-medium mt-1">{order.createdBy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Product</th>
                          <th className="text-right py-3 px-2">Quantity</th>
                          <th className="text-right py-3 px-2">Unit Price</th>
                          <th className="text-right py-3 px-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-2">
                              <div className="font-medium">{item.productName}</div>
                            </td>
                            <td className="py-3 px-2 text-right">{item.quantity}</td>
                            <td className="py-3 px-2 text-right">${item.unitPrice.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right">${item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 max-w-xs ml-auto">
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span className="font-medium">${order.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold border-t mt-2 pt-2">
                      <span>Total</span>
                      <span>${order.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 text-green-600">
                      <span>Estimated Profit</span>
                      <span className="font-medium">${order.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {order.status === "draft" && (
                      <>
                        <Button onClick={() => handleStatusChange("approved")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Order
                        </Button>
                        <Button variant="outline">Edit Order</Button>
                      </>
                    )}
                    {order.status === "approved" && (
                      <Button onClick={() => handleStatusChange("shipped")}>
                        <Truck className="h-4 w-4 mr-2" />
                        Mark as Shipped
                      </Button>
                    )}
                    {order.status === "shipped" && (
                      <Button onClick={() => handleStatusChange("delivered")}>
                        <Package className="h-4 w-4 mr-2" />
                        Mark as Delivered
                      </Button>
                    )}
                    {order.status === "delivered" && (
                      <Button onClick={() => handleStatusChange("completed")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Order
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push("/sales")}>
                      Back to Orders
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