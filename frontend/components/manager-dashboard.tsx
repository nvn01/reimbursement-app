"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle, XCircle, Clock, Users, DollarSign, LogOut, Eye, Loader2 } from "lucide-react"
import { authAPI, managerAPI, reimbursementAPI, getFileUrl, type Reimbursement, type ReimbursementStats, type ReimbursementCategory } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const categoryMap: Record<string, string> = {
  transport: "Perjalanan",
  accommodation: "Akomodasi",
  meals: "Makanan",
  office_supply: "Perlengkapan Kantor",
  other: "Lainnya",
}

export function ManagerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedClaim, setSelectedClaim] = useState<Reimbursement | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [pendingClaims, setPendingClaims] = useState<Reimbursement[]>([])
  const [allClaims, setAllClaims] = useState<Reimbursement[]>([])
  const [stats, setStats] = useState<ReimbursementStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')

  useEffect(() => {
    // Check authentication
    if (!authAPI.isAuthenticated()) {
      router.push('/login')
      return
    }

    const currentUser = authAPI.getCurrentUser()
    if (currentUser?.role !== 'manager') {
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
        managerAPI.getPending(),
        reimbursementAPI.getAll(),
        reimbursementAPI.getStats(),
      ])
      setPendingClaims(pendingData || [])
      // Filter claims that have been reviewed by manager
      const reviewedClaims = (allData || []).filter(
        (claim) => claim.status !== 'pending'
      )
      setAllClaims(reviewedClaims)
      setStats(statsData)
    } catch (error: any) {
      setPendingClaims([])
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
      await managerAPI.approve(id, { action: 'approve' })
      toast({
        title: "Berhasil",
        description: "Klaim berhasil disetujui",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyetujui klaim",
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
      await managerAPI.approve(selectedClaim.id, {
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
            <span className="text-sm text-muted-foreground">{user?.full_name} (Manager)</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu Tinjauan</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Disetujui</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Jumlah</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
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
            Tertunda ({pendingClaims.length})
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Riwayat ({allClaims.length})
          </Button>
        </div>

        {/* Pending Claims */}
        {activeTab === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Persetujuan Tertunda</CardTitle>
              <CardDescription>Klaim yang menunggu tinjauan dan persetujuan Anda</CardDescription>
            </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : !pendingClaims || pendingClaims.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Tidak ada klaim tertunda</h3>
                <p className="text-sm text-muted-foreground mt-2">Semua klaim telah ditinjau</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClaims.map((claim) => (
                  <div key={claim.id} className="rounded-lg border bg-card p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">#{claim.id}</span>
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            Tertunda
                          </Badge>
                        </div>
                        <p className="font-medium">{claim.employee_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(claim.submitted_date).toLocaleDateString('id-ID')} • {categoryMap[claim.category]}
                        </p>
                      </div>
                      <p className="text-xl font-bold">Rp {claim.amount.toLocaleString('id-ID')}</p>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">{claim.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedClaim(claim)} disabled={isSubmitting}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Kwitansi
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
                        Setujui
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Tinjauan</CardTitle>
              <CardDescription>Klaim yang telah Anda tinjau</CardDescription>
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
                  <p className="text-sm text-muted-foreground mt-2">Klaim yang telah ditinjau akan muncul di sini</p>
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
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Catatan</th>
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
                                claim.status === 'approved_manager' || claim.status === 'approved_finance' || claim.status === 'completed'
                                  ? 'default'
                                  : claim.status === 'rejected_manager' || claim.status === 'rejected_finance'
                                    ? 'destructive'
                                    : 'outline'
                              }
                              className={
                                claim.status === 'approved_manager' || claim.status === 'approved_finance' || claim.status === 'completed'
                                  ? 'bg-green-500 text-white'
                                  : ''
                              }
                            >
                              {claim.status === 'approved_manager' && <CheckCircle className="mr-1 h-3 w-3" />}
                              {(claim.status === 'rejected_manager' || claim.status === 'rejected_finance') && <XCircle className="mr-1 h-3 w-3" />}
                              {claim.status === 'approved_manager' && 'Disetujui'}
                              {claim.status === 'rejected_manager' && 'Ditolak'}
                              {claim.status === 'approved_finance' && 'Disetujui Finance'}
                              {claim.status === 'rejected_finance' && 'Ditolak Finance'}
                              {claim.status === 'completed' && 'Selesai'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {claim.manager_notes || '-'}
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
            <DialogTitle>Kwitansi - #{selectedClaim?.id}</DialogTitle>
            <DialogDescription>
              {selectedClaim?.employee_name} • {selectedClaim && categoryMap[selectedClaim.category]} • Rp {selectedClaim?.amount.toLocaleString('id-ID')}
            </DialogDescription>
          </DialogHeader>
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
    </div>
  )
}
