import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onTranscriptionComplete?: (text: string) => void;
}

export function AudioRecorder({
  onRecordingComplete,
  onTranscriptionComplete,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.success("Recording stopped");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-mono text-white mb-4">
              {formatTime(recordingTime)}
            </div>
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-red-400">
                <div className="h-3 w-3 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm">
                  {isPaused ? "Paused" : "Recording..."}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {!isRecording && !audioURL && (
            <Button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button onClick={pauseRecording} variant="outline" size="lg">
                {isPaused ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={stopRecording}
                className="bg-white text-black hover:bg-white/90"
                size="lg"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            </>
          )}

          {audioURL && (
            <>
              <audio src={audioURL} controls className="flex-1" />
              <Button
                onClick={deleteRecording}
                variant="ghost"
                size="sm"
                className="text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
