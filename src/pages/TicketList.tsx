import { useState, useMemo, useEffect } from "react";
import { useComplaints } from "@/hooks/useComplaints";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_LABELS } from "@/lib/constants";
import { Search, Plus, Eye, Pencil, Trash2, Timer } from "lucide-react";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useBranches, useComplaintCategories } from "@/hooks/useMasterData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const calculateDuration = (startDate: Date, endDate: Date): string => {
  const days = differenceInDays(endDate, startDate);
  const hours = differenceInHours(endDate, startDate) % 24;
  const minutes = differenceInMinutes(endDate, startDate) % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}h`);
  if (hours > 0) parts.push(`${hours}j`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "< 1m";
};

export default function TicketList() {
  const { data: complaints, isLoading } = useComplaints();
  const { data: branches = [] } = useBranches();
  const { data: complaintCategories = [] } = useComplaintCategories();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Read search query from URL parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  const filteredTickets = useMemo(() => {
    if (!complaints) return [];
    return complaints.filter(ticket => {
      const matchesSearch =
        ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.vehicle_plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesBranch = branchFilter === "all" || ticket.branch === branchFilter;
      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesBranch && matchesCategory;
    });
  }, [complaints, searchQuery, statusFilter, branchFilter, categoryFilter]);

  const handleEdit = (ticketId: string) => {
    navigate(`/tickets/${ticketId}/edit`);
  };

  const handleDeleteClick = (ticketId: string) => {
    setTicketToDelete(ticketId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .delete()
        .eq("id", ticketToDelete);

      if (error) throw error;

      toast.success("Tiket berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    } catch (error: any) {
      toast.error("Gagal menghapus tiket: " + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daftar Tiket</h1>
          <p className="text-muted-foreground">Kelola semua tiket komplain</p>
        </div>
        <Link to="/tickets/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Tiket Baru
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor tiket, nama pelanggan, atau plat nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {complaintCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">No. Tiket</TableHead>
                  <TableHead className="font-semibold">Pelanggan</TableHead>
                  <TableHead className="font-semibold">Kendaraan</TableHead>
                  <TableHead className="font-semibold">Cabang</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Durasi</TableHead>
                  <TableHead className="font-semibold w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tidak ada tiket yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    const duration = calculateDuration(
                      new Date(ticket.created_at),
                      ticket.status === "closed" ? new Date(ticket.updated_at) : new Date()
                    );

                    return (
                      <TableRow
                        key={ticket.id}
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <TableCell className="font-medium text-primary">{ticket.ticket_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{ticket.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{ticket.vehicle_brand} {ticket.vehicle_model}</p>
                            <p className="text-sm text-muted-foreground">{ticket.vehicle_plate_number}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{ticket.branch}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{ticket.category}</p>
                            <p className="text-xs text-muted-foreground">{ticket.sub_category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={ticket.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Timer className="w-3 h-3 text-muted-foreground" />
                            <span className={ticket.status === "closed" ? "text-green-600" : "text-orange-600"}>
                              {duration}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Link to={`/tickets/${ticket.id}`}>
                              <Button variant="ghost" size="icon" title="Lihat Detail">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              onClick={() => handleEdit(ticket.id)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Hapus"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(ticket.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Menampilkan {filteredTickets.length} dari {complaints?.length || 0} tiket
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tiket</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tiket ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
