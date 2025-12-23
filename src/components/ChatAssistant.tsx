import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Halo! Saya asisten AI Mobeng. Ada yang bisa saya bantu terkait data complaint atau kendaraan?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user" as const, content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('chat-assistant', {
                body: { messages: [...messages, userMessage] }
            });

            if (error) throw error;

            if (data?.reply) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
                if (data.debug) {
                    console.log("Chat Debug Info:", data.debug);
                }
            } else if (data?.error) {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            toast({
                title: "Error",
                description: "Gagal memproses pesan. Silakan coba lagi.",
                variant: "destructive",
            });
            setMessages((prev) => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan saat menghubungi server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50 transition-transform hover:scale-105"
                size="icon"
            >
                <MessageCircle className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-[380px] sm:w-[450px]">
            <Card className="shadow-2xl border-primary/20 h-[600px] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary text-primary-foreground rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        <CardTitle className="text-base">Mobeng AI Assistant</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg max-w-[80%] text-sm ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sedang berpikir...
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-3 bg-card border-t">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex w-full gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tanya database..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
