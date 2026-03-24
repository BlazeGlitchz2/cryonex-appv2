import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  hapticFeedback,
  hapticNotification,
  hapticSelection,
  isIOS,
  isIPadOS,
} from "@/lib/mobile";

interface LectureRecorderProps {
  onTranscriptionComplete?: (transcriptionParams: {
    text: string;
    audioStorageId: string;
  }) => void;
}

const getPreferredMimeTypes = (isIOSDevice: boolean) =>
  isIOSDevice
    ? [
        "audio/mp4;codecs=mp4a.40.2",
        "audio/mp4",
        "audio/aac",
        "audio/mpeg",
        "audio/webm",
      ]
    : [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/aac",
        "audio/mpeg",
      ];

export function LectureRecorder({
  onTranscriptionComplete,
}: LectureRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isIOSDevice = isIOS();
  const isIPad = isIPadOS();
  const [permissionState, setPermissionState] =
    useState<PermissionState>("prompt");

  const generateUploadUrl = useMutation(api.study.generateUploadUrl);
  const processAudio = useAction(api.audio.transcribeAudio);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;

    let isMounted = true;
    let permissionStatus: PermissionStatus | null = null;

    const updatePermissionState = () => {
      if (!isMounted || !permissionStatus) return;
      setPermissionState(permissionStatus.state);
    };

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        updatePermissionState();
        status.addEventListener?.("change", updatePermissionState);
      })
      .catch(() => {
        // Permissions API may not be supported; default to prompt.
      });

    return () => {
      isMounted = false;
      permissionStatus?.removeEventListener?.("change", updatePermissionState);
    };
  }, []);

  const startRecording = async () => {
    try {
      if (permissionState === "denied") {
        toast.error(
          "Microphone permission blocked. Open Settings to re-enable recording.",
        );
        await hapticNotification("warning");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error(
          "Microphone recording is not supported on this device yet.",
        );
        await hapticNotification("error");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredMimeTypes(isIOSDevice).find(
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

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Recording failed.");
        void hapticNotification("error");
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      await hapticSelection();
      toast.success(
        isIPad
          ? "iPad recording ready"
          : isIOSDevice
            ? "iPhone recording ready"
            : "Lecture recording started",
      );
    } catch (error) {
      console.error("Mic error:", error);
      toast.error("Failed to access microphone", {
        description: "Please ensure microphone permissions are granted.",
      });
      await hapticNotification("error");
    }
  };

  const stopAndProcess = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    const recorder = mediaRecorderRef.current;
    const stream = recorder.stream;

    setIsRecording(false);
    setIsProcessing(true);
    await hapticFeedback("medium");

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      if (typeof recorder.requestData === "function") {
        recorder.requestData();
      }
    } catch {
      // Some iOS builds ignore requestData; stop still proceeds.
    }

    const finalBlob = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type:
            chunksRef.current[0]?.type ||
            recorder.mimeType ||
            (isIOSDevice ? "audio/mp4" : "audio/webm"),
        });
        resolve(audioBlob);
      };
    });

    try {
      recorder.stop();
    } finally {
      stream.getTracks().forEach((track) => track.stop());
    }

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
      toast.success(
        isIOSDevice
          ? "Recording saved. Transcribing on iPhone..."
          : "Recording saved. Transcribing...",
        {
          icon: <Sparkles className="w-4 h-4 text-cyan-300" />,
        },
      );
      const transcript = await processAudio({ storageId });

      if (transcript.text) {
        toast.success("Transcription complete!");
        await hapticNotification("success");
        onTranscriptionComplete?.({
          text: transcript.text,
          audioStorageId: storageId,
        });
      } else {
        toast.error("Transcription returned empty.");
        await hapticNotification("warning");
      }
    } catch (error) {
      console.error("Upload/Process Error:", error);
      toast.error("Failed to process lecture audio.");
      await hapticNotification("error");
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
      chunksRef.current = [];
      mediaRecorderRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const deviceHintText = isIPad
    ? "Uses iPad-optimized audio capture and handles the tablet mic array."
    : isIOSDevice
      ? "Uses iPhone-friendly audio formats for cleaner uploads."
      : "Uses the best audio format available on this device.";
  const permissionHint =
    permissionState === "denied"
      ? "Microphone permission blocked. Open Settings to continue."
      : permissionState === "granted"
        ? "Microphone access granted."
        : "Tap to allow microphone access when prompted.";

  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        {!isRecording && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-3"
          >
            <Button
              onClick={startRecording}
              variant="outline"
              className={cn(
                "relative group overflow-hidden rounded-full border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10",
                "h-12 px-5 transition-colors",
                isIPad
                  ? "h-[3.5rem] px-6"
                  : isIOSDevice
                    ? "h-[3.25rem] px-6"
                    : "",
              )}
            >
              <Mic className="mr-2 h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">
                {isIPad
                  ? "Start iPad Recording"
                  : isIOSDevice
                    ? "Start iPhone Recording"
                    : "Start Recording"}
              </span>
            </Button>
            <p className="text-center text-[11px] leading-5 text-white/45">
              <span>{deviceHintText}</span>
              <span className="mt-1 block text-[10px] tracking-wide text-white/40">
                {permissionHint}
              </span>
            </p>
          </motion.div>
        )}

        {isRecording && !isProcessing && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="flex min-h-12 items-center gap-3 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2.5"
          >
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm font-bold text-red-300">
                {formatTime(recordingTime)}
              </span>
            </div>

            <div className="h-4 w-px bg-red-500/30" />

            <button
              onClick={stopAndProcess}
              className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-100 transition-colors hover:bg-red-500/35 hover:text-white"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
          </motion.div>
        )}

        {isProcessing && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="flex min-h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5"
          >
            <Loader2 className="h-4 w-4 animate-spin text-white/70" />
            <span className="font-mono text-xs uppercase tracking-wider text-white/70">
              Transcribing
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
