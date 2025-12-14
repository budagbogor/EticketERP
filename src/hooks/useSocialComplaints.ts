import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SocialComplaint } from '@/types/social-complaint';
import { toast } from 'sonner';

export function useSocialComplaints() {
    const [complaints, setComplaints] = useState<SocialComplaint[]>([]);
    const [loading, setLoading] = useState(true);

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

    const [categories, setCategories] = useState<string[]>([]);
    const [subCategories, setSubCategories] = useState<string[]>([]);
    const [branches, setBranches] = useState<string[]>([]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('complaint_categories')
                .select('name')
                .order('name');

            if (error) throw error;
            setCategories(data.map(c => c.name));
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('sub_categories')
                .select('name')
                .order('name');

            if (error) throw error;
            setSubCategories(data.map(c => c.name));
        } catch (error) {
            console.error('Error fetching sub categories:', error);
        }
    };

    const fetchBranches = async () => {
        try {
            const { data, error } = await supabase
                .from('branches')
                .select('name')
                .order('name');

            if (error) throw error;
            setBranches(data.map(b => b.name));
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const addCategory = async (name: string) => {
        try {
            const { error } = await supabase
                .from('complaint_categories')
                .insert([{ name }]);

            if (error) throw error;
            await fetchCategories();
            toast.success('Kategori berhasil ditambahkan');
            return true;
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Gagal menambahkan kategori');
            return false;
        }
    };

    const addSubCategory = async (name: string) => {
        try {
            const { error } = await supabase
                .from('sub_categories')
                .insert([{ name }]);

            if (error) throw error;
            await fetchSubCategories();
            toast.success('Sub Kategori berhasil ditambahkan');
            return true;
        } catch (error) {
            console.error('Error adding sub category:', error);
            toast.error('Gagal menambahkan sub kategori');
            return false;
        }
    };

    useEffect(() => {
        fetchComplaints();
        fetchCategories();
        fetchCategories();
        fetchSubCategories();
        fetchBranches();

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

            // Manual state update
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

            // Manual state update
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

            // Manual state update
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
        loading,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        exportToCSV,
        addCategory,
        addSubCategory,
    };
}
