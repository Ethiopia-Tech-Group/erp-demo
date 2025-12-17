"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStorageData, setStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { SalesOrder, OrderStatus } from "@/lib/types"
import { Search, Plus, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SalesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    setOrders(getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS))
  }, [])

  const filteredOrders = orders.filter((order) => {
    if (!order) return false
    
    const matchesSearch =
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || (order.status && order.status === statusFilter)

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const currentOrders = getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS)
    const updatedOrders = currentOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    setStorageData(STORAGE_KEYS.SALES_ORDERS, updatedOrders)
    
    // Update local state
    setOrders(updatedOrders)
    
    const order = currentOrders.find(o => o.id === orderId)
    if (order) {
      toast({
        title: "Status Updated",
        description: `Sales order ${order.orderNumber} status has been updated to ${newStatus}.`,
      })
    }
  }

  const StatusCell = ({ order }: { order: SalesOrder }) => (
    <Select value={order.status} onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}>
      <SelectTrigger className="w-32 h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="shipped">Shipped</SelectItem>
        <SelectItem value="delivered">Delivered</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  )

  const getStatusBadge = (status: OrderStatus) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      approved: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      shipped: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
      delivered: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      completed: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[status]}`}>{status}</span>
    )
  }

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
      header: "Delivery Date",
      accessor: "deliveryDate" as keyof SalesOrder,
    },
    {
      header: "Total",
      accessor: "total" as keyof SalesOrder,
      cell: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      header: "Profit",
      accessor: "profit" as keyof SalesOrder,
      cell: (value: number) => <span className="text-green-600 font-medium">${value.toLocaleString()}</span>,
    },
    {
      header: "Status",
      accessor: "status" as keyof SalesOrder,
      cell: (_value: OrderStatus, row: SalesOrder) => <StatusCell order={row} />,
    },
    {
      header: "Actions",
      accessor: ((order: SalesOrder) => (
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      )) as unknown as keyof SalesOrder,
    },
  ] as any // Type assertion to bypass strict typing for this specific case

  return (
    <AuthGuard allowedRoles={["admin", "manager", "sales"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Sales Orders</h1>
                  <p className="text-muted-foreground mt-1">Manage customer orders and track status</p>
                </div>
                <Button onClick={() => router.push("/sales/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search by order number or customer..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Orders Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable data={filteredOrders} columns={columns} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}