export const BRANCHES = [
  "Mobeng Harapan Indah",
  "Mobeng BSD",
  "Mobeng Cinere",
  "Mobeng Karawaci",
  "Mobeng Gading Serpong",
  "Mobeng Jatibening",
  "Mobeng Tole Iskandar",
  "Mobeng Sunter",
  "Mobeng Lenteng Agung",
  "Mobeng Hankam",
  "Mobeng Cilengsi",
  "Mobeng Mustika Jaya",
  "Mobeng Pondok Betung",
  "Mobeng Cipondoh",
  "Mobeng Jati Asih",
  "Mobeng Duren Sawit",
  "Mobeng Galuh Mas",
  "Mobeng Jababeka",
  "Mobeng Kopo Bandung",
  "Mobeng Jemursari",
  "Mobeng Citraland",
  "Mobeng Kupang",
  "Mobeng Merr",
  "Mobeng Katamso",
  "Mobeng Sidoarjo",
] as const;

export const COMPLAINT_CATEGORIES = [
  "Produk & Jasa",
  "Kualitas Servis",
  "Fasilitas Customer",
  "Pelayanan",
  "Marketing Promo",
  "Harga",
  "Durasi Service",
  "Booking Servis",
] as const;

export const SUB_CATEGORIES = [
  "RMB",
  "Ban",
  "Battery",
  "Spooring",
  "Balancing",
  "Oli Mesin",
  "Oli AT/MT/CVT",
  "AC",
  "Kaki-kaki",
  "Rem",
  "Part",
  "Mesin",
  "Transmisi",
  "Gardan",
  "Cooling System",
  "Fuel System",
  "Electrical",
] as const;

export const FUEL_TYPES = [
  "Premium (RON 88)",
  "Pertalite (RON 90)",
  "Pertamax (RON 92)",
  "Pertamax Turbo (RON 98)",
  "Pertamax Racing (RON 100)",
  "Biosolar (CN 48)",
  "Dexlite (CN 51)",
  "Pertamina Dex (CN 53)",
  "Gas Alam Terkompresi (CNG)",
  "Listrik",
  "Biofuel",
] as const;

export const TRANSMISSION_TYPES = ["MT", "AT", "CVT"] as const;

export const TICKET_STATUSES = {
  NEW: "new",
  ESCALATED_TECH: "escalated_tech",
  IN_PROGRESS: "in_progress",
  ESCALATED_PSD: "escalated_psd",
  REPAIR_COMPLETED: "repair_completed",
  AWAITING_REPORT: "awaiting_report",
  CLOSED: "closed",
  CANCELLED: "cancelled",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  new: "Baru",
  escalated_tech: "Diteruskan ke Tech Support",
  in_progress: "Dalam Proses Analisis",
  escalated_psd: "Diteruskan ke Produk & Service",
  repair_completed: "Perbaikan Selesai",
  awaiting_report: "Menunggu Laporan Teknik",
  closed: "Selesai",
  cancelled: "Dibatalkan",
};

export const STATUS_COLORS: Record<string, string> = {
  new: "status-new",
  escalated_tech: "status-escalated",
  in_progress: "status-in-progress",
  escalated_psd: "status-escalated",
  repair_completed: "status-completed",
  awaiting_report: "status-awaiting",
  closed: "status-completed",
  cancelled: "status-cancelled",
};

export const CAR_BRANDS = [
  { brand: "Toyota", models: ["Avanza", "Innova", "Fortuner", "Camry", "Corolla", "Rush", "Raize", "Yaris", "Veloz", "Agya", "Calya", "Kijang", "Land Cruiser", "Alphard", "Vellfire", "Sienta", "HiAce"] },
  { brand: "Honda", models: ["Brio", "Jazz", "City", "Civic", "HR-V", "CR-V", "BR-V", "Mobilio", "Accord", "WR-V", "Odyssey"] },
  { brand: "Suzuki", models: ["Ertiga", "XL7", "Baleno", "Ignis", "Jimny", "APV", "Carry", "S-Presso", "Swift"] },
  { brand: "Mitsubishi", models: ["Xpander", "Pajero Sport", "Outlander", "Triton", "L300", "Colt Diesel", "Eclipse Cross"] },
  { brand: "Daihatsu", models: ["Xenia", "Terios", "Rocky", "Ayla", "Sigra", "Gran Max", "Luxio", "Sirion"] },
  { brand: "Nissan", models: ["Livina", "X-Trail", "Serena", "Terra", "Magnite", "Kicks", "Navara", "March"] },
  { brand: "Mazda", models: ["CX-3", "CX-5", "CX-8", "CX-9", "Mazda2", "Mazda3", "Mazda6", "MX-5"] },
  { brand: "Hyundai", models: ["Creta", "Stargazer", "Santa Fe", "Palisade", "Ioniq 5", "Ioniq 6", "Kona", "Staria"] },
  { brand: "Kia", models: ["Seltos", "Sonet", "Sportage", "Carnival", "EV6", "Carens"] },
  { brand: "Wuling", models: ["Confero", "Cortez", "Almaz", "Air EV", "Formo", "Alvez"] },
  { brand: "Chery", models: ["Omoda 5", "Tiggo 4 Pro", "Tiggo 7 Pro", "Tiggo 8 Pro"] },
  { brand: "MG", models: ["ZS", "HS", "4 EV", "5"] },
  { brand: "BMW", models: ["X1", "X3", "X5", "X7", "320i", "330i", "520i", "730i", "M3", "M5", "iX"] },
  { brand: "Mercedes-Benz", models: ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "EQS", "EQE"] },
  { brand: "Audi", models: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "e-tron"] },
  { brand: "Volkswagen", models: ["Polo", "Golf", "Tiguan", "T-Cross", "ID.4"] },
  { brand: "Isuzu", models: ["Panther", "MU-X", "D-Max", "Elf", "Giga"] },
  { brand: "Hino", models: ["Dutro", "Ranger", "500 Series"] },
  { brand: "Ford", models: ["Ranger", "Everest", "Territory"] },
  { brand: "Jeep", models: ["Wrangler", "Gladiator", "Grand Cherokee", "Compass"] },
] as const;

export const USER_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  TECH_SUPPORT: "tech_support",
  PSD: "psd",
  VIEWER: "viewer",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin Pusat",
  staff: "Staff Cabang",
  tech_support: "Teknikal Support",
  psd: "Produk & Service Development",
  viewer: "Viewer",
};
