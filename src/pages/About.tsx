import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BookOpen,
  Brain,
  Zap,
  Shield,
  Globe,
  Users,
  User,
  Search,
  WifiOff,
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-6">About Cryonex</h1>
        <p className="text-lg text-[#d1d1d1] mb-8">
          Cryonex is a source-grounded study workspace built to turn class
          material into cited summaries, flashcards, quizzes, and guided
          review. The product is focused on helping students move from raw
          material to active recall faster.
        </p>

        <div className="space-y-12">
          {/* Core Features */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Source-Grounded Help</h3>
                </div>
                <p className="text-sm text-[#b0b0b0]">
                  Use source-grounded AI help for explanations, follow-up
                  questions, and revision support tied to your study material.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Study Workspace</h3>
                </div>
                <p className="text-sm text-[#b0b0b0]">
                  Upload PDFs, notes, links, and recordings to generate
                  summaries, flashcards, quizzes, and study sessions from the
                  material you selected.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Find and Import Sources</h3>
                </div>
                <p className="text-sm text-[#b0b0b0]">
                  Pull in course links, web sources, PDFs, and lecture material
                  so the next study artifact starts from the right evidence.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <WifiOff className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Offline-Ready Review</h3>
                </div>
                <p className="text-sm text-[#b0b0b0]">
                  Keep useful study context available for mobile review, with
                  native offline and on-device model paths where supported.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              How It Works
            </h2>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Choose Your Source Set</h3>
                  <p className="text-sm text-[#b0b0b0]">
                    Select the PDFs, notes, links, recordings, or web sources
                    that should ground the study session.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create Active Recall</h3>
                  <p className="text-sm text-[#b0b0b0]">
                    Generate cited summaries, flashcards, quizzes, and focused
                    review from the selected source set.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track the Next Review</h3>
                  <p className="text-sm text-[#b0b0b0]">
                    Save study outputs to the library, revisit weak topics, and
                    keep the next review session focused.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy & Trust */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Privacy & Trust
            </h2>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 space-y-3">
              <p className="text-sm text-[#b0b0b0]">
                <strong className="text-white">Your data is yours.</strong> We
                use end-to-end encryption and never sell your information to
                third parties.
              </p>
              <p className="text-sm text-[#b0b0b0]">
                <strong className="text-white">Transparent AI usage.</strong> We
                clearly label which AI models are being used and give you full
                control over your choices.
              </p>
              <p className="text-sm text-[#b0b0b0]">
                <strong className="text-white">Cookie consent.</strong> We
                respect your privacy with Google Consent Mode v2 and give you
                control over cookies and personalized ads.
              </p>
              <div className="pt-2">
                <Link to="/privacy">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#2a2a2a] text-[#d0d0d0]"
                  >
                    Read Privacy Policy
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Open Source */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-400" />
              Study Model Choice
            </h2>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <p className="text-sm text-[#b0b0b0] mb-3">
                Cryonex can route study tasks through free, open-source, local,
                or premium models depending on the workflow and user settings.
                The product stays centered on source-grounded study outputs, not
                generic model switching.
              </p>
              <p className="text-sm text-[#b0b0b0]">
                Model choice should support clearer citations, faster review,
                and better mobile study sessions.
              </p>
            </div>
          </section>

          {/* Credits / Team */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              The Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-[#2a2a2a] p-6 transition-all hover:border-purple-500/30">
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Alpha</h3>
                  <p className="text-purple-400 text-sm font-medium mb-3">Social Media Manager</p>
                  <p className="text-xs text-[#888] leading-relaxed">
                    Driving our community presence and connecting students with the latest Cryonex features.
                  </p>
                </div>
              </div>
              
              {/* Add more team members here in the future */}
            </div>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link to="/">
            <Button
              variant="outline"
              className="border-[#2a2a2a] text-[#d0d0d0]"
            >
              Back to Home
            </Button>
          </Link>
          <Link to="/login">
            <Button className="bg-white text-black hover:bg-white/90">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
