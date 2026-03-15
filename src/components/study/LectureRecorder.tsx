import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface LectureRecorderProps {
    onTranscriptionComplete?: (transcriptionParams: { text: string; audioStorageId: string }) => void;
}

export function LectureRecorder({ onTranscriptionComplete }: LectureRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const generateUploadUrl = useMutation(api.study.generateUploadUrl);
    const processAudio = useAction(api.audio.transcribeAudio);

    const startRecording = async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                toast.error("Microphone recording is not supported on this device yet.");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = [
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/mp4",
                "audio/aac",
                "audio/mpeg",
            ].find(
                (candidate) =>
                    typeof MediaRecorder !== "undefined" &&
                    typeof MediaRecorder.isTypeSupported === "function" &&
                    MediaRecorder.isTypeSupported(candidate),
            );

            const mediaRecorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start(1000); // collect chunks every second
            setIsRecording(true);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            toast.success("Lecture recording started");
        } catch (error) {
            console.error("Mic error:", error);
            toast.error("Failed to access microphone", {
                description: "Please ensure microphone permissions are granted."
            });
        }
    };

    const stopAndProcess = async () => {
        if (!mediaRecorderRef.current || !isRecording) return;
        setIsRecording(false);
        setIsProcessing(true);

        if (timerRef.current) clearInterval(timerRef.current);

        // Stop tracks
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());

        const finalBlob = new Promise<Blob>((resolve) => {
            mediaRecorderRef.current!.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, {
                    type: chunksRef.current[0]?.type || mediaRecorderRef.current?.mimeType || "audio/webm",
                });
                resolve(audioBlob);
            };
            mediaRecorderRef.current!.stop();
        });

        try {
            const audioBlob = await finalBlob;

            // 1. Upload to Convex Storage
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": audioBlob.type },
                body: audioBlob,
            });

            if (!result.ok) throw new Error("Failed to upload audio chunk");
            const { storageId } = await result.json();

            // 2. Trigger transcription action
            toast.success("Recording saved. Transcribing...", {
                icon: <Sparkles className="w-4 h-4 text-cyan-300" />,
            });
            const transcript = await processAudio({ storageId });

            if (transcript.text) {
                toast.success("Transcription complete!");
                onTranscriptionComplete?.({ text: transcript.text, audioStorageId: storageId });
            } else {
                toast.error("Transcription returned empty.");
            }

        } catch (error) {
            console.error("Upload/Process Error:", error);
            toast.error("Failed to process lecture audio.");
        } finally {
            setIsProcessing(false);
            setRecordingTime(0);
            chunksRef.current = [];
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current?.state === "recording") {
                mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    return (
        <div className="flex justify-center items-center flex-shrink-0">
            <AnimatePresence mode="wait">
                {!isRecording && !isProcessing && (
                    <Button
                        onClick={startRecording}
                        variant="outline"
                        className="relative group overflow-hidden rounded-2xl border-cyan-400/25 bg-cyan-400/10 hover:bg-cyan-400/16 text-cyan-100 hover:border-cyan-300/40 h-11 px-4 transition-all shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/12 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Mic className="h-4 w-4 mr-2" />
                        <span className="font-semibold tracking-wide text-xs uppercase">Record</span>
                    </Button>
                )}

                {isRecording && !isProcessing && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="flex items-center gap-3 bg-rose-500/12 border border-rose-500/30 px-3 h-11 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.15)] backdrop-blur-md"
                    >
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                            <span className="text-xs font-mono font-bold text-red-200">{formatTime(recordingTime)}</span>
                        </div>

                        <div className="w-[1px] h-4 bg-red-500/30 mx-1" />

                        <button
                            onClick={stopAndProcess}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white rounded-md p-1 group transition-colors"
                        >
                            <Square className="h-3.5 w-3.5" />
                        </button>
                    </motion.div>
                )}

                {isProcessing && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="flex items-center gap-2 bg-white/8 border border-white/10 px-4 h-11 rounded-2xl"
                    >
                        <Loader2 className="h-3.5 w-3.5 text-cyan-200 animate-spin" />
                        <span className="text-white/75 font-medium text-xs">Transcribing...</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
