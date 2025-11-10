import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, DollarSign } from "lucide-react"

export default function HomePage() {
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
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Tentang
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Kontak
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground">
            Sederhanakan Proses Reimbursement Anda
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground leading-relaxed">
            Kelola klaim karyawan, persetujuan, dan pembayaran dengan efisien menggunakan sistem manajemen reimbursement
            komprehensif kami. Dibangun untuk perusahaan modern.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="min-w-40">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-40 bg-transparent">
              <Link href="#features">Pelajari Lebih Lanjut</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Dibangun untuk Setiap Peran</h2>
            <p className="text-muted-foreground">Tiga modul canggih yang dirancang untuk organisasi Anda</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <FileText className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Employee Portal</CardTitle>
                <CardDescription>Ajukan dan lacak klaim Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Buat pengajuan klaim baru</li>
                  <li>• Unggah kwitansi dan dokumen</li>
                  <li>• Lacak status klaim secara real-time</li>
                  <li>• Lihat riwayat klaim</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <CheckCircle className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Manager Dashboard</CardTitle>
                <CardDescription>Tinjau dan setujui klaim</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Lihat klaim tim yang tertunda</li>
                  <li>• Tinjau detail klaim & kwitansi</li>
                  <li>• Setujui atau tolak dengan catatan</li>
                  <li>• Ringkasan analitik tim</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <DollarSign className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Finance Admin</CardTitle>
                <CardDescription>Proses dan validasi pembayaran</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Validasi akhir klaim</li>
                  <li>• Perbarui status pembayaran</li>
                  <li>• Ekspor laporan ke Excel</li>
                  <li>• Dashboard ringkasan keuangan</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ReimburseFlow. Hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}
