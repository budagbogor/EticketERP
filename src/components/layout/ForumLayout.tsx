import { Outlet } from "react-router-dom";

export function ForumLayout() {
    return (
        <div className="container mx-auto py-6 max-w-6xl animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Forum Diskusi</h1>
                <p className="text-muted-foreground mt-1">
                    Ruang diskusi dan kolaborasi antar cabang dan pusat.
                </p>
            </div>
            <Outlet />
        </div>
    );
}
