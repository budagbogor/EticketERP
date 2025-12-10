import { z } from "zod";

export const customerSchema = z.object({
  customerName: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),
  customerPhone: z
    .string()
    .regex(/^08\d{8,12}$/, "Format nomor HP tidak valid (contoh: 081234567890)"),
  customerAddress: z
    .string()
    .max(500, "Alamat maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
});

export const vehicleSchema = z.object({
  vehicleBrand: z.string().min(1, "Merek kendaraan wajib diisi"),
  vehicleModel: z.string().min(1, "Model kendaraan wajib diisi"),
  vehicleYear: z
    .number()
    .min(1900, "Tahun tidak valid")
    .max(new Date().getFullYear() + 1, "Tahun tidak valid")
    .optional()
    .nullable(),
  vehiclePlateNumber: z
    .string()
    .regex(/^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/, "Format plat nomor tidak valid (contoh: B 1234 ABC)")
    .optional()
    .or(z.literal("")),
  vehicleVin: z
    .string()
    .length(17, "VIN harus 17 karakter")
    .optional()
    .or(z.literal("")),
  vehicleOdometer: z
    .number()
    .min(0, "Odometer tidak boleh negatif")
    .max(999999, "Odometer tidak valid")
    .optional()
    .nullable(),
  vehicleTransmission: z.string().optional().nullable(),
  vehicleFuelType: z.string().optional().nullable(),
});

export const complaintSchema = z.object({
  branch: z.string().min(1, "Cabang wajib dipilih"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  subCategory: z.string().optional().nullable(),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter"),
  lastServiceDate: z.string().optional().nullable(),
  lastServiceItems: z.string().max(1000, "Maksimal 1000 karakter").optional().nullable(),
});

export const ticketFormSchema = customerSchema.merge(vehicleSchema).merge(complaintSchema);

export type TicketFormData = z.infer<typeof ticketFormSchema>;
