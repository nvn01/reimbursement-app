"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle, XCircle, Clock, Users, LogOut, Eye } from "lucide-react"
import Link from "next/link"

// Dummy data
const pendingClaims = [
  {
    id: "CLM-005",
    employee: "Sarah Johnson",
    date: "2025-01-23",
    type: "Perjalanan",
    amount: 320000,
    description: "Transportasi bandara untuk kunjungan klien",
    receipt: "/paper-receipt.png",
  },
  {
    id: "CLM-006",
    employee: "Mike Chen",
    date: "2025-01-24",
    type: "Makanan",
    amount: 95000,
    description: "Makan malam bisnis dengan mitra",
    receipt: "/paper-receipt.png",
  },
  {
    id: "CLM-007",
    employee: "Emma Davis",
    date: "2025-01-22",
    type: "Perlengkapan Kantor",
    amount: 180000,
    description: "Pembelian peralatan untuk kantor rumah",
    receipt: "/paper-receipt.png",
  },
]

const stats = [
  { label: "Anggota Tim", value: "12", icon: Users },
  { label: "Menunggu Tinjauan", value: "8", icon: Clock },
  { label: "Disetujui Hari Ini", value: "5", icon: CheckCircle },
  { label: "Total Bulan Ini", value: "Rp 12.450.000", icon: FileText },
]

export function ManagerDashboard() {
  const [selectedClaim, setSelectedClaim] = useState<(typeof pendingClaims)[0] | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

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
            <span className="text-sm text-muted-foreground">Jane Smith (Manager)</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Tinjauan Klaim Tim</h1>
          <p className="text-muted-foreground">Tinjau dan setujui klaim reimbursement dari tim Anda</p>
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

        {/* Pending Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Persetujuan Tertunda</CardTitle>
            <CardDescription>Klaim yang menunggu tinjauan dan persetujuan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <div key={claim.id} className="rounded-lg border bg-card p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{claim.id}</span>
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          Tertunda
                        </Badge>
                      </div>
                      <p className="font-medium">{claim.employee}</p>
                      <p className="text-sm text-muted-foreground">
                        {claim.date} • {claim.type}
                      </p>
                    </div>
                    <p className="text-xl font-bold">Rp {claim.amount.toLocaleString('id-ID')}</p>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">{claim.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedClaim(claim)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Kwitansi
                    </Button>
                    <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Setujui
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedClaim(claim)
                        setShowRejectDialog(true)
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Tolak
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Receipt Dialog */}
      <Dialog
        open={selectedClaim !== null && !showRejectDialog}
        onOpenChange={(open) => !open && setSelectedClaim(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kwitansi - {selectedClaim?.id}</DialogTitle>
            <DialogDescription>
              {selectedClaim?.employee} • {selectedClaim?.type} • Rp {selectedClaim?.amount.toLocaleString('id-ID')}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted p-4">
            <img
              src={selectedClaim?.receipt || "/placeholder.svg"}
              alt="Kwitansi"
              className="mx-auto max-h-96 rounded"
            />
          </div>
          <p className="text-sm text-muted-foreground">{selectedClaim?.description}</p>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Klaim</DialogTitle>
            <DialogDescription>Mohon berikan alasan untuk menolak klaim ini</DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan Penolakan</Label>
              <Textarea id="reason" placeholder="Masukkan alasan penolakan..." rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setSelectedClaim(null)
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="destructive"
                onClick={() => {
                  setShowRejectDialog(false)
                  setSelectedClaim(null)
                }}
              >
                Konfirmasi Penolakan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
