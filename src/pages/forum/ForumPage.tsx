import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ForumCategory, ForumThread } from "@/types/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Search, MessageCircle, Eye, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { CreateThreadDialog } from "@/components/forum/CreateThreadDialog";
import { useToast } from "@/hooks/use-toast";

export default function ForumPage() {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const { toast } = useToast();

    // Fetch Categories
    const { data: categories = [] } = useQuery({
        queryKey: ["forum-categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("forum_categories")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as ForumCategory[];
        },
    });

    // Fetch Threads
    const { data: threads = [], isLoading } = useQuery({
        queryKey: ["forum-threads", categoryFilter, search],
        queryFn: async () => {
            let query = supabase
                .from("forum_threads")
                .select(`
                    *,
                    category:forum_categories(*),
                    author:author_id(email),
                    posts:forum_posts(count)
                `)
                .order("is_pinned", { ascending: false })
                .order("created_at", { ascending: false });

            if (categoryFilter !== "all") {
                query = query.eq("category_id", categoryFilter);
            }

            if (search) {
                query = query.ilike("title", `%${search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Map author info properly
            return data.map((thread: any) => ({
                ...thread,
                reply_count: thread.posts?.[0]?.count || 0,
                // Supabase join returns array for single relation sometimes depending on client gen, 
                // but standard select returns object if relation is 1:1 or N:1 correctly defined.
                // Auth users extraction might need adjustment if using raw join.
                // Actually auth.users is special. We usually create a public profile table.
                // If direct auth.users link is tricky due to security, consider using metadata or profiles table.
                // For now, let's assume we can get email. If not, we might see null.
            })) as ForumThread[];
        },
    });

    // Seed Categories
    const seedCategories = async () => {
        const defaultCategories = [
            { name: 'Komplain Pelanggan', slug: 'komplain-pelanggan', description: 'Diskusi mengenai penanganan komplain dan kepuasan pelanggan', icon: 'MessageCircleWarning' },
            { name: 'Masalah Produk', slug: 'masalah-produk', description: 'Laporan dan diskusi mengenai isu teknis pada produk', icon: 'Wrench' },
            { name: 'Tools & Equipment', slug: 'tools-equipment', description: 'Diskusi mengenai penggunaan dan perawatan alat bengkel', icon: 'Hammer' },
            { name: 'Problem Solving', slug: 'problem-solving', description: 'Sharing solusi untuk masalah teknis yang sulit', icon: 'Lightbulb' },
            { name: 'Info Revisi', slug: 'info-revisi', description: 'Update terbaru mengenai revisi buku pintar atau SOP', icon: 'FileText' },
            { name: 'Lainnya', slug: 'lainnya', description: 'Diskusi umum lainnya', icon: 'MessageSquare' }
        ];

        try {
            const { error } = await supabase.from('forum_categories').insert(defaultCategories);
            if (error) throw error;
            toast({ title: "Sukses", description: "Kategori default berhasil dibuat" });
            window.location.reload();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto flex-1">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari topik diskusi..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {categories.length > 0 && (
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                {categories.length > 0 ? (
                    <CreateThreadDialog categories={categories} />
                ) : (
                    <Button onClick={seedCategories} variant="secondary">
                        Inisialisasi Kategori
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading diskusi...</div>
            ) : threads.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Belum ada diskusi</h3>
                        <p className="text-muted-foreground mb-4">Mulai diskusi baru untuk membahas topik terkini.</p>
                        <CreateThreadDialog categories={categories} buttonRequest />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {threads.map((thread) => (
                        <Link key={thread.id} to={`/forum/${thread.id}`}>
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                {thread.is_pinned && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Pin className="w-3 h-3" /> Pinned
                                                    </Badge>
                                                )}
                                                <Badge variant="outline">{thread.category?.name}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: id })}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg leading-none tracking-tight">
                                                {thread.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {thread.content}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 text-muted-foreground text-sm min-w-[80px]">
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4" />
                                                <span>{thread.reply_count}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                <span>{thread.view_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
