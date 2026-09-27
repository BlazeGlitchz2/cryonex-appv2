import { motion, useReducedMotion } from "framer-motion";

// Adapted from micka_design's Segmented Tabs, retrieved through the 21st MCP.
// https://21st.dev/@micka_design/components/tabs-base
// Equal-width account options don't need the catalog component's measurement
// contexts or an additional primitive library. Preserve native button semantics.
export function AccountModeSwitch({
  value,
  onChange,
  disabled = false,
}: {
  value: "signin" | "signup";
  onChange: (value: "signin" | "signup") => void;
  disabled?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="cx-auth-mode" role="group" aria-label="Account options">
      <motion.span
        className="cx-account-indicator"
        aria-hidden="true"
        initial={false}
        animate={{ x: value === "signin" ? "0%" : "100%" }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 300, damping: 32 }
        }
      />
      {(["signin", "signup"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          disabled={disabled}
          onClick={() => onChange(option)}
          onKeyDown={(event) => {
            if (
              disabled ||
              !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
            )
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? "signin"
                : event.key === "End"
                  ? "signup"
                  : option === "signin"
                    ? "signup"
                    : "signin";
            onChange(next);
            const index = next === "signin" ? 0 : 1;
            event.currentTarget.parentElement
              ?.querySelectorAll("button")
              [index]?.focus();
          }}
        >
          {option === "signin" ? "Sign in" : "Create account"}
        </button>
      ))}
    </div>
  );
}
