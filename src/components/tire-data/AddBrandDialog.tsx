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

interface AddBrandDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddBrandDialog({ open, onOpenChange }: AddBrandDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: "",
        country: "",
        logo: "🛞",
        tier: "mid" as "premium" | "mid" | "budget",
        description: "",
    });

    const createMutation = useMutation({
        mutationFn: tireService.createBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tire-brands"] });
            toast({
                title: "Berhasil",
                description: "Merek ban berhasil ditambahkan",
            });
            onOpenChange(false);
            resetForm();
        },
        onError: () => {
            toast({
                title: "Gagal",
                description: "Gagal menambahkan merek ban",
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            country: "",
            logo: "🛞",
            tier: "mid",
            description: "",
        });
    };

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
        createMutation.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Merek Ban</DialogTitle>
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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
