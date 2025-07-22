"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface DiagramUploaderProps {
    onFileSelect: (previewUrl: string, base64Image: string) => void; // Callback to pass both the preview URL and base64-encoded image
}

export function DiagramUploader({ onFileSelect }: DiagramUploaderProps) {
    const [preview, setPreview] = useState<string>(""); // Stores the preview URL

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                // Generate the preview URL for the UI
                const previewUrl = URL.createObjectURL(file);
                setPreview(previewUrl);

                // Read the file as a base64-encoded string for the API
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result as string; // Get the base64-encoded image
                    onFileSelect(previewUrl, base64); // Pass both the preview URL and base64-encoded image to the parent
                };
                reader.readAsDataURL(file); // Read the file as a data URL
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".svg"],
        },
        maxFiles: 1,
    });

    const clearPreview = () => {
        setPreview(""); // Clear the preview
        onFileSelect("", ""); // Notify the parent that the preview is cleared
    };

    if (preview) {
        return (
            <div className="relative flex-1 bg-muted/50 rounded-md overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={clearPreview}
                >
                    <X className="h-4 w-4" />
                </Button>
                <Image
                    src={preview} // Use the preview URL for the UI
                    alt="Uploaded diagram"
                    fill
                    className="object-contain p-4"
                />
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-md p-8 cursor-pointer transition-colors",
                isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
            )}
        >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
                <p className="text-sm font-medium">
                    Drag & drop your diagram here
                </p>
                <p className="text-sm text-muted-foreground">
                    or click to select a file
                </p>
            </div>
            <p className="text-xs text-muted-foreground">
                Supports PNG, JPG, JPEG, and SVG
            </p>
        </div>
    );
}
