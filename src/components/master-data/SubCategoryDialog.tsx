import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

interface SubCategoryDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function SubCategoryDialog({ open, onOpenChange, trigger, onSuccess }: SubCategoryDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const isControlled = open !== undefined && onOpenChange !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        if (!newOpen) {
            setName("");
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Nama sub-kategori tidak boleh kosong",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        const { error } = await supabase
            .from("sub_categories")
            .insert({ name: name.trim() });

        if (error) {
            toast({
                title: "Error",
                description: error.message.includes("duplicate")
                    ? "Sub-kategori sudah ada"
                    : "Gagal menambahkan sub-kategori",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Berhasil",
                description: `Sub-kategori "${name}" berhasil ditambahkan`,
            });
            queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
            if (onSuccess) onSuccess();
            handleOpenChange(false);
        }
        setIsSaving(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Sub-Kategori</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="subcategory-name">Nama Sub-Kategori</Label>
                        <Input
                            id="subcategory-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Masukkan nama sub-kategori"
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Tambah
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
