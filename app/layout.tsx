import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TXGram",
    description: "Convert text to UML diagrams with ease",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <div className="flex h-screen">
                        <Sidebar />
                        <main className="flex-1 overflow-y-auto bg-background">
                            {children}
                        </main>
                    </div>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
