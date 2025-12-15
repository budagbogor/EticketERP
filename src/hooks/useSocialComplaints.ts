import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SocialComplaint } from '@/types/social-complaint';
import { toast } from 'sonner';
import { useBranches, useComplaintCategories, useSubCategories } from '@/hooks/useMasterData';
import { useQuery } from '@tanstack/react-query';

export function useSocialComplaints() {
    const [complaints, setComplaints] = useState<SocialComplaint[]>([]);
    const [loading, setLoading] = useState(true);

    // Use Master Data Hooks
    const { data: categoryData } = useComplaintCategories();
    const categories = categoryData?.map(c => c.name) || [];

    const { data: subCategoryData } = useSubCategories();
    const subCategories = subCategoryData?.map(c => c.name) || [];

    const { data: branchData } = useBranches();
    const branches = branchData?.map(b => b.name) || [];

    // Keep channels local for now as it wasn't in MasterData hooks previously shown, 
    // or fetch it similarly if it exists. 
    // Looking at useMasterData.ts (Step 132), there is NO useChannels.
    // So I must keep fetchChannels here or add it to useMasterData.
    // The previous code had fetchChannels. I should probably keep it or genericize it.
    // For now I will keep it but clean it up.
    const { data: channels = [] } = useQuery({
        queryKey: ['channels'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('channels' as any)
                .select('name')
                .order('name');
            if (error) throw error;
            return data.map((c: any) => c.name);
        }
    });

    const addChannel = async (name: string) => {
        try {
            const { error } = await supabase
                .from('channels' as any)
                .insert([{ name }]);

            if (error) throw error;
            // Invalidate query would be better but we'll return true for compatibility with component
            toast.success('Channel berhasil ditambahkan');
            return true;
        } catch (error) {
            console.error('Error adding channel:', error);
            toast.error('Gagal menambahkan channel');
            return false;
        }
    };

    const fetchComplaints = async () => {
        try {
            const { data, error } = await supabase
                .from('social_complaints')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComplaints(data as SocialComplaint[]);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            toast.error('Gagal mengambil data complain');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'social_complaints',
                },
                (payload) => {
                    fetchComplaints();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addComplaint = async (complaint: Omit<SocialComplaint, 'id' | 'created_at'>) => {
        try {
            const { data, error } = await supabase
                .from('social_complaints')
                .insert([complaint])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setComplaints((prev) => [data as SocialComplaint, ...prev]);
            }

            return data;
        } catch (error) {
            console.error('Error adding complaint:', error);
            toast.error(`Gagal menyimpan complain: ${error.message || 'Unknown error'}`);
            throw error;
        }
    };

    const updateComplaint = async (id: string, updates: Partial<SocialComplaint>) => {
        try {
            const { error } = await supabase
                .from('social_complaints')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            setComplaints((prev) =>
                prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
            );

            toast.success('Complain berhasil diperbarui');
        } catch (error) {
            console.error('Error updating complaint:', error);
            toast.error('Gagal memperbarui complain');
            throw error;
        }
    };

    const deleteComplaint = async (id: string) => {
        try {
            const { error } = await supabase
                .from('social_complaints')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setComplaints((prev) => prev.filter((c) => c.id !== id));

            toast.success('Complain berhasil dihapus');
        } catch (error) {
            console.error('Error deleting complaint:', error);
            toast.error('Gagal menghapus complain');
            throw error;
        }
    };

    const exportToCSV = () => {
        const headers = [
            'ID',
            'Channel',
            'Username',
            'Link',
            'Datetime',
            'Category',
            'Sub Category',
            'Branch',
            'Contact Status',
            'Summary',
            'Original Text',
            'Risk',
            'Status',
            'Follow Up Note',
            'Created At'
        ];

        const csvContent = [
            headers.join(','),
            ...complaints.map(row => [
                row.id,
                `"${row.channel}"`,
                `"${row.username}"`,
                `"${row.link || ''}"`,
                `"${row.datetime}"`,
                `"${row.complain_category}"`,
                `"${row.sub_category || ''}"`,
                `"${row.branch || ''}"`,
                `"${row.contact_status}"`,
                `"${(row.complain_summary || '').replace(/"/g, '""')}"`,
                `"${(row.original_complain_text || '').replace(/"/g, '""')}"`,
                `"${row.viral_risk}"`,
                `"${row.status}"`,
                `"${(row.follow_up_note || '').replace(/"/g, '""')}"`,
                `"${row.created_at}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `social_complaints_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return {
        complaints,
        categories,
        subCategories,
        branches,
        channels,
        loading,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        exportToCSV,
        addChannel,
    };
}
