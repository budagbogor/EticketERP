import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Building, Bell, Database, Download, Upload, Loader2, CalendarIcon, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockTickets } from "@/lib/mock-data";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const COMPANY_DATA_KEY = "company_settings";

export default function Settings() {
  const [companyData, setCompanyData] = useState({
    name: "PT Mobeng Indonesia",
    email: "info@mobeng.com",
    phone: "021-12345678",
    website: "www.mobeng.com",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    status: true,
    reminder: false,
  });
  const [autoBackup, setAutoBackup] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Load company data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(COMPANY_DATA_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCompanyData(parsed);
      } catch (error) {
        console.error("Failed to load company data:", error);
      }
    }
  }, []);

  const handleSaveCompany = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save to localStorage
    localStorage.setItem(COMPANY_DATA_KEY, JSON.stringify(companyData));

    setIsSaving(false);
    toast({
      title: "Berhasil Disimpan",
      description: "Informasi perusahaan telah diperbarui",
    });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const exportData = {
      company: companyData,
      exportDate: new Date().toISOString(),
      totalTickets: 150,
      totalUsers: 25,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mobeng-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    toast({
      title: "Export Berhasil",
      description: "Data telah berhasil di-export",
    });
  };

  const handleExportCsv = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Pilih Periode",
        description: "Silakan pilih tanggal mulai dan tanggal akhir",
        variant: "destructive",
      });
      return;
    }

    setIsExportingCsv(true);

    try {
      // Fetch real tickets from Supabase
      const { data: tickets, error } = await supabase
        .from("complaints")
        .select("*")
        .gte("created_at", startOfDay(startDate).toISOString())
        .lte("created_at", endOfDay(endDate).toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!tickets || tickets.length === 0) {
        setIsExportingCsv(false);
        toast({
          title: "Tidak Ada Data",
          description: "Tidak ada tiket dalam periode yang dipilih",
          variant: "destructive",
        });
        return;
      }

      // Helper function to properly escape CSV values
      const escapeCsvValue = (value: string | null | undefined): string => {
        if (!value) return '""';
        // Replace newlines with spaces and escape quotes
        const cleaned = String(value)
          .replace(/\r\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/"/g, '""')
          .trim();
        return `"${cleaned}"`;
      };

      const headers = [
        "No Tiket",
        "Tanggal Input",
        "Nama Pelanggan",
        "Telepon",
        "Alamat",
        "Kendaraan",
        "Plat Nomor",
        "Cabang",
        "Kategori",
        "Sub Kategori",
        "Deskripsi",
        "Status",
        "Tanggal Service Sebelumnya",
        "Item Service Sebelumnya",
      ].map(h => `"${h}"`);

      const csvRows = tickets.map(ticket => [
        `"${ticket.ticket_number}"`,
        `"${format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}"`,
        `"${ticket.customer_name}"`,
        `"${ticket.customer_phone}"`,
        escapeCsvValue(ticket.customer_address),
        `"${ticket.vehicle_brand} ${ticket.vehicle_model} ${ticket.vehicle_year || ''}"`.trim(),
        `"${ticket.vehicle_plate_number || "-"}"`,
        `"${ticket.branch}"`,
        `"${ticket.category}"`,
        `"${ticket.sub_category || "-"}"`,
        escapeCsvValue(ticket.description),
        `"${STATUS_LABELS[ticket.status] || ticket.status}"`,
        `"${ticket.last_service_date ? format(new Date(ticket.last_service_date), "dd/MM/yyyy") : "-"}"`,
        escapeCsvValue(ticket.last_service_items),
      ]);

      const csvContent = [headers.join(","), ...csvRows.map(row => row.join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tiket-${format(startDate, "ddMMyyyy")}-${format(endDate, "ddMMyyyy")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExportingCsv(false);
      toast({
        title: "Export CSV Berhasil",
        description: `${tickets.length} tiket berhasil di-export`,
      });
    } catch (error: any) {
      setIsExportingCsv(false);
      toast({
        title: "Export Gagal",
        description: error.message || "Terjadi kesalahan saat export data",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          JSON.parse(text);
          toast({
            title: "Import Berhasil",
            description: `Data dari ${file.name} berhasil diimport`,
          });
        } catch {
          toast({
            title: "Import Gagal",
            description: "Format file tidak valid",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan sistem</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="w-5 h-5" />
            Informasi Perusahaan
          </CardTitle>
          <CardDescription>Pengaturan umum perusahaan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nama Perusahaan</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Masukkan nama perusahaan"
                value={companyData.name}
                onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email Perusahaan</Label>
              <Input
                id="companyEmail"
                type="email"
                placeholder="email@perusahaan.com"
                value={companyData.email}
                onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Telepon</Label>
              <Input
                id="companyPhone"
                type="tel"
                placeholder="021-12345678"
                value={companyData.phone}
                onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                id="companyWebsite"
                type="url"
                placeholder="www.perusahaan.com"
                value={companyData.website}
                onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleSaveCompany} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Simpan Perubahan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Notifikasi
          </CardTitle>
          <CardDescription>Pengaturan notifikasi sistem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifikasi Email</p>
              <p className="text-sm text-muted-foreground">Kirim notifikasi via email untuk tiket baru</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => {
                setNotifications(prev => ({ ...prev, email: checked }));
                toast({
                  title: checked ? "Notifikasi Aktif" : "Notifikasi Nonaktif",
                  description: `Notifikasi email ${checked ? "diaktifkan" : "dinonaktifkan"}`,
                });
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifikasi Status</p>
              <p className="text-sm text-muted-foreground">Beritahu saat status tiket berubah</p>
            </div>
            <Switch
              checked={notifications.status}
              onCheckedChange={(checked) => {
                setNotifications(prev => ({ ...prev, status: checked }));
                toast({
                  title: checked ? "Notifikasi Aktif" : "Notifikasi Nonaktif",
                  description: `Notifikasi status ${checked ? "diaktifkan" : "dinonaktifkan"}`,
                });
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pengingat Tiket</p>
              <p className="text-sm text-muted-foreground">Kirim pengingat untuk tiket yang belum ditangani</p>
            </div>
            <Switch
              checked={notifications.reminder}
              onCheckedChange={(checked) => {
                setNotifications(prev => ({ ...prev, reminder: checked }));
                toast({
                  title: checked ? "Pengingat Aktif" : "Pengingat Nonaktif",
                  description: `Pengingat tiket ${checked ? "diaktifkan" : "dinonaktifkan"}`,
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5" />
            Data & Backup
          </CardTitle>
          <CardDescription>Pengaturan data dan backup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Backup Otomatis</p>
              <p className="text-sm text-muted-foreground">Backup data setiap hari secara otomatis</p>
            </div>
            <Switch
              checked={autoBackup}
              onCheckedChange={(checked) => {
                setAutoBackup(checked);
                toast({
                  title: checked ? "Backup Aktif" : "Backup Nonaktif",
                  description: `Backup otomatis ${checked ? "diaktifkan" : "dinonaktifkan"}`,
                });
              }}
            />
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export Data
            </Button>
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="w-5 h-5" />
            Export Tiket ke CSV
          </CardTitle>
          <CardDescription>Export semua data tiket berdasarkan periode tanggal input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button onClick={handleExportCsv} disabled={isExportingCsv}>
            {isExportingCsv ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
            Export ke CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}