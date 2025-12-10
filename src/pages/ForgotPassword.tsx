import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMobeng from "@/assets/logo-mobeng-2.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email harus diisi");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("reset-password", {
        body: { email },
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        toast({
          title: "Email Terkirim",
          description: "Password baru telah dikirim ke email Anda.",
        });
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Email Terkirim!</h2>
              <p className="text-muted-foreground">
                Password baru telah dikirim ke email <strong>{email}</strong>. 
                Silakan cek inbox Anda dan gunakan password baru untuk login.
              </p>
              <Link to="/login">
                <Button className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary overflow-hidden mb-4">
            <img src={logoMobeng} alt="Mobeng Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Mobeng E-Ticket</h1>
          <p className="text-muted-foreground mt-1">Sistem Penanganan Komplain Kendaraan</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Lupa Password</CardTitle>
            </div>
            <CardDescription>
              Masukkan email terdaftar Anda. Password baru akan dikirim ke email tersebut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email terdaftar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Kirim Password Baru"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <Link to="/login" className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
