"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    FolderOpen,
    Settings,
    User2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const routes = [
    {
        label: "Diagrams",
        icon: FolderOpen,
        href: "/diagrams",
    },
    {
        label: "New Extraction",
        icon: FileText,
        href: "/description",
    },
    {
        label: "Profile",
        icon: User2,
        href: "/profile",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="relative">
            <div
                className={cn(
                    "space-y-4 py-4 flex flex-col h-screen bg-muted/50 border-r transition-all duration-300",
                    isCollapsed ? "w-[60px]" : "w-[200px]"
                )}
            >
                <div className="px-3 py-2">
                    <Link href="/">
                        <div
                            className={cn(
                                "flex items-center pl-3 mb-14 transition-all duration-300",
                                isCollapsed && "justify-center pl-0"
                            )}
                        >
                            <Image
                                src="/icon/Logo (Dark).png"
                                alt="TXGram"
                                width={42}
                                height={42}
                                className="shrink-0 dark:hidden"
                            />
                            <Image
                                src="/icon/Logo (Light).png"
                                alt="TXGram"
                                width={42}
                                height={42}
                                className="shrink-0 hidden dark:block"
                            />
                            {!isCollapsed && (
                                <h1 className="text-xl font-bold ml-2">
                                    TXGram
                                </h1>
                            )}
                        </div>
                    </Link>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={
                                    pathname === route.href
                                        ? "secondary"
                                        : "ghost"
                                }
                                className={cn(
                                    "w-full justify-start",
                                    pathname === route.href && "bg-secondary",
                                    isCollapsed && "justify-center px-2"
                                )}
                                asChild
                            >
                                <Link href={route.href}>
                                    <route.icon
                                        className={cn(
                                            "h-5 w-5",
                                            !isCollapsed && "mr-3"
                                        )}
                                    />
                                    {!isCollapsed && route.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-4 top-6 h-8 w-8 rounded-full border shadow-md bg-background"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
