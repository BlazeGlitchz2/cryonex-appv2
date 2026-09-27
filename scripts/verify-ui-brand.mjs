import assert from "node:assert/strict";
import fs from "node:fs";

const officialPath = "/assets/cryonex-logo-official.png";
const usesOfficialLogo = (source) =>
  source.includes(`src="${officialPath}"`) && !/<svg\b/.test(source);

// Positive control: the previous invented vector must be rejected.
assert.equal(
  usesOfficialLogo('<svg viewBox="0 0 32 32"><path /></svg>'),
  false,
);
assert.equal(usesOfficialLogo(`<img src="${officialPath}" alt="" />`), true);
assert.equal(
  usesOfficialLogo(fs.readFileSync("src/components/BrandMark.tsx", "utf8")),
  true,
);
assert.ok(fs.statSync(`public${officialPath}`).size > 0);

for (const file of [
  "src/components/auth/AuthExperience.tsx",
  "src/components/landing/ModernLanding.tsx",
  "src/components/layout/WorkspaceSidebar.tsx",
  "src/components/study/mobile-workspace/MobileWorkspaceChrome.tsx",
  "src/components/ui/message.tsx",
  "src/pages/StudyWorkspace.tsx",
  "src/pages/Onboarding.tsx",
  "src/pages/Plans.tsx",
  "src/main.tsx",
]) {
  assert.ok(
    fs.readFileSync(file, "utf8").includes("<BrandMark"),
    `${file} must render the shared official brand`,
  );
}
const styles = fs.readFileSync("src/styles/refresh.css", "utf8");
assert.ok(styles.includes("--background: #050218"));
assert.ok(styles.includes("#ffd29a 0%"));
assert.ok(styles.includes("#ff8a2a 48%"));
assert.ok(styles.includes("#d85b13 100%"));
assert.equal(styles.includes("#2563eb"), false);
assert.ok(
  fs
    .readFileSync("src/components/auth/AccountModeSwitch.tsx", "utf8")
    .includes("21st.dev/@micka_design/components/tabs-base"),
);
console.log("CRYONEX_BRAND_VERIFIED");
