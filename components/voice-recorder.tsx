"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Mic, Square } from "lucide-react";
import React, { useRef, useState } from "react";

interface VoiceRecorderProps {
    onTranscriptionComplete: (text: string) => void;
    groqClient: any;
    isDisabled?: boolean;
}

export default function VoiceRecorder({
    onTranscriptionComplete,
    groqClient,
    isDisabled = false,
}: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, {
                    type: "audio/webm",
                });
                await processAudioToText(audioBlob);

                // Stop all tracks in the stream
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processAudioToText = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            // Convert Blob to File
            const file = new File([audioBlob], "recording.webm", {
                type: "audio/webm",
            });

            // Create FormData with the file
            const formData = new FormData();
            formData.append("file", file);
            formData.append("model", "whisper-large-v3");
            formData.append(
                "prompt",
                "You are a transcription assistant. Convert the following audio to text."
            );

            const transcription = await groqClient.audio.transcriptions.create({
                file: file,
                model: "whisper-large-v3",
                prompt: "You are a transcription assistant. Convert the following audio to text.",
            });

            onTranscriptionComplete(transcription.text);
        } catch (error) {
            console.error("Error processing audio:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isDisabled || isProcessing}
        >
            {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
                <Square className="h-4 w-4 text-red-500" />
            ) : (
                <Mic className="h-4 w-4" />
            )}
        </Button>
    );
}
