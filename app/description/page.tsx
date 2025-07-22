"use client";

import { DiagramUploader } from "@/components/diagram-uploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Groq from "groq-sdk";
import { ArrowLeft, Copy, Loader2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ExtractDiagramPage() {
    const [extractedText, setExtractedText] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [base64Image, setBase64Image] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const groq = new Groq({
        apiKey: "",
        dangerouslyAllowBrowser: true,
    });

    const handleExtract = async () => {
        if (!base64Image) {
            alert("Please upload an image first.");
            return;
        }

        setIsGenerating(true);
        try {
            // Extract the base64 data from the data URL
            const base64Data = base64Image.split(",")[1];

            // Call the Groq API
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Analyze this UML diagram and provide: \n1. Brief overview (2-3 sentences)\n2. List of key components\n3. User stories in format: 'As a [role], I want to [action] so that [benefit]'\nKeep the total response under 300 words. All in french.",
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Data}`,
                                },
                            },
                        ],
                    },
                ],
                model: "llama-3.2-11b-vision-preview",
                temperature: 1,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null,
            });

            // Set the extracted text
            setExtractedText(
                chatCompletion.choices[0].message.content as string
            );
            setIsGenerating(false);
        } catch (error) {
            console.error("Error extracting text:", error);
            setExtractedText("Failed to extract text. Please try again.");
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        const outputContainer = document.getElementById("tx-gram-output");
        const image = outputContainer?.querySelector("img");

        if (!image) {
            console.log("No image found to copy.");
            return;
        }

        try {
            // Fetch the image as a Blob
            const response = await fetch(image.src);
            if (!response.ok) {
                throw new Error("Failed to fetch the image.");
            }

            const blob = await response.blob();

            // Write the Blob to the clipboard
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);

            console.log("Image copied to clipboard!");
        } catch (error) {
            console.error("Failed to copy image:", error);
            console.log("Failed to copy image.");
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="border-b">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-semibold">
                            Extract from Diagram
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
                <Card className="p-4 flex flex-col gap-2">
                    <div className="flex items-center p-1">
                        <h2 className="font-semibold mb-2">Upload Diagram</h2>
                        <div className="flex-1" />
                        <Button
                            onClick={handleExtract}
                            variant="ghost"
                            className="gap-2"
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Wand2 className="w-4 h-4" />
                            )}
                            Extract Text
                        </Button>
                    </div>
                    <DiagramUploader
                        onFileSelect={(previewUrl, base64Image) => {
                            setPreviewUrl(previewUrl); // Set the preview URL for the UI
                            setBase64Image(base64Image); // Set the base64-encoded image for the API
                        }}
                    />
                </Card>
                <Card className="p-4 flex flex-col gap-2">
                    <div className="flex items-center p-1">
                        <h2 className="font-semibold mb-2">Extracted Text</h2>
                        <div className="flex-1" />
                        <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" onClick={handleCopy} />
                        </Button>
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-md p-4 overflow-y-auto text-sm">
                        <ReactMarkdown>
                            {extractedText ||
                                "The extracted text will appear here..."}
                        </ReactMarkdown>
                    </div>
                </Card>
            </div>
        </div>
    );
}
