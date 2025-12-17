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
import type { PurchaseOrder, PurchaseStatus } from "@/lib/types"
import { Search, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ProcurementPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    setOrders(getStorageData<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS))
  }, [])

  const filteredOrders = orders.filter((order) => {
    if (!order) return false
    
    const matchesSearch =
      (order.poNumber && order.poNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.supplierName && order.supplierName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || (order.status && order.status === statusFilter)

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: PurchaseStatus) => {
    const currentOrders = getStorageData<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS)
    const updatedOrders = currentOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    setStorageData(STORAGE_KEYS.PURCHASE_ORDERS, updatedOrders)
    
    // Update local state
    setOrders(updatedOrders)
    
    const order = currentOrders.find(o => o.id === orderId)
    if (order) {
      toast({
        title: "Status Updated",
        description: `Purchase order ${order.poNumber} status has been updated to ${newStatus}.`,
      })
    }
  }

  const StatusCell = ({ order }: { order: PurchaseOrder }) => (
    <Select value={order.status} onValueChange={(value: PurchaseStatus) => handleStatusChange(order.id, value)}>
      <SelectTrigger className="w-32 h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="ordered">Ordered</SelectItem>
        <SelectItem value="received">Received</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  )

  const columns = [
    {
      header: "PO Number",
      accessor: "poNumber" as keyof PurchaseOrder,
      cell: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      header: "Supplier",
      accessor: "supplierName" as keyof PurchaseOrder,
    },
    {
      header: "Order Date",
      accessor: "orderDate" as keyof PurchaseOrder,
    },
    {
      header: "Expected Date",
      accessor: "expectedDate" as keyof PurchaseOrder,
    },
    {
      header: "Total",
      accessor: "total" as keyof PurchaseOrder,
      cell: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      header: "Status",
      accessor: "status" as keyof PurchaseOrder,
      cell: (value: PurchaseStatus, row: PurchaseOrder) => <StatusCell order={row} />,
    },
  ] as any // Type assertion to bypass strict typing for this specific case

  return (
    <AuthGuard allowedRoles={["admin", "manager", "procurement"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Purchase Orders</h1>
                  <p className="text-muted-foreground mt-1">Manage supplier orders and procurement</p>
                </div>
                <Button onClick={() => router.push("/procurement/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create PO
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search by PO number or supplier..."
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
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Purchase Orders ({filteredOrders.length})</CardTitle>
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