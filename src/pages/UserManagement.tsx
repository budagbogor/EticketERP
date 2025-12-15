import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useBranches } from "@/hooks/useMasterData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, User, Loader2, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type UserRole = "admin" | "staff" | "tech_support" | "psd" | "viewer" | "customer_service";

interface AppUser {
  id: string;
  nik: string | null;
  name: string;
  email: string | null;
  role: UserRole;
  branch: string | null;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    email: "",
    role: "staff" as UserRole,
    branch: "",
    password: "",
  });
  const { toast } = useToast();
  const { data: branches = [] } = useBranches();

  // Fetch users from database
  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("app_users")
      .select("id, nik, name, email, role, branch")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        variant: "destructive",
      });
    } else {
      setUsers(data as AppUser[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.nik && user.nik.includes(searchQuery))
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "default";
      case "staff": return "secondary";
      case "tech_support": return "outline";
      case "psd": return "outline";
      case "viewer": return "secondary";
      case "customer_service": return "secondary";
      default: return "secondary";
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nik: "",
      email: "",
      role: "staff",
      branch: "",
      password: "",
    });
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Mohon lengkapi nama dan email",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Error",
          description: "Sesi tidak valid. Silakan login ulang.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Call edge function to create user with NIK as password (or email prefix if NIK is empty)
      const nikValue = formData.nik || formData.email.split('@')[0];
      const response = await supabase.functions.invoke("create-user", {
        body: {
          email: formData.email,
          nik: nikValue,
          name: formData.name,
          role: formData.role,
          branch: formData.branch || null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const temporaryPassword = response.data?.temporaryPassword;

      toast({
        title: "Pengguna Ditambahkan",
        description: `${formData.name} berhasil ditambahkan.`,
      });

      // Show the temporary password in a dialog
      setNewUserName(formData.name);
      setGeneratedPassword(temporaryPassword);
      setPasswordCopied(false);
      setIsPasswordDialogOpen(true);

      resetForm();
      setIsAddOpen(false);
      fetchUsers();
    } catch (error: any) {
      const isEmailDuplicate = error.message?.includes("already been registered") ||
        error.message?.includes("already registered") ||
        error.message?.includes("User already registered");

      toast({
        title: isEmailDuplicate ? "Email Sudah Digunakan" : "Error",
        description: isEmailDuplicate
          ? "Email ini sudah terdaftar di sistem. Silakan gunakan email lain."
          : error.message || "Gagal menambahkan pengguna",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.name) {
      toast({
        title: "Error",
        description: "Mohon lengkapi nama",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("app_users")
      .update({
        nik: formData.nik || null,
        name: formData.name,
        email: formData.email || null,
        role: formData.role,
        branch: formData.branch || null,
      })
      .eq("id", selectedUser.id);

    if (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message.includes("duplicate")
          ? "NIK sudah terdaftar"
          : "Gagal memperbarui pengguna",
        variant: "destructive",
      });
    } else {
      // Also update the role in user_roles table to ensure permissions are synced
      if (selectedUser.role !== formData.role) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: formData.role as any }) // Cast to any to bypass type check if types aren't regenerated yet
          .eq("user_id", selectedUser.id);

        if (roleError) {
          console.error("Error updating user role permissions:", roleError);
          // We don't block the UI success but log it and maybe warn
          // Likely if this fails, the user needs to run the SQL to update enums
        }
      }

      toast({
        title: "Pengguna Diperbarui",
        description: `Data ${formData.name} berhasil diperbarui`,
      });
      setIsEditOpen(false);
      setSelectedUser(null);
      fetchUsers();
    }
    setIsSaving(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSaving(true);

    try {
      // Call edge function to delete user from auth system
      const response = await supabase.functions.invoke("delete-user", {
        body: { userId: selectedUser.id },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Pengguna Dihapus",
        description: `${selectedUser.name} berhasil dihapus. Email ${selectedUser.email} sekarang dapat digunakan kembali.`,
      });
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message === "Cannot delete your own account"
          ? "Tidak dapat menghapus akun sendiri"
          : error.message || "Gagal menghapus pengguna",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditDialog = (user: AppUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      nik: user.nik,
      email: user.email || "",
      role: user.role,
      branch: user.branch || "",
      password: "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (user: AppUser) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Kelola pengguna dan hak akses sistem</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Pengguna</TableHead>
                  <TableHead className="font-semibold">NIK</TableHead>
                  <TableHead className="font-semibold">Peran</TableHead>
                  <TableHead className="font-semibold">Cabang</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada pengguna ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{user.nik || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.branch || "-"}
                      </TableCell>
                      <TableCell className="text-sm">{user.email || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog(user)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Tambah Pengguna */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Masukkan nama"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  value={formData.nik}
                  onChange={(e) => setFormData(prev => ({ ...prev, nik: e.target.value }))}
                  placeholder="Masukkan NIK (opsional)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Masukkan email"
                required
              />
              <p className="text-xs text-muted-foreground">
                Password sementara akan digenerate otomatis oleh sistem
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peran *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(USER_ROLES).map(role => (
                      <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cabang</Label>
                <Select value={formData.branch} onValueChange={(value) => setFormData(prev => ({ ...prev, branch: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSaving}>Batal</Button>
            <Button onClick={handleAddUser} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Pengguna */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nik">NIK</Label>
                <Input
                  id="edit-nik"
                  value={formData.nik}
                  onChange={(e) => setFormData(prev => ({ ...prev, nik: e.target.value }))}
                  placeholder="Masukkan NIK (opsional)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peran *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(USER_ROLES).map(role => (
                      <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cabang</Label>
                <Select value={formData.branch} onValueChange={(value) => setFormData(prev => ({ ...prev, branch: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Password di-enkripsi dan tidak dapat ditampilkan
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (selectedUser) {
                      // Generate new temporary password (8 characters: letters + numbers)
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                      let tempPassword = '';
                      for (let i = 0; i < 8; i++) {
                        tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
                      }

                      setIsSaving(true);

                      try {
                        // Call edge function to update password
                        const response = await supabase.functions.invoke("admin-reset-password", {
                          body: {
                            userId: selectedUser.id,
                            newPassword: tempPassword,
                          },
                        });

                        if (response.error) {
                          throw new Error(response.error.message);
                        }

                        if (response.data?.error) {
                          throw new Error(response.data.error);
                        }

                        setGeneratedPassword(tempPassword);
                        setNewUserName(selectedUser.name);
                        setPasswordCopied(false);
                        setIsPasswordDialogOpen(true);

                        toast({
                          title: "Password Baru Dibuat",
                          description: "Password sementara telah dibuat dan disimpan. Silakan catat dan berikan ke pengguna.",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Gagal membuat password baru",
                          variant: "destructive",
                        });
                      } finally {
                        setIsSaving(false);
                      }
                    }
                  }}
                  disabled={isSaving || !selectedUser}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Generate Password Baru
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Batal</Button>
            <Button onClick={handleEditUser} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus Pengguna */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Apakah Anda yakin ingin menghapus pengguna "{selectedUser?.name}"?</p>
              {selectedUser?.email && (
                <p className="text-sm">
                  Email <strong>{selectedUser.email}</strong> akan dibebaskan dan dapat digunakan untuk pendaftaran baru.
                </p>
              )}
              <p className="text-destructive font-medium">Tindakan ini tidak dapat dibatalkan.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus Pengguna
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Password Sementara */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Pengguna Berhasil Ditambahkan
            </DialogTitle>
            <DialogDescription>
              Password sementara untuk {newUserName}. Mohon catat dan berikan kepada pengguna.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Password Sementara:</p>
              <code className="text-xl font-bold text-primary tracking-wider bg-background px-4 py-2 rounded inline-block">
                {generatedPassword}
              </code>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(generatedPassword);
                setPasswordCopied(true);
                toast({
                  title: "Tersalin!",
                  description: "Password berhasil disalin ke clipboard",
                });
              }}
            >
              {passwordCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Salin Password
                </>
              )}
            </Button>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Penting:</strong> Password ini hanya ditampilkan sekali. Pengguna harus mengganti password setelah login pertama.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPasswordDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
