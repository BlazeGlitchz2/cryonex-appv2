import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type ProgressStep = 1 | 2 | 3;

interface ProgressIndicatorProps {
  className?: string;
  currentStep?: ProgressStep;
  expanded?: boolean;
  onContinue?: () => void;
  onBack?: () => void;
  continueLabel?: string;
  finishLabel?: string;
  hideButtons?: boolean;
}

const ProgressIndicator = ({
  className,
  currentStep,
  expanded,
  onContinue,
  onBack,
  continueLabel = "Continue",
  finishLabel = "Finish",
  hideButtons = false,
}: ProgressIndicatorProps) => {
  const [step, setStep] = useState<ProgressStep>(1);
  const [isExpanded, setIsExpanded] = useState(true);

  const resolvedStep = currentStep ?? step;
  const resolvedExpanded =
    expanded ?? (currentStep ? currentStep === 1 : isExpanded);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
      return;
    }

    if (step < 3) {
      setStep((prev) => (prev + 1) as ProgressStep);
      setIsExpanded(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (step === 2) {
      setIsExpanded(true);
    }
    if (step > 1) {
      setStep((prev) => (prev - 1) as ProgressStep);
    }
  };

  const progressWidth = useMemo(() => {
    if (resolvedStep === 1) return "24px";
    if (resolvedStep === 2) return "60px";
    return "96px";
  }, [resolvedStep]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8",
        className,
      )}
    >
      <div className="relative flex items-center gap-6">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={cn(
              "relative z-10 h-2 w-2 rounded-full",
              dot <= resolvedStep ? "bg-white" : "bg-gray-300",
            )}
          />
        ))}

        <motion.div
          initial={{ width: "12px", height: "24px", x: 0 }}
          animate={{
            width: progressWidth,
            x: 0,
          }}
          className="absolute -left-[8px] -top-[8px] h-3 -translate-y-1/2 rounded-full bg-green-500"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8,
            bounce: 0.25,
            duration: 0.6,
          }}
        />
      </div>

      {!hideButtons ? (
        <div className="w-full max-w-sm">
          <motion.div
            className="flex items-center gap-1"
            animate={{
              justifyContent: resolvedExpanded ? "stretch" : "space-between",
            }}
          >
            {!resolvedExpanded ? (
              <motion.button
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: "64px", scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  mass: 0.8,
                  bounce: 0.25,
                  duration: 0.6,
                  opacity: { duration: 0.2 },
                }}
                onClick={handleBack}
                className="w-16 flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-black transition-colors hover:border hover:bg-gray-50"
              >
                Back
              </motion.button>
            ) : null}
            <motion.button
              onClick={handleContinue}
              animate={{
                flex: resolvedExpanded ? 1 : "inherit",
              }}
              className={cn(
                "w-56 flex-1 rounded-full bg-[#006cff] px-4 py-3 text-white transition-colors",
                !resolvedExpanded && "w-44",
              )}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-[600]">
                {resolvedStep === 3 ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                      mass: 0.5,
                      bounce: 0.4,
                    }}
                  >
                    <CircleCheck size={16} />
                  </motion.div>
                ) : null}
                {resolvedStep === 3 ? finishLabel : continueLabel}
              </div>
            </motion.button>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
};

export default ProgressIndicator;

export function ProgressIndicatorDemo() {
  return <ProgressIndicator />;
}
