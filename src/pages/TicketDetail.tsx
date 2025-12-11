import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Car,
  MapPin,
  Phone,
  Calendar,
  FileText,
  Send,
  CheckCircle,
  Clock,
  ArrowRight,
  XCircle,
  Timer,
  History,
  Eye,
  Pencil
} from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";

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

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user, canCreateReports } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [comment, setComment] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Fetch ticket data from Supabase
  const { data: ticket, isLoading: ticketLoading, error } = useQuery({
    queryKey: ["complaint", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  // Fetch ticket history from Supabase
  const { data: history = [] } = useQuery({
    queryKey: ["complaint_history", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaint_history")
        .select("*")
        .eq("complaint_id", ticketId)
        .order("performed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  // Fetch technical report if exists
  const { data: technicalReport } = useQuery({
    queryKey: ["technical_report", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technical_reports")
        .select("*")
        .eq("complaint_id", ticketId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  const formatCurrency = (value: number | null): string => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (ticketLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Tiket tidak ditemukan</p>
        <Button variant="link" onClick={() => navigate("/tickets")}>
          Kembali ke daftar tiket
        </Button>
      </div>
    );
  }

  const handleEscalate = async () => {
    if (!selectedDepartment) {
      toast({
        title: "Error",
        description: "Pilih departemen tujuan terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    try {
      const newStatus = selectedDepartment === "tech_support" ? "escalated_tech" : "escalated_psd";

      const { error } = await supabase
        .from("complaints")
        .update({
          status: newStatus,
          assigned_department: selectedDepartment,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketId);

      if (error) throw error;

      // Add history record
      await supabase.from("complaint_history").insert({
        complaint_id: ticketId,
        action: "escalated",
        old_status: ticket.status,
        new_status: newStatus,
        description: `Tiket diteruskan ke ${selectedDepartment === "tech_support" ? "Teknikal Support" : "Produk & Service Development"}`,
        performed_by: user?.id || "",
      });

      queryClient.invalidateQueries({ queryKey: ["complaint", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["complaint_history", ticketId] });

      toast({
        title: "Tiket Diteruskan",
        description: `Tiket berhasil diteruskan ke ${selectedDepartment === "tech_support" ? "Teknikal Support" : "Produk & Service Development"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketId);

      if (error) throw error;

      // Add history record
      await supabase.from("complaint_history").insert({
        complaint_id: ticketId,
        action: "status_changed",
        old_status: ticket.status,
        new_status: newStatus,
        description: `Status berubah dari "${STATUS_LABELS[ticket.status] || ticket.status}" menjadi "${STATUS_LABELS[newStatus] || newStatus}"`,
        performed_by: user?.id || "",
      });

      queryClient.invalidateQueries({ queryKey: ["complaint", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["complaint_history", ticketId] });

      toast({
        title: "Status Diperbarui",
        description: `Status tiket berubah menjadi "${STATUS_LABELS[newStatus] || newStatus}"`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTimelineIcon = (action: string) => {
    switch (action) {
      case "created": return <FileText className="w-4 h-4" />;
      case "escalated": return <Send className="w-4 h-4" />;
      case "status_changed": return <Clock className="w-4 h-4" />;
      case "comment": return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Komentar tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setIsSendingComment(true);
    try {
      const { error } = await supabase.from("complaint_history").insert({
        complaint_id: ticketId,
        action: "comment",
        description: comment.trim(),
        performed_by: user?.id || "",
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["complaint_history", ticketId] });
      setComment("");

      toast({
        title: "Komentar Terkirim",
        description: "Komentar berhasil ditambahkan",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingComment(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{ticket.ticket_number}</h1>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="text-muted-foreground">
            Dibuat pada {format(new Date(ticket.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  Data Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nama</p>
                  <p className="font-medium">{ticket.customer_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{ticket.customer_phone}</span>
                </div>
                {ticket.customer_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{ticket.customer_address}</span>
                  </div>
                )}
                {ticket.creator_name && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground">Dibuat oleh</p>
                    <p className="font-medium">{ticket.creator_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="w-4 h-4" />
                  Data Kendaraan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merek/Model</span>
                  <span className="font-medium">{ticket.vehicle_brand} {ticket.vehicle_model}</span>
                </div>
                {ticket.vehicle_year && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tahun</span>
                    <span>{ticket.vehicle_year}</span>
                  </div>
                )}
                {ticket.vehicle_plate_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">No. Polisi</span>
                    <span className="font-medium">{ticket.vehicle_plate_number}</span>
                  </div>
                )}
                {ticket.vehicle_transmission && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transmisi</span>
                    <span>{ticket.vehicle_transmission}</span>
                  </div>
                )}
                {ticket.vehicle_odometer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Odometer</span>
                    <span>{ticket.vehicle_odometer.toLocaleString()} KM</span>
                  </div>
                )}
                {ticket.vehicle_fuel_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">BBM</span>
                    <span>{ticket.vehicle_fuel_type}</span>
                  </div>
                )}
                {ticket.last_service_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Terakhir</span>
                    <span>{format(new Date(ticket.last_service_date), "dd/MM/yyyy", { locale: id })}</span>
                  </div>
                )}
                {ticket.last_service_items && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-1">Item Service Terakhir:</p>
                    <p className="text-xs">{ticket.last_service_items}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Complaint Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Detail Komplain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Kategori</p>
                  <p className="font-medium">{ticket.category}</p>
                </div>
                {ticket.sub_category && (
                  <div>
                    <p className="text-muted-foreground">Sub-Kategori</p>
                    <p className="font-medium">{ticket.sub_category}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Cabang</p>
                  <p className="font-medium">{ticket.branch}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Deskripsi</p>
                <p className="text-sm bg-muted/50 p-4 rounded-lg">{ticket.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Duration Card */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-blue-800 dark:text-blue-200">
                <Timer className="w-4 h-4" />
                Durasi Penanganan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {calculateDuration(new Date(ticket.created_at), ticket.status === "closed" ? new Date(ticket.updated_at) : new Date())}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {ticket.status === "closed" ? (
                  <>Selesai: {format(new Date(ticket.updated_at), "dd MMM yyyy HH:mm", { locale: id })}</>
                ) : (
                  <>Berlangsung sejak: {format(new Date(ticket.created_at), "dd MMM yyyy HH:mm", { locale: id })}</>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-4 h-4" />
                Riwayat Aktivitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat aktivitas</p>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {getTimelineIcon(item.action)}
                        </div>
                        {index < history.length - 1 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{format(new Date(item.performed_at), "dd MMM yyyy, HH:mm", { locale: id })}</span>
                        </div>
                        {item.new_status && (
                          <div className="mt-2">
                            <StatusBadge status={item.new_status} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          {/* Status Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aksi Tiket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.status === "new" && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Kirim ke Departemen</p>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech_support">Teknikal Support</SelectItem>
                        <SelectItem value="psd">Produk & Service Development</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={handleEscalate}>
                      <Send className="w-4 h-4 mr-2" />
                      Kirim
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">atau</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange("repair_completed")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Selesaikan Langsung
                  </Button>
                </>
              )}

              {["escalated_tech", "in_progress"].includes(ticket.status) && (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleStatusChange("repair_completed")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Perbaikan Selesai
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange("escalated_psd")}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Teruskan ke PSD
                  </Button>
                </div>
              )}

              {ticket.status === "escalated_psd" && (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleStatusChange("repair_completed")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Perbaikan Selesai
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange("escalated_tech")}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Teruskan ke Tech Support
                  </Button>
                </div>
              )}

              {ticket.status === "repair_completed" && !technicalReport && (
                <Button
                  className="w-full"
                  onClick={() => navigate(`/tickets/${ticketId}/technical-report`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Buat Laporan Teknik
                </Button>
              )}

              {ticket.status === "awaiting_report" && !technicalReport && (
                <Button
                  className="w-full"
                  onClick={() => navigate(`/tickets/${ticketId}/technical-report`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Buat Laporan Teknik
                </Button>
              )}

              {technicalReport && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowReportDialog(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Laporan Teknik
                </Button>
              )}

              {!["closed", "cancelled"].includes(ticket.status) && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleStatusChange("cancelled")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Batalkan Tiket
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Add Comment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Update Progress / Komentar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Tulis Progress/catatan/komentar.."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSendComment}
                disabled={isSendingComment || !comment.trim()}
              >
                {isSendingComment ? "Mengirim..." : "Update"}
              </Button>
            </CardContent>
          </Card>

          {/* Assigned Info */}
          {ticket.assigned_department && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ditugaskan Kepada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {ticket.assigned_department === "tech_support" ? "Teknikal Support" : "Produk & Service Development"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ROLE_LABELS[ticket.assigned_department] || ticket.assigned_department}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Technical Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Laporan Teknik - {ticket.ticket_number}
            </DialogTitle>
          </DialogHeader>
          {technicalReport && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary border-b pb-1">Data Pelanggan</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Nama:</span> {ticket.customer_name}</div>
                  <div><span className="text-muted-foreground">Telepon:</span> {ticket.customer_phone}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Alamat:</span> {ticket.customer_address || "-"}</div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary border-b pb-1">Data Kendaraan</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Kendaraan:</span> {ticket.vehicle_brand} {ticket.vehicle_model} {ticket.vehicle_year || ""}</div>
                  <div><span className="text-muted-foreground">No. Polisi:</span> {ticket.vehicle_plate_number || "-"}</div>
                  <div><span className="text-muted-foreground">VIN:</span> {ticket.vehicle_vin || "-"}</div>
                  <div><span className="text-muted-foreground">Odometer:</span> {ticket.vehicle_odometer ? ticket.vehicle_odometer.toLocaleString() + " KM" : "-"}</div>
                  <div><span className="text-muted-foreground">Service Terakhir:</span> {ticket.last_service_date ? format(new Date(ticket.last_service_date), "dd MMMM yyyy", { locale: id }) : "-"}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Item Service Terakhir:</span> {ticket.last_service_items || "-"}</div>
                </div>
              </div>

              {/* Complaint Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary border-b pb-1">Data Komplain</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Cabang:</span> {ticket.branch}</div>
                  <div><span className="text-muted-foreground">Kategori:</span> {ticket.category}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Sub-Kategori:</span> {ticket.sub_category || "-"}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground mb-1">Deskripsi Komplain:</p>
                  <p>{ticket.description}</p>
                </div>
              </div>

              {/* Technical Analysis */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary border-b pb-1">Hasil Analisa Teknik</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-muted-foreground">Nama PIC:</span> {technicalReport.pic_name}</div>
                  <div><span className="text-muted-foreground">Tanggal Laporan:</span> {format(new Date(technicalReport.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Analisa Kerusakan</p>
                    <p className="bg-muted/50 p-3 rounded-lg text-sm">{technicalReport.damage_analysis}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Metode Perbaikan</p>
                    <p className="bg-muted/50 p-3 rounded-lg text-sm">{technicalReport.repair_method}</p>
                  </div>

                  {technicalReport.problem_parts && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Part yang Bermasalah</p>
                      <p className="bg-muted/50 p-3 rounded-lg text-sm">{technicalReport.problem_parts}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Biaya yang Dibutuhkan</p>
                    <p className="bg-muted/50 p-3 rounded-lg text-sm font-medium">
                      {formatCurrency(technicalReport.estimated_cost)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Kesimpulan</p>
                    <p className="bg-muted/50 p-3 rounded-lg text-sm">{technicalReport.conclusion}</p>
                  </div>

                  {technicalReport.recommendation && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rekomendasi Pencegahan</p>
                      <p className="bg-muted/50 p-3 rounded-lg text-sm">{technicalReport.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800 dark:text-blue-200">Durasi Penanganan</span>
                </div>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {calculateDuration(new Date(ticket.created_at), ticket.status === "closed" ? new Date(ticket.updated_at) : new Date())}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Dari: {format(new Date(ticket.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                  {ticket.status === "closed" && ` - Sampai: ${format(new Date(ticket.updated_at), "dd MMM yyyy HH:mm", { locale: id })}`}
                </p>
              </div>

              {/* Activity History */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary border-b pb-1 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Riwayat Aktivitas
                </h3>
                <div className="bg-muted/30 rounded-lg overflow-hidden">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada riwayat</p>
                  ) : (
                    <div className="divide-y">
                      {history.map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-3 text-sm">
                          <div className="flex-1">
                            <p>{item.description || item.action}</p>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {format(new Date(item.performed_at), "dd/MM/yyyy HH:mm", { locale: id })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReportDialog(false);
                    navigate(`/tickets/${ticketId}/technical-report/edit`);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Laporan
                </Button>
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
