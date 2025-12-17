import { WiperDataProvider } from "@/contexts/WiperDataContext";
import { WiperFinder } from "@/components/wiper/WiperFinder";
import { AddWiperDataDialog } from "@/components/wiper/AddWiperDataDialog";
import { ImportWiperDataDialog } from "@/components/wiper/ImportWiperDataDialog";

const WiperFitFinder = () => {
    return (
        <WiperDataProvider>
            <div className="container mx-auto py-6">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Pencari Ukuran Wiper</h1>
                        <p className="text-muted-foreground mt-2">
                            Temukan ukuran wiper yang tepat untuk setiap kendaraan di bengkel Anda
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <AddWiperDataDialog />
                        <ImportWiperDataDialog />
                    </div>
                </div>
                <WiperFinder />
            </div>
        </WiperDataProvider>
    );
};

export default WiperFitFinder;
