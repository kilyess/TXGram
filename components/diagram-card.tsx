"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { diagramOperations } from "@/lib/data";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash2 } from "lucide-react";
import Image from "next/image";

interface DiagramCardProps {
    diagram: {
        id: string;
        name: string;
        modified_at: Date;
        thumbnail: string;
    };
    view: "grid" | "list";
    onClick: () => void;
}

export function DiagramCard({ diagram, view, onClick }: DiagramCardProps) {
    const handleDelete = async (id: string) => {
        const { error } = await diagramOperations.delete(id);
        if (error) {
            console.error(error);
            return;
        } else {
            window.location.reload();
        }
    };
    if (view === "list") {
        return (
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div
                        className="relative w-16 h-16 cursor-pointer"
                        onClick={onClick}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                            alt={diagram.name}
                            fill
                            className="object-cover rounded"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold">{diagram.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Updated {formatDistanceToNow(diagram.modified_at)}{" "}
                            ago
                        </p>
                    </div>
                    <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                            if (
                                confirm(
                                    "Are you sure you want to delete this diagram?"
                                )
                            ) {
                                handleDelete(diagram.id);
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <div
                className="relative aspect-video cursor-pointer"
                onClick={onClick}
            >
                <Image
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    alt={diagram.name}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold">{diagram.name}</h3>
                    </div>
                    <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                            if (
                                confirm(
                                    "Are you sure you want to delete this diagram?"
                                )
                            ) {
                                handleDelete(diagram.id);
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Updated {formatDistanceToNow(diagram.modified_at)} ago
                </p>
            </div>
        </Card>
    );
}
