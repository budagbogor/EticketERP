import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useComplaints, useComplaintStats } from "@/hooks/useComplaints";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { Link } from "react-router-dom";

const defaultCategoryData = [
  { name: "Produk & Jasa", value: 0, color: "hsl(217, 91%, 40%)" },
  { name: "Kualitas Servis", value: 0, color: "hsl(142, 71%, 45%)" },
  { name: "Pelayanan", value: 0, color: "hsl(45, 100%, 51%)" },
  { name: "Fasilitas", value: 0, color: "hsl(262, 52%, 47%)" },
  { name: "Lainnya", value: 0, color: "hsl(215, 14%, 34%)" },
];

export default function Dashboard() {
  const { data: complaints, isLoading: complaintsLoading } = useComplaints();
  const { data: stats, isLoading: statsLoading } = useComplaintStats();

  const recentComplaints = complaints?.slice(0, 4) || [];
  const categoryData = stats?.byCategory?.length ? stats.byCategory : defaultCategoryData;
  const branchData = stats?.byBranch || [];

  const isLoading = complaintsLoading || statsLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan status komplain dan tiket</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Komplain"
              value={stats?.total || 0}
              subtitle="Bulan ini"
              icon={<Ticket className="w-6 h-6" />}
            />
            <StatsCard
              title="Tiket Terbuka"
              value={stats?.open || 0}
              subtitle="Perlu penanganan"
              icon={<AlertCircle className="w-6 h-6" />}
            />
            <StatsCard
              title="Dalam Proses"
              value={stats?.inProgress || 0}
              subtitle="Sedang ditangani"
              icon={<Clock className="w-6 h-6" />}
            />
            <StatsCard
              title="Selesai"
              value={stats?.closed || 0}
              subtitle="Bulan ini"
              icon={<CheckCircle2 className="w-6 h-6" />}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Komplain per Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : branchData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar
                    dataKey="complaints"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Komplain"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Belum ada data komplain
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kategori Komplain</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : categoryData.some(c => c.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`${value}%`, "Persentase"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Belum ada data komplain
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Tiket Terbaru</CardTitle>
          <Link to="/tickets" className="text-sm text-primary hover:underline">
            Lihat semua
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : recentComplaints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentComplaints.map((complaint) => (
                <Link
                  key={complaint.id}
                  to={`/tickets/${complaint.id}`}
                  className="block"
                >
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm font-medium text-primary">
                          {complaint.ticket_number}
                        </span>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <h4 className="font-medium text-sm mb-1">{complaint.customer_name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {complaint.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{complaint.branch}</span>
                        <span>
                          {format(new Date(complaint.created_at), "dd MMM yyyy", { locale: id })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada tiket komplain. Buat tiket pertama Anda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
