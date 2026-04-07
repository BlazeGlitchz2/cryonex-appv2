# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa/mobile-auth-smoke.spec.ts >> mobile auth smoke test >> mobile auth supports guest entry without obvious rendering failures
- Location: qa/mobile-auth-smoke.spec.ts:12:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "Origin http://127.0.0.1:4178 is not allowed by Access-Control-Allow-Origin. Status code: 403",
+   "Failed to load resource: Origin http://127.0.0.1:4178 is not allowed by Access-Control-Allow-Origin. Status code: 403",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - banner [ref=e5]:
        - generic [ref=e6]:
          - button "Open mobile navigation menu" [ref=e7] [cursor=pointer]:
            - img
          - generic [ref=e8]:
            - paragraph [ref=e9]: Dashboard
            - paragraph [ref=e10]: Today in Cryonex
        - button "Open assistant" [ref=e11] [cursor=pointer]:
          - img
      - main [ref=e12]:
        - generic [ref=e15]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]:
                - generic [ref=e21]:
                  - img [ref=e22]
                  - text: Learning OS
                - generic [ref=e24]: Global
              - generic [ref=e25]:
                - paragraph [ref=e26]: Welcome back
                - heading "Your mobile study lane is ready." [level=1] [ref=e27]
                - paragraph [ref=e28]: Capture one source and Cryonex will tune this phone dashboard around your next review step.
              - generic [ref=e29]:
                - generic [ref=e30]: Balanced pace
                - generic [ref=e31]: General
                - generic [ref=e32]: No source loaded yet
              - generic [ref=e33]:
                - button "No recent sources yet Bring in a fresh source Scan general notes, worksheets, or a whiteboard before the next review." [ref=e34]:
                  - generic [ref=e35]:
                    - img [ref=e37]
                    - img [ref=e40]
                  - generic [ref=e42]:
                    - paragraph [ref=e43]: No recent sources yet
                    - heading "Bring in a fresh source" [level=3] [ref=e44]
                    - paragraph [ref=e45]: Scan general notes, worksheets, or a whiteboard before the next review.
                - button "Generate on demand Build a fresh recall set Keep your next checkpoint in reach with one-thumb spaced review." [ref=e46]:
                  - generic [ref=e47]:
                    - img [ref=e49]
                    - img [ref=e59]
                  - generic [ref=e61]:
                    - paragraph [ref=e62]: Generate on demand
                    - heading "Build a fresh recall set" [level=3] [ref=e63]
                    - paragraph [ref=e64]: Keep your next checkpoint in reach with one-thumb spaced review.
                - button "Exam rehearsal Quiz General Check weak spots before your next checkpoint using short adaptive questions." [ref=e65]:
                  - generic [ref=e66]:
                    - img [ref=e68]
                    - img [ref=e71]
                  - generic [ref=e73]:
                    - paragraph [ref=e74]: Exam rehearsal
                    - heading "Quiz General" [level=3] [ref=e75]
                    - paragraph [ref=e76]: Check weak spots before your next checkpoint using short adaptive questions.
                - button "Balanced pace Start a clean session Match the workspace to your balanced pace and finish one clear block." [ref=e77]:
                  - generic [ref=e78]:
                    - img [ref=e80]
                    - img [ref=e82]
                  - generic [ref=e84]:
                    - paragraph [ref=e85]: Balanced pace
                    - heading "Start a clean session" [level=3] [ref=e86]
                    - paragraph [ref=e87]: Match the workspace to your balanced pace and finish one clear block.
              - generic [ref=e88]:
                - generic [ref=e89]:
                  - paragraph [ref=e90]: Coach Assistant
                  - img [ref=e91]
                - textbox "I want to revise..." [ref=e93]
                - generic [ref=e94]:
                  - button "Continue" [ref=e95]
                  - button "Goals" [ref=e96]
                  - button "Shelf" [ref=e97]
                  - button "Society" [ref=e98]
            - generic [ref=e99]:
              - generic [ref=e101]:
                - paragraph [ref=e102]: Live Context
                - heading "Desktop rhythm, tuned for mobile" [level=2] [ref=e103]
                - paragraph [ref=e104]: Keep one prompt, one source, and one next move visible so the phone dashboard feels like the same study system as desktop.
              - generic [ref=e106]:
                - generic [ref=e107]:
                  - generic [ref=e108]:
                    - paragraph [ref=e109]: Current prompt
                    - button "Open Copilot" [ref=e110]
                  - paragraph [ref=e111]: Build a calm general revision plan for me
                - generic [ref=e112]:
                  - generic [ref=e113]:
                    - paragraph [ref=e114]: Region
                    - paragraph [ref=e115]: Global
                  - generic [ref=e116]:
                    - paragraph [ref=e117]: Curriculum
                    - paragraph [ref=e118]: general
                  - generic [ref=e119]:
                    - paragraph [ref=e120]: School
                    - paragraph [ref=e121]: Independent
                  - generic [ref=e122]:
                    - paragraph [ref=e123]: Pace
                    - paragraph [ref=e124]: Balanced pace
                - generic [ref=e125]:
                  - button "Summarize my latest source into the ke..." [ref=e126]
                  - button "Turn my recent material into flashcard..." [ref=e127]
                  - button "Plan a focused 45-minute study session..." [ref=e128]
            - generic [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]:
                  - generic [ref=e133]:
                    - img [ref=e134]
                    - text: Next Actions
                  - heading "Highest-impact move." [level=2] [ref=e136]
                  - paragraph [ref=e137]: "Speed-to-value: every action starts from your uploaded source material instead of generic prompts."
                - generic [ref=e138]:
                  - generic [ref=e139]: general
                  - generic [ref=e140]: global
              - generic [ref=e141]:
                - button "Start spaced review Warm up your memory lane Launch" [ref=e142]:
                  - generic [ref=e143]:
                    - generic [ref=e144]:
                      - paragraph [ref=e145]: Start spaced review
                      - paragraph [ref=e146]: Warm up your memory lane
                    - img [ref=e148]
                  - generic [ref=e151]:
                    - text: Launch
                    - img [ref=e152]
                - button "Open your latest source Grounded answers from your own material Launch" [ref=e154]:
                  - generic [ref=e155]:
                    - generic [ref=e156]:
                      - paragraph [ref=e157]: Open your latest source
                      - paragraph [ref=e158]: Grounded answers from your own material
                    - img [ref=e160]
                  - generic [ref=e163]:
                    - text: Launch
                    - img [ref=e164]
                - button "Run an adaptive quiz Find gaps before the exam finds them Launch" [ref=e166]:
                  - generic [ref=e167]:
                    - generic [ref=e168]:
                      - paragraph [ref=e169]: Run an adaptive quiz
                      - paragraph [ref=e170]: Find gaps before the exam finds them
                    - img [ref=e172]
                  - generic [ref=e175]:
                    - text: Launch
                    - img [ref=e176]
                - button "Start a focus block Short deep-work burst to finish your day Launch" [ref=e178]:
                  - generic [ref=e179]:
                    - generic [ref=e180]:
                      - paragraph [ref=e181]: Start a focus block
                      - paragraph [ref=e182]: Short deep-work burst to finish your day
                    - img [ref=e184]
                  - generic [ref=e187]:
                    - text: Launch
                    - img [ref=e188]
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - paragraph [ref=e193]: Regional Study Lane
                  - paragraph [ref=e194]: Enable your region in settings for local exam and language personalization.
                - button "Add Source" [ref=e196]:
                  - img [ref=e197]
                  - text: Add Source
            - generic [ref=e200]:
              - generic [ref=e202]:
                - paragraph [ref=e203]: Resonance
                - heading "Resume Activity" [level=2] [ref=e204]
                - paragraph [ref=e205]: Pick up exactly where you left off. Your latest source and connected insights are ready.
              - button "Latest Source Start a new session Capture your first source to build a personalized study network." [ref=e207]:
                - paragraph [ref=e209]: Latest Source
                - paragraph [ref=e210]: Start a new session
                - paragraph [ref=e211]: Capture your first source to build a personalized study network.
                - img [ref=e218]
            - generic [ref=e220]:
              - generic [ref=e222]:
                - paragraph [ref=e223]: Analytics
                - heading "Study Momentum" [level=2] [ref=e224]
                - paragraph [ref=e225]: Effort tracking and recall metrics distilled for mobile navigation.
              - generic [ref=e226]:
                - generic [ref=e227]:
                  - generic [ref=e228]:
                    - generic [ref=e229]:
                      - generic [ref=e230]:
                        - generic [ref=e231]: Study time
                        - paragraph [ref=e232]: 0m
                      - img [ref=e234]
                    - paragraph [ref=e237]: tracked across focused sessions
                    - generic [ref=e240]:
                      - generic [ref=e241]: 120m focus target
                      - generic [ref=e242]: 0%
                  - generic [ref=e243]:
                    - generic [ref=e244]:
                      - generic [ref=e245]:
                        - generic [ref=e246]: Current streak
                        - paragraph [ref=e247]: 0d
                      - img [ref=e249]
                    - paragraph [ref=e251]: 0h total this week
                    - generic [ref=e254]:
                      - generic [ref=e255]: 14-day consistency push
                      - generic [ref=e256]: 0%
                  - generic [ref=e257]:
                    - generic [ref=e258]:
                      - generic [ref=e259]:
                        - generic [ref=e260]: Credits
                        - paragraph [ref=e261]: "100"
                      - img [ref=e263]
                    - paragraph [ref=e268]: Earn more with focus sessions and refuels
                    - generic [ref=e271]:
                      - generic [ref=e272]: 50-credit reserve
                      - generic [ref=e273]: 100%
                - generic [ref=e274]:
                  - button "Review lane 0 cards ready Spaced review Clear the due queue before it grows cold and expensive to recover. Best for fast recall Great as the first move when you open the dashboard. Open mode" [ref=e275]:
                    - generic [ref=e276]:
                      - generic [ref=e277]:
                        - img [ref=e279]
                        - generic [ref=e281]: Review lane
                      - generic [ref=e282]:
                        - generic [ref=e283]: 0 cards ready
                        - heading "Spaced review" [level=3] [ref=e284]
                        - paragraph [ref=e285]: Clear the due queue before it grows cold and expensive to recover.
                      - generic [ref=e286]:
                        - generic [ref=e287]:
                          - paragraph [ref=e288]: Best for fast recall
                          - paragraph [ref=e289]: Great as the first move when you open the dashboard.
                        - generic [ref=e290]:
                          - text: Open mode
                          - img [ref=e291]
                  - button "Practice lane Exam simulation Adaptive quiz Pressure-test what you know and expose the weak spots quickly. Best for gap finding Use when you need feedback, not just familiarity. Open mode" [ref=e293]:
                    - generic [ref=e294]:
                      - generic [ref=e295]:
                        - img [ref=e297]
                        - generic [ref=e309]: Practice lane
                      - generic [ref=e310]:
                        - generic [ref=e311]: Exam simulation
                        - heading "Adaptive quiz" [level=3] [ref=e312]
                        - paragraph [ref=e313]: Pressure-test what you know and expose the weak spots quickly.
                      - generic [ref=e314]:
                        - generic [ref=e315]:
                          - paragraph [ref=e316]: Best for gap finding
                          - paragraph [ref=e317]: Use when you need feedback, not just familiarity.
                        - generic [ref=e318]:
                          - text: Open mode
                          - img [ref=e319]
                  - button "Speed lane Warm-up reps Memory match Run short, playful reps when you want momentum without setup. Best for energy resets Useful between deeper study blocks. Open mode" [ref=e321]:
                    - generic [ref=e322]:
                      - generic [ref=e323]:
                        - img [ref=e325]
                        - generic [ref=e327]: Speed lane
                      - generic [ref=e328]:
                        - generic [ref=e329]: Warm-up reps
                        - heading "Memory match" [level=3] [ref=e330]
                        - paragraph [ref=e331]: Run short, playful reps when you want momentum without setup.
                      - generic [ref=e332]:
                        - generic [ref=e333]:
                          - paragraph [ref=e334]: Best for energy resets
                          - paragraph [ref=e335]: Useful between deeper study blocks.
                        - generic [ref=e336]:
                          - text: Open mode
                          - img [ref=e337]
            - generic [ref=e340]:
              - generic [ref=e341]:
                - generic [ref=e342]:
                  - generic [ref=e343]: Quick Capture
                  - heading "Sync your physical notes." [level=2] [ref=e344]
                - img [ref=e346]
              - paragraph [ref=e349]: Capture lectures, whiteboards, or handouts. We turn them into high-signal study packs in seconds.
              - generic [ref=e350]:
                - button "Upload PDF" [ref=e351]:
                  - img [ref=e352]
                  - generic [ref=e355]: Upload PDF
                - button "Paste Notes" [ref=e356]:
                  - img [ref=e357]
                  - generic [ref=e360]: Paste Notes
              - generic [ref=e363]:
                - button "Start Recording" [ref=e364] [cursor=pointer]:
                  - img
                  - generic [ref=e365]: Start Recording
                - paragraph [ref=e366]:
                  - text: Uses the best audio format available on this device.
                  - generic [ref=e367]: Tap to allow microphone access when prompted.
            - generic [ref=e368]:
              - generic [ref=e369]:
                - paragraph [ref=e370]: Cryonex Society
                - heading "The Signal Stream" [level=2] [ref=e371]
              - generic [ref=e372]:
                - button "School 0" [ref=e373]:
                  - img [ref=e374]
                  - text: School
                  - generic [ref=e379]: "0"
                - button "Global 4" [ref=e380]:
                  - img [ref=e381]
                  - text: Global
                  - generic [ref=e386]: "4"
                - button "Following 0" [ref=e387]:
                  - img [ref=e388]
                  - text: Following
                  - generic [ref=e393]: "0"
              - generic [ref=e394]:
                - generic [ref=e395]:
                  - generic [ref=e397]:
                    - generic [ref=e398]:
                      - img [ref=e399]
                      - text: School
                    - heading "School Network" [level=3] [ref=e404]
                    - paragraph [ref=e405]: Shared packs from your classmates.
                  - generic [ref=e406]: No shared assets in your school yet.
                - generic [ref=e407]:
                  - generic [ref=e408]:
                    - img [ref=e409]
                    - text: Schoolmates
                  - heading "People worth following" [level=3] [ref=e414]
                  - paragraph [ref=e415]: Discover classmates and creators from your school who are sharing useful notes and study packs.
                  - generic [ref=e417]: No schoolmate suggestions yet. Once more students opt in and share assets, they will appear here.
            - generic [ref=e418]:
              - generic [ref=e419]:
                - generic [ref=e420]:
                  - paragraph [ref=e421]: Library Shelf
                  - heading "Recent Sources" [level=2] [ref=e422]
                - button "All" [ref=e424]
                - generic [ref=e425]:
                  - generic [ref=e426]:
                    - generic [ref=e427]:
                      - generic [ref=e428]:
                        - img [ref=e429]
                        - text: Recently captured
                      - generic [ref=e435]:
                        - heading "Continue from latest sources" [level=2] [ref=e436]
                        - paragraph [ref=e437]: Resume sources instantly. All notes and follow-up tools stay linked.
                    - button "Library" [ref=e439] [cursor=pointer]
                  - generic [ref=e440]:
                    - paragraph [ref=e441]: No recent material
                    - paragraph [ref=e442]: Upload a source once and the whole dashboard starts working for you.
                    - button "Upload first source" [ref=e443] [cursor=pointer]
              - generic [ref=e445]:
                - generic [ref=e446]:
                  - generic [ref=e447]:
                    - generic [ref=e448]:
                      - img [ref=e449]
                      - text: Study packs
                    - heading "Bundle the best parts." [level=3] [ref=e453]
                    - paragraph [ref=e454]: Each pack keeps your summary, key points, flashcards, quiz practice, and sharing controls attached to the same source material.
                  - generic [ref=e455]:
                    - button "From Notes" [ref=e456] [cursor=pointer]:
                      - img
                      - text: From Notes
                    - button "Upload" [ref=e457] [cursor=pointer]:
                      - img
                      - text: Upload
                - generic [ref=e459]:
                  - img [ref=e461]
                  - generic [ref=e463]:
                    - paragraph [ref=e464]: No study packs yet
                    - paragraph [ref=e465]: Ready to turn a source into a reusable pack with review structure and sharing?
                  - button "Build first pack" [ref=e466] [cursor=pointer]:
                    - img
                    - text: Build first pack
            - generic [ref=e467]:
              - generic [ref=e468]:
                - generic [ref=e469]:
                  - generic [ref=e470]:
                    - img [ref=e471]
                    - text: Local brief
                  - heading "Student-safe updates for your area" [level=3] [ref=e473]
                  - paragraph [ref=e474]: Pinned conflict coverage stays first. The rest of the brief stays localized and calm for school, safety, and mobility decisions.
                - button [ref=e475]:
                  - img [ref=e476]
              - generic [ref=e482]:
                - generic [ref=e483]:
                  - generic [ref=e484]:
                    - img [ref=e485]
                    - text: Iran-US conflict
                  - paragraph [ref=e487]: Latest first. Trusted war coverage for Iran-US escalation and regional impact.
                - generic [ref=e488]:
                  - generic [ref=e489]: Latest first
                  - generic [ref=e490]: Trusted news only right now
              - generic [ref=e504]:
                - generic [ref=e505]:
                  - paragraph [ref=e506]: Local context
                  - paragraph [ref=e507]: Localized school, safety, and mobility updates stay underneath the pinned conflict lane.
                - generic [ref=e508]: Official sources prioritized
              - generic [ref=e509]:
                - button "School" [ref=e510]:
                  - img [ref=e511]
                  - text: School
                - button "Safety" [ref=e514]:
                  - img [ref=e515]
                  - text: Safety
                - button "Mobility" [ref=e517]:
                  - img [ref=e518]
                  - text: Mobility
              - generic [ref=e535]:
                - generic [ref=e536]:
                  - generic [ref=e537]: Latest first
                  - generic [ref=e538]: School mode
                - button "Ask Cryonex" [ref=e539] [cursor=pointer]:
                  - text: Ask Cryonex
                  - img
              - paragraph [ref=e540]: Use official instructions over headlines whenever movement, closures, or evacuation guidance affects your area.
            - generic [ref=e541]:
              - generic [ref=e542]:
                - generic [ref=e543]:
                  - generic [ref=e544]:
                    - generic [ref=e545]:
                      - generic [ref=e546]: Today plan
                      - generic [ref=e547]:
                        - heading "Daily goals" [level=3] [ref=e548]
                        - paragraph [ref=e549]: Keep the checklist small enough to finish so the dashboard feels like momentum, not admin.
                    - generic [ref=e550]:
                      - paragraph [ref=e551]: Progress
                      - paragraph [ref=e552]: 0/1
                      - paragraph [ref=e553]: 0% complete
                  - generic [ref=e554]:
                    - textbox [ref=e556]:
                      - /placeholder: Add one clear outcome for today
                    - button "Add goal" [disabled] [ref=e557]:
                      - img [ref=e558]
                      - text: Add goal
                  - generic [ref=e560]:
                    - paragraph [ref=e561]: No goals yet
                    - paragraph [ref=e562]: Add one concrete checkpoint and let the rest of the dashboard align around it.
                  - generic [ref=e563]:
                    - generic [ref=e564]: 0 completed
                    - generic [ref=e565]: 0 remaining
                    - generic [ref=e566]: Start with one small win
                - generic [ref=e567]:
                  - generic [ref=e568]:
                    - generic [ref=e569]:
                      - generic [ref=e570]: Momentum
                      - generic [ref=e571]:
                        - heading "Weekly rhythm" [level=3] [ref=e572]
                        - paragraph [ref=e573]: Watch the cadence, not just the totals. Consistency keeps your dashboard working for you.
                    - generic [ref=e574]:
                      - img [ref=e575]
                      - generic [ref=e578]: 0h this week
                  - generic [ref=e579]:
                    - generic [ref=e583]: Wed
                    - generic [ref=e587]: Thu
                    - generic [ref=e591]: Fri
                    - generic [ref=e595]: Sat
                    - generic [ref=e599]: Sun
                    - generic [ref=e603]: Mon
                    - generic [ref=e607]: Tue
                  - generic [ref=e608]:
                    - generic [ref=e609]:
                      - paragraph [ref=e610]: Strongest day
                      - paragraph [ref=e611]: Wed
                      - paragraph [ref=e612]: 0h of focused study
                    - generic [ref=e613]:
                      - paragraph [ref=e614]: Avg. pace
                      - paragraph [ref=e615]: 0.0h
                      - paragraph [ref=e616]: average study time per day this week
              - generic [ref=e617]:
                - generic [ref=e618]:
                  - generic [ref=e619]:
                    - generic [ref=e620]: Mastery track
                    - heading "Level 1" [level=3] [ref=e621]
                    - paragraph [ref=e622]: Starter tier unlocked
                  - img [ref=e624]
                - paragraph [ref=e627]: Your review activity, quiz work, and study sessions all push this bar forward.
                - generic [ref=e628]:
                  - generic [ref=e629]:
                    - paragraph [ref=e630]: "0"
                    - paragraph [ref=e631]: total XP earned
                  - generic [ref=e632]:
                    - paragraph [ref=e633]: This level
                    - paragraph [ref=e634]: 0/250 XP
                - generic [ref=e636]:
                  - generic [ref=e637]: Level 1
                  - generic [ref=e638]: 250 XP to level 2
                - generic [ref=e639]:
                  - generic [ref=e640]:
                    - img [ref=e641]
                    - paragraph [ref=e643]: "0"
                    - paragraph [ref=e644]: quizzes
                  - generic [ref=e645]:
                    - img [ref=e646]
                    - paragraph [ref=e649]: "0"
                    - paragraph [ref=e650]: cards
                  - generic [ref=e651]:
                    - img [ref=e652]
                    - paragraph [ref=e656]: "0"
                    - paragraph [ref=e657]: materials
          - generic [ref=e660]:
            - button [ref=e661]:
              - img [ref=e662]
            - generic [ref=e664]:
              - button "Goals" [ref=e665]
              - button "Packs" [ref=e667]
              - button "Social" [ref=e669]
            - button [ref=e670]:
              - img [ref=e671]
    - navigation [ref=e675]:
      - generic [ref=e676]:
        - button "Home" [ref=e677]:
          - generic [ref=e678]:
            - img [ref=e679]
            - generic [ref=e684]: Home
        - button "Coach" [ref=e686]:
          - generic [ref=e687]:
            - img [ref=e688]
            - generic [ref=e690]: Coach
        - button "Capture" [ref=e692]:
          - img [ref=e695]
          - generic [ref=e700]: Capture
        - button "Library" [ref=e701]:
          - generic [ref=e702]:
            - img [ref=e703]
            - generic [ref=e705]: Library
        - button "C Profile" [ref=e707]:
          - generic [ref=e708]:
            - generic [ref=e712]: C
            - generic [ref=e714]: Profile
  - region "Notifications alt+T"
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
  10 | test.describe("mobile auth smoke test", () => {
  11 | 
  12 |   test("mobile auth supports guest entry without obvious rendering failures", async ({
  13 |     page,
  14 |   }) => {
  15 |     const consoleErrors: string[] = [];
  16 | 
  17 |     page.on("console", (message) => {
  18 |       if (message.type() === "error") {
  19 |         consoleErrors.push(message.text());
  20 |       }
  21 |     });
  22 | 
  23 |     await page.goto("/auth", { waitUntil: "networkidle" });
  24 | 
  25 |     await expect(
  26 |       page.getByRole("button", { name: /preview workspace first/i }),
  27 |     ).toBeVisible();
  28 | 
  29 |     const consentAccept = page.getByRole("button", { name: /accept all/i });
  30 |     if (await consentAccept.isVisible()) {
  31 |       await consentAccept.click();
  32 |     }
  33 | 
  34 |     await page.screenshot({
  35 |       path: "test-results/mobile-auth-before-guest.png",
  36 |       fullPage: true,
  37 |     });
  38 | 
  39 |     await page.getByRole("button", { name: /preview workspace first/i }).click();
  40 |     await page.waitForLoadState("networkidle");
  41 | 
  42 |     await page.screenshot({
  43 |       path: "test-results/mobile-auth-after-guest.png",
  44 |       fullPage: true,
  45 |     });
  46 | 
  47 |     await expect(page).toHaveURL(/\/study\/dashboard/);
> 48 |     expect(consoleErrors).toEqual([]);
     |                           ^ Error: expect(received).toEqual(expected) // deep equality
  49 |   });
  50 | });
  51 | 
```