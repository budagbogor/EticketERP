import { useState } from 'react';
import { SocialComplaint } from '@/types/social-complaint';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertTriangle,
    Search,
    ExternalLink,
    Clock,
    MessageSquare,
    Trash2,
    Eye,
    Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ComplaintListProps {
    complaints: SocialComplaint[];
    onUpdateStatus: (id: string, status: SocialComplaint['status']) => void;
    onDelete: (id: string) => void;
}

export function ComplaintList({
    complaints,
    onUpdateStatus,
    onDelete,
}: ComplaintListProps) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRisk, setFilterRisk] = useState<string>('all');

    const filtered = complaints.filter((c) => {
        const matchSearch =
            c.username.toLowerCase().includes(search.toLowerCase()) ||
            c.original_complain_text.toLowerCase().includes(search.toLowerCase()) ||
            c.channel.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || c.status === filterStatus;
        const matchRisk = filterRisk === 'all' || c.viral_risk === filterRisk;
        return matchSearch && matchStatus && matchRisk;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'Monitoring':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'Closed':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getChannelIcon = (channel: string) => {
        const icons: Record<string, string> = {
            Instagram: '📸',
            'Twitter/X': '𝕏',
            Facebook: '📘',
            TikTok: '🎵',
            YouTube: '▶️',
            WhatsApp: '💬',
            Telegram: '✈️',
        };
        return icons[channel] || '📱';
    };

    return (
        <Card className="glass-card animate-fade-in">
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-accent" />
                        Daftar Complain ({filtered.length})
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-48"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-32">
                                <Filter className="h-4 w-4 mr-1" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Monitoring">Monitoring</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterRisk} onValueChange={setFilterRisk}>
                            <SelectTrigger className="w-36">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <SelectValue placeholder="Risiko" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="Potensi Viral">Potensi Viral</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada complain yang tercatat</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((complaint, index) => (
                            <div
                                key={complaint.id}
                                className="p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200 animate-slide-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-lg">{getChannelIcon(complaint.channel)}</span>
                                            <span className="font-medium">{complaint.channel}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="text-accent font-medium">{complaint.username}</span>
                                            {complaint.viral_risk === 'Potensi Viral' && (
                                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 animate-pulse-soft">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Viral Risk
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground line-clamp-2 mb-2">
                                            {complaint.original_complain_text}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {complaint.created_at && !isNaN(new Date(complaint.created_at).getTime()) ?
                                                    format(new Date(complaint.created_at), 'dd MMM yyyy, HH:mm', { locale: id })
                                                    : 'Invalid date'}
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                {complaint.complain_category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={complaint.status}
                                            onValueChange={(value: SocialComplaint['status']) =>
                                                onUpdateStatus(complaint.id, value)
                                            }
                                        >
                                            <SelectTrigger className={`w-28 h-8 text-xs ${getStatusColor(complaint.status)}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="Monitoring">Monitoring</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Detail Complain</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 mt-4">
                                                    <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-96">
                                                        {JSON.stringify(
                                                            {
                                                                channel: complaint.channel,
                                                                username: complaint.username,
                                                                datetime: complaint.datetime,
                                                                complain_category: complaint.complain_category,
                                                                sub_category: complaint.sub_category || 'N/A',
                                                                branch: complaint.branch || 'N/A',
                                                                complain_summary: complaint.complain_summary,
                                                                original_complain_text: complaint.original_complain_text,
                                                                contact_status: complaint.contact_status,
                                                                viral_risk: complaint.viral_risk,
                                                                follow_up_note: complaint.follow_up_note || 'N/A',
                                                                status: complaint.status,
                                                            },
                                                            null,
                                                            2
                                                        )}
                                                    </pre>
                                                    {complaint.link && complaint.link !== 'N/A' && (
                                                        <a
                                                            href={complaint.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-accent hover:underline"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            Buka Link Original
                                                        </a>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => onDelete(complaint.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
