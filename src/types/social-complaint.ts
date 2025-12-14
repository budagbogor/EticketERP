export type SocialComplaint = {
    id: string;
    channel: string;
    username: string;
    link: string | null;
    datetime: string;
    complain_category: string;
    sub_category: string | null;
    complain_summary: string;
    original_complain_text: string;
    contact_status: 'Sulit Dihubungi' | 'Berhasil Dihubungi' | 'Belum Dicoba';
    viral_risk: 'Normal' | 'Potensi Viral';
    follow_up_note: string | null;
    branch: string | null;
    status: 'Open' | 'Monitoring' | 'Closed';
    created_at: string;
};

export const CHANNELS = [
    'Instagram',
    'Twitter/X',
    'Facebook',
    'TikTok',
    'YouTube',
    'WhatsApp',
    'Telegram',
    'Lainnya',
] as const;

export const CATEGORIES = [
    'Produk/Layanan',
    'Pengiriman',
    'Pembayaran',
    'Customer Service',
    'Kualitas',
    'Harga',
    'Promo',
    'Teknis/App',
    'Lainnya',
] as const;
