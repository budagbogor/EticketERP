export interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year_start: number;
    year_end: number | null; // null means "present"
    variants: VehicleVariant[];
}

export interface VehicleVariant {
    id: string;
    name: string; // Restoring name field
    transmission: "AT" | "MT" | "CVT" | "DCT" | "Manual" | "Automatic";
    year_start?: number; // Added specific year range for variant
    year_end?: number;
    engine_code: string;
    specifications: {
        engine_oil: EngineOilSpec;
        transmission_oil: FluidSpec;
        parts: RecommendedPart[];
        tires: TireSpec[];
        suspension?: SuspensionSpec;
        battery?: BatterySpec;
        brakes?: BrakeSpec;
    };
}

export interface EngineOilSpec {
    viscosity_options: string[]; // e.g. ["0W-20", "5W-30"]
    capacity_liter: number;
    capacity_with_filter_liter: number;
    quality_standard: string; // e.g. "API SP / ILSAC GF-6A"
    recommended_brands?: string[];
}

export interface FluidSpec {
    type: string; // e.g. "CVT Fluid FE"
    capacity_liter: number;
    replacement_interval_km?: number;
}

export interface RecommendedPart {
    category: "Filter Oli" | "Filter Udara" | "Filter Kabin" | "Busi" | "Kampas Rem Depan" | "Kampas Rem Belakang" | "V-Belt" | "Wiper" | "Lainnya";
    name: string;
    part_number: string;
    description?: string;
    replacement_interval_km?: number;
    compatible_brands?: string[]; // e.g. ["Denso", "Bosch"]
}

export interface TireSpec {
    location: "Depan & Belakang" | "Depan" | "Belakang";
    size: string; // e.g. "185/65 R15"
    pressure_psi_front: number;
    pressure_psi_rear: number;
    load_speed_index?: string; // e.g. "88H"
    recommended_brands?: string[];
}

export interface SuspensionSpec {
    rack_end?: string;
    tie_rod_end?: string;
    link_stabilizer?: string;
    lower_arm?: string;
    upper_arm?: string;
    shock_absorber_front?: string;
    shock_absorber_rear?: string;
}

export interface BatterySpec {
    type: string; // e.g. "Dry" or "Wet"
    model: string; // e.g. "NS40ZL"
    ampere: number;
    voltage: number;
    dimensions?: string;
}

export interface BrakeSpec {
    front_type: string; // e.g. "Ventilated Disc"
    rear_type: string; // e.g. "Drum"
    fluid_type: string; // e.g. "DOT 3" or "DOT 4"
    pad_part_number_front?: string;
    shoe_part_number_rear?: string;
}
