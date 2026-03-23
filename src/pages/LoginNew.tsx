import { useSearchParams } from "react-router";

import { AuthUI } from "@/components/ui/auth-fuse";

export function LoginNew() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("hint") ?? "";
  const autoSendCode = searchParams.get("auto") === "true";
  const defaultMode =
    searchParams.get("action") === "add_account" ? "signup" : "signin";

  return (
    <AuthUI
      initialEmail={initialEmail}
      autoSendCode={autoSendCode}
      defaultMode={defaultMode}
    />
  );
}
