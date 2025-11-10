"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { FileText, Plus, Upload, Clock, CheckCircle, XCircle, DollarSign, LogOut, Loader2, X, Printer, Download } from "lucide-react"
import { authAPI, reimbursementAPI, uploadAPI, type Reimbursement, type ReimbursementStats, type ReimbursementCategory } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const categoryMap: Record<ReimbursementCategory, string> = {
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

export function EmployeeDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [stats, setStats] = useState<ReimbursementStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Reimbursement | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    category: "" as ReimbursementCategory,
    amount: "",
    receipt_url: "",
  })

  useEffect(() => {
    // Check authentication
    if (!authAPI.isAuthenticated()) {
      router.push('/login')
      return
    }

    const currentUser = authAPI.getCurrentUser()
    if (currentUser?.role !== 'employee') {
      router.push('/login')
      return
    }

    setUser(currentUser)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [reimbData, statsData] = await Promise.all([
        reimbursementAPI.getAll(),
        reimbursementAPI.getStats(),
      ])
      setReimbursements(reimbData || [])
      setStats(statsData)
    } catch (error: any) {
      setReimbursements([])
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 10MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Tipe file harus JPG, PNG, GIF, WEBP, atau PDF",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Silakan upload kwitansi",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload file first
      setIsUploading(true)
      const uploadResult = await uploadAPI.uploadReceipt(selectedFile)
      setIsUploading(false)

      // Create reimbursement with uploaded file URL
      await reimbursementAPI.create({
        name: formData.name,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        receipt_url: uploadResult.url,
      })

      toast({
        title: "Berhasil",
        description: "Reimbursement berhasil diajukan",
      })

      setOpen(false)
      setFormData({
        name: "",
        title: "",
        description: "",
        category: "" as ReimbursementCategory,
        amount: "",
        receipt_url: "",
      })
      setSelectedFile(null)
      setFilePreview(null)
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengajukan reimbursement",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
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
            <span className="text-sm text-muted-foreground">{user?.full_name} (Employee)</span>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama Anda"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Judul</Label>
                  <Input 
                    id="title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Transportasi ke klien"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value as ReimbursementCategory })}
                    disabled={isSubmitting}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transport">Perjalanan</SelectItem>
                      <SelectItem value="accommodation">Akomodasi</SelectItem>
                      <SelectItem value="meals">Makanan</SelectItem>
                      <SelectItem value="office_supply">Perlengkapan Kantor</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah (Rp)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0" 
                    step="1000"
                    min="0"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Berikan detail tentang klaim ini" 
                    rows={3}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Kwitansi</Label>
                  <div className="space-y-2">
                    {!selectedFile ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          id="receipt" 
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                          className="cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{selectedFile.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {filePreview && (
                          <div className="border rounded-lg p-2">
                            <img 
                              src={filePreview} 
                              alt="Preview" 
                              className="max-h-48 mx-auto rounded"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: JPG, PNG, GIF, WEBP, atau PDF (Maks. 10MB)
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? 'Mengupload...' : 'Memproses...'}
                      </>
                    ) : (
                      'Ajukan Klaim'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Tertunda</CardTitle>
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
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {stats.total_amount.toLocaleString('id-ID')}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Klaim</CardTitle>
            <CardDescription>Lihat dan lacak semua klaim yang telah Anda ajukan</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : !reimbursements || reimbursements.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Belum ada klaim</h3>
                <p className="text-sm text-muted-foreground mt-2">Mulai dengan membuat klaim reimbursement pertama Anda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Judul</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kategori</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tanggal</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Jumlah</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reimbursements.map((reimb) => (
                      <tr key={reimb.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-mono text-sm">#{reimb.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{reimb.title}</td>
                        <td className="px-4 py-3 text-sm">{categoryMap[reimb.category]}</td>
                        <td className="px-4 py-3 text-sm">{new Date(reimb.submitted_date).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">Rp {reimb.amount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              reimb.status === "approved_finance" || reimb.status === "completed"
                                ? "default"
                                : reimb.status === "approved_manager"
                                  ? "secondary"
                                  : reimb.status === "pending"
                                    ? "outline"
                                    : "destructive"
                            }
                            className={
                              reimb.status === "approved_finance" || reimb.status === "completed"
                                ? "bg-green-500 text-white"
                                : reimb.status === "approved_manager"
                                  ? "bg-blue-500 text-white"
                                  : ""
                            }
                          >
                            {(reimb.status === "approved_finance" || reimb.status === "completed") && <CheckCircle className="mr-1 h-3 w-3" />}
                            {reimb.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                            {(reimb.status === "rejected_manager" || reimb.status === "rejected_finance") && <XCircle className="mr-1 h-3 w-3" />}
                            {statusMap[reimb.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {(reimb.status === "approved_finance" || reimb.status === "completed") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReceipt(reimb)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Bukti Transfer
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
      </div>

      {/* Payment Receipt Dialog */}
      <Dialog open={selectedReceipt !== null} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Transfer Reimbursement</DialogTitle>
            <DialogDescription>
              Bukti transfer untuk klaim #{selectedReceipt?.id}
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
                <span>#{selectedReceipt?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nama Karyawan:</span>
                <span>{selectedReceipt?.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Kategori:</span>
                <span>{selectedReceipt && categoryMap[selectedReceipt.category]}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Deskripsi:</span>
                <span className="text-sm">{selectedReceipt?.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tanggal Pengajuan:</span>
                <span>{selectedReceipt && new Date(selectedReceipt.submitted_date).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-bold">Jumlah Transfer:</span>
                <span className="text-2xl font-bold text-green-600">
                  Rp {selectedReceipt?.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Catatan:</strong> Dana telah ditransfer ke rekening Anda. Simpan bukti transfer ini sebagai arsip.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
              Tutup
            </Button>
            <Button onClick={() => {
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
                      <div class="value">#${selectedReceipt?.id}</div>
                    </div>
                    <div class="row">
                      <div class="label">Nama Karyawan:</div>
                      <div class="value">${selectedReceipt?.employee_name}</div>
                    </div>
                    <div class="row">
                      <div class="label">Kategori:</div>
                      <div class="value">${selectedReceipt && categoryMap[selectedReceipt.category]}</div>
                    </div>
                    <div class="row">
                      <div class="label">Deskripsi:</div>
                      <div class="value">${selectedReceipt?.description}</div>
                    </div>
                    <div class="row">
                      <div class="label">Tanggal Pengajuan:</div>
                      <div class="value">${selectedReceipt && new Date(selectedReceipt.submitted_date).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div class="amount">
                      <div class="label">Jumlah Transfer:</div>
                      <div>Rp ${selectedReceipt?.amount.toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                  <div class="footer">
                    <p><strong>Catatan:</strong></p>
                    <p>Dana telah ditransfer ke rekening karyawan yang bersangkutan.</p>
                    <p>Simpan bukti transfer ini sebagai arsip.</p>
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
            }}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
