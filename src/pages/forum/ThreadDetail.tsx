import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ForumThread, ForumPost } from "@/types/forum";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MessageSquare, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function ThreadDetailPage() {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [replyContent, setReplyContent] = useState("");

    const { data: thread, isLoading: threadLoading } = useQuery({
        queryKey: ["forum-thread", threadId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("forum_threads")
                .select(`
                    *,
                    category:forum_categories(*),
                    author:author_id(email)
                `)
                .eq("id", threadId)
                .single();
            if (error) throw error;
            return data as ForumThread;
        },
    });

    const { data: posts = [], isLoading: postsLoading } = useQuery({
        queryKey: ["forum-posts", threadId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("forum_posts")
                .select(`
                    *,
                    author:author_id(email)
                `)
                .eq("thread_id", threadId)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return data as ForumPost[];
        },
    });

    const createPost = useMutation({
        mutationFn: async (content: string) => {
            if (!user) throw new Error("Unauthorized");
            const { error } = await supabase.from("forum_posts").insert({
                thread_id: threadId,
                content,
                author_id: user.id,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forum-posts", threadId] });
            queryClient.invalidateQueries({ queryKey: ["forum-threads"] }); // Update reply count
            setReplyContent("");
            toast({ title: "Balasan terkirim" });
        },
        onError: (err) => {
            toast({ title: "Gagal mengirim balasan", description: err.message, variant: "destructive" });
        },
    });

    const deleteThread = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus diskusi ini?")) return;
        const { error } = await supabase.from("forum_threads").delete().eq("id", threadId);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Diskusi dihapus" });
            navigate("/forum");
        }
    };

    if (threadLoading) return <div className="p-8 text-center">Loading topic...</div>;
    if (!thread) return <div className="p-8 text-center">Topik tidak ditemukan</div>;

    const getInitials = (email?: string) => email ? email.substring(0, 2).toUpperCase() : "U";

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate("/forum")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Forum
            </Button>

            {/* Main Thread */}
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{thread.category?.name}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(thread.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                                </span>
                            </div>
                            <CardTitle className="text-2xl">{thread.title}</CardTitle>
                        </div>
                        {user?.id === thread.author_id && (
                            <Button variant="ghost" size="icon" onClick={deleteThread}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        {thread.content}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback>{getInitials(thread.author?.email)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <p className="font-medium">{thread.author?.email}</p>
                            <p className="text-xs text-muted-foreground">Author</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Replies */}
            <div className="space-y-4 mt-8">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {posts.length} Balasan
                </h3>

                {posts.map((post) => (
                    <Card key={post.id} className="bg-muted/30">
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <Avatar className="w-8 h-8 mt-1">
                                    <AvatarFallback>{getInitials(post.author?.email)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">{post.author?.email}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}
                                        </span>
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap">
                                        {post.content}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground italic">
                        Belum ada balasan. Jadilah yang pertama menanggapi!
                    </div>
                )}
            </div>

            {/* Reply Form */}
            <Card className="mt-8">
                <CardContent className="pt-6 space-y-4">
                    <h4 className="font-medium">Kirim Balasan</h4>
                    <Textarea
                        placeholder="Tulis balasan Anda di sini..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={() => createPost.mutate(replyContent)}
                            disabled={!replyContent.trim() || createPost.isPending}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {createPost.isPending ? "Mengirim..." : "Kirim Balasan"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
