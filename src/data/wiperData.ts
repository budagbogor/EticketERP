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

// Seed data - kosong, data akan diambil dari Supabase
export const SEED_WIPER_DATA: VehicleWiperSpec[] = [];
