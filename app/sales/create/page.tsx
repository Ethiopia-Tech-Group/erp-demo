"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStorageData, setStorageData, STORAGE_KEYS } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import type { Customer, Product, SalesOrder, OrderItem } from "@/lib/types"
import { Plus, X, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CreateSalesOrderPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>(() => getStorageData<Customer>(STORAGE_KEYS.CUSTOMERS) || [])
  const [products, setProducts] = useState<Product[]>(() => getStorageData<Product>(STORAGE_KEYS.PRODUCTS) || [])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split("T")[0])
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split("T")[0]
  })
  const [items, setItems] = useState<OrderItem[]>([
    {
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      costPrice: 0,
      total: 0,
    },
  ])

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        costPrice: 0,
        total: 0,
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items]
    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value as string,
          productName: product.name,
          unitPrice: product.salePrice,
          costPrice: product.costPrice,
          total: product.salePrice * (newItems[index].quantity || 1),
        }
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      }
      if (field === "quantity") {
        newItems[index].total = (newItems[index].unitPrice || 0) * (value as number)
      }
    }
    setItems(newItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax
    const profit = items.reduce((sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity, 0)

    return { subtotal, tax, total, profit }
  }

  const handleSaveOrder = () => {
    if (!selectedCustomer || items.length === 0) {
      toast({
        title: "Invalid Order",
        description: "Please select a customer and add at least one item.",
        variant: "destructive",
      })
      return
    }

    const customer = customers.find((c) => c.id === selectedCustomer)
    const user = getCurrentUser()
    const { subtotal, tax, total, profit } = calculateTotals()

    const newOrder: SalesOrder = {
      id: `SO${Date.now()}`,
      orderNumber: `SO-2024-${String(Date.now()).slice(-4)}`,
      customerId: selectedCustomer,
      customerName: customer?.name || "",
      orderDate,
      deliveryDate,
      status: "draft",
      items,
      subtotal,
      tax,
      total,
      profit,
      createdBy: user?.name || "Unknown",
    }

    const currentOrders = getStorageData<SalesOrder>(STORAGE_KEYS.SALES_ORDERS)
    setStorageData(STORAGE_KEYS.SALES_ORDERS, [...currentOrders, newOrder])

    toast({
      title: "Order Created",
      description: `Sales order ${newOrder.orderNumber} has been successfully created.`,
    })
    
    router.push("/sales")
  }

  const { subtotal, tax, total, profit } = calculateTotals()

  return (
    <AuthGuard allowedRoles={["admin", "manager", "sales"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Create Sales Order</h1>
                  <p className="text-muted-foreground mt-1">Create a new sales order for a customer</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Customer</label>
                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Order Date</label>
                      <Input
                        type="date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Delivery Date</label>
                      <Input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-5">
                        <label className="text-sm font-medium">Product</label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => handleItemChange(index, "productId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Unit Price</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Total</label>
                        <Input
                          type="number"
                          readOnly
                          value={item.total.toFixed(2)}
                          className="bg-muted"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" onClick={handleAddItem} className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-w-xs ml-auto">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span className="font-medium">${tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Estimated Profit</span>
                      <span className="font-medium">${profit.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button onClick={handleSaveOrder}>Save Order</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}