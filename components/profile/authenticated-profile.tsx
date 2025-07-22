"use client";

import { authUtils } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileHeader } from "./profile-header";

export function AuthenticatedProfile() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { user } = await authUtils.getCurrentUser();
            setUser(user);
        };
        checkAuth();
    }, []);

    if (!user) {
        return null;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <ProfileHeader user={user} />
        </div>
    );
}
