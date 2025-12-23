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
   - Columns: brand_id, model_id, variant_name, engine_oil_type, tire_size_front, tire_size_rear, battery_type, wiper_size_driver, wiper_size_passenger, created_at.
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
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            throw new Error("Invalid messages format");
        }

        // 1. Plan: Ask AI to generate SQL
        const systemPrompt = `
    You are a database assistant for a company. Your goal is to answer user questions by querying the PostgreSQL database OR helping with tire upgrades.
    
    Database Schema:
    ${DATABASE_SCHEMA}

    Rules:
    1. You have READ-ONLY access.
    2. Convert natural language questions into valid PostgreSQL queries.
    3. Output Format (JSON ONLY):
       - Database Question: { "sql": "SELECT ..." }
       - Tire Upgrade Request (e.g. "upgrade ban 195/65R15"): { "action": "upgrade_tire", "size": "195/65R15" }
       - Navigation Request (e.g. "buka kalkulator", "menu ban"): { "action": "navigate", "target": "/tire-upgrade" }
       - Error/Unknown: { "error": "Cannot answer" }
    4. Do not include markdown code blocks.
    5. Be case-insensitive (use ILIKE).
    6. Limit results to 10 unless specified.
    7. CRITICAL: The column for brand name is 'name' (in car_brands) and model name is 'name' (in car_models). Do NOT use 'brand_name' or 'model_name'.
    `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "tngtech/deepseek-r1t2-chimera:free",
                messages: [
                    { role: "system", content: systemPrompt },
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
                reply: `I tried to query the database but encountered an error: ${dbError.message || JSON.stringify(dbError)}`,
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
                    { role: "system", content: "You are a helpful assistant. If the Database Results contain data, summarize it concisely. If the Database Results are empty or contain '[]', IGNORE the database and answer the User Question using your own general knowledge/training data. If you answer from general knowledge, start with '⚠️ Data tidak ditemukan di database internal, namun berdasarkan informasi umum:'." },
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
