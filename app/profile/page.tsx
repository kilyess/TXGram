"use client";

import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthenticatedProfile } from "@/components/profile/authenticated-profile";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authUtils } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { user } = await authUtils.getCurrentUser();
            setIsAuthenticated(!!user);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <AuthenticatedProfile />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
            <Card className="w-full max-w-md p-6">
                <div className="flex flex-col items-center mb-6">
                    <Image
                        src="/icon/Logo (Dark).png"
                        alt="TXGram"
                        width={72}
                        height={72}
                        className="shrink-0 dark:hidden mb-3"
                    />
                    <Image
                        src="/icon/Logo (Light).png"
                        alt="TXGram"
                        width={72}
                        height={72}
                        className="shrink-0 hidden dark:block mb-3"
                    />
                    <h1 className="text-2xl font-bold">Welcome to TXGram</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage your UML diagrams with ease
                    </p>
                </div>

                <Tabs defaultValue="sign-in">
                    <TabsList className="grid grid-cols-2 w-full mb-6">
                        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                        <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sign-in">
                        <SignInForm />
                    </TabsContent>
                    <TabsContent value="sign-up">
                        <SignUpForm />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}
