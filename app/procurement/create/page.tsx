"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStorageData, setStorageData, STORAGE_KEYS } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import type { PurchaseOrder, PurchaseItem, Supplier, Product } from "@/lib/types"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CreatePurchaseOrderPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [orderDate, setOrderDate] = useState("")
  const [expectedDate, setExpectedDate] = useState("")
  const [items, setItems] = useState<PurchaseItem[]>([])

  useEffect(() => {
    setSuppliers(getStorageData<Supplier>(STORAGE_KEYS.SUPPLIERS))
    setProducts(getStorageData<Product>(STORAGE_KEYS.PRODUCTS))

    const today = new Date().toISOString().split("T")[0]
    setOrderDate(today)

    const fourWeeks = new Date()
    fourWeeks.setDate(fourWeeks.getDate() + 28)
    setExpectedDate(fourWeeks.toISOString().split("T")[0])
  }, [])

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...items]
    const item = updatedItems[index]

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        item.productId = product.id
        item.productName = product.name
        item.unitPrice = product.costPrice
        item.total = item.quantity * product.costPrice
      }
    } else if (field === "quantity") {
      item.quantity = Number(value)
      item.total = item.quantity * item.unitPrice
    } else {
      item[field] = value
    }

    setItems(updatedItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSaveOrder = () => {
    if (!selectedSupplier || items.length === 0) {
      toast({
        title: "Invalid Order",
        description: "Please select a supplier and add at least one item.",
        variant: "destructive",
      })
      return
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplier)
    const user = getCurrentUser()
    const total = calculateTotal()

    const newOrder: PurchaseOrder = {
      id: `PO${Date.now()}`,
      poNumber: `PO-2024-${String(Date.now()).slice(-4)}`,
      supplierId: selectedSupplier,
      supplierName: supplier?.name || "",
      orderDate,
      expectedDate,
      status: "draft",
      items,
      total,
      createdBy: user?.name || "Unknown",
    }

    const currentOrders = getStorageData<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS)
    setStorageData(STORAGE_KEYS.PURCHASE_ORDERS, [...currentOrders, newOrder])

    toast({
      title: "Purchase Order Created",
      description: `Purchase order ${newOrder.poNumber} has been successfully created.`,
    })
    
    router.push("/procurement")
  }

  const total = calculateTotal()

  return (
    <AuthGuard allowedRoles={["admin", "manager", "procurement"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">Create Purchase Order</h1>
                  <p className="text-muted-foreground mt-1">Add a new purchase order from a supplier</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Supplier</label>
                      <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Order Date</label>
                      <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expected Delivery</label>
                      <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No items added yet</p>
                        <Button onClick={addItem} className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Item
                        </Button>
                      </div>
                    ) : (
                      items.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                          <div className="md:col-span-5">
                            <label className="text-sm font-medium">Product</label>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => updateItem(index, "productId", value)}
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
                              onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Unit Price</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
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
                            <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="mt-6">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <Button onClick={addItem} variant="outline" className="w-full md:w-auto mt-4">
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
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button onClick={handleSaveOrder}>Save Purchase Order</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}