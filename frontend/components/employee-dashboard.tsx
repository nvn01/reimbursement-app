"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Upload, Clock, CheckCircle, XCircle, DollarSign, LogOut } from "lucide-react"
import Link from "next/link"

// Dummy data
const claims = [
  {
    id: "CLM-001",
    date: "2025-01-15",
    type: "Perjalanan",
    amount: 450000,
    status: "Dibayar",
    description: "Transportasi pertemuan klien",
  },
  {
    id: "CLM-002",
    date: "2025-01-20",
    type: "Makanan",
    amount: 85000,
    status: "Disetujui Manager",
    description: "Makan siang tim",
  },
  {
    id: "CLM-003",
    date: "2025-01-22",
    type: "Perlengkapan Kantor",
    amount: 120000,
    status: "Tertunda",
    description: "Pembelian alat tulis",
  },
  { id: "CLM-004", date: "2025-01-10", type: "Perjalanan", amount: 200000, status: "Ditolak", description: "Ongkos taksi" },
]

const stats = [
  { label: "Total Klaim", value: "12", icon: FileText },
  { label: "Tertunda", value: "3", icon: Clock },
  { label: "Disetujui", value: "7", icon: CheckCircle },
  { label: "Total Jumlah", value: "Rp 3.450.000", icon: DollarSign },
]

export function EmployeeDashboard() {
  const [open, setOpen] = useState(false)

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
            <span className="text-sm text-muted-foreground">John Doe (Employee)</span>
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
            <h1 className="text-3xl font-bold text-foreground">Klaim Saya</h1>
            <p className="text-muted-foreground">Ajukan dan lacak klaim reimbursement Anda</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Klaim Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Buat Klaim Baru</DialogTitle>
                <DialogDescription>Isi detail untuk klaim reimbursement Anda</DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipe</Label>
                    <Select>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Perjalanan</SelectItem>
                        <SelectItem value="meals">Makanan</SelectItem>
                        <SelectItem value="office">Perlengkapan Kantor</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah</Label>
                  <Input id="amount" type="number" placeholder="0.00" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" placeholder="Berikan detail tentang klaim ini" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt">Unggah Kwitansi</Label>
                  <div className="flex items-center gap-2">
                    <Input id="receipt" type="file" accept="image/*,.pdf" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Format yang diterima: JPG, PNG, PDF</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Ajukan Klaim</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Klaim</CardTitle>
            <CardDescription>Lihat dan lacak semua klaim yang telah Anda ajukan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID Klaim</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tipe</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Deskripsi</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Jumlah</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-sm">{claim.id}</td>
                      <td className="px-4 py-3 text-sm">{claim.date}</td>
                      <td className="px-4 py-3 text-sm">{claim.type}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{claim.description}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">Rp {claim.amount.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            claim.status === "Dibayar"
                              ? "default"
                              : claim.status === "Disetujui Manager"
                                ? "secondary"
                                : claim.status === "Tertunda"
                                  ? "outline"
                                  : "destructive"
                          }
                          className={
                            claim.status === "Dibayar"
                              ? "bg-success text-success-foreground"
                              : claim.status === "Disetujui Manager"
                                ? "bg-accent text-accent-foreground"
                                : ""
                          }
                        >
                          {claim.status === "Dibayar" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {claim.status === "Tertunda" && <Clock className="mr-1 h-3 w-3" />}
                          {claim.status === "Ditolak" && <XCircle className="mr-1 h-3 w-3" />}
                          {claim.status}
                        </Badge>
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
