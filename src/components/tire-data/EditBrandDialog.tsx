import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tireService } from "@/services/tireService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TireBrand } from "@/lib/tireBrands";
import { Trash2, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditBrandDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand: TireBrand;
}

export function EditBrandDialog({ open, onOpenChange, brand }: EditBrandDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: brand.name,
        country: brand.country,
        logo: brand.logo,
        tier: brand.tier as "premium" | "mid" | "budget",
        description: brand.description,
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const updateMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return tireService.updateBrand(brand.id, {
                name: data.name,
                country: data.country,
                logo: data.logo,
                tier: data.tier,
                description: data.description,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tire-brands"] });
            toast({
                title: "Berhasil",
                description: "Merek ban berhasil diperbarui",
            });
            onOpenChange(false);
        },
        onError: () => {
            toast({
                title: "Gagal",
                description: "Gagal memperbarui merek ban",
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            return tireService.deleteBrand(brand.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tire-brands"] });
            queryClient.invalidateQueries({ queryKey: ["tire-products"] });
            toast({
                title: "Berhasil",
                description: "Merek ban berhasil dihapus",
            });
            onOpenChange(false);
        },
        onError: () => {
            toast({
                title: "Gagal",
                description: "Gagal menghapus merek ban",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast({
                title: "Error",
                description: "Nama merek harus diisi",
                variant: "destructive",
            });
            return;
        }
        updateMutation.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Merek Ban</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Merek *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Contoh: Bridgestone"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Negara</Label>
                        <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) =>
                                setFormData({ ...formData, country: e.target.value })
                            }
                            placeholder="Contoh: Jepang"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo (Emoji)</Label>
                        <Input
                            id="logo"
                            value={formData.logo}
                            onChange={(e) =>
                                setFormData({ ...formData, logo: e.target.value })
                            }
                            placeholder="🛞"
                            maxLength={10}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tier">Tier</Label>
                        <Select
                            value={formData.tier}
                            onValueChange={(value: "premium" | "mid" | "budget") =>
                                setFormData({ ...formData, tier: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="mid">Mid-Range</SelectItem>
                                <SelectItem value="budget">Budget</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Deskripsi singkat tentang merek..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="flex-row justify-between items-center sm:justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={updateMutation.isPending || deleteMutation.isPending}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={updateMutation.isPending || deleteMutation.isPending}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending || deleteMutation.isPending}>
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : "Simpan"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Merek Ban?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus merek <strong>{brand.name}</strong>.
                            Tindakan ini akan menghapus semua produk yang terkait dengan merek ini.
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}
