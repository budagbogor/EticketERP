import { useEffect, useState, useMemo } from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, FileText, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/hooks/useComplaints";
import { useBukuPintar } from "@/hooks/use-buku-pintar";

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { data: complaints } = useComplaints();
    const { vehicles } = useBukuPintar();

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSelectTicket = (id: string) => {
        setOpen(false);
        // Assuming there's a ticket detail page or just go to dashboard for now
        // If specific ticket route exists: navigate(\`/tickets/\${id}\`);
        navigate("/dashboard");
    };

    const handleSelectVehicle = () => {
        setOpen(false);
        navigate("/buku-pintar");
    };

    // Flatten vehicle data for search
    const searchableVehicles = useMemo(() => {
        if (!vehicles) return [];
        return vehicles.flatMap(v =>
            v.variants.map(varData => ({
                id: varData.id,
                brand: v.brand,
                model: v.model,
                variant: varData.name,
                year: \`\${v.year_start}\${v.year_end ? ' - ' + v.year_end : ' - Sekarang'}\`,
                fullName: \`\${v.brand} \${v.model} \${varData.name}\`
            }))
        );
    }, [vehicles]);

    return (
        <>
            <Button
                variant="outline"
                className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64 bg-secondary/50 border-0 hover:bg-secondary"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">Cari tiket, kendaraan...</span>
                <span className="inline-flex lg:hidden">Cari...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                    
                    <CommandSeparator />

                    {searchableVehicles && searchableVehicles.length > 0 && (
                        <CommandGroup heading="Buku Pintar (Database Kendaraan)">
                            {searchableVehicles.slice(0, 10).map((vehicle) => (
                                <CommandItem
                                    key={vehicle.id}
                                    onSelect={handleSelectVehicle}
                                    value={vehicle.fullName}
                                >
                                    <Car className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{vehicle.brand} {vehicle.model} - {vehicle.variant}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {vehicle.year}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
