import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ForumCategory } from "@/types/forum";
import { Plus } from "lucide-react";

interface CreateThreadDialogProps {
    categories: ForumCategory[];
    buttonRequest?: boolean; // If true, render a button that says "Buat Topik Baru" even if no trigger children
}

export function CreateThreadDialog({ categories, buttonRequest }: CreateThreadDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!title || !content || !categoryId) {
            toast({
                title: "Error",
                description: "Mohon lengkapi semua field",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("forum_threads").insert({
                title,
                content,
                category_id: categoryId,
                author_id: user.id,
            });

            if (error) throw error;

            toast({
                title: "Sukses",
                description: "Topik diskusi berhasil dibuat",
            });
            setOpen(false);
            setTitle("");
            setContent("");
            setCategoryId("");
            queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Buat Topik Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Mulai Diskusi Baru</DialogTitle>
                    <DialogDescription>
                        Bagikan permasalahan, ide, atau informasi dengan rekan kerja lainnya.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Judul Topik</Label>
                        <Input
                            id="title"
                            placeholder="Contoh: Cara mengatasi bunyi pada kaki-kaki Avanza"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Isi Diskusi</Label>
                        <Textarea
                            id="content"
                            placeholder="Jelaskan detail permasalahan atau informasi yang ingin dibagikan..."
                            className="min-h-[150px]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Mengirim..." : "Kirim Topik"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
