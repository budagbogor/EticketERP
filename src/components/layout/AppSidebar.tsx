import {
  LayoutDashboard,
  TicketPlus,
  ListTodo,
  FileText,
  Users,
  Settings,
  Car,
  Database,
  LogOut,
  Lock,
  BookOpen,
  MessageSquareWarning,
  CircleDashed,
  Briefcase,
  Wrench,
  CircleDot
} from "lucide-react";
import logoMobeng from "@/assets/logo-mobeng.jpg";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, end: true },
  { title: "Buat Tiket", url: "/tickets/create", icon: TicketPlus, end: true },
  { title: "Daftar Tiket", url: "/tickets", icon: ListTodo, end: true },
  { title: "Laporan Teknik", url: "/reports", icon: FileText, end: true },
  { title: "Buku Pintar", url: "/buku-pintar", icon: BookOpen, end: true },
  { title: "Complain Compass", url: "/complain-compass", icon: MessageSquareWarning, end: true },
  { title: "Upgrade Ban", url: "/tire-upgrade", icon: CircleDashed, end: true },
  { title: "Pencari Ukuran Wiper", url: "/wiper-fit-finder", icon: Wrench, end: true },
];

const adminMenuItems = [
  { title: "Manajemen Pengguna", url: "/users", icon: Users, end: true },
  { title: "Data Master", url: "/master-data", icon: Database, end: true },
  { title: "Data Ban", url: "/tire-data-management", icon: CircleDot, end: true },
  { title: "Pengaturan", url: "/settings", icon: Settings, end: true },
];

export function AppSidebar() {
  const { profile, roles, isAdmin, signOut } = useAuth();

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Admin",
      staff: "Staff",
      tech_support: "Tech Support",
      psd: "PSD",
      viewer: "Viewer",
      customer_service: "Customer Service",
    };
    return labels[role] || role;
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <img src={logoMobeng} alt="Mobeng Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-lg">Mobeng</h1>
            <p className="text-xs text-sidebar-foreground/60">E-Ticket System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              Administrasi
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.end}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-foreground">
                {profile?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.name || "User"}</p>
              <p className="text-xs text-sidebar-foreground/60">{roles.length > 0 && getRoleLabel(roles[0])}</p>
            </div>
          </div>
          <NavLink
            to="/change-password"
            end={true}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-sm"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <Lock className="w-4 h-4" />
            Ganti Password
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
