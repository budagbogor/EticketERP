import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Tire Calculation Helpers ---

interface TireSize {
    width: number;
    aspectRatio: number;
    rimDiameter: number;
}

interface TireRecommendation {
    size: string;
    width: number;
    aspectRatio: number;
    rimDiameter: number;
    overallDiameter: number;
    diameterDiff: number;
    safetyLevel: 'safe' | 'moderate' | 'caution';
}

function parseTireSize(sizeString: string): TireSize | null {
    const regex = /^(\d{3})\/(\d{2})R(\d{2})$/i;
    const match = sizeString.trim().toUpperCase().match(regex);
    if (!match) return null;
    return {
        width: parseInt(match[1]),
        aspectRatio: parseInt(match[2]),
        rimDiameter: parseInt(match[3]),
    };
}

function formatTireSize(tire: TireSize): string {
    return `${tire.width}/${tire.aspectRatio}R${tire.rimDiameter}`;
}

function calculateOverallDiameter(tire: TireSize): number {
    const rimDiameterMm = tire.rimDiameter * 25.4;
    const sidewallHeight = tire.width * (tire.aspectRatio / 100);
    return rimDiameterMm + (2 * sidewallHeight);
}

function calculateDiameterDifference(original: number, newDiameter: number): number {
    return ((newDiameter - original) / original) * 100;
}

function getSafetyLevel(diameterDiff: number): 'safe' | 'moderate' | 'caution' {
    const absDiff = Math.abs(diameterDiff);
    if (absDiff <= 1.0) return 'safe';
    if (absDiff <= 3.0) return 'moderate'; // Industry standard ±3%
    return 'caution';
}

function generateRecommendations(originalSize: TireSize): TireRecommendation[] {
    const originalDiameter = calculateOverallDiameter(originalSize);

    // Same-rim upgrade patterns only
    const upgrades: TireSize[] = [
        { width: originalSize.width + 10, aspectRatio: originalSize.aspectRatio, rimDiameter: originalSize.rimDiameter },
        { width: originalSize.width + 10, aspectRatio: originalSize.aspectRatio - 5, rimDiameter: originalSize.rimDiameter },
        { width: originalSize.width + 5, aspectRatio: originalSize.aspectRatio, rimDiameter: originalSize.rimDiameter },
        { width: originalSize.width + 20, aspectRatio: originalSize.aspectRatio - 5, rimDiameter: originalSize.rimDiameter },
        { width: originalSize.width + 15, aspectRatio: originalSize.aspectRatio - 5, rimDiameter: originalSize.rimDiameter },
        { width: originalSize.width + 5, aspectRatio: originalSize.aspectRatio - 5, rimDiameter: originalSize.rimDiameter },
    ];

    const recommendations: TireRecommendation[] = [];

    for (const upgrade of upgrades) {
        if (upgrade.width < 155 || upgrade.width > 335) continue;
        if (upgrade.aspectRatio < 25 || upgrade.aspectRatio > 80) continue;
        if (upgrade.rimDiameter < 14 || upgrade.rimDiameter > 22) continue;

        const newDiameter = calculateOverallDiameter(upgrade);
        const diameterDiff = calculateDiameterDifference(originalDiameter, newDiameter);

        if (Math.abs(diameterDiff) <= 3.0) {
            recommendations.push({
                size: formatTireSize(upgrade),
                width: upgrade.width,
                aspectRatio: upgrade.aspectRatio,
                rimDiameter: upgrade.rimDiameter,
                overallDiameter: newDiameter,
                diameterDiff: Math.round(diameterDiff * 100) / 100,
                safetyLevel: getSafetyLevel(diameterDiff),
            });
        }
    }

    // Sort: Safe first, then by diff
    return recommendations
        .sort((a, b) => {
            const safetyOrder = { safe: 0, moderate: 1, caution: 2 };
            if (safetyOrder[a.safetyLevel] !== safetyOrder[b.safetyLevel]) {
                return safetyOrder[a.safetyLevel] - safetyOrder[b.safetyLevel];
            }
            return Math.abs(a.diameterDiff) - Math.abs(b.diameterDiff);
        })
        .slice(0, 5);
}


const DATABASE_SCHEMA = `
The database has the following key tables:

1. complaints: Customer complaints.
   - Columns: id, ticket_number, customer_name, customer_phone, branch, vehicle_brand, vehicle_model, description, status, created_at, category.
2. vehicle_specifications: Technical specs of vehicles.
   - Columns: brand_id, model_id, variant_name, year_start, year_end, engine_type, engine_oil_capacity, engine_oil_type, transmission_oil_capacity, transmission_oil_type, power_steering_oil_capacity, power_steering_oil_type, brake_oil_type, radiator_coolant_capacity, radiator_coolant_type, ac_freon_capacity, ac_freon_type, tire_size_front, tire_size_rear, tire_pressure_front, tire_pressure_rear, battery_type, wiper_size_driver, wiper_size_passenger, wiper_size_rear, spark_plug_type, air_filter_type, cabin_filter_type, fuel_filter_type, oil_filter_type, brake_pad_front_type, brake_pad_rear_type, brake_disc_front_type, brake_disc_rear_type, shock_depan_recommended_brands, shock_belakang_recommended_brands, rack_end_recommended_brands, tie_rod_recommended_brands, link_stabilizer_recommended_brands, lower_arm_recommended_brands, upper_arm_recommended_brands, upper_support_recommended_brands, created_at.
3. technical_reports: Technical analysis of complaints.
   - Columns: complaint_id, damage_analysis, repair_method, conclusion, estimated_cost.
4. car_brands: Brand names (e.g., Toyota, Honda).
   - Columns: id, name.
5. car_models: Model names linked to brands.
   - Columns: id, brand_id, name.
6. branches: Company branch names.
   - Columns: id, name.
7. social_complaints: Complaints from social media.
   - Columns: channel, username, complain_summary, status, viral_risk.
8. wiper_specifications: Wiper compatibility specs.
   - Columns: id, brand, model, year_start, year_end, notes.
9. wiper_sizes: Specific wiper sizes for specs.
   - Columns: specification_id, position (kiri/kanan/belakang), size_inch, blade_brand, part_code, price, stock.

Relationships:
- complaints.id is referenced by technical_reports.complaint_id
- car_brands.id -> car_models.brand_id
- car_models.id -> vehicle_specifications.model_id
- car_brands.id -> vehicle_specifications.brand_id
- wiper_specifications.id -> wiper_sizes.specification_id
`;

const APP_DOCUMENTATION = `
SYSTEM KNOWLEDGE BASE (WORKFLOWS):

1. **COMPLAIN COMPASS (Pendataan Medsos)**
   - **Tujuan**: Mencatat komplain dari media sosial (IG/FB/TikTok/WA) dengan data minim.
   - **User**: Admin CS.
   - **Input**: Username, Link, Channel, Kategori, Risiko Viral (Normal/Potensi).
   - **Flow**:
     1. Terima komplain di medsos.
     2. Input ke "Complain Compass" (Status: Open).
     3. Coba hubungi customer (Status: Monitoring).
     4. Jika selesai atau jadi tiket formal -> Status: Closed.

2. **SISTEM TIKET (Resmi)**
   - **Tujuan**: Penanganan servis/komplain resmi di bengkel.
   - **Input**: Nama, Telp, Merek, Model, Nopol, VIN, KM, Attachment (Foto).
   - **Flow**:
     1. Buat Tiket (Status: New).
     2. Teknisi periksa -> Buat "Laporan Teknik" (Analisa kerusakan, estimasi biaya).
     3. Persetujuan & Pengerjaan (Status: In Progress).
     4. Selesai (Status: Closed).

3. **BUKU PINTAR**
   - **Tujuan**: Database spesifikasi teknis (Oli, Ban, Part).
   - **Cara Pakai**: Cukup tanya "Oli Avanza" atau "Ban Xpander".
`;

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");

        if (!openRouterApiKey) {
            throw new Error("Missing OPENROUTER_API_KEY");
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { messages, userName } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            throw new Error("Invalid messages format");
        }

        // 1. Plan: Ask AI to generate SQL
        const systemPrompt = `
    You are a database assistant for a company. Your goal is to answer user questions by querying the PostgreSQL database OR helping with tire upgrades.
    
    Database Schema:
    ${DATABASE_SCHEMA}

    ${APP_DOCUMENTATION}

    Rules:
    1. You have READ-ONLY access.
    2. Convert natural language questions into valid PostgreSQL queries.
    3. Output Format (JSON ONLY):
       - Database Question: { "sql": "SELECT ..." }
       - App/Workflow Question (e.g. "cara buat tiket", "apa itu complain compass"): { "action": "explain_app", "topic": "ticket_creation" } -> *Handle this in summarizer, or just answer directly via 'sql' with empty query if needed, but better to let the summarizer handle it. Actually, for this model, we can just let it answer in the summarization phase if no SQL is generated. But wait, the first step is SQL generation. If the user asks "How to create ticket", we don't need SQL.
       
       *REVISED STRATEGY*:
       If the user asks about APP WORKFLOWS (not database data), return: { "action": "explain_app", "reply": "Your explanation here based on SYSTEM KNOWLEDGE BASE." }
       
       - Database Question: { "sql": "SELECT ..." }
       - Tire Upgrade Request: { "action": "upgrade_tire", "size": "..." }
       - Navigation Request: { "action": "navigate", "target": "..." }
       - App Knowledge/Workflow Question: { "action": "explain_app", "reply": "Short explanation based on System Knowledge Base." }
       - Error/Unknown: { "error": "Cannot answer" }

    4. Do not include markdown code blocks.
    5. Be case-insensitive (use ILIKE).
    6. Limit results to 10 unless specified.
    7. CRITICAL: The column for brand name is 'name' (in car_brands) and model name is 'name' (in car_models). Do NOT use 'brand_name' or 'model_name'.
    8. WIPER QUERIES:
       - If the user asks for wiper sizes and does NOT provide a year, SELECT all matching rows for that model from 'wiper_specifications'.
       - Do NOT ask for the year.
       - Join with 'wiper_sizes' to get the size_inch and position.
       - Order by year_start DESC.
    9. GENERAL SPECIFICATION QUERIES (fluids, parts, tires, legs, etc.):
       - If user asks for any vehicle spec (oil, tires, battery, suspension, filters, etc) and does NOT provide a year:
       - SELECT all matching rows for that 'model' from 'vehicle_specifications'.
       - Include 'year_start', 'year_end', and 'variant_name' in the SELECT column list along with the requested spec.
       - Order by 'year_start' DESC.
       - Do NOT ask for the year.
    10. APP KNOWLEDGE (INFERENCE):
       - If user input is short (e.g. "tiket macet", "beda compass"), INFER the intent based on the WORKFLOWS.
       - example: "tiket macet" -> Explain the ticket flow (New -> Report -> In Progress) and suggest checking status.
       - example: "complain viral" -> Explain "Complain Compass" viral risk flow.
    11. CONTEXT RETENTION (CRITICAL):
       - If the user asks a follow-up question (e.g. "Harganya berapa?", "Kalau olinya?", "Ukuran wipernya?") without mentioning a vehicle:
       - LOOK BACK at the conversation history to find the active Vehicle Brand, Model, and Year.
       - USE that retained vehicle context to construct the SQL query.
       - Example: User "Ban Avanza 2021" -> SQL covers Avanza. Next User msg "Harganya?" -> You MUST infer they mean "Harga Ban Avanza 2021".
       - RESET context ONLY if the user explicitly mentions a NEW vehicle brand/model.
    `;

        // Add user context if available
        let currentSystemPrompt = systemPrompt;
        if (userName) {
            const firstName = userName.split(' ')[0];
            currentSystemPrompt += `\n\nUser Context: You are chatting with ${firstName}. Greet them by name naturally in your FIRST response if appropriate, and occasionally during the conversation, but do not overuse it.`;
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "tngtech/deepseek-r1t2-chimera:free",
                messages: [
                    { role: "system", content: currentSystemPrompt },
                    ...messages
                ]
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("OpenRouter API Error:", errText);
            throw new Error(`OpenRouter API Error: ${response.status} ${errText}`);
        }

        const aiData = await response.json();
        const aiContent = aiData.choices[0].message.content;

        let generatedSql = "";

        try {
            // Aggressive JSON extraction first
            const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);

            if (parsed.action === 'upgrade_tire' && parsed.size) {
                const parsedSize = parseTireSize(parsed.size);
                if (!parsedSize) {
                    return new Response(JSON.stringify({ reply: `Format ukuran ban "${parsed.size}" tidak valid. Gunakan format seperti 195/65R15.` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
                }
                const recommendations = generateRecommendations(parsedSize);

                let replyText = `**Rekomendasi Upgrade untuk ${parsed.size}:**\n\n`;
                if (recommendations.length === 0) {
                    replyText += "Tidak ada rekomendasi upgrade yang aman (±3% diameter) untuk ukuran ini.";
                } else {
                    recommendations.forEach(rec => {
                        replyText += `- **${rec.size}** (${rec.safetyLevel === 'safe' ? '✅ Aman' : '⚠️ Perhatian'})\n  Diff: ${rec.diameterDiff}%, Diameter: ${Math.round(rec.overallDiameter)}mm\n`;
                    });
                    replyText += `\n[Buka Kalkulator Lengkap](/tire-upgrade)`;
                }

                return new Response(JSON.stringify({ reply: replyText }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

            } else if (parsed.action === 'navigate' && parsed.target) {
                return new Response(JSON.stringify({ reply: `Silakan akses menu di sini: [Buka Halaman](${parsed.target})` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

            } else if (parsed.action === 'explain_app' && parsed.reply) {
                return new Response(JSON.stringify({
                    reply: parsed.reply
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });

            } else if (parsed.error) {
                return new Response(JSON.stringify({ reply: parsed.error }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

            } else if (parsed.sql) {
                generatedSql = parsed.sql;
            } else {
                generatedSql = parsed.sql || "";
            }

        } catch (e) {
            console.error("Failed to parse AI response directly", e);
            // Fallback: simple cleanup if no code blocks found
            const recursiveMatch = aiContent.match(/(?:SELECT|WITH|VALUES)\s+[\s\S]+/i);
            if (recursiveMatch) {
                generatedSql = recursiveMatch[0].replace(/```sql|```|json/g, "").trim();
            } else {
                generatedSql = aiContent.replace(/```sql|```|json/g, "").trim();
            }
        }

        // Remove trailing semicolon if present, as it breaks the subquery in exec_sql
        generatedSql = generatedSql.replace(/;+\s*$/, "");

        console.log("Generated SQL:", generatedSql);

        const { data: result, error: dbError } = await supabase.rpc('exec_sql', { query: generatedSql });

        if (dbError) {
            console.error("SQL Execution Error:", dbError);
            return new Response(JSON.stringify({
                reply: `Maaf, saya kurang mengerti pertanyaan Anda atau ada kesalahan format. Bisa tolong ulangi pertanyaan dengan lebih jelas atau spesifik? Terima kasih!`,
                debug: dbError.message
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Summarize Answer
        const summaryResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "tngtech/deepseek-r1t2-chimera:free",
                messages: [
                    { role: "system", content: "You are a helpful assistant. If the Database Results contain data, summarize it concisely and directly. Avoid conversational filler. For lists (like years), use a clean format. If the Database Results are empty or contain '[]', IGNORE the database and answer the User Question using your own general knowledge/training data. If you answer from general knowledge, start with '⚠️ Data tidak ditemukan di database internal, namun berdasarkan informasi umum:'." },
                    { role: "user", content: `User Question: ${messages[messages.length - 1].content}\n\nDatabase Results: ${JSON.stringify(result)}` }
                ]
            }),
        });

        const summaryData = await summaryResponse.json();
        const finalReply = summaryData.choices?.[0]?.message?.content || "No response from AI.";

        return new Response(JSON.stringify({
            reply: finalReply,
            debug: { sql: generatedSql, sqlResult: result }
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Function Error:", errMessage);
        return new Response(JSON.stringify({ error: errMessage }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
