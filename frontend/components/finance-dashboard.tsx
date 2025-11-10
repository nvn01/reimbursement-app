"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle, DollarSign, TrendingUp, Download, LogOut, Filter, Loader2, XCircle, Eye, Clock, Printer } from "lucide-react"
import { authAPI, financeAPI, reimbursementAPI, getFileUrl, type Reimbursement, type ReimbursementStats } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const categoryMap: Record<string, string> = {
  transport: "Perjalanan",
  accommodation: "Akomodasi",
  meals: "Makanan",
  office_supply: "Perlengkapan Kantor",
  other: "Lainnya",
}

const statusMap: Record<string, string> = {
  pending: "Tertunda",
  approved_manager: "Disetujui Manager",
  rejected_manager: "Ditolak Manager",
  approved_finance: "Disetujui Finance",
  rejected_finance: "Ditolak Finance",
  completed: "Selesai",
}

export function FinanceDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState<Reimbursement | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approvedClaims, setApprovedClaims] = useState<Reimbursement[]>([])
  const [allClaims, setAllClaims] = useState<Reimbursement[]>([])
  const [stats, setStats] = useState<ReimbursementStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [receiptClaim, setReceiptClaim] = useState<Reimbursement | null>(null)

  useEffect(() => {
    // Check authentication
    if (!authAPI.isAuthenticated()) {
      router.push('/login')
      return
    }

    const currentUser = authAPI.getCurrentUser()
    if (currentUser?.role !== 'finance') {
      router.push('/login')
      return
    }

    setUser(currentUser)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [pendingData, allData, statsData] = await Promise.all([
        financeAPI.getPending(),
        reimbursementAPI.getAll(),
        reimbursementAPI.getStats(),
      ])
      setApprovedClaims(pendingData || [])
      // Filter claims that have been reviewed by finance
      const reviewedClaims = (allData || []).filter(
        (claim) => claim.status === 'approved_finance' || claim.status === 'rejected_finance' || claim.status === 'completed'
      )
      setAllClaims(reviewedClaims)
      setStats(statsData)
    } catch (error: any) {
      setApprovedClaims([])
      setAllClaims([])
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    router.push('/login')
  }

  const handleApprove = async (id: number) => {
    try {
      setIsSubmitting(true)
      await financeAPI.approve(id, { action: 'approve' })
      toast({
        title: "Berhasil",
        description: "Klaim berhasil divalidasi",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memvalidasi klaim",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClaim) return

    try {
      setIsSubmitting(true)
      await financeAPI.approve(selectedClaim.id, {
        action: 'reject',
        notes: rejectNotes,
      })
      toast({
        title: "Berhasil",
        description: "Klaim berhasil ditolak",
      })
      setShowRejectDialog(false)
      setSelectedClaim(null)
      setRejectNotes("")
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menolak klaim",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintReceipt = (claim: Reimbursement) => {
    setReceiptClaim(claim)
    setShowReceiptDialog(true)
  }

  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bukti Transfer Reimbursement</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .content { margin: 20px 0; }
          .row { display: flex; margin: 10px 0; }
          .label { width: 200px; font-weight: bold; }
          .value { flex: 1; }
          .amount { font-size: 24px; font-weight: bold; color: #16a34a; margin: 20px 0; }
          .footer { margin-top: 50px; border-top: 2px solid #000; padding-top: 20px; }
          .signature { margin-top: 60px; }
          .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 60px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BUKTI TRANSFER REIMBURSEMENT</h1>
          <p>ReimburseFlow Company</p>
          <p>Tanggal: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="content">
          <div class="row">
            <div class="label">No. Klaim:</div>
            <div class="value">#${receiptClaim?.id}</div>
          </div>
          <div class="row">
            <div class="label">Nama Karyawan:</div>
            <div class="value">${receiptClaim?.employee_name}</div>
          </div>
          <div class="row">
            <div class="label">Kategori:</div>
            <div class="value">${receiptClaim && categoryMap[receiptClaim.category]}</div>
          </div>
          <div class="row">
            <div class="label">Deskripsi:</div>
            <div class="value">${receiptClaim?.description}</div>
          </div>
          <div class="row">
            <div class="label">Tanggal Pengajuan:</div>
            <div class="value">${receiptClaim && new Date(receiptClaim.submitted_date).toLocaleDateString('id-ID')}</div>
          </div>
          <div class="row">
            <div class="label">Tanggal Transfer:</div>
            <div class="value">${new Date().toLocaleDateString('id-ID')}</div>
          </div>
          <div class="amount">
            <div class="label">Jumlah Transfer:</div>
            <div>Rp ${receiptClaim?.amount.toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div class="footer">
          <p><strong>Catatan:</strong></p>
          <p>Dana telah ditransfer ke rekening karyawan yang bersangkutan.</p>
          <p>Simpan bukti transfer ini sebagai arsip.</p>
          <div class="signature">
            <p>Hormat kami,</p>
            <div class="signature-line"></div>
            <p><strong>${user?.full_name}</strong></p>
            <p>Finance Department</p>
          </div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

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
            <span className="text-sm text-muted-foreground">{user?.full_name} (Finance)</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
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
        {isLoading ? (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                  <div className="h-4 w-4 animate-pulse bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Klaim</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_submitted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu Validasi</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Disetujui</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Jumlah</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {stats.total_amount.toLocaleString('id-ID')}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Menunggu Validasi ({approvedClaims.length})
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Riwayat ({allClaims.length})
          </Button>
        </div>

        {/* Pending Claims Table */}
        {activeTab === 'pending' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Klaim Disetujui Manager</CardTitle>
                <CardDescription>Klaim siap untuk validasi akhir dan proses pembayaran</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : !approvedClaims || approvedClaims.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Tidak ada klaim menunggu validasi</h3>
                <p className="text-sm text-muted-foreground mt-2">Semua klaim telah divalidasi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Karyawan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kategori</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tanggal</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Jumlah</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedClaims.map((claim) => (
                      <tr key={claim.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-mono text-sm">#{claim.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{claim.employee_name}</td>
                        <td className="px-4 py-3 text-sm">{categoryMap[claim.category]}</td>
                        <td className="px-4 py-3 text-sm">{new Date(claim.submitted_date).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">Rp {claim.amount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {statusMap[claim.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedClaim(claim)}
                              disabled={isSubmitting}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-500 text-white hover:bg-green-600"
                              onClick={() => handleApprove(claim.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              Validasi
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim)
                                setShowRejectDialog(true)
                              }}
                              disabled={isSubmitting}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Tolak
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Validasi</CardTitle>
              <CardDescription>Klaim yang telah Anda validasi</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : !allClaims || allClaims.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Belum ada riwayat</h3>
                  <p className="text-sm text-muted-foreground mt-2">Klaim yang telah divalidasi akan muncul di sini</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Karyawan</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kategori</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tanggal</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Jumlah</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allClaims.map((claim) => (
                        <tr key={claim.id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-mono text-sm">#{claim.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">{claim.employee_name}</td>
                          <td className="px-4 py-3 text-sm">{categoryMap[claim.category]}</td>
                          <td className="px-4 py-3 text-sm">{new Date(claim.submitted_date).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">Rp {claim.amount.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                claim.status === 'approved_finance' || claim.status === 'completed'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                claim.status === 'approved_finance' || claim.status === 'completed'
                                  ? 'bg-green-500 text-white'
                                  : ''
                              }
                            >
                              {(claim.status === 'approved_finance' || claim.status === 'completed') && <CheckCircle className="mr-1 h-3 w-3" />}
                              {claim.status === 'rejected_finance' && <XCircle className="mr-1 h-3 w-3" />}
                              {claim.status === 'approved_finance' && 'Disetujui'}
                              {claim.status === 'rejected_finance' && 'Ditolak'}
                              {claim.status === 'completed' && 'Selesai'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {(claim.status === 'approved_finance' || claim.status === 'completed') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrintReceipt(claim)}
                              >
                                <Printer className="mr-2 h-4 w-4" />
                                Cetak Bukti
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Receipt Dialog */}
      <Dialog
        open={selectedClaim !== null && !showRejectDialog}
        onOpenChange={(open) => !open && setSelectedClaim(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Klaim - #{selectedClaim?.id}</DialogTitle>
            <DialogDescription>
              {selectedClaim?.employee_name} • {selectedClaim && categoryMap[selectedClaim.category]} • Rp {selectedClaim?.amount.toLocaleString('id-ID')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Judul</Label>
              <p className="text-sm">{selectedClaim?.title}</p>
            </div>
            <div>
              <Label>Deskripsi</Label>
              <p className="text-sm text-muted-foreground">{selectedClaim?.description}</p>
            </div>
            <div>
              <Label>Kwitansi</Label>
              <div className="rounded-lg border bg-muted p-4">
                {selectedClaim?.receipt_url ? (
                  selectedClaim.receipt_url.endsWith('.pdf') ? (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-sm font-medium mb-4">Dokumen PDF</p>
                      <Button
                        onClick={() => window.open(getFileUrl(selectedClaim.receipt_url), '_blank')}
                        variant="outline"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Buka PDF
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={getFileUrl(selectedClaim.receipt_url)}
                      alt="Kwitansi"
                      className="mx-auto max-h-96 rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-16 w-16 mb-4" />
                    <p>Tidak ada kwitansi</p>
                  </div>
                )}
              </div>
            </div>
            {selectedClaim?.manager_notes && (
              <div>
                <Label>Catatan Manager</Label>
                <p className="text-sm text-muted-foreground">{selectedClaim.manager_notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Klaim</DialogTitle>
            <DialogDescription>Mohon berikan alasan untuk menolak klaim ini</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan Penolakan</Label>
              <Textarea 
                id="reason" 
                placeholder="Masukkan alasan penolakan..." 
                rows={4}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setSelectedClaim(null)
                  setRejectNotes("")
                }}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi Penolakan'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Transfer Reimbursement</DialogTitle>
            <DialogDescription>
              Preview bukti transfer untuk klaim #{receiptClaim?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 border rounded-lg p-6 bg-muted/50">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold">BUKTI TRANSFER REIMBURSEMENT</h2>
              <p className="text-sm text-muted-foreground">ReimburseFlow Company</p>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">No. Klaim:</span>
                <span>#{receiptClaim?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nama Karyawan:</span>
                <span>{receiptClaim?.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Kategori:</span>
                <span>{receiptClaim && categoryMap[receiptClaim.category]}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tanggal Pengajuan:</span>
                <span>{receiptClaim && new Date(receiptClaim.submitted_date).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tanggal Transfer:</span>
                <span>{new Date().toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-bold">Jumlah Transfer:</span>
                <span className="text-2xl font-bold text-green-600">
                  Rp {receiptClaim?.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
              Tutup
            </Button>
            <Button onClick={printReceipt}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
