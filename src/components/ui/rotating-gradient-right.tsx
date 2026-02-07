"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { usePerformanceStore } from "@/lib/stores/performance-store";

export default function RotatingGradientRight() {
  const shouldDisableEffects = usePerformanceStore((state) =>
    state.shouldDisableHeavyEffects(),
  );

  return (
    <section className="min-h-screen w-full bg-black text-white px-8 py-16 md:px-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* LEFT: Text */}
        <div className="relative mx-auto flex h-[40rem] w-full max-w-[60rem] items-center justify-center overflow-hidden rounded-3xl">
          {/* Rotating conic gradient glow OR Static for Lite Mode */}
          <div className="absolute -inset-10 flex items-center justify-center">
            <div
              className={`
                                h-[120%] w-[120%] rounded-[36px] blur-3xl opacity-80
                                ${
                                  shouldDisableEffects
                                    ? "bg-gradient-to-br from-emerald-500/80 via-cyan-500/80 to-blue-600/80"
                                    : "bg-[conic-gradient(from_0deg,theme(colors.emerald.400),theme(colors.cyan.400),theme(colors.blue.500),theme(colors.violet.600),theme(colors.red.500),theme(colors.emerald.400))] animate-[spin_8s_linear_infinite]"
                                }
                            `}
            />
          </div>

          {/* Black card inside the glow */}
          <Card className="w-[340px] z-10 rounded-2xl border border-white/10 bg-black/85 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Cryonex AI
                </span>
                <span className="text-xs text-zinc-400">Processing...</span>
              </div>

              {/* Progress bar */}
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full w-[92%] rounded-full
                                bg-[linear-gradient(90deg,theme(colors.cyan.400),theme(colors.sky.400),theme(colors.emerald.400))]"
                />
              </div>

              <p className="text-xs text-zinc-400">
                Analyzing study materials and generating interactive quizzes...
              </p>

              <Button
                variant="secondary"
                className="mt-4 w-full rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              >
                View Summary
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Rotating gradient with black card */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-3xl font-normal text-white leading-relaxed">
            Master Any Subject <br />
            <span className="text-gray-400 text-sm sm:text-base lg:text-3xl">
              Transform your study materials into interactive quizzes,
              flashcards, and summaries instantly with Cryonex AI.
            </span>
          </h2>
          <Button
            variant="link"
            className="px-0 text-white hover:text-gray-300"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
