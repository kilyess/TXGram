"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import VoiceRecorder from "@/components/voice-recorder";
import { authUtils } from "@/lib/auth";
import { diagramOperations } from "@/lib/data";
import Groq from "groq-sdk";
import {
    ArrowLeft,
    Copy,
    Download,
    Loader2,
    Mic,
    Save,
    Wand2,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import Script from "next/script";
import React, { useEffect, useState } from "react";

export default function NewDiagramPage({ params }: any) {
    const [description, setDescription] = useState("");
    const [activeTab, setActiveTab] = useState("description");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [diagram, setDiagram] = useState(null);
    const [name, setName] = useState("");
    const router = useRouter();
    const { id }: any = React.use(params);
    const [isSpinning, setIsSpinning] = useState(false);
    const [client, setClient] = useState<Groq>();
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const client = new Groq({
            apiKey: "",
            dangerouslyAllowBrowser: true,
        });
        setClient(client);
        const fetchData = async () => {
            const { data, error } = await diagramOperations.getById(id);
            if (error) {
                router.push("/diagrams");
            }
            setDiagram(data);
            setName(data.name);
            window.localStorage.setItem("firstCode", data.code);
        };

        const checkAuth = async () => {
            const { user } = await authUtils.getCurrentUser();
            setIsAuthenticated(!!user);
            if (!user) {
                setIsLoading(false);
                redirect("/profile");
            }
            setIsLoading(false);
        };

        fetchData();
        checkAuth();
    }, [id, router]);

    const fetchChatCompletion = async (question: string) => {
        const chatCompletion = await client?.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: question,
                },
            ],
            max_tokens: 500,
        });

        return chatCompletion?.choices[0].message.content;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push("/profile");
    }

    const generateUserStories = async () => {
        return await fetchChatCompletion(
            "Generate user stories from this description (in this form: 'User Story 1:' and so on, don't add any explanation or details only the user stories), and include the type of the diagram at the top: " +
                description
        );
    };

    const handleGenerate = async () => {
        if (!description) {
            return;
        }
        setIsGenerating(true);
        try {
            const userStories = await generateUserStories();
            const text = `

Based on the DSL grammar provided below, generate the corresponding uml diagram for the provided user stories, any names or identifiers in the diagram should not contain any spaces or special characters, only use camelCase or snake_case, and the type of the diagram should be at the top of the code (for example: type useCaseDiagram), remember only the dsl grammar, don't add any explanation or details, also don't add any extra spaces or new lines, only the dsl grammar and the diagram should be under one name. Give the code in a format suited to be pasted directly in a vscode editor, and don't exceed 70 lines of code (note: if u want to name something with database, use Database instead of database, and if u want to name something with participant, use Participant, and if u want to name something with collection, use Collection):
grammar TXGram

entry Model:
    'type' diagramType=DiagramType
    diagrams+=Diagram*;

DiagramType:
    USE_CASE='useCaseDiagram' |
    SEQUENCE='sequenceDiagram';

Diagram:
    UseCaseDiagram | SequenceDiagram | ClassDiagram | ActivityDiagram;

UseCaseDiagram:
    'useCaseDiagram' name=ID ':'
        ('actors:' actors+=Actor (',' actors+=Actor)*)?
        ('rectangles:' rectangles+=Rectangle (',' rectangles+=Rectangle)*)?
        ('useCases:' useCases+=UseCase*)?
        ('relationships:' relations+=Relation*)?;

Actor:
    name=ID;

Rectangle:
    name=ID;

UseCase:
    'useCase' name=ID ':'
        'description:' description=STRING
        ('extensionPoints:' extensionPoints+=ExtensionPoint (',' extensionPoints+=ExtensionPoint)*)?;

Relation:
    '-' 'from:' from=[Element]
        'to:' to=[Element]
        'type:' type=('normal' | 'extension' | 'inclusion')
        ('direction:' direction=('up' | 'down' | 'left' | 'right'))?
        ('length:' length=INT)?;

Element:
    Actor | UseCase | Rectangle;

ExtensionPoint:
    name=STRING;

SequenceDiagram:
    'sequenceDiagram' name=ID ':'
        'lifelines:' lifelines+=Lifeline*
        ('interactions:' 
            (interactions+=Interaction | interactions+=Execution | interactions+=Group)*
        )?;

Lifeline:
    '-' 'name:' name=ID
        'type:' type=('participant' | 'actor' | 'boundary' | 'control' | 'entity' | 'database' | 'collections' | 'queue');

Interaction:
    '-' 'from:' from=[Lifeline]
        'to:' to=[Lifeline]
        'type:' type=('synchronousCall' | 'asynchronousCall' | 'return' | 'lost' | 'found')
        ('message:' message=STRING)?;

Execution:
    '-' 'execution' lifeline=[Lifeline] ':' type=('start' | 'end');

Group:
    '-' 'group' operator=('alt' | 'loop' | 'par' | 'break') ':'
        branches+=Branch*;

Branch:
    '*' 'label:' label=STRING
        ('subInteractions:' (interactions+=Interaction | interactions+=Execution | interactions+=Group)*)?;

ClassDiagram:
    'classDiagram' name=ID ':'
        'classes:' classes+=Class*
        ('relationships:' relationships+=Relationship*)?;

here is an example of a grammar generated for a sequence diagram:
type sequenceDiagram

sequenceDiagram test:
  lifelines:
    - name: User
      type: actor
    - name: System
      type: participant
    - name: Database
      type: database
  interactions:
    - from: User
      to: System
      type: synchronousCall
      message: "Login"
    - group alt:
      * label: "User data?"
        subInteractions:
          - from: System
            to: Database
            type: synchronousCall
            message: "SELECT * FROM users WHERE username = 'admin'"
          - execution Database: start
          - from: Database
            to: System
            type: asynchronousCall
            message: "User data"
          - execution Database: end
      * label: "No user data"
        subInteractions:
          - from: System
            to: Database
            type: synchronousCall
            message: "Failed to retrieve user data"
          - from: Database
            to: System
            type: asynchronousCall
            message: "Error"
          - group alt:
            * label: "User data?"
              subInteractions:
                - from: System
                  to: Database
                  type: synchronousCall
                  message: "SELECT * FROM users WHERE username = 'admin'"
                - execution Database: start
                - from: Database
                  to: System
                  type: asynchronousCall
                  message: "User data"
                - execution Database: end

here is an example of a grammar generated for a use case diagram:
type useCaseDiagram

useCaseDiagram OnlineShoppingSystem:
    actors: Customer, Admin

    useCases:
        useCase BrowseItems:
            description: "Browse the list of available items."
            extensionPoints: "search filter", "view item details"
        useCase AddToCart:
            description: "Add items to their shopping cart."
            extensionPoints: "item availability"
        useCase Checkout:
            description: "Complete their purchase."
            extensionPoints: "payment gateway", "shipping details"
        useCase ViewItemDetails:
            description: "Display detailed information about an item."
        useCase VerifyPayment:
            description: "Verify payment details during checkout."
        useCase ManageItems:
            description: "Add, update, or remove items from the store."
        useCase ProcessOrders:
            description: "Process customer orders."

    relationships:
        - from: Customer
          to: BrowseItems
          type: normal
          direction: up
          length: 2
        - from: Customer
          to: AddToCart
          type: normal
          direction: up
          length: 2
        - from: Customer
          to: Checkout
          type: normal
          direction: up
          length: 2
        - from: Admin
          to: ManageItems
          type: normal
          length: 2
        - from: Admin
          to: ProcessOrders
          type: normal
          length: 2
        - from: ViewItemDetails
          to: BrowseItems
          type: extension
          length: 2
        - from: VerifyPayment
          to: Checkout
          type: extension
          length: 2
        - from: Checkout
          to: AddToCart
          type: inclusion
          length: 2
        `;

            const code = await fetchChatCompletion(userStories + "\n\n" + text);
            window.localStorage.setItem("AICode", code || "");
        } finally {
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

    const handleDownload = async () => {
        const outputContainer = document.getElementById("tx-gram-output");
        const image = outputContainer?.querySelector("img");

        if (!image) {
            console.log("No image found to download.");
            return;
        }

        try {
            // Fetch the image as a Blob
            const response = await fetch(image.src);
            if (!response.ok) {
                throw new Error("Failed to fetch the image.");
            }

            const blob = await response.blob();

            // Create a temporary URL for the Blob
            const url = URL.createObjectURL(blob);

            // Create a temporary anchor element to trigger the download
            const link = document.createElement("a");
            link.href = url;
            link.download = "diagram.png"; // Set the default filename
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log("Image downloaded successfully!");
        } catch (error) {
            console.error("Failed to download image:", error);
        }
    };

    const handleSave = async () => {
        setIsSpinning(true);
        try {
            await diagramOperations.update(id, {
                name: name,
                code: window.localStorage.getItem("mainCode") || "",
            });
            setIsSpinning(false);
        } catch (err) {
            console.error("Failed to save diagram:", err);
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="border-b">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <a href="/diagrams">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </a>
                        <Input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                        ></Input>
                        {isSpinning && (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span>Saving..</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1" />
                    <Button
                        onClick={handleSave}
                        variant="ghost"
                        className="gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
                <Card className="p-4 flex flex-col">
                    <Tabs
                        defaultValue="description"
                        className="flex-1 flex flex-col"
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value)}
                    >
                        <div className="flex items-center p-1">
                            <TabsList>
                                <TabsTrigger value="description">
                                    Description
                                </TabsTrigger>
                                <TabsTrigger value="editor">Editor</TabsTrigger>
                            </TabsList>
                            {activeTab === "description" && (
                                <>
                                    <div className="flex-1" />
                                    <VoiceRecorder
                                        onTranscriptionComplete={(text) =>
                                            setDescription(text)
                                        }
                                        groqClient={client}
                                    />
                                    <Separator
                                        orientation="vertical"
                                        className="mx-2 h-6"
                                    />
                                    <Button
                                        onClick={handleGenerate}
                                        variant="ghost"
                                        className="gap-2"
                                        id="generate-button"
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Wand2 className="w-4 h-4" />
                                        )}
                                        Generate Diagram
                                    </Button>
                                </>
                            )}
                        </div>
                        <Card className="flex-1 flex flex-col overflow-hidden border-0 mt-2">
                            <TabsContent
                                value="description"
                                className="flex-1 relative m-0 data-[state=active]:flex flex-col"
                            >
                                <Textarea
                                    placeholder="Describe your system or process in natural language..."
                                    className="flex-1 resize-none h-full"
                                    value={description}
                                    onChange={(e) => {
                                        if (
                                            e.target.value.split(/\s+/)
                                                .length <= 2000
                                        ) {
                                            setDescription(e.target.value);
                                        }
                                    }}
                                />
                                <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                                    {
                                        description
                                            .split(/\s+/)
                                            .filter((word) => word.length > 0)
                                            .length
                                    }{" "}
                                    / 2000 words
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="editor"
                                className="flex-1 m-0 data-[state=active]:flex"
                            >
                                <div
                                    id="monaco-editor-root"
                                    className="w-full h-full"
                                />
                            </TabsContent>
                        </Card>
                    </Tabs>
                </Card>
                <Card className="p-4 flex flex-col max-h-full">
                    <div className="flex items-center p-1">
                        <h2 className="font-semibold mb-2">Preview</h2>
                        <div className="flex-1" />
                        <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" onClick={handleCopy} />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Download
                                className="h-4 w-4"
                                onClick={handleDownload}
                            />
                        </Button>
                    </div>
                    <Card className="flex-1 mt-3 overflow-hidden max-h-full">
                        <div
                            id="tx-gram-output"
                            className="bg-muted/50 flex justify-center items-center w-full h-full"
                        />
                    </Card>
                </Card>
            </div>
            <Script src="/tx-gram.js" strategy="lazyOnload" />
        </div>
    );
}
