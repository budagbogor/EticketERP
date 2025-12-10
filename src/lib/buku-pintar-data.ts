import { Vehicle } from "@/types/buku-pintar";

export const bukuPintarData: Vehicle[] = [
    {
        id: "toyota-avanza-gen3",
        brand: "Toyota",
        model: "Avanza",
        year_start: 2021,
        year_end: null,
        variants: [
            {
                id: "avanza-1.5-g-cvt",
                name: "1.5 G CVT",
                transmission: "CVT",
                engine_code: "2NR-VE",
                specifications: {
                    engine_oil: {
                        viscosity_options: ["0W-20", "5W-30"],
                        capacity_liter: 4,
                        capacity_with_filter_liter: 4.2,
                        quality_standard: "API SP / ILSAC GF-6A",
                        recommended_brands: ["Toyota Motor Oil (TMO)", "Castrol Magnatec", "Shell Helix Eco"]
                    },
                    transmission_oil: {
                        type: "CVT Fluid FE",
                        capacity_liter: 2.8
                    },
                    parts: [
                        {
                            category: "Filter Oli",
                            name: "Filter Oli Mesin",
                            part_number: "90915-YZZN2",
                            replacement_interval_km: 10000
                        },
                        {
                            category: "Busi",
                            name: "Spark Plug Iridium",
                            part_number: "SC20HR11",
                            replacement_interval_km: 100000
                        },
                        {
                            category: "Filter Udara",
                            name: "Air Cleaner Element",
                            part_number: "17801-BZ160",
                            replacement_interval_km: 40000
                        },
                        {
                            category: "Filter Kabin",
                            name: "Cabin Air Filter",
                            part_number: "87139-BZ010",
                            replacement_interval_km: 20000
                        }
                    ],
                    tires: [
                        {
                            location: "Depan & Belakang",
                            size: "185/65 R15",
                            pressure_psi_front: 33,
                            pressure_psi_rear: 36,
                            load_speed_index: "88H",
                            recommended_brands: ["Bridgestone Ecopia", "GT Radial Champiro", "Dunlop Enasave"]
                        }
                    ],
                    suspension: {
                        shock_absorber_front: "48510-BZxxx (Contoh)",
                        shock_absorber_rear: "48531-BZxxx (Contoh)",
                        rack_end: "45503-BZxxx",
                        tie_rod_end: "45046-BZxxx",
                        link_stabilizer: "48820-BZxxx",
                        lower_arm: "48068-BZxxx"
                    },
                    battery: {
                        type: "MF (Maintenance Free)",
                        model: "34B19L / NS40ZL",
                        ampere: 35,
                        voltage: 12,
                        dimensions: "187 x 127 x 203 mm"
                    },
                    brakes: {
                        front_type: "Ventilated Disc",
                        rear_type: "Drum (Tromol)",
                        fluid_type: "DOT 3",
                        pad_part_number_front: "04465-BZxxx",
                        shoe_part_number_rear: "04495-BZxxx"
                    }
                }
            },
            {
                id: "avanza-1.3-e-mt",
                name: "1.3 E MT",
                transmission: "MT",
                engine_code: "1NR-VE",
                specifications: {
                    engine_oil: {
                        viscosity_options: ["0W-20", "5W-30"],
                        capacity_liter: 3.8,
                        capacity_with_filter_liter: 4.0,
                        quality_standard: "API SN / ILSAC GF-5",
                        recommended_brands: ["Toyota Motor Oil (TMO)", "Pertamina Fastron"]
                    },
                    transmission_oil: {
                        type: "MT Fluid",
                        capacity_liter: 1.2
                    },
                    parts: [
                        {
                            category: "Filter Oli",
                            name: "Filter Oli Mesin",
                            part_number: "90915-YZZN2",
                            replacement_interval_km: 10000
                        },
                        {
                            category: "Kampas Rem Depan",
                            name: "Disc Brake Pad",
                            part_number: "04465-BZ270"
                        },
                        {
                            category: "Filter Kabin",
                            name: "Cabin Air Filter",
                            part_number: "87139-BZ010",
                            replacement_interval_km: 20000
                        }
                    ],
                    tires: [
                        {
                            location: "Depan & Belakang",
                            size: "185/65 R15",
                            pressure_psi_front: 32,
                            pressure_psi_rear: 35
                        }
                    ]
                }
            }
        ]
    },
    {
        id: "honda-brio-gen2",
        brand: "Honda",
        model: "Brio",
        year_start: 2018,
        year_end: null,
        variants: [
            {
                id: "brio-rs-cvt",
                name: "RS CVT",
                transmission: "CVT",
                engine_code: "L12B",
                specifications: {
                    engine_oil: {
                        viscosity_options: ["0W-20"],
                        capacity_liter: 3.4,
                        capacity_with_filter_liter: 3.6,
                        quality_standard: "API SP",
                        recommended_brands: ["Honda Automobile Oil (HAO)", "Shell Helix HX8"]
                    },
                    transmission_oil: {
                        type: "HCF-2",
                        capacity_liter: 3.5
                    },
                    parts: [
                        {
                            category: "Filter Oli",
                            name: "Oil Filter",
                            part_number: "15400-RK9-F01",
                            replacement_interval_km: 10000
                        },
                        {
                            category: "Filter Kabin",
                            name: "AC Filter",
                            part_number: "80292-TG0-T02",
                            replacement_interval_km: 20000
                        }
                    ],
                    tires: [
                        {
                            location: "Depan & Belakang",
                            size: "185/55 R15",
                            pressure_psi_front: 32,
                            pressure_psi_rear: 30,
                            recommended_brands: ["Bridgestone Potenza"]
                        }
                    ],
                    suspension: {
                        shock_absorber_front: "51611-TG0-xxx",
                        shock_absorber_rear: "52610-TG0-xxx",
                        rack_end: "53010-TG0-xxx",
                        tie_rod_end: "53540-TG0-xxx"
                    },
                    battery: {
                        type: "MF",
                        model: "NS40ZL",
                        ampere: 35,
                        voltage: 12
                    },
                    brakes: {
                        front_type: "Ventilated Disc",
                        rear_type: "Drum",
                        fluid_type: "DOT 4",
                        pad_part_number_front: "45022-TG0-xxx"
                    }
                }
            }
        ]
    },
    {
        id: "mitsubishi-xpander",
        brand: "Mitsubishi",
        model: "Xpander",
        year_start: 2017,
        year_end: null,
        variants: [
            {
                id: "xpander-ultimate",
                name: "Ultimate CVT",
                transmission: "CVT",
                engine_code: "4A91",
                specifications: {
                    engine_oil: {
                        viscosity_options: ["0W-20", "5W-30"],
                        capacity_liter: 3.8,
                        capacity_with_filter_liter: 4.0,
                        quality_standard: "API SP",
                        recommended_brands: ["Mitsubishi Motors Genuine Oil", "Motul H-Tech"]
                    },
                    transmission_oil: {
                        type: "CVT Fluid J4",
                        capacity_liter: 3.0
                    },
                    parts: [
                        {
                            category: "Filter Oli",
                            name: "Oil Filter",
                            part_number: "MD360935",
                            replacement_interval_km: 10000
                        },
                        {
                            category: "Wiper",
                            name: "Front Wiper Blade",
                            part_number: "8250A179 + 8250A180"
                        },
                        {
                            category: "Filter Kabin",
                            name: "Cabin Air Filter",
                            part_number: "7850A002",
                            replacement_interval_km: 20000
                        }
                    ],
                    tires: [
                        {
                            location: "Depan & Belakang",
                            size: "205/55 R17",
                            pressure_psi_front: 33,
                            pressure_psi_rear: 33,
                            recommended_brands: ["Dunlop Enasave"]
                        }
                    ],
                    suspension: {
                        shock_absorber_front: "4060Axxx",
                        shock_absorber_rear: "4162Axxx"
                    },
                    battery: {
                        type: "MF",
                        model: "Q85 / 95D23L",
                        ampere: 65,
                        voltage: 12
                    },
                    brakes: {
                        front_type: "Ventilated Disc",
                        rear_type: "Drum (EPB)",
                        fluid_type: "DOT 4"
                    }
                }
            }
        ],
    },
    {
        id: "toyota-innova-reborn",
        brand: "Toyota",
        model: "Innova",
        year_start: 2015,
        year_end: 2022,
        variants: [
            {
                id: "innova-2.4-diesel",
                name: "2.4 Diesel (2GD-FTV)",
                transmission: "AT",
                engine_code: "2GD-FTV",
                specifications: {
                    engine_oil: {
                        viscosity_options: ["5W-30", "10W-30"],
                        capacity_liter: 7.0,
                        capacity_with_filter_liter: 7.5,
                        quality_standard: "API CI-4 / ACEA B3",
                        recommended_brands: ["TMO Diesel Synthetic", "Shell Rimula R5", "Mobil Delvac"]
                    },
                    transmission_oil: {
                        type: "ATF WS",
                        capacity_liter: 4.5
                    },
                    parts: [
                        { category: "Filter Oli", name: "Oil Filter", part_number: "90915-YZZD4", replacement_interval_km: 10000 },
                        { category: "Filter Udara", name: "Air Filter", part_number: "17801-0L040", replacement_interval_km: 40000 },
                        { category: "Filter Kabin", name: "Cabin Air Filter", part_number: "87139-0K010", replacement_interval_km: 20000 }
                    ],
                    tires: [
                        { location: "Depan & Belakang", size: "205/65 R16", pressure_psi_front: 33, pressure_psi_rear: 33, recommended_brands: ["Bridgestone Ecopia", "Dunlop Enasave"] }
                    ],
                    suspension: {
                        shock_absorber_front: "48510-80xxx",
                        shock_absorber_rear: "48531-80xxx",
                        link_stabilizer: "48820-0Kxxx"
                    },
                    battery: {
                        type: "MF (DIN)",
                        model: "LN3 / 370LN3",
                        ampere: 65,
                        voltage: 12
                    },
                    brakes: {
                        front_type: "Ventilated Disc",
                        rear_type: "Drum",
                        fluid_type: "DOT 3",
                        pad_part_number_front: "04465-0K380"
                    }
                }
            }
        ]
    },
    {
        id: "toyota-calya-sigra",
        brand: "Toyota",
        model: "Calya",
        year_start: 2016,
        year_end: null,
        variants: [
            {
                id: "calya-1.2-g",
                name: "1.2 G AT/MT",
                transmission: "AT",
                engine_code: "3NR-VE",
                specifications: {
                    engine_oil: {
                        viscosity_options: ["0W-20", "5W-30"],
                        capacity_liter: 3.3,
                        capacity_with_filter_liter: 3.5,
                        quality_standard: "API SN / ILSAC GF-5",
                        recommended_brands: ["TMO Gold", "Castrol Magnatec", "Fastron Gold"]
                    },
                    transmission_oil: {
                        type: "ATF T-IV",
                        capacity_liter: 2.5
                    },
                    parts: [
                        { category: "Filter Oli", name: "Oil Filter", part_number: "90915-YZZC5", replacement_interval_km: 10000 },
                        { category: "Busi", name: "Spark Plug", part_number: "SC16HR11", replacement_interval_km: 40000 },
                        { category: "Filter Kabin", name: "Cabin Air Filter", part_number: "87139-BZ010", replacement_interval_km: 20000 }
                    ],
                    tires: [
                        { location: "Depan & Belakang", size: "175/65 R14", pressure_psi_front: 36, pressure_psi_rear: 36 }
                    ],
                    battery: {
                        type: "Basah / MF",
                        model: "NS40ZL / 34B19L",
                        ampere: 35,
                        voltage: 12
                    },
                    brakes: {
                        front_type: "Ventilated Disc",
                        rear_type: "Drum",
                        fluid_type: "DOT 3",
                        pad_part_number_front: "04465-BZxxx"
                    }
                }
            }
        ]
    },
    {
        id: "honda-hrv-gen2",
        brand: "Honda",
        model: "HR-V",
        year_start: 2015,
        year_end: 2021,
        variants: [
            {
                id: "hrv-1.5-e-cvt",
                name: "1.5 E CVT",
                transmission: "CVT",
                engine_code: "L15Z",
                specifications: {
                    engine_oil: {
                        viscosity_options: ["0W-20", "5W-30"],
                        capacity_liter: 3.4,
                        capacity_with_filter_liter: 3.6,
                        quality_standard: "API SP",
                        recommended_brands: ["Honda E-Pro Gold", "Shell Helix Ultra"]
                    },
                    transmission_oil: {
                        type: "HCF-2",
                        capacity_liter: 3.5
                    },
                    parts: [
                        { category: "Filter Oli", name: "Oil Filter", part_number: "15400-RK9-F01", replacement_interval_km: 10000 },
                        { category: "Filter Udara", name: "Air Filter", part_number: "17220-51B-H00", replacement_interval_km: 30000 },
                        { category: "Filter Kabin", name: "Cabin Air Filter", part_number: "80292-T7A-003", replacement_interval_km: 20000 }
                    ],
                    tires: [
                        { location: "Depan & Belakang", size: "215/55 R17", pressure_psi_front: 32, pressure_psi_rear: 30 }
                    ],
                    suspension: {
                        shock_absorber_front: "51611-T7A-xxx",
                        shock_absorber_rear: "52610-T7A-xxx"
                    },
                    battery: {
                        type: "MF",
                        model: "NS60L / 55B24L",
                        ampere: 45,
                        voltage: 12
                    },
                    brakes: {
                        front_type: "Ventilated Disc",
                        rear_type: "Solid Disc",
                        fluid_type: "DOT 4",
                        pad_part_number_front: "45022-T7A-xxx"
                    }
                }
            }
        ]
    }
];
