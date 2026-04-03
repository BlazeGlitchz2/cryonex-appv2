import { test, expect, devices } from "@playwright/test";

const baseURL = process.env.MOBILE_QA_BASE_URL || "http://127.0.0.1:4174";

test.use({
  ...devices["iPhone 13"],
  baseURL,
});

test("mobile auth supports guest entry without obvious rendering failures", async ({
  page,
}) => {
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

  await page.screenshot({
    path: "test-results/mobile-auth-before-guest.png",
    fullPage: true,
  });

  await page.getByRole("button", { name: /preview workspace first/i }).click();
  await page.waitForLoadState("networkidle");

  await page.screenshot({
    path: "test-results/mobile-auth-after-guest.png",
    fullPage: true,
  });

  await expect(page).toHaveURL(/\/study\/dashboard/);
  expect(consoleErrors).toEqual([]);
});
