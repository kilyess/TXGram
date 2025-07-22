import { Button } from "@/components/ui/button";
import { FileText, Mic, Upload } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <h1 className="text-4xl font-bold mb-6">
                Transform Text into UML Diagrams
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
                Convert natural language into professional UML diagrams
                instantly using AI. Start with text, voice, or upload existing
                diagrams.
            </p>

            <div className="flex gap-4 mb-12">
                <Link href="/diagrams">
                    <Button size="lg" className="gap-2">
                        <FileText className="w-5 h-5" />
                        Start with Text
                    </Button>
                </Link>
                <Link href="/diagrams">
                    <Button size="lg" variant="outline" className="gap-2">
                        <Mic className="w-5 h-5" />
                        Use Voice Input
                    </Button>
                </Link>
                <Link href="/description">
                    <Button size="lg" variant="outline" className="gap-2">
                        <Upload className="w-5 h-5" />
                        Upload Diagram
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="p-6 rounded-lg border bg-card text-left"
                    >
                        <feature.icon className="w-12 h-12 mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">
                            {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const features = [
    {
        title: "Text to UML",
        description:
            "Convert natural language descriptions into professional UML diagrams instantly.",
        icon: FileText,
    },
    {
        title: "Voice Input",
        description:
            "Speak your diagram descriptions and watch them come to life.",
        icon: Mic,
    },
    {
        title: "Import & Export",
        description:
            "Upload existing diagrams or export in various formats including PNG, SVG, and PDF.",
        icon: Upload,
    },
];
