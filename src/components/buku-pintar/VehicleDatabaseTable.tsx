import { useState, useMemo } from "react";
import { Vehicle, VehicleVariant } from "@/types/buku-pintar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { DeleteVariantDialog } from "@/components/buku-pintar/DeleteVariantDialog";
import { bukuPintarData } from "@/lib/buku-pintar-data";

interface VehicleDatabaseTableProps {
    vehicles: Vehicle[];
    onSelect: (vehicle: Vehicle, variant: VehicleVariant) => void;
    onDelete: (brandName: string, modelName: string, variantId: string) => void;
}

export function VehicleDatabaseTable({ vehicles, onSelect, onDelete }: VehicleDatabaseTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Flatten data for table view
    const flatData = useMemo(() => {
        return vehicles.flatMap(vehicle => {
            return vehicle.variants.map(variant => {
                // Check if this variant is from mock data (not deletable)
                const isMockData = bukuPintarData.some(
                    mockVehicle =>
                        mockVehicle.brand.toLowerCase() === vehicle.brand.toLowerCase() &&
                        mockVehicle.model.toLowerCase() === vehicle.model.toLowerCase() &&
                        mockVehicle.variants.some(mockVariant => mockVariant.id === variant.id)
                );

                return {
                    id: variant.id,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    yearStart: variant.year_start || vehicle.year_start,
                    yearEnd: variant.year_end || vehicle.year_end,
                    variant: variant.name,
                    transmission: variant.transmission,
                    engineCode: variant.engine_code,
                    isCustom: !isMockData,
                    // Include full objects for selection
                    originalVehicle: vehicle,
                    originalVariant: variant
                };
            });
        });
    }, [vehicles]);

    // Filter data
    const filteredData = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return flatData.filter(item =>
            item.brand.toLowerCase().includes(lowerSearch) ||
            item.model.toLowerCase().includes(lowerSearch) ||
            item.variant.toLowerCase().includes(lowerSearch) ||
            item.engineCode.toLowerCase().includes(lowerSearch)
        );
    }, [flatData, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari kendaraan..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                        className="pl-8"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Total: {filteredData.length} Varian
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Merek</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Tahun</TableHead>
                            <TableHead>Varian</TableHead>
                            <TableHead>Transmisi</TableHead>
                            <TableHead>Kode Mesin</TableHead>
                            <TableHead className="w-[80px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => onSelect(item.originalVehicle, item.originalVariant)}
                                >
                                    <TableCell className="font-medium">{item.brand}</TableCell>
                                    <TableCell>{item.model}</TableCell>
                                    <TableCell>
                                        {item.yearStart} - {item.yearEnd || "Sekarang"}
                                    </TableCell>
                                    <TableCell>{item.variant}</TableCell>
                                    <TableCell>{item.transmission}</TableCell>
                                    <TableCell>{item.engineCode}</TableCell>
                                    <TableCell>
                                        {item.isCustom ? (
                                            <DeleteVariantDialog
                                                vehicle={item.originalVehicle}
                                                variant={item.originalVariant}
                                                onDelete={onDelete}
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Tidak ada data ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages || 1}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
