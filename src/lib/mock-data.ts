import { Ticket, TicketHistory, User } from "./types";

export const mockUsers: User[] = [
  { id: "1", nik: "160201011", name: "Administrator", role: "admin", email: "admin@mobeng.com" },
  { id: "2", nik: "160201012", name: "Budi Santoso", role: "staff", branch: "Mobeng Harapan Indah", email: "budi@mobeng.com" },
  { id: "3", nik: "160201013", name: "Andi Wijaya", role: "tech_support", email: "andi@mobeng.com" },
  { id: "4", nik: "160201014", name: "Dewi Lestari", role: "psd", email: "dewi@mobeng.com" },
  { id: "5", nik: "160201015", name: "Rizky Pratama", role: "staff", branch: "Mobeng BSD", email: "rizky@mobeng.com" },
];

export const mockTickets: Ticket[] = [
  {
    id: "1",
    ticketNumber: "TKT-2024-00001",
    customer: { name: "Ahmad Fauzi", phone: "081234567890", address: "Jl. Kebon Jeruk No. 45, Jakarta Barat" },
    vehicle: { brand: "Toyota", model: "Avanza", year: 2021, plateNumber: "B 1234 ABC", vin: "MHFM1BA3J1K123456", odometer: 45000, transmission: "AT", fuelType: "Pertalite (RON 90)", lastServiceDate: new Date("2024-10-15"), lastServiceItems: "Ganti oli mesin, filter oli, tune up" },
    branch: "Mobeng Harapan Indah",
    category: "Produk & Jasa",
    subCategory: "Oli Mesin",
    description: "Pelanggan mengeluhkan suara mesin kasar setelah ganti oli di cabang kami. Oli yang digunakan adalah oli standar rekomendasi Toyota.",
    attachments: [],
    status: "new",
    createdBy: "Budi Santoso",
    createdAt: new Date("2024-12-01T09:30:00"),
    updatedAt: new Date("2024-12-01T09:30:00"),
  },
  {
    id: "2",
    ticketNumber: "TKT-2024-00002",
    customer: { name: "Siti Nurhaliza", phone: "082345678901", address: "Jl. BSD Boulevard No. 12, Tangerang Selatan" },
    vehicle: { brand: "Honda", model: "HR-V", year: 2022, plateNumber: "B 5678 DEF", vin: "MHRGM8670LP123456", odometer: 32000, transmission: "CVT", fuelType: "Pertamax (RON 92)", lastServiceDate: new Date("2024-09-20"), lastServiceItems: "Service AC, ganti freon, bersihkan filter kabin" },
    branch: "Mobeng BSD",
    category: "Kualitas Servis",
    subCategory: "AC",
    description: "AC mobil tidak dingin setelah di-service. Sudah dilakukan pengecekan freon namun masih tidak dingin maksimal.",
    attachments: [],
    status: "escalated_tech",
    createdBy: "Rizky Pratama",
    createdAt: new Date("2024-12-02T11:15:00"),
    updatedAt: new Date("2024-12-02T14:30:00"),
    assignedTo: "Andi Wijaya",
    assignedDepartment: "tech_support",
  },
  {
    id: "3",
    ticketNumber: "TKT-2024-00003",
    customer: { name: "Bambang Suryono", phone: "083456789012", address: "Jl. Cinere Raya No. 88, Depok" },
    vehicle: { brand: "Mitsubishi", model: "Xpander", year: 2020, plateNumber: "D 9012 GHI", vin: "MMBXNKL10LF123456", odometer: 67000, transmission: "AT", fuelType: "Pertalite (RON 90)", lastServiceDate: new Date("2024-11-01"), lastServiceItems: "Ganti kampas rem depan, spooring balancing" },
    branch: "Mobeng Cinere",
    category: "Produk & Jasa",
    subCategory: "Rem",
    description: "Rem berdecit keras setelah penggantian kampas rem. Pelanggan merasa tidak nyaman dan meminta pengecekan ulang.",
    attachments: [],
    status: "in_progress",
    createdBy: "Budi Santoso",
    createdAt: new Date("2024-12-03T08:45:00"),
    updatedAt: new Date("2024-12-03T10:00:00"),
    assignedTo: "Andi Wijaya",
    assignedDepartment: "tech_support",
  },
  {
    id: "4",
    ticketNumber: "TKT-2024-00004",
    customer: { name: "Rina Wati", phone: "084567890123", address: "Jl. Gading Serpong No. 156, Tangerang" },
    vehicle: { brand: "Suzuki", model: "Ertiga", year: 2019, plateNumber: "B 3456 JKL", vin: "MHYESL415JJ123456", odometer: 89000, transmission: "MT", fuelType: "Pertalite (RON 90)", lastServiceDate: new Date("2024-09-15"), lastServiceItems: "Ganti oli mesin, filter oli, tune up, periksa rem" },
    branch: "Mobeng Gading Serpong",
    category: "Pelayanan",
    subCategory: "Part",
    description: "Part yang dipesan tidak tersedia sesuai janji. Sudah menunggu 2 minggu namun belum ada kejelasan.",
    attachments: [],
    status: "closed",
    createdBy: "Rizky Pratama",
    createdAt: new Date("2024-11-25T14:20:00"),
    updatedAt: new Date("2024-11-30T16:45:00"),
  },
  {
    id: "5",
    ticketNumber: "TKT-2024-00005",
    customer: { name: "Joko Widodo", phone: "085678901234", address: "Jl. Sunter Agung No. 99, Jakarta Utara" },
    vehicle: { brand: "Daihatsu", model: "Xenia", year: 2018, plateNumber: "B 7890 MNO", vin: "MHKV1BA2JJK123456", odometer: 112000, transmission: "MT", fuelType: "Premium (RON 88)", lastServiceDate: new Date("2024-08-10"), lastServiceItems: "Ganti battery, tune up, cek kelistrikan" },
    branch: "Mobeng Sunter",
    category: "Produk & Jasa",
    subCategory: "Battery",
    description: "Battery baru yang dipasang hanya bertahan 3 bulan. Pelanggan meminta garansi atau penggantian.",
    attachments: [],
    status: "awaiting_report",
    createdBy: "Budi Santoso",
    createdAt: new Date("2024-12-01T16:00:00"),
    updatedAt: new Date("2024-12-04T09:30:00"),
    assignedTo: "Andi Wijaya",
    assignedDepartment: "tech_support",
  },
];

export const mockTicketHistory: TicketHistory[] = [
  { id: "1", ticketId: "1", action: "created", description: "Tiket dibuat", performedBy: "Budi Santoso", performedAt: new Date("2024-12-01T09:30:00"), newStatus: "new" },
  { id: "2", ticketId: "2", action: "created", description: "Tiket dibuat", performedBy: "Rizky Pratama", performedAt: new Date("2024-12-02T11:15:00"), newStatus: "new" },
  { id: "3", ticketId: "2", action: "escalated", description: "Diteruskan ke Teknikal Support untuk analisis lebih lanjut", performedBy: "Rizky Pratama", performedAt: new Date("2024-12-02T14:30:00"), oldStatus: "new", newStatus: "escalated_tech" },
  { id: "4", ticketId: "3", action: "created", description: "Tiket dibuat", performedBy: "Budi Santoso", performedAt: new Date("2024-12-03T08:45:00"), newStatus: "new" },
  { id: "5", ticketId: "3", action: "status_changed", description: "Status diubah ke Dalam Proses Analisis", performedBy: "Andi Wijaya", performedAt: new Date("2024-12-03T10:00:00"), oldStatus: "escalated_tech", newStatus: "in_progress" },
];

export const generateTicketNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `TKT-${year}-${randomNum}`;
};
