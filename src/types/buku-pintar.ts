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

    // Engine oils and fluids
    engine_oil?: {
        capacity?: string;
        type?: string;
    };
    transmission_oil?: {
        capacity?: string;
        type?: string;
    };
    power_steering_oil?: {
        capacity?: string;
        type?: string;
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
    };

    // Battery
    battery?: {
        type?: string;
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

    // Brake parts
    brake_parts?: {
        front_pad?: string;
        rear_pad?: string;
        front_disc?: string;
        rear_disc?: string;
    };

    // Suspension
    suspension?: {
        shock_depan?: {
            recommended_brands?: string;
        };
        shock_belakang?: {
            recommended_brands?: string;
        };
        rack_end?: {
            recommended_brands?: string;
        };
        tie_rod?: {
            recommended_brands?: string;
        };
        link_stabilizer?: {
            recommended_brands?: string;
        };
        lower_arm?: {
            recommended_brands?: string;
        };
        upper_arm?: {
            recommended_brands?: string;
        };
        upper_support?: {
            recommended_brands?: string;
        };
    };
}

// Legacy interfaces kept for backward compatibility
export interface EngineOilSpec {
    viscosity_options: string[];
    capacity_liter: number;
    capacity_with_filter_liter: number;
    quality_standard: string;
    recommended_brands?: string[];
}

export interface FluidSpec {
    type: string;
    capacity_liter: number;
    replacement_interval_km?: number;
    recommended_brands?: string[];
}

export interface RecommendedPart {
    category: "Filter Oli" | "Filter Udara" | "Filter Kabin" | "Busi" | "Kampas Rem Depan" | "Kampas Rem Belakang" | "V-Belt" | "Wiper" | "Filter Solar" | "Filter Bensin" | "Lainnya";
    name: string;
    part_number: string;
    description?: string;
    replacement_interval_km?: number;
    compatible_brands?: string[];
}

export interface TireSpec {
    location: "Depan & Belakang" | "Depan" | "Belakang";
    size: string;
    pressure_psi_front: number;
    pressure_psi_rear: number;
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
    type: string;
    model: string;
    ampere: number;
    voltage: number;
    dimensions?: string;
}

export interface BrakeSpec {
    front_type: string;
    rear_type: string;
    fluid_type: string;
    pad_part_number_front?: string;
    shoe_part_number_rear?: string;
    recommended_brands_front?: string[];
    recommended_brands_rear?: string[];
}
