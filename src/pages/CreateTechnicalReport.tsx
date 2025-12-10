import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Car, FileText, Save } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import { z } from "zod";

const technicalReportSchema = z.object({
  damageAnalysis: z.string().min(1, "Analisa kerusakan wajib diisi").max(5000),
  repairMethod: z.string().min(1, "Metode perbaikan wajib diisi").max(5000),
  problemParts: z.string().max(2000).optional(),
  estimatedCost: z.string().optional(),
  conclusion: z.string().min(1, "Kesimpulan wajib diisi").max(5000),
  recommendation: z.string().max(5000).optional(),
  picName: z.string().min(1, "Nama PIC wajib diisi").max(200),
});

export default function CreateTechnicalReport() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    damageAnalysis: "",
    repairMethod: "",
    problemParts: "",
    estimatedCost: "",
    conclusion: "",
    recommendation: "",
    picName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch ticket data from Supabase
  const { data: ticket, isLoading: ticketLoading } = useQuery({
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

  // Fetch profile to get default PIC name
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Set default PIC name when profile is loaded
  useState(() => {
    if (profile?.name && !formData.picName) {
      setFormData(prev => ({ ...prev, picName: profile.name }));
    }
  });

  const formatCurrency = (value: string): string => {
    // Remove non-digit characters
    const numericValue = value.replace(/\D/g, "");
    // Format with thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Format currency for estimatedCost field
    if (field === "estimatedCost") {
      processedValue = formatCurrency(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    // Validate form
    const result = technicalReportSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert technical report
      const { error: reportError } = await supabase.from("technical_reports").insert({
        complaint_id: ticketId,
        damage_analysis: formData.damageAnalysis,
        repair_method: formData.repairMethod,
        problem_parts: formData.problemParts || null,
        estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost.replace(/\./g, "").replace(",", ".")) : null,
        conclusion: formData.conclusion,
        recommendation: formData.recommendation || null,
        pic_name: formData.picName,
        created_by: user?.id,
      });

      if (reportError) throw reportError;

      // Update complaint status to closed
      const { error: statusError } = await supabase
        .from("complaints")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("id", ticketId);

      if (statusError) throw statusError;

      // Add history record
      await supabase.from("complaint_history").insert({
        complaint_id: ticketId,
        action: "report_created",
        description: `Laporan teknik dibuat oleh ${formData.picName}`,
        performed_by: user?.id || "",
        old_status: ticket?.status,
        new_status: "closed",
      });

      toast({
        title: "Berhasil",
        description: "Laporan teknik berhasil dibuat dan tiket ditutup",
      });

      navigate(`/tickets/${ticketId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticketLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Tiket tidak ditemukan</p>
        <Button variant="link" onClick={() => navigate("/tickets")}>
          Kembali ke daftar tiket
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buat Laporan Teknik</h1>
          <p className="text-muted-foreground">Tiket: {ticket.ticket_number}</p>
        </div>
      </div>

      {/* Ticket Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Data Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Nama:</span>
              <p className="font-medium">{ticket.customer_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Telepon:</span>
              <p>{ticket.customer_phone}</p>
            </div>
            {ticket.customer_address && (
              <div>
                <span className="text-muted-foreground">Alamat:</span>
                <p>{ticket.customer_address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="w-4 h-4" />
              Data Kendaraan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
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
            {ticket.vehicle_vin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VIN</span>
                <span className="font-mono text-xs">{ticket.vehicle_vin}</span>
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
            {ticket.last_service_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tgl Service Terakhir</span>
                <span>{format(new Date(ticket.last_service_date), "dd MMM yyyy", { locale: id })}</span>
              </div>
            )}
            {ticket.last_service_items && (
              <div className="pt-2 border-t">
                <span className="text-muted-foreground">Item Service Terakhir:</span>
                <p className="mt-1 text-xs">{ticket.last_service_items}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaint Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" />
              Detail Keluhan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Kategori:</span>
              <p className="font-medium">{ticket.category}</p>
            </div>
            {ticket.sub_category && (
              <div>
                <span className="text-muted-foreground">Sub-Kategori:</span>
                <p>{ticket.sub_category}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Cabang:</span>
              <p>{ticket.branch}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tanggal Dibuat:</span>
              <p>{format(new Date(ticket.created_at), "dd MMM yyyy", { locale: id })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaint Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Deskripsi Keluhan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm bg-muted/50 p-4 rounded-lg">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Technical Report Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Laporan Teknik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Damage Analysis */}
          <div className="space-y-2">
            <Label htmlFor="damageAnalysis">
              Analisa Kerusakan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="damageAnalysis"
              placeholder="Jelaskan hasil analisa kerusakan yang ditemukan..."
              rows={4}
              value={formData.damageAnalysis}
              onChange={(e) => handleChange("damageAnalysis", e.target.value)}
              className={errors.damageAnalysis ? "border-destructive" : ""}
            />
            {errors.damageAnalysis && (
              <p className="text-sm text-destructive">{errors.damageAnalysis}</p>
            )}
          </div>

          {/* Repair Method */}
          <div className="space-y-2">
            <Label htmlFor="repairMethod">
              Metode/Tindakan Perbaikan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="repairMethod"
              placeholder="Jelaskan metode atau tindakan perbaikan yang dilakukan..."
              rows={4}
              value={formData.repairMethod}
              onChange={(e) => handleChange("repairMethod", e.target.value)}
              className={errors.repairMethod ? "border-destructive" : ""}
            />
            {errors.repairMethod && (
              <p className="text-sm text-destructive">{errors.repairMethod}</p>
            )}
          </div>

          {/* Problem Parts */}
          <div className="space-y-2">
            <Label htmlFor="problemParts">Nama Part yang Bermasalah</Label>
            <Textarea
              id="problemParts"
              placeholder="Sebutkan part-part yang bermasalah (jika ada)..."
              rows={2}
              value={formData.problemParts}
              onChange={(e) => handleChange("problemParts", e.target.value)}
            />
          </div>

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Biaya yang Dibutuhkan (Rp)</Label>
            <Input
              id="estimatedCost"
              type="text"
              placeholder="Contoh: 500.000"
              value={formData.estimatedCost}
              onChange={(e) => handleChange("estimatedCost", e.target.value)}
            />
          </div>

          {/* Conclusion */}
          <div className="space-y-2">
            <Label htmlFor="conclusion">
              Kesimpulan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="conclusion"
              placeholder="Tuliskan kesimpulan dari hasil perbaikan..."
              rows={3}
              value={formData.conclusion}
              onChange={(e) => handleChange("conclusion", e.target.value)}
              className={errors.conclusion ? "border-destructive" : ""}
            />
            {errors.conclusion && (
              <p className="text-sm text-destructive">{errors.conclusion}</p>
            )}
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <Label htmlFor="recommendation">Rekomendasi Agar Keluhan Tidak Terulang</Label>
            <Textarea
              id="recommendation"
              placeholder="Tuliskan rekomendasi pencegahan untuk masa depan..."
              rows={3}
              value={formData.recommendation}
              onChange={(e) => handleChange("recommendation", e.target.value)}
            />
          </div>

          {/* PIC Name */}
          <div className="space-y-2">
            <Label htmlFor="picName">
              Nama PIC Pembuat Laporan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="picName"
              placeholder="Nama PIC yang membuat laporan"
              value={formData.picName}
              onChange={(e) => handleChange("picName", e.target.value)}
              className={errors.picName ? "border-destructive" : ""}
            />
            {errors.picName && (
              <p className="text-sm text-destructive">{errors.picName}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Menyimpan..." : "Submit Laporan Teknik"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
