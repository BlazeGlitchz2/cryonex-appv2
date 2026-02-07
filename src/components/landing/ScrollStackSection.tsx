import ScrollStack, { Card } from "@/components/ui/ScrollStack";
import { Brain, Share2, Network, Users } from "lucide-react";

export const ScrollStackSection = () => {
  const cards: Card[] = [
    {
      id: 1,
      title: "AI Research Assistant",
      description:
        "Analyze complex documents in seconds. Our AI breaks down dense academic papers into digestible insights.",
      backgroundColor: "rgba(59, 130, 246, 0.1)", // blue-500/10
      content: (
        <div className="p-6 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 mb-2 inline-flex">
          <Brain className="w-16 h-16 text-blue-400" />
        </div>
      ),
    },
    {
      id: 2,
      title: "Viral Content Generator",
      description:
        "Turn your study notes into shareable content. Automatically generate quizzes, flashcards, and summaries to share with peers.",
      backgroundColor: "rgba(168, 85, 247, 0.1)", // purple-500/10
      content: (
        <div className="p-6 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 mb-2 inline-flex">
          <Share2 className="w-16 h-16 text-purple-400" />
        </div>
      ),
    },
    {
      id: 3,
      title: "Global Knowledge Graph",
      description:
        "Connect ideas across thousands of sources. Visualize relationships between concepts to deepen your understanding.",
      backgroundColor: "rgba(6, 182, 212, 0.1)", // cyan-500/10
      content: (
        <div className="p-6 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 mb-2 inline-flex">
          <Network className="w-16 h-16 text-cyan-400" />
        </div>
      ),
    },
    {
      id: 4,
      title: "Real-time Collaboration",
      description:
        "Study together with AI-powered tools. Collaborate on documents and research in real-time with students worldwide.",
      backgroundColor: "rgba(236, 72, 153, 0.1)", // pink-500/10
      content: (
        <div className="p-6 rounded-full bg-pink-500/20 backdrop-blur-sm border border-pink-500/30 mb-2 inline-flex">
          <Users className="w-16 h-16 text-pink-400" />
        </div>
      ),
    },
  ];

  return (
    <section className="relative w-full bg-black pb-20 pt-0">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Evolution of Learning
        </h2>

        <ScrollStack cards={cards} />
      </div>
    </section>
  );
};
