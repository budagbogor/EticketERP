import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBranches } from "@/hooks/useMasterData";
import { Search, Download, FileText, Eye, Printer, Clock, History, Loader2, Pencil } from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ComplaintHistory {
  id: string;
  complaint_id: string;
  action: string;
  description: string | null;
  performed_by: string;
  performed_at: string;
  old_status: string | null;
  new_status: string | null;
  performer_name?: string;
}

interface TechnicalReport {
  id: string;
  complaint_id: string;
  pic_name: string;
  damage_analysis: string;
  repair_method: string;
  problem_parts: string | null;
  estimated_cost: number | null;
  conclusion: string;
  recommendation: string | null;
  created_at: string;
  created_by: string;
}

interface ReportData {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number | null;
  vehicle_plate_number: string | null;
  vehicle_vin: string | null;
  vehicle_odometer: number | null;
  last_service_date: string | null;
  last_service_items: string | null;
  branch: string;
  category: string;
  sub_category: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string | null;
  activityHistory: ComplaintHistory[];
  technicalReport: TechnicalReport | null;
}

const calculateDuration = (startDate: Date, endDate: Date): string => {
  const days = differenceInDays(endDate, startDate);
  const hours = differenceInHours(endDate, startDate) % 24;
  const minutes = differenceInMinutes(endDate, startDate) % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} hari`);
  if (hours > 0) parts.push(`${hours} jam`);
  if (minutes > 0) parts.push(`${minutes} menit`);

  return parts.length > 0 ? parts.join(" ") : "< 1 menit";
};

function useClosedComplaints() {
  return useQuery({
    queryKey: ["closed-complaints-with-history"],
    queryFn: async () => {
      // Fetch closed complaints
      const { data: complaints, error: complaintsError } = await supabase
        .from("complaints")
        .select("*")
        .eq("status", "closed")
        .order("updated_at", { ascending: false });

      if (complaintsError) throw complaintsError;
      if (!complaints || complaints.length === 0) return [];

      // Fetch history for all closed complaints
      const complaintIds = complaints.map(c => c.id);
      const { data: historyData, error: historyError } = await supabase
        .from("complaint_history")
        .select("*")
        .in("complaint_id", complaintIds)
        .order("performed_at", { ascending: true });

      if (historyError) throw historyError;

      // Fetch technical reports for all closed complaints
      const { data: technicalReportsData, error: techError } = await supabase
        .from("technical_reports")
        .select("*")
        .in("complaint_id", complaintIds);

      if (techError) throw techError;

      // Create map of technical reports by complaint_id
      const technicalReportMap = new Map(
        (technicalReportsData || []).map(tr => [tr.complaint_id, tr])
      );

      // Fetch profile names for history performers
      const performerIds = [...new Set((historyData || []).map(h => h.performed_by))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", performerIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p.name]));

      // Map history to complaints
      const historyByComplaint = (historyData || []).reduce((acc, h) => {
        if (!acc[h.complaint_id]) acc[h.complaint_id] = [];
        acc[h.complaint_id].push({
          ...h,
          performer_name: profileMap.get(h.performed_by) || "Unknown"
        });
        return acc;
      }, {} as Record<string, ComplaintHistory[]>);

      return complaints.map(c => ({
        ...c,
        activityHistory: historyByComplaint[c.id] || [],
        technicalReport: technicalReportMap.get(c.id) || null
      })) as ReportData[];
    },
  });
}

const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function Reports() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { data: branches = [] } = useBranches();
  const { data: reports = [], isLoading } = useClosedComplaints();

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === "all" || report.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const handleView = (report: ReportData) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const getVehicleDisplay = (report: ReportData) => {
    const parts = [report.vehicle_brand, report.vehicle_model];
    if (report.vehicle_year) parts.push(String(report.vehicle_year));
    return parts.join(" ");
  };

  const getClosedDate = (report: ReportData): Date => {
    // Find the closed action in history, or use updated_at as fallback
    const closedHistory = report.activityHistory.find(h => h.new_status === "closed");
    return closedHistory ? new Date(closedHistory.performed_at) : new Date(report.updated_at);
  };

  const handleDownloadPDF = (report: ReportData) => {
    const ticketCreatedAt = new Date(report.created_at);
    const ticketClosedAt = getClosedDate(report);
    const resolutionDuration = calculateDuration(ticketCreatedAt, ticketClosedAt);

    const activityHistoryHtml = report.activityHistory
      .map(h => `<tr><td style="padding: 6px; border: 1px solid #e5e7eb;">${format(new Date(h.performed_at), "dd/MM/yyyy HH:mm", { locale: localeId })}</td><td style="padding: 6px; border: 1px solid #e5e7eb;">${h.description || h.action}</td><td style="padding: 6px; border: 1px solid #e5e7eb;">${h.performer_name}</td></tr>`)
      .join("");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Teknik - ${report.ticket_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1e40af; margin: 0; font-size: 24px; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin-bottom: 25px; }
          .section-title { background: #f1f5f9; padding: 8px 12px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
          .row { display: flex; margin-bottom: 8px; }
          .label { width: 180px; font-weight: 500; color: #374151; }
          .value { flex: 1; color: #1f2937; }
          .description { background: #f9fafb; padding: 12px; border-radius: 4px; white-space: pre-wrap; }
          .duration-box { background: #dbeafe; border: 1px solid #3b82f6; padding: 12px; border-radius: 4px; margin-bottom: 15px; }
          .duration-label { font-weight: bold; color: #1e40af; }
          .history-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .history-table th { background: #f1f5f9; padding: 8px; border: 1px solid #e5e7eb; text-align: left; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN TEKNIK</h1>
          <p>No. Tiket: ${report.ticket_number}</p>
          <p>Tanggal: ${format(ticketClosedAt, "dd MMMM yyyy", { locale: localeId })}</p>
        </div>

        <div class="duration-box">
          <span class="duration-label">Durasi Penyelesaian Komplain:</span> ${resolutionDuration}
          <br/>
          <span style="font-size: 12px; color: #6b7280;">Dari: ${format(ticketCreatedAt, "dd MMMM yyyy HH:mm", { locale: localeId })} - Sampai: ${format(ticketClosedAt, "dd MMMM yyyy HH:mm", { locale: localeId })}</span>
        </div>

        <div class="section">
          <div class="section-title">DATA PELANGGAN</div>
          <div class="row"><span class="label">Nama</span><span class="value">: ${report.customer_name}</span></div>
          <div class="row"><span class="label">Telepon</span><span class="value">: ${report.customer_phone}</span></div>
          <div class="row"><span class="label">Alamat</span><span class="value">: ${report.customer_address || "-"}</span></div>
        </div>

        <div class="section">
          <div class="section-title">DATA KENDARAAN</div>
          <div class="row"><span class="label">Kendaraan</span><span class="value">: ${getVehicleDisplay(report)}</span></div>
          <div class="row"><span class="label">Nomor Polisi</span><span class="value">: ${report.vehicle_plate_number || "-"}</span></div>
          <div class="row"><span class="label">Nomor Rangka (VIN)</span><span class="value">: ${report.vehicle_vin || "-"}</span></div>
          <div class="row"><span class="label">Odometer</span><span class="value">: ${report.vehicle_odometer ? report.vehicle_odometer.toLocaleString() + " KM" : "-"}</span></div>
          <div class="row"><span class="label">Tanggal Service Terakhir</span><span class="value">: ${report.last_service_date ? format(new Date(report.last_service_date), "dd MMMM yyyy", { locale: localeId }) : "-"}</span></div>
          <div class="row"><span class="label">Item Service Terakhir</span><span class="value">: ${report.last_service_items || "-"}</span></div>
        </div>

        <div class="section">
          <div class="section-title">DATA KOMPLAIN</div>
          <div class="row"><span class="label">Cabang</span><span class="value">: ${report.branch}</span></div>
          <div class="row"><span class="label">Kategori</span><span class="value">: ${report.category}</span></div>
          <div class="row"><span class="label">Sub-Kategori</span><span class="value">: ${report.sub_category || "-"}</span></div>
          <div class="row"><span class="label">Deskripsi Komplain</span></div>
          <div class="description">${report.description}</div>
        </div>

        ${report.technicalReport ? `
        <div class="section">
          <div class="section-title">HASIL ANALISA TEKNIK</div>
          <div class="row"><span class="label">Nama PIC</span><span class="value">: ${report.technicalReport.pic_name}</span></div>
          <div class="row"><span class="label">Tanggal Laporan</span><span class="value">: ${format(new Date(report.technicalReport.created_at), "dd MMMM yyyy, HH:mm", { locale: localeId })}</span></div>
          <div class="row"><span class="label">Analisa Kerusakan</span></div>
          <div class="description">${report.technicalReport.damage_analysis}</div>
          <div class="row" style="margin-top: 10px;"><span class="label">Metode Perbaikan</span></div>
          <div class="description">${report.technicalReport.repair_method}</div>
          ${report.technicalReport.problem_parts ? `
          <div class="row" style="margin-top: 10px;"><span class="label">Part yang Bermasalah</span></div>
          <div class="description">${report.technicalReport.problem_parts}</div>
          ` : ''}
          <div class="row" style="margin-top: 10px;"><span class="label">Biaya yang Dibutuhkan</span><span class="value">: ${report.technicalReport.estimated_cost !== null ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(report.technicalReport.estimated_cost) : "-"}</span></div>
          <div class="row"><span class="label">Kesimpulan</span></div>
          <div class="description">${report.technicalReport.conclusion}</div>
          ${report.technicalReport.recommendation ? `
          <div class="row" style="margin-top: 10px;"><span class="label">Rekomendasi Pencegahan</span></div>
          <div class="description">${report.technicalReport.recommendation}</div>
          ` : ''}
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">RIWAYAT AKTIVITAS</div>
          <table class="history-table">
            <thead>
              <tr>
                <th style="width: 150px;">Waktu</th>
                <th>Aktivitas</th>
                <th style="width: 150px;">Oleh</th>
              </tr>
            </thead>
            <tbody>
              ${activityHistoryHtml || '<tr><td colspan="3" style="text-align: center; padding: 12px;">Tidak ada riwayat</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Dokumen ini digenerate secara otomatis dari sistem E-Ticket Mobeng</p>
          <p>© ${new Date().getFullYear()} Mobeng - All Rights Reserved</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      toast.success("PDF siap untuk didownload/print");
    } else {
      toast.error("Gagal membuka jendela print. Mohon izinkan popup.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Teknik</h1>
          <p className="text-muted-foreground">Daftar tiket yang sudah selesai (closed)</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor tiket atau nama pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Semua Cabang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Cabang</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">No. Tiket</TableHead>
                  <TableHead className="font-semibold">Pelanggan</TableHead>
                  <TableHead className="font-semibold">Kendaraan</TableHead>
                  <TableHead className="font-semibold">Cabang</TableHead>
                  <TableHead className="font-semibold">Tanggal Selesai</TableHead>
                  <TableHead className="font-semibold">Durasi</TableHead>
                  <TableHead className="font-semibold w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-2" />
                      <p className="text-muted-foreground">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">Belum ada tiket yang selesai</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => {
                    const closedDate = getClosedDate(report);
                    const duration = calculateDuration(new Date(report.created_at), closedDate);
                    return (
                      <TableRow
                        key={report.id}
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => handleView(report)}
                      >
                        <TableCell className="font-medium text-primary">{report.ticket_number}</TableCell>
                        <TableCell>{report.customer_name}</TableCell>
                        <TableCell>{getVehicleDisplay(report)}</TableCell>
                        <TableCell className="text-sm">{report.branch}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(closedDate, "dd/MM/yyyy", { locale: localeId })}
                        </TableCell>
                        <TableCell className="text-sm">{duration}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(report)}
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadPDF(report)}
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Laporan Teknik - {selectedReport?.ticket_number}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedReport && handleDownloadPDF(selectedReport)}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print PDF
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (() => {
            const ticketCreatedAt = new Date(selectedReport.created_at);
            const ticketClosedAt = getClosedDate(selectedReport);

            return (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary border-b pb-1">Data Pelanggan</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Nama:</span> {selectedReport.customer_name}</div>
                    <div><span className="text-muted-foreground">Telepon:</span> {selectedReport.customer_phone}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Alamat:</span> {selectedReport.customer_address || "-"}</div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary border-b pb-1">Data Kendaraan</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Kendaraan:</span> {getVehicleDisplay(selectedReport)}</div>
                    <div><span className="text-muted-foreground">No. Polisi:</span> {selectedReport.vehicle_plate_number || "-"}</div>
                    <div><span className="text-muted-foreground">VIN:</span> {selectedReport.vehicle_vin || "-"}</div>
                    <div><span className="text-muted-foreground">Odometer:</span> {selectedReport.vehicle_odometer ? selectedReport.vehicle_odometer.toLocaleString() + " KM" : "-"}</div>
                    <div><span className="text-muted-foreground">Tanggal Service Terakhir:</span> {selectedReport.last_service_date ? format(new Date(selectedReport.last_service_date), "dd MMMM yyyy", { locale: localeId }) : "-"}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Item Service Terakhir:</span> {selectedReport.last_service_items || "-"}</div>
                  </div>
                </div>

                {/* Complaint Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary border-b pb-1">Data Komplain</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Cabang:</span> {selectedReport.branch}</div>
                    <div><span className="text-muted-foreground">Kategori:</span> {selectedReport.category}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Sub-Kategori:</span> {selectedReport.sub_category || "-"}</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <p className="text-muted-foreground mb-1">Deskripsi Komplain:</p>
                    <p>{selectedReport.description}</p>
                  </div>
                </div>

                {/* Technical Analysis */}
                {selectedReport.technicalReport && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-primary border-b pb-1">Hasil Analisa Teknik</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div><span className="text-muted-foreground">Nama PIC:</span> {selectedReport.technicalReport.pic_name}</div>
                      <div><span className="text-muted-foreground">Tanggal Laporan:</span> {format(new Date(selectedReport.technicalReport.created_at), "dd MMMM yyyy, HH:mm", { locale: localeId })}</div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Analisa Kerusakan</p>
                        <p className="bg-muted/50 p-3 rounded-lg text-sm">{selectedReport.technicalReport.damage_analysis}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Metode Perbaikan</p>
                        <p className="bg-muted/50 p-3 rounded-lg text-sm">{selectedReport.technicalReport.repair_method}</p>
                      </div>

                      {selectedReport.technicalReport.problem_parts && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Part yang Bermasalah</p>
                          <p className="bg-muted/50 p-3 rounded-lg text-sm">{selectedReport.technicalReport.problem_parts}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Biaya yang Dibutuhkan</p>
                        <p className="bg-muted/50 p-3 rounded-lg text-sm font-medium">
                          {formatCurrency(selectedReport.technicalReport.estimated_cost)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Kesimpulan</p>
                        <p className="bg-muted/50 p-3 rounded-lg text-sm">{selectedReport.technicalReport.conclusion}</p>
                      </div>

                      {selectedReport.technicalReport.recommendation && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Rekomendasi Pencegahan</p>
                          <p className="bg-muted/50 p-3 rounded-lg text-sm">{selectedReport.technicalReport.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800 dark:text-blue-200">Durasi Penyelesaian Komplain</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {calculateDuration(ticketCreatedAt, ticketClosedAt)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Dari: {format(ticketCreatedAt, "dd MMM yyyy HH:mm", { locale: localeId })} - Sampai: {format(ticketClosedAt, "dd MMM yyyy HH:mm", { locale: localeId })}
                  </p>
                </div>

                {/* Activity History */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary border-b pb-1 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Riwayat Aktivitas
                  </h3>
                  <div className="bg-muted/30 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs">Waktu</TableHead>
                          <TableHead className="text-xs">Aktivitas</TableHead>
                          <TableHead className="text-xs">Oleh</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReport.activityHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                              Tidak ada riwayat
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedReport.activityHistory.map((history) => (
                            <TableRow key={history.id}>
                              <TableCell className="text-xs py-2">
                                {format(new Date(history.performed_at), "dd/MM/yyyy HH:mm", { locale: localeId })}
                              </TableCell>
                              <TableCell className="text-xs py-2">{history.description || history.action}</TableCell>
                              <TableCell className="text-xs py-2">{history.performer_name}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {selectedReport.technicalReport && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        navigate(`/tickets/${selectedReport.id}/technical-report/edit`);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Laporan
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Tutup
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
