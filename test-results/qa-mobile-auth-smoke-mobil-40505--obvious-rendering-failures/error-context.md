# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa/mobile-auth-smoke.spec.ts >> mobile auth supports guest entry without obvious rendering failures
- Location: qa/mobile-auth-smoke.spec.ts:10:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /browse in guest mode/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /browse in guest mode/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - img [ref=e6]
    - heading "404" [level=1] [ref=e8]
    - paragraph [ref=e9]: Page Not Found
    - paragraph [ref=e10]: The page you're looking for doesn't exist or has been moved.
    - generic [ref=e11]:
      - button "Go Back" [ref=e12] [cursor=pointer]:
        - img
        - text: Go Back
      - button "Back to Cryonex" [ref=e13] [cursor=pointer]:
        - img
        - text: Back to Cryonex
  - region "Notifications alt+T"
  - generic [ref=e16]:
    - paragraph [ref=e17]:
      - text: We use cookies to deliver and measure personalized ads (Google AdSense) and improve the product. See our
      - link "Privacy Policy" [ref=e18]:
        - /url: /privacy
      - text: . You can change your choice anytime in “Cookie settings”.
    - generic [ref=e19]:
      - button "Decline" [ref=e20] [cursor=pointer]
      - button "Accept all" [ref=e21] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect, devices } from "@playwright/test";
  2  | 
  3  | const baseURL = process.env.MOBILE_QA_BASE_URL || "http://127.0.0.1:4174";
  4  | 
  5  | test.use({
  6  |   ...devices["iPhone 13"],
  7  |   baseURL,
  8  | });
  9  | 
  10 | test("mobile auth supports guest entry without obvious rendering failures", async ({
  11 |   page,
  12 | }) => {
  13 |   const consoleErrors: string[] = [];
  14 | 
  15 |   page.on("console", (message) => {
  16 |     if (message.type() === "error") {
  17 |       consoleErrors.push(message.text());
  18 |     }
  19 |   });
  20 | 
  21 |   await page.goto("/auth", { waitUntil: "networkidle" });
  22 | 
  23 |   await expect(
  24 |     page.getByRole("button", { name: /browse in guest mode/i }),
> 25 |   ).toBeVisible();
     |     ^ Error: expect(locator).toBeVisible() failed
  26 | 
  27 |   await page.screenshot({
  28 |     path: "test-results/mobile-auth-before-guest.png",
  29 |     fullPage: true,
  30 |   });
  31 | 
  32 |   await page.getByRole("button", { name: /browse in guest mode/i }).click();
  33 |   await page.waitForLoadState("networkidle");
  34 | 
  35 |   await page.screenshot({
  36 |     path: "test-results/mobile-auth-after-guest.png",
  37 |     fullPage: true,
  38 |   });
  39 | 
  40 |   expect(consoleErrors).toEqual([]);
  41 | });
  42 | 
```