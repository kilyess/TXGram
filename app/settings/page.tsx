"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Switch between light and dark themes
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4" />
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={(checked) =>
                                    setTheme(checked ? "dark" : "light")
                                }
                            />
                            <Moon className="h-4 w-4" />
                        </div>
                    </div>
                </Card>

                {/* Add more settings sections as needed */}
            </div>
        </div>
    );
}
