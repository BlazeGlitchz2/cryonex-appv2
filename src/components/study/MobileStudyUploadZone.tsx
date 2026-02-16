import {
    Upload,
    X,
    CheckCircle,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStudyUpload } from "@/hooks/use-study-upload";

interface MobileStudyUploadZoneProps {
    onUploadComplete?: (docId: string) => void;
}

export function MobileStudyUploadZone({ onUploadComplete }: MobileStudyUploadZoneProps) {
    const {
        files,
        handleFileSelect,
        removeFile,
        retryUpload,
        STEP_LABELS,
        statusToStepIndex,
    } = useStudyUpload({ onUploadComplete });

    return (
        <div className="space-y-4 p-4 pb-8">
            {/* Mobile-optimized Upload Button */}
            <div className="space-y-4">
                <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="mobile-file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.mp4,.webm,.mov,.mp3,.wav,.m4a"
                />
                <Button
                    className="w-full h-14 bg-white text-black hover:bg-white/90 text-lg font-medium shadow-lg shadow-white/10"
                    onClick={() => document.getElementById("mobile-file-upload")?.click()}
                >
                    <Upload className="h-5 w-5 mr-3" />
                    Select Files
                </Button>
                <p className="text-xs text-center text-[#6b6b6b]">
                    Supported: PDF, Video, Audio, Image
                </p>
            </div>

            {/* Upload Progress List for Mobile */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        {files.map((file) => {
                            const currentStep = statusToStepIndex(file.status);
                            return (
                                <Card key={file.id} className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
                                    <CardContent className="p-3">
                                        <div className="flex gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 mt-1">
                                                {file.status === "complete" ? (
                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                ) : file.status === "error" ? (
                                                    <X className="h-5 w-5 text-red-400" />
                                                ) : (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium text-white truncate max-w-[150px]">
                                                        {file.name}
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFile(file.id)}
                                                        className="h-8 w-8 text-white/50 hover:text-white"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Simplified Progress for Mobile */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-[#6b6b6b]">
                                                            {file.statusMessage || file.status}
                                                        </span>
                                                        <span className="text-white/60 font-mono">
                                                            {file.progress}%
                                                        </span>
                                                    </div>
                                                    <Progress value={file.progress} className="h-1.5" />
                                                </div>

                                                {file.status === "error" && (
                                                    <div className="mt-2 flex justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs border-white/20 text-white"
                                                            onClick={() => retryUpload(file.id)}
                                                        >
                                                            Retry
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
