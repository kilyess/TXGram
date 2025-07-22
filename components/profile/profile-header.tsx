"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authUtils } from "@/lib/auth";
import { userOperations } from "@/lib/data";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ProfileHeaderProps {
    user: User;
}

interface RealUser {
    id: string;
    avatar_url: string;
    first_name: string;
    last_name: string;
    email: string;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();
    const [realUser, setRealUser] = useState<RealUser>();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        userOperations.getByUserId(user.id).then(({ data }) => {
            setRealUser(data);
            setFirstName(data?.first_name);
            setLastName(data?.last_name);
        });
    }, [user.id]);

    const handleUpdateProfile = async () => {
        const { data, error } = await userOperations.update(user.id, {
            first_name: firstName,
            last_name: lastName,
        });

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
            setIsEditing(false);
        }
    };

    return (
        <div className="flex items-start gap-6 mb-8">
            <Avatar className="w-24 h-24">
                <AvatarImage src={realUser?.avatar_url} />
                <AvatarFallback>
                    {firstName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-bold">
                        {firstName + " " + lastName}
                    </h1>
                    <Link href="/profile/change-password">
                        <Button variant="outline">Change Password</Button>
                    </Link>
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Button onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={firstName}
                                        onChange={(e) =>
                                            setFirstName(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={lastName}
                                        onChange={(e) =>
                                            setLastName(e.target.value)
                                        }
                                    />
                                </div>
                                <Button onClick={handleUpdateProfile}>
                                    Update Profile
                                </Button>
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                    <Button
                        variant="destructive"
                        onClick={() =>
                            authUtils.signOut().then(() => {
                                window.location.href = "/";
                            })
                        }
                    >
                        Logout
                    </Button>
                </div>
                <p className="text-muted-foreground">{realUser?.email}</p>
            </div>
        </div>
    );
}
