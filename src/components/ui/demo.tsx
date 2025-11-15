import { PromptInputBox } from "@/components/ui/ai-prompt-box";

export default function PromptBoxDemo() {
  const handleSubmit = (text: string, files?: File[]) => {
    console.log("Submitted:", { text, files });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Prompt Box Demo</h1>
          <p className="text-[#aaaaaa]">
            Try the interactive prompt box with file uploads, voice recording, and action toggles
          </p>
        </div>
        <PromptInputBox
          onSubmit={handleSubmit}
          placeholder="What do you want to know?"
        />
      </div>
    </div>
  );
}
