export type WiperPosition = "kiri" | "kanan" | "belakang";

export interface WiperSize {
    posisi: WiperPosition;
    ukuranInch: number;
    merekBlade?: string;
    kodeBarang?: string;
    stok?: number;
    harga?: number; // dalam Rupiah
}

export interface VehicleWiperSpec {
    id: string;
    merek: string;
    model: string;
    tahunMulai: number;
    tahunSelesai?: number;
    catatan?: string;
    wipers: WiperSize[];
}

// Seed data contoh. Untuk produksi, ganti/extend dengan data dari CSV/DB.
export const SEED_WIPER_DATA: VehicleWiperSpec[] = [
    {
        id: "toyota-avanza-gen1",
        merek: "Toyota",
        model: "Avanza",
        tahunMulai: 2004,
        tahunSelesai: 2011,
        wipers: [
            { posisi: "kiri", ukuranInch: 20, merekBlade: "Universal", stok: 6, harga: 65000 },
            { posisi: "kanan", ukuranInch: 16, merekBlade: "Universal", stok: 8, harga: 60000 },
            { posisi: "belakang", ukuranInch: 12, merekBlade: "Universal", stok: 4, harga: 55000 },
        ],
    },
    {
        id: "toyota-avanza-gen2",
        merek: "Toyota",
        model: "Avanza",
        tahunMulai: 2012,
        tahunSelesai: 2018,
        catatan: "Termasuk Veloz generasi awal.",
        wipers: [
            { posisi: "kiri", ukuranInch: 24, merekBlade: "Premium", stok: 5, harga: 85000 },
            { posisi: "kanan", ukuranInch: 14, merekBlade: "Premium", stok: 5, harga: 80000 },
            { posisi: "belakang", ukuranInch: 12, merekBlade: "Universal", stok: 3, harga: 60000 },
        ],
    },
    {
        id: "toyota-innova-reborn",
        merek: "Toyota",
        model: "Kijang Innova Reborn",
        tahunMulai: 2016,
        wipers: [
            { posisi: "kiri", ukuranInch: 26, merekBlade: "Premium", stok: 2, harga: 95000 },
            { posisi: "kanan", ukuranInch: 16, merekBlade: "Premium", stok: 2, harga: 90000 },
        ],
    },
    {
        id: "mitsubishi-xpander",
        merek: "Mitsubishi",
        model: "Xpander",
        tahunMulai: 2017,
        wipers: [
            { posisi: "kiri", ukuranInch: 24, merekBlade: "OEM", stok: 5, harga: 90000 },
            { posisi: "kanan", ukuranInch: 16, merekBlade: "OEM", stok: 5, harga: 88000 },
            { posisi: "belakang", ukuranInch: 12, merekBlade: "Universal", stok: 4, harga: 65000 },
        ],
    },
    {
        id: "honda-brio",
        merek: "Honda",
        model: "Brio",
        tahunMulai: 2012,
        wipers: [
            { posisi: "kiri", ukuranInch: 22, merekBlade: "Universal", stok: 7, harga: 75000 },
            { posisi: "kanan", ukuranInch: 14, merekBlade: "Universal", stok: 7, harga: 70000 },
        ],
    },
    {
        id: "honda-jazz-ge8",
        merek: "Honda",
        model: "Jazz GE8",
        tahunMulai: 2008,
        tahunSelesai: 2013,
        wipers: [
            { posisi: "kiri", ukuranInch: 24, merekBlade: "Premium", stok: 3, harga: 90000 },
            { posisi: "kanan", ukuranInch: 14, merekBlade: "Premium", stok: 3, harga: 85000 },
            { posisi: "belakang", ukuranInch: 14, merekBlade: "Universal", stok: 3, harga: 70000 },
        ],
    },
    {
        id: "daihatsu-terios-gen2",
        merek: "Daihatsu",
        model: "Terios",
        tahunMulai: 2018,
        wipers: [
            { posisi: "kiri", ukuranInch: 24, merekBlade: "OEM", stok: 4, harga: 88000 },
            { posisi: "kanan", ukuranInch: 14, merekBlade: "OEM", stok: 4, harga: 84000 },
            { posisi: "belakang", ukuranInch: 12, merekBlade: "Universal", stok: 3, harga: 65000 },
        ],
    },
    {
        id: "suzuki-ertiga-gen1",
        merek: "Suzuki",
        model: "Ertiga",
        tahunMulai: 2012,
        tahunSelesai: 2018,
        wipers: [
            { posisi: "kiri", ukuranInch: 22, merekBlade: "Universal", stok: 6, harga: 80000 },
            { posisi: "kanan", ukuranInch: 16, merekBlade: "Universal", stok: 6, harga: 78000 },
            { posisi: "belakang", ukuranInch: 10, merekBlade: "Universal", stok: 4, harga: 60000 },
        ],
    },
    {
        id: "suzuki-ignis",
        merek: "Suzuki",
        model: "Ignis",
        tahunMulai: 2017,
        wipers: [
            { posisi: "kiri", ukuranInch: 21, merekBlade: "OEM", stok: 4, harga: 88000 },
            { posisi: "kanan", ukuranInch: 16, merekBlade: "OEM", stok: 4, harga: 85000 },
            { posisi: "belakang", ukuranInch: 12, merekBlade: "Universal", stok: 3, harga: 65000 },
        ],
    },
    {
        id: "nissan-grand-livina",
        merek: "Nissan",
        model: "Grand Livina",
        tahunMulai: 2007,
        tahunSelesai: 2018,
        wipers: [
            { posisi: "kiri", ukuranInch: 24, merekBlade: "Universal", stok: 5, harga: 85000 },
            { posisi: "kanan", ukuranInch: 16, merekBlade: "Universal", stok: 5, harga: 80000 },
            { posisi: "belakang", ukuranInch: 12, merekBlade: "Universal", stok: 3, harga: 65000 },
        ],
    },
];
