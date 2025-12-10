import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Car, MapPin, FileText, CalendarIcon, Loader2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBranches, useComplaintCategories, useSubCategories, useFuelTypes, useTransmissionTypes, useCarBrands } from "@/hooks/useMasterData";
import { Skeleton } from "@/components/ui/skeleton";
import { ticketFormSchema } from "@/lib/validations";

interface CarModel {
  id: string;
  name: string;
  brand_id: string;
}

export default function EditTicket() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vin, setVin] = useState("");
  const [odometer, setOdometer] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [lastServiceItems, setLastServiceItems] = useState("");
  const [availableModels, setAvailableModels] = useState<CarModel[]>([]);
  const [lastServiceDate, setLastServiceDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch master data from database
  const { data: carBrands = [] } = useCarBrands();
  const { data: branches = [] } = useBranches();
  const { data: complaintCategories = [] } = useComplaintCategories();
  const { data: subCategories = [] } = useSubCategories();
  const { data: fuelTypes = [] } = useFuelTypes();
  const { data: transmissionTypes = [] } = useTransmissionTypes();

  // Fetch existing ticket data
  const { data: ticket, isLoading } = useQuery({
    queryKey: ["complaint", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", ticketId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  // Populate form when ticket data is loaded
  useEffect(() => {
    if (ticket) {
      setCustomerName(ticket.customer_name || "");
      setCustomerPhone(ticket.customer_phone || "");
      setCustomerAddress(ticket.customer_address || "");
      setSelectedBrand(ticket.vehicle_brand || "");
      setSelectedModel(ticket.vehicle_model || "");
      setSelectedYear(ticket.vehicle_year?.toString() || "");
      setPlateNumber(ticket.vehicle_plate_number || "");
      setVin(ticket.vehicle_vin || "");
      setOdometer(ticket.vehicle_odometer?.toString() || "");
      setSelectedTransmission(ticket.vehicle_transmission || "");
      setSelectedFuel(ticket.vehicle_fuel_type || "");
      setSelectedBranch(ticket.branch || "");
      setSelectedCategory(ticket.category || "");
      setSelectedSubCategory(ticket.sub_category || "");
      setDescription(ticket.description || "");
      setLastServiceItems(ticket.last_service_items || "");
      if (ticket.last_service_date) {
        setLastServiceDate(new Date(ticket.last_service_date));
      }
    }
  }, [ticket]);

  // Update available models when brand changes or data loads
  useEffect(() => {
    if (selectedBrand && carBrands.length > 0) {
      const brandData = carBrands.find(b => b.name === selectedBrand);
      setAvailableModels(brandData ? brandData.car_models : []);
    }
  }, [selectedBrand, carBrands]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    const brandData = carBrands.find(b => b.name === brand);
    setAvailableModels(brandData ? brandData.car_models : []);
  };

  const updateComplaintMutation = useMutation({
    mutationFn: async () => {
      if (!user || !ticketId) throw new Error("User not authenticated or ticket ID missing");

      const { data, error } = await supabase
        .from("complaints")
        .update({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress || null,
          vehicle_brand: selectedBrand,
          vehicle_model: selectedModel,
          vehicle_year: selectedYear ? parseInt(selectedYear) : null,
          vehicle_plate_number: plateNumber || null,
          vehicle_vin: vin || null,
          vehicle_odometer: odometer ? parseInt(odometer) : null,
          vehicle_transmission: selectedTransmission || null,
          vehicle_fuel_type: selectedFuel || null,
          last_service_date: lastServiceDate?.toISOString() || null,
          last_service_items: lastServiceItems || null,
          branch: selectedBranch,
          category: selectedCategory,
          sub_category: selectedSubCategory || null,
          description: description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["complaint-stats"] });
      toast({
        title: "Tiket Berhasil Diperbarui",
        description: `Nomor tiket: ${data.ticket_number}`,
      });
      navigate(`/tickets/${ticketId}`);
    },
    onError: (error) => {
      toast({
        title: "Gagal Memperbarui Tiket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form data
    const validationData = {
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      vehicleBrand: selectedBrand,
      vehicleModel: selectedModel,
      vehicleYear: selectedYear ? parseInt(selectedYear) : null,
      vehiclePlateNumber: plateNumber?.toUpperCase() || "",
      vehicleVin: vin?.toUpperCase() || "",
      vehicleOdometer: odometer ? parseInt(odometer) : null,
      vehicleTransmission: selectedTransmission || null,
      vehicleFuelType: selectedFuel || null,
      branch: selectedBranch,
      category: selectedCategory,
      subCategory: selectedSubCategory || null,
      description: description,
      lastServiceDate: lastServiceDate?.toISOString() || null,
      lastServiceItems: lastServiceItems || null,
    };

    const result = ticketFormSchema.safeParse(validationData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Validasi Gagal",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }
    
    updateComplaintMutation.mutate();
  };

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tiket Tidak Ditemukan</h1>
            <p className="text-muted-foreground">Tiket yang Anda cari tidak ada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Tiket</h1>
          <p className="text-muted-foreground">Nomor tiket: {ticket.ticket_number}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Data Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Pelanggan *</Label>
              <Input 
                id="customerName" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama lengkap" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Nomor Telepon *</Label>
              <Input 
                id="customerPhone" 
                type="tel" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="08xxxxxxxxxx" 
                required 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customerAddress">Alamat</Label>
              <Textarea 
                id="customerAddress" 
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap" 
                rows={2} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="w-5 h-5" />
              Data Kendaraan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Merek *</Label>
              <Select value={selectedBrand} onValueChange={handleBrandChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih merek" />
                </SelectTrigger>
                <SelectContent>
                  {carBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model *</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahun *</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear} required>
                <SelectTrigger>
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Nomor Polisi *</Label>
              <Input 
                id="plateNumber" 
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="B 1234 ABC" 
                required 
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">Nomor Rangka (VIN)</Label>
              <Input 
                id="vin" 
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="MHFM1BA3J1K123456"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer (KM) *</Label>
              <Input 
                id="odometer" 
                type="number" 
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="45000" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Tipe Transmisi *</Label>
              <Select value={selectedTransmission} onValueChange={setSelectedTransmission} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih transmisi" />
                </SelectTrigger>
                <SelectContent>
                  {transmissionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jenis BBM *</Label>
              <Select value={selectedFuel} onValueChange={setSelectedFuel} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis BBM" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuel) => (
                    <SelectItem key={fuel.id} value={fuel.name}>{fuel.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Service Terakhir</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !lastServiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {lastServiceDate ? format(lastServiceDate, "dd/MM/yyyy") : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={lastServiceDate}
                    onSelect={(date) => {
                      setLastServiceDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="lastServiceItems">Item Servis Terakhir</Label>
              <Textarea 
                id="lastServiceItems" 
                value={lastServiceItems}
                onChange={(e) => setLastServiceItems(e.target.value)}
                placeholder="Contoh: Ganti oli, tune up, ganti filter udara..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branch & Complaint */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5" />
              Cabang & Detail Komplain
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cabang/Toko *</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategori Komplain *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {complaintCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sub Kategori</Label>
              <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sub kategori" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Deskripsi Komplain *</Label>
              <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan detail keluhan pelanggan..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            {(ticket.status === "repair_completed" || ticket.status === "awaiting_report") && (
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => navigate(`/tickets/${ticketId}/technical-report`)}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Buat Laporan Teknik
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Batal
            </Button>
            <Button type="submit" disabled={updateComplaintMutation.isPending}>
              {updateComplaintMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}