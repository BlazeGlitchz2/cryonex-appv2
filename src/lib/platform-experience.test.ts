import { getPlatformExperience } from "./platform-experience";
import type { DeviceInfo } from "@/hooks/use-mobile";

const baseDevice: DeviceInfo = {
  deviceType: "desktop",
  isAndroid: false,
  isIOS: false,
  isLowPowerDevice: false,
  isPhone: false,
  isSmartboard: false,
  isTablet: false,
  isTouchDevice: false,
};

describe("platform experience landing copy", () => {
  it("positions the web landing page around source-grounded study workflows", () => {
    const experience = getPlatformExperience(baseDevice);
    const title = experience.landingTitle.toLowerCase();

    expect(title).toContain("source-grounded");
    expect(experience.landingDescription).toContain("flashcards");
    expect(experience.landingDescription).toContain("quizzes");
    expect(title).not.toContain("calm web workflow");
  });
});
