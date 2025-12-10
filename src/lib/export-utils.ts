import { Vehicle, RecommendedPart } from "@/types/buku-pintar";

export function exportToCSV(vehicles: Vehicle[]) {
    // Define headers
    const headers = [
        "Merek",
        "Model",
        "Tahun Mulai",
        "Tahun Selesai",
        "Varian",
        "Transmisi",
        "Kode Mesin",
        "Oli Mesin - Viskositas",
        "Oli Mesin - Kapasitas (L)",
        "Oli Mesin - Kapasitas Filter (L)",
        "Oli Mesin - Standar",
        "Oli Transmisi - Tipe",
        "Oli Transmisi - Kapasitas (L)",
        "Aki - Tipe",
        "Aki - Model",
        "Aki - Ampere",
        "Aki - Voltage",
        "Rem - Depan",
        "Rem - Belakang",
        "Minyak Rem",
        "Part - Filter Oli",
        "Part - Filter Udara",
        "Part - Filter Kabin",
        "Part - Busi",
        "Ban - Ukuran"
    ];

    // Helper to find part by category
    const findPart = (parts: RecommendedPart[], category: string) => {
        const part = parts.find(p => p.category === category);
        return part ? part.part_number : "-";
    };

    // Flatten data
    const rows = vehicles.flatMap(vehicle => {
        return vehicle.variants.map(variant => {
            const yStart = variant.year_start || vehicle.year_start;
            const yEnd = variant.year_end || vehicle.year_end || "Sekarang";

            // Oil specs
            const oil = variant.specifications.engine_oil;
            const transOil = variant.specifications.transmission_oil;

            // Battery
            const battery = variant.specifications.battery;

            // Brakes
            const brakes = variant.specifications.brakes;

            // Parts
            const parts = variant.specifications.parts;

            // Tires (take the first one as representative if multiple)
            const tires = variant.specifications.tires;
            const tireSize = tires.length > 0 ? tires[0].size : "-";

            return [
                vehicle.brand,
                vehicle.model,
                yStart,
                yEnd,
                variant.name,
                variant.transmission,
                variant.engine_code,
                oil.viscosity_options.join(" / "),
                oil.capacity_liter,
                oil.capacity_with_filter_liter,
                oil.quality_standard,
                transOil.type,
                transOil.capacity_liter,
                battery ? battery.type : "-",
                battery ? battery.model : "-",
                battery ? battery.ampere : "-",
                battery ? battery.voltage : "-",
                brakes ? brakes.front_type : "-",
                brakes ? brakes.rear_type : "-",
                brakes ? brakes.fluid_type : "-",
                findPart(parts, "Filter Oli"),
                findPart(parts, "Filter Udara"),
                findPart(parts, "Filter Kabin"),
                findPart(parts, "Busi"),
                tireSize
            ].map(field => `"${String(field || "").replace(/"/g, '""')}"`).join(","); // Escape quotes and wrap in quotes
        });
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `buku_pintar_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
