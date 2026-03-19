# Shared Context

- `src/convex/chat.ts`, `src/convex/autoGenerate.ts`, and `src/convex/chatHelpers.ts` all call `api.credits.charge`, but `src/convex/credits.ts` currently does not export `charge`.
- Wallet data lives in the `wallet` table in `src/convex/schema.ts`; there is no ledger/activity table yet.
- The current app shell uses `LiquidSidebar` from `src/components/layout/LiquidSidebar.tsx`, but repo history and `src/components/AppSidebar.tsx` contain the older purple-cyan rail style the user wants back.
- The current study dashboard already has an in-progress revamp in tracked-but-dirty files. New edits should preserve those improvements while reducing visual overload.
- The vault editor issue is likely caused by `useKeystrokes` diffing against stale React state during rapid updates, which can misclassify inserts/deletes and record wrong chunks.
