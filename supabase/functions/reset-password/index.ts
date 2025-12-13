import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const MAX_ATTEMPTS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Email service tidak dikonfigurasi" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const resend = new Resend(resendApiKey);

    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email harus diisi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Format email tidak valid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Processing password reset for email: ${normalizedEmail}`);

    // Check rate limit
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count: attemptCount, error: countError } = await supabaseAdmin
      .from("password_reset_attempts")
      .select("*", { count: "exact", head: true })
      .eq("email", normalizedEmail)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
    }

    if (attemptCount && attemptCount >= MAX_ATTEMPTS_PER_HOUR) {
      console.log(`Rate limit exceeded for email: ${normalizedEmail}`);
      return new Response(
        JSON.stringify({
          error: "Terlalu banyak percobaan. Silakan coba lagi dalam 1 jam.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Record this attempt (before processing to prevent race conditions)
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_attempts")
      .insert({ email: normalizedEmail, ip_address: clientIp });

    if (insertError) {
      console.error("Error recording reset attempt:", insertError);
    }

    // Find user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(JSON.stringify({ error: "Terjadi kesalahan sistem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = users.users.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (!user) {
      // Don't reveal if email exists or not for security
      console.log(`User not found for email: ${normalizedEmail}`);
      return new Response(JSON.stringify({ success: true, message: "Jika email terdaftar, password baru akan dikirim" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user name from profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    const userName = profile?.name || user.user_metadata?.name || "Pengguna";

    // Generate a secure random password
    const generateSecurePassword = (): string => {
      const lowercase = 'abcdefghijkmnpqrstuvwxyz';
      const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const numbers = '23456789';
      const symbols = '!@#$%&*';
      const allChars = lowercase + uppercase + numbers + symbols;

      let password = '';
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];

      for (let i = 4; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }

      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const newPassword = generateSecurePassword();

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(JSON.stringify({ error: "Gagal mereset password" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Password updated for user: ${user.id}`);

    // Send email with new password
    const { error: emailError } = await resend.emails.send({
      from: "Mobeng E-Ticket <onboarding@resend.dev>",
      to: [normalizedEmail],
      subject: "Reset Password - Mobeng E-Ticket",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Mobeng E-Ticket</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Reset Password</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Halo, ${userName}!</h2>
            
            <p>Kami menerima permintaan untuk mereset password akun Anda. Berikut adalah password baru Anda:</p>
            
            <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Password Baru Anda:</p>
              <code style="font-size: 20px; font-weight: bold; color: #667eea; letter-spacing: 2px; background: white; padding: 10px 20px; border-radius: 4px; display: inline-block;">${newPassword}</code>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Penting:</strong> Demi keamanan akun Anda, segera ganti password ini setelah berhasil login.
              </p>
            </div>
            
            <p>Jika Anda tidak meminta reset password, segera hubungi administrator sistem.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              Email ini dikirim secara otomatis oleh sistem Mobeng E-Ticket.<br>
              Mohon tidak membalas email ini.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      // Password already changed, so return success with warning
      return new Response(JSON.stringify({
        success: true,
        warning: "Password berhasil direset tetapi email gagal dikirim. Hubungi administrator untuk password baru."
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Reset password email sent to: ${normalizedEmail}`);

    return new Response(JSON.stringify({ success: true, message: "Password baru telah dikirim ke email Anda" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Reset password error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});