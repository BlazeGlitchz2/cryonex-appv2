import { test, expect } from "@playwright/test";

const baseURL = process.env.MOBILE_QA_BASE_URL || "http://127.0.0.1:4174";

test.use({ baseURL });

test.describe("public route smoke tests", () => {
  test("landing page renders primary calls to action", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page).toHaveTitle(/Cryonex/i);
    expect(
      await page.getByRole("link", { name: /start free/i }).count(),
    ).toBeGreaterThan(0);
    expect(
      await page.getByRole("link", { name: /pricing/i }).count(),
    ).toBeGreaterThan(0);
    expect(consoleErrors).toEqual([]);
  });

  test("auth mode toggle exposes sign-up fields", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto("/auth", { waitUntil: "networkidle" });

    await expect(
      page.getByRole("button", { name: /preview workspace first/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByRole("textbox", { name: /name/i })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("guest demo workspace loads useful study content", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.addInitScript(() => {
      window.sessionStorage.setItem("cryo_guest_preview_mode", "true");
    });

    await page.goto("/study/workspace/test-doc", { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/study\/workspace\/test-doc/);
    await expect(
      page.getByRole("heading", { name: "Cell Structure", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Generate Study Pack", exact: true }),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
