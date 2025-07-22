"use client";

import { DiagramCard } from "@/components/diagram-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authUtils } from "@/lib/auth";
import { diagramOperations } from "@/lib/data";
import { Grid, List, Loader2, Plus, Search } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiagramsPage() {
    const [view, setView] = useState<"grid" | "list">("grid");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [diagrams, setDiagrams] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { user } = await authUtils.getCurrentUser();
            setIsAuthenticated(!!user);
            if (!user) {
                setIsLoading(false);
                redirect("/profile");
            }
            setIsLoading(false);
            setUser(user);
        };

        checkAuth();
    }, []);

    useEffect(() => {
        const fetchDiagrams = async () => {
            if (!user) return;
            const { data, error } = await diagramOperations.getAllByUser(
                user.id
            );
            if (data) {
                setDiagrams(data);
            } else if (error) {
                console.error(error);
                return;
            }
        };

        fetchDiagrams();
    }, [user]);

    const handleCreate = async () => {
        setIsCreating(true);
        const { data, error } = await diagramOperations.create({
            name: "Untitled Diagram",
            code: "// Start typing your code here...",
            user_id: user.id,
        });
        if (error) {
            console.error(error);
            return;
        }
        router.push(`/diagrams/${data.id}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Diagrams</h1>
                <Button className="gap-2" onClick={handleCreate}>
                    {isCreating ? (
                        "Creating..."
                    ) : (
                        <>
                            <Plus className="w-4 h-4" /> New Diagram
                        </>
                    )}
                </Button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search diagrams..." className="pl-10" />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={view === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setView("grid")}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === "list" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setView("list")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div
                className={
                    view === "grid" ? "grid grid-cols-3 gap-6" : "space-y-4"
                }
            >
                {diagrams.map((diagram) => (
                    <DiagramCard
                        key={diagram.id}
                        diagram={diagram}
                        view={view}
                        onClick={() => {
                            router.push(`/diagrams/${diagram.id}`);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
