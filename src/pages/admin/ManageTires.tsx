import TireDataManagement from "@/pages/TireDataManagement";

interface ManageTiresProps {
    isEmbedded?: boolean;
}

export default function ManageTires({ isEmbedded = false }: ManageTiresProps) {
    return <TireDataManagement isEmbedded={isEmbedded} />;
}
