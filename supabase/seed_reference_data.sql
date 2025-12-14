-- Script to seed reference data for dropdowns (Using data from constants.ts)
-- Run this in Supabase SQL Editor

-- 1. Seed Branches (from constants.ts)
INSERT INTO public.branches (name) VALUES
('Mobeng Harapan Indah'),
('Mobeng BSD'),
('Mobeng Cinere'),
('Mobeng Karawaci'),
('Mobeng Gading Serpong'),
('Mobeng Jatibening'),
('Mobeng Tole Iskandar'),
('Mobeng Sunter'),
('Mobeng Lenteng Agung'),
('Mobeng Hankam'),
('Mobeng Cilengsi'),
('Mobeng Mustika Jaya'),
('Mobeng Pondok Betung'),
('Mobeng Cipondoh'),
('Mobeng Jati Asih'),
('Mobeng Duren Sawit'),
('Mobeng Galuh Mas'),
('Mobeng Jababeka'),
('Mobeng Kopo Bandung'),
('Mobeng Jemursari'),
('Mobeng Citraland'),
('Mobeng Kupang'),
('Mobeng Merr'),
('Mobeng Katamso'),
('Mobeng Sidoarjo')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Complaint Categories (from constants.ts)
INSERT INTO public.complaint_categories (name) VALUES
('Produk & Jasa'),
('Kualitas Servis'),
('Fasilitas Customer'),
('Pelayanan'),
('Marketing Promo'),
('Harga'),
('Durasi Service'),
('Booking Servis')
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Sub Categories (from constants.ts)
INSERT INTO public.sub_categories (name) VALUES
('RMB'),
('Ban'),
('Battery'),
('Spooring'),
('Balancing'),
('Oli Mesin'),
('Oli AT/MT/CVT'),
('AC'),
('Kaki-kaki'),
('Rem'),
('Part'),
('Mesin'),
('Transmisi'),
('Gardan'),
('Cooling System'),
('Fuel System'),
('Electrical')
ON CONFLICT (name) DO NOTHING;

-- 4. Seed Fuel Types (from constants.ts)
INSERT INTO public.fuel_types (name) VALUES
('Premium (RON 88)'),
('Pertalite (RON 90)'),
('Pertamax (RON 92)'),
('Pertamax Turbo (RON 98)'),
('Pertamax Racing (RON 100)'),
('Biosolar (CN 48)'),
('Dexlite (CN 51)'),
('Pertamina Dex (CN 53)'),
('Gas Alam Terkompresi (CNG)'),
('Listrik'),
('Biofuel')
ON CONFLICT (name) DO NOTHING;

-- 5. Seed Transmission Types (from constants.ts)
INSERT INTO public.transmission_types (name) VALUES
('MT'),
('AT'),
('CVT')
ON CONFLICT (name) DO NOTHING;
