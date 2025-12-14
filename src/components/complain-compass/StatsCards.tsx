import { SocialComplaint } from '@/types/social-complaint';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
    complaints: SocialComplaint[];
}

export function StatsCards({ complaints }: StatsCardsProps) {
    const stats = {
        total: complaints.length,
        open: complaints.filter((c) => c.status === 'Open').length,
        monitoring: complaints.filter((c) => c.status === 'Monitoring').length,
        viral: complaints.filter((c) => c.viral_risk === 'Potensi Viral').length,
    };

    const cards = [
        {
            label: 'Total Complain',
            value: stats.total,
            icon: MessageSquare,
            color: 'text-primary',
            bg: 'bg-primary/10',
        },
        {
            label: 'Open',
            value: stats.open,
            icon: Clock,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
        },
        {
            label: 'Monitoring',
            value: stats.monitoring,
            icon: CheckCircle,
            color: 'text-warning',
            bg: 'bg-warning/10',
        },
        {
            label: 'Potensi Viral',
            value: stats.viral,
            icon: AlertTriangle,
            color: 'text-warning',
            bg: 'bg-warning/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <Card
                    key={card.label}
                    className="glass-card animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{card.label}</p>
                                <p className="text-3xl font-bold mt-1">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${card.bg}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
