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
    name: string;
    year_start?: number;
    year_end?: number | null;
    engine_type?: string;
    transmission?: "AT" | "MT" | "CVT" | "DCT" | "Manual" | "Automatic";
    engine_code?: string;

    specifications: {
        // Engine oils and fluids
        engine_oil?: {
            capacity?: string;
            type?: string;
            viscosity_options?: string[]; // Legacy
            capacity_liter?: number; // Legacy
            capacity_with_filter_liter?: number; // Legacy
            quality_standard?: string; // Legacy
            recommended_brands?: string[]; // Legacy
            replacement_interval_km?: number;
        };
        transmission_oil?: {
            capacity?: string;
            type?: string;
            capacity_liter?: number; // Legacy
            recommended_brands?: string[]; // Legacy
            replacement_interval_km?: number;
        };
        power_steering_oil?: {
            capacity?: string;
            type?: string;
            capacity_liter?: number; // Legacy
            recommended_brands?: string[]; // Legacy
            replacement_interval_km?: number;
        };
        diff_oil?: { // Legacy naming
            type?: string;
            capacity_liter?: number;
            recommended_brands?: string[];
        };
        differential_oil?: { // New naming to match dialog
            type?: string;
            capacity?: string;
            capacity_liter?: number;
            recommended_brands?: string[];
            replacement_interval_km?: number;
        };
        brake_oil?: {
            type?: string;
        };
        radiator_coolant?: {
            capacity?: string;
            type?: string;
        };
        ac_freon?: {
            capacity?: string;
            type?: string;
        };

        // Tire specifications
        tire?: {
            front_size?: string;
            rear_size?: string;
            front_pressure?: string;
            rear_pressure?: string;
            recommended_brands?: string[];
        };
        tires?: TireSpec[]; // Legacy array format

        // Battery
        battery?: {
            type?: string;
            model?: string; // Legacy
            ampere?: number; // Legacy
            voltage?: number; // Legacy
            dimensions?: string; // Legacy
        };

        // Wiper
        wiper?: {
            driver?: string;
            passenger?: string;
            rear?: string;
        };

        // Filters
        filters?: {
            spark_plug?: string;
            air_filter?: string;
            cabin_filter?: string;
            fuel_filter?: string;
            oil_filter?: string;
        };
        parts?: RecommendedPart[]; // Legacy array format

        // Brake parts
        brake_parts?: {
            front_pad?: string;
            rear_pad?: string;
            front_disc?: string;
            rear_disc?: string;
        };
        brakes?: BrakeSpec; // Legacy object format

        // Suspension
        suspension?: SuspensionSpec;
    };
}

// Legacy interfaces kept for backward compatibility
export interface EngineOilSpec {
    viscosity_options?: string[];
    capacity_liter?: number;
    capacity?: string;
    capacity_with_filter_liter?: number;
    quality_standard?: string;
    recommended_brands?: string[];
    replacement_interval_km?: number;
}

export interface FluidSpec {
    type?: string;
    capacity_liter?: number;
    capacity?: string;
    replacement_interval_km?: number;
    recommended_brands?: string[];
}

export interface RecommendedPart {
    category?: "Filter Oli" | "Filter Udara" | "Filter Kabin" | "Busi" | "Kampas Rem Depan" | "Kampas Rem Belakang" | "V-Belt" | "Wiper" | "Filter Solar" | "Filter Bensin" | "Lainnya";
    name?: string;
    part_number?: string;
    description?: string;
    replacement_interval_km?: number;
    compatible_brands?: string[];
}

export interface TireSpec {
    location?: "Depan & Belakang" | "Depan" | "Belakang";
    size?: string;
    pressure_psi_front?: number;
    pressure_psi_rear?: number;
    load_speed_index?: string;
    recommended_brands?: string[];
}

export interface SuspensionSpec {
    rack_end?: string;
    rack_end_brands?: string[];
    tie_rod_end?: string;
    tie_rod_end_brands?: string[];
    link_stabilizer?: string;
    link_stabilizer_brands?: string[];
    lower_arm?: string;
    lower_arm_brands?: string[];
    upper_arm?: string;
    upper_arm_brands?: string[];
    upper_support?: string;
    upper_support_brands?: string[];
    shock_absorber_front?: string;
    shock_absorber_front_brands?: string[];
    shock_absorber_rear?: string;
    shock_absorber_rear_brands?: string[];
}

export interface BatterySpec {
    type?: string;
    model?: string;
    ampere?: number;
    voltage?: number;
    dimensions?: string;
}

export interface BrakeSpec {
    front_type?: string;
    rear_type?: string;
    fluid_type?: string;
    pad_part_number_front?: string;
    shoe_part_number_rear?: string;
    recommended_brands_front?: string[];
    recommended_brands_rear?: string[];
}
