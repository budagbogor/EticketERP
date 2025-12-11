import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { ArrowLeft, Upload, User, Car, MapPin, FileText, CalendarIcon, X, Image, Video, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBranches, useComplaintCategories, useSubCategories, useFuelTypes, useTransmissionTypes, useCarBrands } from "@/hooks/useMasterData";
import { ticketFormSchema } from "@/lib/validations";

interface CarModel {
  id: string;
  name: string;
  brand_id: string;
}

interface CarBrand {
  id: string;
  name: string;
  car_models: CarModel[];
}

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const generateTicketNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `TKT-${year}-${randomNum}`;
};

export default function CreateTicket() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(profile?.branch || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [availableModels, setAvailableModels] = useState<CarModel[]>([]);
  const [lastServiceDate, setLastServiceDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch master data from database
  const { data: carBrands = [] } = useCarBrands();
  const { data: branches = [] } = useBranches();
  const { data: complaintCategories = [] } = useComplaintCategories();
  const { data: subCategories = [] } = useSubCategories();
  const { data: fuelTypes = [] } = useFuelTypes();
  const { data: transmissionTypes = [] } = useTransmissionTypes();

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    const brandData = carBrands.find(b => b.name === brand);
    setAvailableModels(brandData ? brandData.car_models : []);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_FILES - uploadedFiles.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Batas file tercapai",
        description: `Maksimal ${MAX_FILES} file yang dapat diupload`,
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File terlalu besar",
          description: `${file.name} melebihi batas 10MB`,
          variant: "destructive",
        });
        continue;
      }

      // Check file type
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        toast({
          title: "Format tidak didukung",
          description: `${file.name} bukan format yang didukung`,
          variant: "destructive",
        });
        continue;
      }

      const preview = URL.createObjectURL(file);
      newFiles.push({
        file,
        preview,
        type: isImage ? 'image' : 'video',
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFilesToStorage = async (ticketNumber: string): Promise<string[]> => {
    if (!user || uploadedFiles.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const uploadedFile of uploadedFiles) {
      const fileExt = uploadedFile.file.name.split('.').pop();
      const fileName = `${user.id}/${ticketNumber}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, uploadedFile.file);

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('ticket-attachments')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const createComplaintMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) throw new Error("User not authenticated");

      setIsUploading(true);
      const ticketNumber = generateTicketNumber();

      // Upload files first
      const attachmentUrls = await uploadFilesToStorage(ticketNumber);

      const { data, error } = await supabase
        .from("complaints")
        .insert({
          ticket_number: ticketNumber,
          customer_name: formData.get("customerName") as string,
          customer_phone: formData.get("customerPhone") as string,
          customer_address: formData.get("customerAddress") as string || null,
          vehicle_brand: selectedBrand,
          vehicle_model: selectedModel,
          vehicle_year: selectedYear ? parseInt(selectedYear) : null,
          vehicle_plate_number: formData.get("plateNumber") as string || null,
          vehicle_vin: formData.get("vin") as string || null,
          vehicle_odometer: formData.get("odometer") ? parseInt(formData.get("odometer") as string) : null,
          vehicle_transmission: selectedTransmission || null,
          vehicle_fuel_type: selectedFuel || null,
          last_service_date: lastServiceDate?.toISOString() || null,
          last_service_items: formData.get("lastServiceItems") as string || null,
          branch: selectedBranch,
          category: selectedCategory,
          sub_category: selectedSubCategory || null,
          description: formData.get("description") as string,
          status: "new",
          created_by: user.id,
          creator_name: formData.get("creatorName") as string || profile?.name || null,
          attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setIsUploading(false);
      // Cleanup previews
      uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setUploadedFiles([]);

      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-stats"] });
      toast({
        title: "Tiket Berhasil Dibuat",
        description: `Nomor tiket: ${data.ticket_number}`,
      });
      navigate("/tickets");
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Gagal Membuat Tiket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validate form data
    const validationData = {
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      customerAddress: formData.get("customerAddress") as string,
      vehicleBrand: selectedBrand,
      vehicleModel: selectedModel,
      vehicleYear: selectedYear ? parseInt(selectedYear) : null,
      vehiclePlateNumber: (formData.get("plateNumber") as string)?.toUpperCase() || "",
      vehicleVin: (formData.get("vin") as string)?.toUpperCase() || "",
      vehicleOdometer: formData.get("odometer") ? parseInt(formData.get("odometer") as string) : null,
      vehicleTransmission: selectedTransmission || null,
      vehicleFuelType: selectedFuel || null,
      branch: selectedBranch,
      category: selectedCategory,
      subCategory: selectedSubCategory || null,
      description: formData.get("description") as string,
      lastServiceDate: lastServiceDate?.toISOString() || null,
      lastServiceItems: formData.get("lastServiceItems") as string || null,
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

    createComplaintMutation.mutate(formData);
  };

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buat Tiket Komplain</h1>
          <p className="text-muted-foreground">Isi formulir untuk membuat tiket baru</p>
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
              <Input id="customerName" name="customerName" placeholder="Masukkan nama lengkap" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Nomor Telepon *</Label>
              <Input id="customerPhone" name="customerPhone" type="tel" placeholder="08xxxxxxxxxx" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customerAddress">Alamat</Label>
              <Textarea id="customerAddress" name="customerAddress" placeholder="Masukkan alamat lengkap" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="creatorName">Nama Pembuat Tiket *</Label>
              <Input
                id="creatorName"
                name="creatorName"
                placeholder="Nama pembuat tiket"
                defaultValue={profile?.name || ''}
                required
              />
              <p className="text-xs text-muted-foreground">
                Nama Anda sebagai pembuat tiket ini
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="w-5 h-5" />
                Data Kendaraan
              </CardTitle>
              <Link to="/vehicles">
                <Button variant="outline" size="sm" type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Data Kendaraan
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Jika merek/model kendaraan belum tersedia, klik tombol "Tambah Data Kendaraan" untuk menambahkannya terlebih dahulu.
            </p>
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
                name="plateNumber"
                placeholder="B 1234 ABC"
                required
                className="uppercase"
                onChange={(e) => e.target.value = e.target.value.toUpperCase()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">Nomor Rangka (VIN)</Label>
              <Input
                id="vin"
                name="vin"
                placeholder="MHFM1BA3J1K123456"
                className="uppercase"
                onChange={(e) => e.target.value = e.target.value.toUpperCase()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer (KM) *</Label>
              <Input id="odometer" name="odometer" type="number" placeholder="45000" required />
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
                name="lastServiceItems"
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
            <div className="space-y-2 md:col-span-2">
              <Label>Sub-Kategori *</Label>
              <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sub-kategori" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Deskripsi Komplain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Lengkap *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Jelaskan keluhan pelanggan secara detail..."
                rows={5}
                required
              />
            </div>
            <div className="space-y-3">
              <Label>Lampiran (Foto/Video) - Maks. {MAX_FILES} file</Label>

              {/* File Previews */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border bg-muted aspect-video">
                      {uploadedFile.type === 'image' ? (
                        <img
                          src={uploadedFile.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <video
                            src={uploadedFile.preview}
                            className="w-full h-full object-cover"
                          />
                          <Video className="absolute w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
                        {uploadedFile.type === 'image' ? <Image className="w-3 h-3 inline mr-1" /> : <Video className="w-3 h-3 inline mr-1" />}
                        {uploadedFile.type === 'image' ? 'Foto' : 'Video'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              {uploadedFiles.length < MAX_FILES && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klik untuk upload foto/video
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, GIF, WEBP, MP4 (Maks. 10MB per file)
                  </p>
                  <p className="text-xs text-primary mt-1">
                    {uploadedFiles.length}/{MAX_FILES} file
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isUploading}>
            Batal
          </Button>
          <Button type="submit" disabled={createComplaintMutation.isPending || isUploading}>
            {(createComplaintMutation.isPending || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isUploading ? "Mengupload..." : createComplaintMutation.isPending ? "Menyimpan..." : "Buat Tiket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
