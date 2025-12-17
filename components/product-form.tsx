"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getStorageData, setStorageData, STORAGE_KEYS } from "@/lib/storage"
import type { Product } from "@/lib/types"

interface ProductFormProps {
  onProductAdded?: () => void
}

export function ProductForm({ onProductAdded }: ProductFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    unit: "",
    costPrice: "",
    salePrice: "",
    currentStock: "",
    reorderLevel: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.code || !formData.name || !formData.category || !formData.unit) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number(formData.costPrice)) || isNaN(Number(formData.salePrice)) || 
        isNaN(Number(formData.currentStock)) || isNaN(Number(formData.reorderLevel))) {
      toast({
        title: "Validation Error",
        description: "Please enter valid numbers for price and stock fields.",
        variant: "destructive",
      })
      return
    }

    // Create new product
    const newProduct: Product = {
      id: `P${Date.now()}`,
      code: formData.code,
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      costPrice: Number(formData.costPrice),
      salePrice: Number(formData.salePrice),
      currentStock: Number(formData.currentStock),
      reorderLevel: Number(formData.reorderLevel),
    }

    // Save to storage
    const currentProducts = getStorageData<Product>(STORAGE_KEYS.PRODUCTS)
    setStorageData(STORAGE_KEYS.PRODUCTS, [...currentProducts, newProduct])

    // Reset form
    setFormData({
      code: "",
      name: "",
      category: "",
      unit: "",
      costPrice: "",
      salePrice: "",
      currentStock: "",
      reorderLevel: "",
    })

    toast({
      title: "Product Added",
      description: `Product "${newProduct.name}" has been successfully added to inventory.`,
    })

    if (onProductAdded) {
      onProductAdded()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Product Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="e.g., TEX-001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Cotton T-Shirts"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Textiles">Textiles</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                placeholder="e.g., Pack, Box, Set"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price ($) *</Label>
              <Input
                id="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleChange("costPrice", e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price ($) *</Label>
              <Input
                id="salePrice"
                type="number"
                value={formData.salePrice}
                onChange={(e) => handleChange("salePrice", e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock *</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => handleChange("currentStock", e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level *</Label>
              <Input
                id="reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => handleChange("reorderLevel", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}