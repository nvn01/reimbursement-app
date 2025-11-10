"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, CheckCircle, DollarSign, TrendingUp, Download, LogOut, Filter } from "lucide-react"
import Link from "next/link"

// Dummy data
const approvedClaims = [
  {
    id: "CLM-001",
    employee: "John Doe",
    department: "Sales",
    date: "2025-01-15",
    type: "Perjalanan",
    amount: 450000,
    status: "Tervalidasi",
    manager: "Jane Smith",
  },
  {
    id: "CLM-008",
    employee: "Sarah Johnson",
    department: "Marketing",
    date: "2025-01-18",
    type: "Makanan",
    amount: 120000,
    status: "Menunggu Validasi",
    manager: "Jane Smith",
  },
  {
    id: "CLM-002",
    employee: "Mike Chen",
    department: "Engineering",
    date: "2025-01-20",
    type: "Perlengkapan Kantor",
    amount: 275000,
    status: "Tervalidasi",
    manager: "Robert Brown",
  },
  {
    id: "CLM-009",
    employee: "Emma Davis",
    department: "Sales",
    date: "2025-01-22",
    type: "Perjalanan",
    amount: 680000,
    status: "Menunggu Validasi",
    manager: "Jane Smith",
  },
]

const stats = [
  { label: "Klaim Disetujui", value: "24", icon: CheckCircle },
  { label: "Menunggu Validasi", value: "6", icon: FileText },
  { label: "Dibayar Bulan Ini", value: "18", icon: TrendingUp },
  { label: "Total Jumlah", value: "Rp 24.850.000", icon: DollarSign },
]

export function FinanceDashboard() {
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">ReimburseFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Alex Johnson (Finance Admin)</span>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Finance</h1>
            <p className="text-muted-foreground">Validasi dan proses klaim reimbursement yang disetujui</p>
          </div>
          <Button size="lg">
            <Download className="mr-2 h-4 w-4" />
            Ekspor ke Excel
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Claims Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Klaim Disetujui</CardTitle>
                <CardDescription>Klaim siap untuk validasi akhir dan proses pembayaran</CardDescription>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Departemen</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu Validasi</SelectItem>
                  <SelectItem value="validated">Tervalidasi</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Cari klaim..." className="max-w-xs" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID Klaim</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Karyawan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Departemen</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tipe</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tanggal</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Jumlah</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedClaims.map((claim) => (
                    <tr key={claim.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-sm">{claim.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{claim.employee}</td>
                      <td className="px-4 py-3 text-sm">{claim.department}</td>
                      <td className="px-4 py-3 text-sm">{claim.type}</td>
                      <td className="px-4 py-3 text-sm">{claim.date}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">Rp {claim.amount.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={claim.status === "Tervalidasi" ? "secondary" : "outline"}
                          className={claim.status === "Tervalidasi" ? "bg-accent text-accent-foreground" : ""}
                        >
                          {claim.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {claim.status === "Tervalidasi" ? (
                          <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Tandai Dibayar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            Validasi
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
