"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { FileText, Download, Calendar, Filter, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState("monthly")
  const [reportType, setReportType] = useState("sales")

  // Mock data for charts
  const salesData = [
    { month: "Jan", sales: 45000, profit: 18000 },
    { month: "Feb", sales: 52000, profit: 21000 },
    { month: "Mar", sales: 48000, profit: 19000 },
    { month: "Apr", sales: 61000, profit: 25000 },
    { month: "May", sales: 55000, profit: 22000 },
    { month: "Jun", sales: 67000, profit: 28000 },
  ]

  const productData = [
    { name: "Coffee Beans", value: 35 },
    { name: "Sesame Seeds", value: 25 },
    { name: "Leather Goods", value: 20 },
    { name: "Jewelry", value: 15 },
    { name: "Spices", value: 5 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const exportReport = () => {
    alert("Report exported successfully!")
  }

  return (
    <AuthGuard allowedRoles={["admin", "manager", "finance"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Reports</h1>
                  <p className="text-muted-foreground mt-1">Generate and export detailed business reports</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="procurement">Procurement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={exportReport} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
                        <Bar dataKey="profit" fill="#10b981" name="Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={productData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {productData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Sales" />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Reports Generated</span>
                        <span className="font-bold">124</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most Popular Report</span>
                        <span className="font-bold">Sales Summary</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Generated</span>
                        <span className="font-bold">Today, 10:30 AM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Monthly Sales Report", date: "Dec 15, 2024", type: "Sales" },
                        { name: "Inventory Analysis", date: "Dec 10, 2024", type: "Inventory" },
                        { name: "Q4 Financial Summary", date: "Dec 5, 2024", type: "Finance" },
                        { name: "Supplier Performance", date: "Nov 28, 2024", type: "Procurement" },
                      ].map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">{report.name}</p>
                            <p className="text-sm text-muted-foreground">{report.date} • {report.type}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => alert(`Downloading ${report.name}`)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}