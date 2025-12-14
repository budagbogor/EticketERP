import { useSocialComplaints } from '@/hooks/useSocialComplaints';
import { ComplaintForm } from '@/components/complain-compass/ComplaintForm';
import { ComplaintList } from '@/components/complain-compass/ComplaintList';
import { StatsCards } from '@/components/complain-compass/StatsCards';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, MessageSquareWarning, FileSpreadsheet } from 'lucide-react';
import { SocialComplaint } from '@/types/social-complaint';

const ComplainCompass = () => {
    const {
        complaints,
        categories,
        subCategories,
        branches,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        exportToCSV,
        addCategory,
        addSubCategory,
    } = useSocialComplaints();

    const handleAddComplaint = async (data: Omit<SocialComplaint, 'id' | 'created_at'>) => {
        try {
            await addComplaint(data);
            toast.success('Complain berhasil disimpan');
        } catch (error) {
            // Error is handled in hook
        }
    };

    const handleUpdateStatus = async (id: string, status: 'Open' | 'Monitoring' | 'Closed') => {
        try {
            await updateComplaint(id, { status });
        } catch (error) {
            // Error is handled in hook
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteComplaint(id);
        } catch (error) {
            // Error is handled in hook
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary">
                                <MessageSquareWarning className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Pendataan Complain Medsos</h1>
                                <p className="text-sm text-muted-foreground">
                                    Admin CS - Data Minim & Sulit Dihubungi
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={exportToCSV}
                            disabled={complaints.length === 0}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export Complain Compass to CSV
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 space-y-6">
                <StatsCards complaints={complaints} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <ComplaintForm
                            onSubmit={handleAddComplaint}
                            categories={categories}
                            subCategories={subCategories}
                            branches={branches}
                            onAddCategory={addCategory}
                            onAddSubCategory={addSubCategory}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <ComplaintList
                            complaints={complaints}
                            onUpdateStatus={handleUpdateStatus}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t py-4 mt-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    Sistem Pendataan Complain Media Sosial • Fokus Monitoring & Pendataan
                </div>
            </footer>
        </div>
    );
};

export default ComplainCompass;
