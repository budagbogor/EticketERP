import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-2 text-xl font-medium">Halaman Tidak Ditemukan</p>
        <p className="mb-6 text-muted-foreground">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link to="/dashboard">
          <Button>
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
