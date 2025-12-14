import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CHANNELS, SocialComplaint } from '@/types/social-complaint';
import { Send, AlertTriangle, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ComplaintFormProps {
    onSubmit: (complaint: Omit<SocialComplaint, 'id' | 'created_at'>) => void;
    categories: string[];
    subCategories: string[];
    branches: string[];
    onAddCategory: (name: string) => Promise<boolean>;
    onAddSubCategory: (name: string) => Promise<boolean>;
}

export function ComplaintForm({ onSubmit, categories, subCategories, branches, onAddCategory, onAddSubCategory }: ComplaintFormProps) {
    const [formData, setFormData] = useState({
        channel: '',
        username: '',
        link: '',
        datetime: '',
        original_complain_text: '',
        complain_category: '',
        sub_category: '',
        complain_summary: '',
        viral_risk: 'Normal' as 'Normal' | 'Potensi Viral',
        follow_up_note: '',
        branch: '',
        contact_status: 'Belum Dicoba' as 'Sulit Dihubungi' | 'Berhasil Dihubungi' | 'Belum Dicoba',
    });

    // Date & Time State
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState<string>(format(new Date(), "HH:mm"));

    // Function to combine Date and Time
    const getCombinedDateTime = (selectedDate: Date | undefined, selectedTime: string) => {
        if (!selectedDate) return '';
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        return `${dateStr}T${selectedTime}`; // ISO format for local time
    };

    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const combinedDateTime = getCombinedDateTime(date, time) || new Date().toISOString();

        onSubmit({
            ...formData,
            channel: formData.channel || 'N/A',
            username: formData.username || 'N/A',
            link: formData.link || 'N/A',
            datetime: combinedDateTime,
            complain_category: formData.complain_category || 'Lainnya',
            sub_category: formData.sub_category || null,
            complain_summary: formData.complain_summary || formData.original_complain_text.slice(0, 100),
            contact_status: formData.contact_status,
            status: 'Open',
            branch: formData.branch || null,
        });

        // Reset form
        setFormData({
            channel: '',
            username: '',
            link: '',
            datetime: '',
            original_complain_text: '',
            complain_category: '',
            sub_category: '',
            complain_summary: '',
            viral_risk: 'Normal',
            follow_up_note: '',
            branch: '',
            contact_status: 'Belum Dicoba',
        });
        setDate(new Date());
        setTime(format(new Date(), "HH:mm"));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        const success = await onAddCategory(newCategoryName);
        if (success) {
            setFormData({ ...formData, complain_category: newCategoryName });
            setNewCategoryName('');
            setIsAddCategoryOpen(false);
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategoryName.trim()) return;
        const success = await onAddSubCategory(newSubCategoryName);
        if (success) {
            setFormData({ ...formData, sub_category: newSubCategoryName });
            setNewSubCategoryName('');
            setIsAddSubCategoryOpen(false);
        }
    };

    return (
        <Card className="glass-card animate-fade-in">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Send className="h-5 w-5 text-accent" />
                    Input Complain Baru
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="channel">Channel Media Sosial</Label>
                        <Select
                            value={formData.channel}
                            onValueChange={(value) =>
                                setFormData({ ...formData, channel: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih channel" />
                            </SelectTrigger>
                            <SelectContent>
                                {CHANNELS.map((ch) => (
                                    <SelectItem key={ch} value={ch}>
                                        {ch}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="branch">Cabang yang Dicomplain</Label>
                        <Select
                            value={formData.branch}
                            onValueChange={(value) =>
                                setFormData({ ...formData, branch: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih cabang" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((b) => (
                                    <SelectItem key={b} value={b}>
                                        {b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact_status">Status Kontak Pelanggan</Label>
                        <Select
                            value={formData.contact_status}
                            onValueChange={(value: 'Belum Dicoba' | 'Berhasil Dihubungi' | 'Sulit Dihubungi') =>
                                setFormData({ ...formData, contact_status: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status kontak" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Belum Dicoba">Belum Dicoba</SelectItem>
                                <SelectItem value="Berhasil Dihubungi">Dapat Dihubungi (Berhasil)</SelectItem>
                                <SelectItem value="Sulit Dihubungi">Tidak Dapat Dihubungi (Sulit)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username Akun</Label>
                        <Input
                            id="username"
                            placeholder="@username"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link">Link Post / Komentar / DM</Label>
                        <Input
                            id="link"
                            placeholder="https://..."
                            value={formData.link}
                            onChange={(e) =>
                                setFormData({ ...formData, link: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tanggal & Waktu</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                        time ? `${format(date, "PPP")}, ${time}` : format(date, "PPP")
                                    ) : (
                                        <span>Pilih tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                                <div className="p-3 border-t flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="h-8"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="original_text">Isi Complain (Teks Asli Pelanggan)</Label>
                        <Textarea
                            id="original_text"
                            placeholder="Salin teks complain pelanggan di sini..."
                            rows={4}
                            value={formData.original_complain_text}
                            onChange={(e) =>
                                setFormData({ ...formData, original_complain_text: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Kategori Complain</Label>
                        <div className="flex gap-2">
                            <Select
                                value={formData.complain_category}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, complain_category: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" title="Tambah Kategori">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                                        <DialogDescription>
                                            Masukkan nama kategori baru yang ingin ditambahkan.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Input
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="Nama Kategori"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Batal</Button>
                                        <Button onClick={handleAddCategory}>Simpan</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sub_category">Sub Kategori</Label>
                        <div className="flex gap-2">
                            <Select
                                value={formData.sub_category}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, sub_category: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih sub kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subCategories.map((sub) => (
                                        <SelectItem key={sub} value={sub}>
                                            {sub}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Dialog open={isAddSubCategoryOpen} onOpenChange={setIsAddSubCategoryOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" title="Tambah Sub Kategori">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Tambah Sub Kategori Baru</DialogTitle>
                                        <DialogDescription>
                                            Masukkan nama sub kategori baru yang ingin ditambahkan.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Input
                                            value={newSubCategoryName}
                                            onChange={(e) => setNewSubCategoryName(e.target.value)}
                                            placeholder="Nama Sub Kategori"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddSubCategoryOpen(false)}>Batal</Button>
                                        <Button onClick={handleAddSubCategory}>Simpan</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="viral_risk">Potensi Risiko</Label>
                        <Select
                            value={formData.viral_risk}
                            onValueChange={(value: 'Normal' | 'Potensi Viral') =>
                                setFormData({ ...formData, viral_risk: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="Potensi Viral">
                                    <span className="flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        Potensi Viral
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="summary">Ringkasan Complain</Label>
                        <Textarea
                            id="summary"
                            placeholder="Ringkasan singkat..."
                            rows={4}
                            value={formData.complain_summary}
                            onChange={(e) =>
                                setFormData({ ...formData, complain_summary: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="follow_up">Catatan Tindak Lanjut Internal</Label>
                        <Textarea
                            id="follow_up"
                            placeholder="Catatan untuk tim internal..."
                            rows={2}
                            value={formData.follow_up_note}
                            onChange={(e) =>
                                setFormData({ ...formData, follow_up_note: e.target.value })
                            }
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Simpan Complain
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
