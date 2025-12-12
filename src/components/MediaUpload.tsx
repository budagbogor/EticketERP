import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";

export interface MediaFile {
    name: string;
    type: string;
    data: string; // base64
    size: number;
    preview?: string; // for display
}

interface MediaUploadProps {
    files: MediaFile[];
    onChange: (files: MediaFile[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
}

export function MediaUpload({
    files,
    onChange,
    maxFiles = 3,
    maxSizeMB = 5
}: MediaUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const acceptedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/quicktime",
    ];

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            return `File type tidak didukung. Hanya foto (JPG, PNG, GIF, WebP) dan video (MP4, WebM, MOV) yang diperbolehkan.`;
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB per file.`;
        }

        return null;
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;

        const remainingSlots = maxFiles - files.length;
        if (remainingSlots <= 0) {
            toast.error(`Maksimal ${maxFiles} file yang dapat diupload`);
            return;
        }

        const filesToProcess = Array.from(fileList).slice(0, remainingSlots);
        const newFiles: MediaFile[] = [];

        for (const file of filesToProcess) {
            const error = validateFile(file);
            if (error) {
                toast.error(error);
                continue;
            }

            try {
                const base64Data = await convertToBase64(file);
                newFiles.push({
                    name: file.name,
                    type: file.type,
                    data: base64Data,
                    size: file.size,
                    preview: base64Data,
                });
            } catch (error) {
                toast.error(`Gagal memproses file: ${file.name}`);
            }
        }

        if (newFiles.length > 0) {
            onChange([...files, ...newFiles]);
            toast.success(`${newFiles.length} file berhasil ditambahkan`);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // Reset input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
        toast.success("File dihapus");
    };

    const isImage = (type: string) => type.startsWith("image/");
    const isVideo = (type: string) => type.startsWith("video/");

    return (
        <div className="space-y-3">
            <Label>
                Upload Foto/Video <span className="text-muted-foreground text-xs">(Maksimal {maxFiles} file, {maxSizeMB}MB per file)</span>
            </Label>

            {/* Upload Area */}
            {files.length < maxFiles && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                        Klik atau drag & drop file di sini
                    </p>
                    <p className="text-xs text-muted-foreground">
                        JPG, PNG, GIF, WebP, MP4, WebM, MOV (max {maxSizeMB}MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedTypes.join(",")}
                        onChange={handleFileInput}
                        className="hidden"
                    />
                </div>
            )}

            {/* File Previews */}
            {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="relative border rounded-lg overflow-hidden bg-muted/30 group"
                        >
                            {/* Preview */}
                            <div className="aspect-video bg-muted flex items-center justify-center">
                                {isImage(file.type) ? (
                                    <img
                                        src={file.preview}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : isVideo(file.type) ? (
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <Video className="w-12 h-12 text-muted-foreground mb-2" />
                                        <p className="text-xs text-center text-muted-foreground break-all">
                                            {file.name}
                                        </p>
                                    </div>
                                ) : (
                                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                )}
                            </div>

                            {/* File Info */}
                            <div className="p-2 bg-background">
                                <p className="text-xs font-medium truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>

                            {/* Remove Button */}
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeFile(index)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {files.length >= maxFiles && (
                <p className="text-sm text-muted-foreground text-center">
                    Maksimal {maxFiles} file telah tercapai
                </p>
            )}
        </div>
    );
}
