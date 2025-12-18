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
import type { Product, StockMovement } from "@/lib/types"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function StockOutPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(() => getStorageData<Product>(STORAGE_KEYS.PRODUCTS))
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")

  const handleStockOut = () => {
    if (!selectedProduct || !quantity || Number(quantity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a product and enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    if (product.currentStock < Number(quantity)) {
      toast({
        title: "Insufficient Stock",
        description: `Not enough stock available. Current stock: ${product.currentStock}`,
        variant: "destructive",
      })
      return
    }

    const user = getCurrentUser()

    // Create stock movement record
    const movement: StockMovement = {
      id: `SM${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: "out",
      quantity: Number(quantity),
      reference: reference || "Direct Issue",
      date: new Date().toISOString().split("T")[0],
      notes,
      createdBy: user?.name || "Unknown",
    }

    const movements = getStorageData<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS)
    setStorageData(STORAGE_KEYS.STOCK_MOVEMENTS, [...movements, movement])

    // Update product stock
    const allProducts = getStorageData<Product>(STORAGE_KEYS.PRODUCTS)
    const updatedProducts = allProducts.map((p) =>
      p.id === selectedProduct ? { ...p, currentStock: p.currentStock - Number(quantity) } : p,
    )
    setStorageData(STORAGE_KEYS.PRODUCTS, updatedProducts)

    toast({
      title: "Stock Removed",
      description: `${quantity} units of ${product.name} have been successfully removed from inventory.`,
    })
    
    setSelectedProduct("")
    setQuantity("")
    setReference("")
    setNotes("")
    setProducts(updatedProducts)
  }

  return (
    <AuthGuard allowedRoles={["admin", "warehouse"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Stock Out</h1>
                  <p className="text-muted-foreground mt-1">Remove inventory from stock</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Remove Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Product</label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Available: {product.currentStock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity to remove"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Reference (Optional)</label>
                    <Input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g., SO-2024-001"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleStockOut} className="flex-1">
                      Remove Stock
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/inventory")}>
                      Cancel
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
