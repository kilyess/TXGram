"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authUtils } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignInForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { toast } = useToast();
    const router = useRouter();

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsLoading(true);

        try {
            const { user, error } = await authUtils.signIn(email, password);
            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
                return;
            }

            if (user) {
                toast({
                    title: "Success",
                    description: "You have successfully signed in.",
                });
                router.push("/");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while signing in.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email2"
                            placeholder="name@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password2"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button disabled={isLoading}>
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In
                    </Button>
                </div>
            </form>
        </div>
    );
}
