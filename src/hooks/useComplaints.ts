import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Complaint {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number | null;
  vehicle_plate_number: string | null;
  vehicle_vin: string | null;
  vehicle_odometer: number | null;
  vehicle_transmission: string | null;
  vehicle_fuel_type: string | null;
  last_service_date: string | null;
  last_service_items: string | null;
  branch: string;
  category: string;
  sub_category: string | null;
  description: string;
  attachments: string[] | null;
  status: string;
  assigned_to: string | null;
  assigned_department: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useComplaints() {
  return useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Complaint[];
    },
  });
}

export function useComplaintStats() {
  return useQuery({
    queryKey: ["complaint-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("status, category, branch, created_at");

      if (error) throw error;

      const complaints = data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisMonthComplaints = complaints.filter(
        (c) => new Date(c.created_at) >= startOfMonth
      );

      return {
        total: thisMonthComplaints.length,
        open: complaints.filter(
          (c) => !["closed", "cancelled"].includes(c.status)
        ).length,
        inProgress: complaints.filter((c) => c.status === "in_progress").length,
        closed: thisMonthComplaints.filter((c) => c.status === "closed").length,
        byCategory: getCategoryStats(complaints),
        byBranch: getBranchStats(complaints),
      };
    },
  });
}

function getCategoryStats(complaints: { category: string }[]) {
  const categoryCount: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
  });

  const total = complaints.length || 1;
  const colors: Record<string, string> = {
    "Produk & Jasa": "hsl(217, 91%, 40%)",
    "Kualitas Servis": "hsl(142, 71%, 45%)",
    Pelayanan: "hsl(45, 100%, 51%)",
    Fasilitas: "hsl(262, 52%, 47%)",
    Lainnya: "hsl(215, 14%, 34%)",
  };

  return Object.entries(categoryCount).map(([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
    color: colors[name] || "hsl(215, 14%, 34%)",
  }));
}

function getBranchStats(complaints: { branch: string }[]) {
  const branchCount: Record<string, number> = {};
  complaints.forEach((c) => {
    branchCount[c.branch] = (branchCount[c.branch] || 0) + 1;
  });

  return Object.entries(branchCount)
    .map(([name, complaints]) => ({
      name: name.replace("Mobeng ", ""),
      complaints,
    }))
    .slice(0, 8);
}
