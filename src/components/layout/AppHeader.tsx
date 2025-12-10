import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useComplaints } from "@/hooks/useComplaints";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function AppHeader() {
  const { profile, roles } = useAuth();
  const { data: complaints } = useComplaints();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Count open/new tickets that need attention
  const openComplaints = complaints?.filter(
    (c) => c.status === 'new' || c.status === 'open'
  ) || [];

  const notificationCount = openComplaints.length;

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Admin",
      staff: "Staff",
      tech_support: "Tech Support",
      psd: "PSD",
      viewer: "Viewer",
    };
    return labels[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "destructive",
      open: "default",
    };
    return variants[status] || "secondary";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to tickets page with search query
      navigate(`/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari tiket, pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 w-64"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifikasi</h3>
                <Badge variant="secondary">{notificationCount} Baru</Badge>
              </div>

              {notificationCount > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {openComplaints.slice(0, 5).map((complaint) => (
                    <div
                      key={complaint.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/tickets/${complaint.id}`)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {complaint.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {complaint.vehicle_brand} {complaint.vehicle_model} {complaint.vehicle_year ? `(${complaint.vehicle_year})` : ''}
                          </p>
                        </div>
                        <Badge variant={getStatusBadge(complaint.status)} className="text-xs">
                          {complaint.status === 'new' ? 'Baru' : 'Terbuka'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {complaint.description}
                      </p>
                    </div>
                  ))}

                  {notificationCount > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/tickets')}
                    >
                      Lihat Semua ({notificationCount})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada notifikasi baru</p>
                </div>
              )}

              {notificationCount > 0 && notificationCount <= 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => navigate('/tickets')}
                >
                  Lihat Semua Tiket
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium">{profile?.name}</span>
          <span className="text-xs text-muted-foreground">
            {roles.length > 0 && getRoleLabel(roles[0])}
            {profile?.branch && ` • ${profile.branch}`}
          </span>
        </div>
      </div>
    </header>
  );
}
