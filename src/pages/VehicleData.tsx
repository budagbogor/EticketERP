import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Car, X, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CarModel {
  id: string;
  name: string;
  brand_id: string;
}

interface CarBrand {
  id: string;
  name: string;
  models: CarModel[];
}

export default function VehicleData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<CarBrand | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [editBrandName, setEditBrandName] = useState("");
  const [editModels, setEditModels] = useState<CarModel[]>([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const { data: brandsData, error: brandsError } = await supabase
        .from("car_brands")
        .select("id, name")
        .order("name");

      if (brandsError) throw brandsError;

      const { data: modelsData, error: modelsError } = await supabase
        .from("car_models")
        .select("id, name, brand_id");

      if (modelsError) throw modelsError;

      const brandsWithModels: CarBrand[] = (brandsData || []).map((brand) => ({
        id: brand.id,
        name: brand.name,
        models: (modelsData || []).filter((model) => model.brand_id === brand.id),
      }));

      setBrands(brandsWithModels);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data kendaraan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.models.some(model => model.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddModel = async () => {
    if (!selectedBrand || !newModelName.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("car_models")
        .insert({ brand_id: selectedBrand.id, name: newModelName.trim() });

      if (error) throw error;

      toast({
        title: "Model Ditambahkan",
        description: `Model "${newModelName}" berhasil ditambahkan ke ${selectedBrand.name}`,
      });

      setNewModelName("");
      setIsAddModelOpen(false);
      setSelectedBrand(null);
      fetchBrands();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan model",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditBrand = async () => {
    if (!selectedBrand || !editBrandName.trim()) return;

    setIsSaving(true);
    try {
      // Update brand name
      const { error: brandError } = await supabase
        .from("car_brands")
        .update({ name: editBrandName.trim() })
        .eq("id", selectedBrand.id);

      if (brandError) throw brandError;

      // Delete removed models
      const currentModelIds = editModels.map(m => m.id);
      const originalModelIds = selectedBrand.models.map(m => m.id);
      const modelsToDelete = originalModelIds.filter(id => !currentModelIds.includes(id));

      if (modelsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("car_models")
          .delete()
          .in("id", modelsToDelete);

        if (deleteError) throw deleteError;
      }

      toast({
        title: "Merek Diperbarui",
        description: `Data merek berhasil diperbarui`,
      });

      setIsEditBrandOpen(false);
      setSelectedBrand(null);
      fetchBrands();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui merek",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("car_brands")
        .insert({ name: newBrandName.trim() });

      if (error) throw error;

      toast({
        title: "Merek Ditambahkan",
        description: `Merek "${newBrandName}" berhasil ditambahkan`,
      });

      setNewBrandName("");
      setIsAddBrandOpen(false);
      fetchBrands();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan merek",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModelDialog = (brand: CarBrand) => {
    setSelectedBrand(brand);
    setNewModelName("");
    setIsAddModelOpen(true);
  };

  const openEditBrandDialog = (brand: CarBrand) => {
    setSelectedBrand(brand);
    setEditBrandName(brand.name);
    setEditModels([...brand.models]);
    setIsEditBrandOpen(true);
  };

  const removeModelFromEdit = (modelToRemove: CarModel) => {
    setEditModels(prev => prev.filter(model => model.id !== modelToRemove.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Data Kendaraan</h1>
          <p className="text-muted-foreground">Kelola data merek dan model kendaraan</p>
        </div>
        <Button onClick={() => setIsAddBrandOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Merek
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari merek atau model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {filteredBrands.map((brand) => (
              <AccordionItem 
                key={brand.id} 
                value={brand.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{brand.name}</p>
                      <p className="text-sm text-muted-foreground">{brand.models.length} model</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {brand.models.map((model) => (
                        <Badge key={model.id} variant="secondary" className="text-sm">
                          {model.name}
                        </Badge>
                      ))}
                      {brand.models.length === 0 && (
                        <p className="text-sm text-muted-foreground">Belum ada model</p>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openAddModelDialog(brand)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Tambah Model
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditBrandDialog(brand)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Dialog Tambah Model */}
      <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Model Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Merek</Label>
              <Input value={selectedBrand?.name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelName">Nama Model</Label>
              <Input
                id="modelName"
                placeholder="Contoh: Avanza, Jazz, dll"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModelOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddModel} disabled={!newModelName.trim() || isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Merek */}
      <Dialog open={isEditBrandOpen} onOpenChange={setIsEditBrandOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Merek</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Nama Merek</Label>
              <Input
                id="brandName"
                value={editBrandName}
                onChange={(e) => setEditBrandName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Model Kendaraan</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[80px]">
                {editModels.map((model) => (
                  <Badge key={model.id} variant="secondary" className="text-sm flex items-center gap-1">
                    {model.name}
                    <button
                      type="button"
                      onClick={() => removeModelFromEdit(model)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {editModels.length === 0 && (
                  <p className="text-sm text-muted-foreground">Tidak ada model</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBrandOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditBrand} disabled={!editBrandName.trim() || isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Merek */}
      <Dialog open={isAddBrandOpen} onOpenChange={setIsAddBrandOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Merek Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newBrandName">Nama Merek</Label>
              <Input
                id="newBrandName"
                placeholder="Contoh: Toyota, Honda, dll"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBrandOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddBrand} disabled={!newBrandName.trim() || isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
