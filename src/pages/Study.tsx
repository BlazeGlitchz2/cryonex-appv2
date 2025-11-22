import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { BookOpen } from "lucide-react";

export default function Study() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Center</h1>
            <p className="text-muted-foreground">Upload documents and start learning.</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <StudyUploadZone />
        </div>
      </div>
    </div>
  );
}