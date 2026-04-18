import { IELTSTrainer } from "@/components/study/IELTSTrainer";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

export default function IELTSpeaking() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col bg-background p-4 md:p-8 relative">
      <div className="mx-auto w-full max-w-4xl flex-1">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/study/dashboard")}
            className="hover:bg-foreground/5 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              IELTS Speaking Simulator
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Speak naturally, and our AI examiner will evaluate your fluency, vocabulary, and grammar.
            </p>
          </div>
        </div>

        <IELTSTrainer />
      </div>
    </div>
  );
}
