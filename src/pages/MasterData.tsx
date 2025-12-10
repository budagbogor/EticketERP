import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranches, useComplaintCategories, useSubCategories } from "@/hooks/useMasterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building, Tag, Layers, Loader2, Search } from "lucide-react";

interface MasterDataItem {
  id: string;
  name: string;
}

type DataType = "branches" | "complaint_categories" | "sub_categories";

export default function MasterData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: categories = [], isLoading: categoriesLoading } = useComplaintCategories();
  const { data: subCategories = [], isLoading: subCategoriesLoading } = useSubCategories();
  
  const [activeTab, setActiveTab] = useState<DataType>("branches");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);
  const [formName, setFormName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getTableName = (type: DataType) => type;
  
  const getQueryKey = (type: DataType) => {
    switch (type) {
      case "branches": return ["branches"];
      case "complaint_categories": return ["complaint-categories"];
      case "sub_categories": return ["sub-categories"];
    }
  };

  const getLabel = (type: DataType) => {
    switch (type) {
      case "branches": return { singular: "Cabang", plural: "Cabang" };
      case "complaint_categories": return { singular: "Kategori", plural: "Kategori" };
      case "sub_categories": return { singular: "Sub-Kategori", plural: "Sub-Kategori" };
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "branches": return branches;
      case "complaint_categories": return categories;
      case "sub_categories": return subCategories;
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case "branches": return branchesLoading;
      case "complaint_categories": return categoriesLoading;
      case "sub_categories": return subCategoriesLoading;
    }
  };

  const filteredData = getCurrentData().filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formName.trim()) {
      toast({
        title: "Error",
        description: "Nama tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from(getTableName(activeTab))
      .insert({ name: formName.trim() });

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate") 
          ? `${getLabel(activeTab).singular} sudah ada` 
          : `Gagal menambahkan ${getLabel(activeTab).singular.toLowerCase()}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: `${getLabel(activeTab).singular} "${formName}" berhasil ditambahkan`,
      });
      queryClient.invalidateQueries({ queryKey: getQueryKey(activeTab) });
      setIsAddOpen(false);
      setFormName("");
    }
    setIsSaving(false);
  };

  const handleEdit = async () => {
    if (!selectedItem || !formName.trim()) {
      toast({
        title: "Error",
        description: "Nama tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from(getTableName(activeTab))
      .update({ name: formName.trim() })
      .eq("id", selectedItem.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate") 
          ? `${getLabel(activeTab).singular} sudah ada` 
          : `Gagal memperbarui ${getLabel(activeTab).singular.toLowerCase()}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: `${getLabel(activeTab).singular} berhasil diperbarui`,
      });
      queryClient.invalidateQueries({ queryKey: getQueryKey(activeTab) });
      setIsEditOpen(false);
      setSelectedItem(null);
      setFormName("");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setIsSaving(true);
    const { error } = await supabase
      .from(getTableName(activeTab))
      .delete()
      .eq("id", selectedItem.id);

    if (error) {
      toast({
        title: "Error",
        description: `Gagal menghapus ${getLabel(activeTab).singular.toLowerCase()}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: `${getLabel(activeTab).singular} "${selectedItem.name}" berhasil dihapus`,
      });
      queryClient.invalidateQueries({ queryKey: getQueryKey(activeTab) });
      setIsDeleteOpen(false);
      setSelectedItem(null);
    }
    setIsSaving(false);
  };

  const openAddDialog = () => {
    setFormName("");
    setIsAddOpen(true);
  };

  const openEditDialog = (item: MasterDataItem) => {
    setSelectedItem(item);
    setFormName(item.name);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (item: MasterDataItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Data Master</h1>
        <p className="text-muted-foreground">Kelola data cabang, kategori, dan sub-kategori</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as DataType); setSearchQuery(""); }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Cabang
          </TabsTrigger>
          <TabsTrigger value="complaint_categories" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Kategori
          </TabsTrigger>
          <TabsTrigger value="sub_categories" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Sub-Kategori
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">Daftar {getLabel(activeTab).plural}</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={openAddDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Nama</TableHead>
                      <TableHead className="font-semibold w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading() ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "Tidak ada data yang cocok" : `Belum ada ${getLabel(activeTab).singular.toLowerCase()}`}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => openDeleteDialog(item)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Menampilkan {filteredData.length} dari {getCurrentData().length} data
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Tambah */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah {getLabel(activeTab).singular}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama {getLabel(activeTab).singular}</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={`Masukkan nama ${getLabel(activeTab).singular.toLowerCase()}`}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleAdd} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {getLabel(activeTab).singular}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama {getLabel(activeTab).singular}</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {getLabel(activeTab).singular}</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{selectedItem?.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
