# Cryonex -> Deepshi Redesign Map

Date: 2026-03-19

## Primary ownership map

### Routing and app shell entry
- `src/main.tsx:197-284`
  Owns route registration. The Deepshi-like chat surface lives on `/app` and `/app/chat/:chatId`, both rendered through `AppLayout` -> `pages/App.tsx`.
- `src/main.tsx:469-471`
  Global overlays still mount above the app here. `ConsentBanner` is outside the chat route and will visually interfere with a pixel-match redesign unless handled explicitly.

### Shared shell frame
- `src/components/AppLayout.tsx:37-38`
  `isAssistantRoute` gates whether the app uses the assistant/chat shell versus the rest of the product shell.
- `src/components/AppLayout.tsx:84-116`
  Desktop sidebar mount and mobile sidebar sheet mount. If the shell should match `deepshi.ai/chat`, this is the first shared frame to stabilize.
- `src/components/AppLayout.tsx:118-252`
  Main content container, assistant-route spacing, panel chrome, and page transition wrapper around `<Outlet />`.
- `src/components/AppLayout.tsx:255-317`
  Mobile bottom nav, quick actions, onboarding, model picker, global search, and desktop onboarding tour. These are the main non-chat shell elements that can break a clean Deepshi-style surface.

### Sidebar
- `src/components/layout/LiquidSidebar.tsx:60-177`
  Sidebar state, nav items, project-aware chat query, and new/select chat navigation.
- `src/components/layout/LiquidSidebar.tsx:181-269`
  Conversation grouping logic for chat history buckets.
- `src/components/layout/LiquidSidebar.tsx:274-475`
  Actual sidebar UI: logo row, collapse control, new-chat button, search trigger, nav pills, chat list, auth/profile area, upgrade card.
- `src/components/layout/LiquidSidebar.tsx:478-546`
  Rename/delete dialogs attached to the sidebar flow.

### Chat page composition
- `src/pages/App.tsx:34-100`
  Pulls chat state, URL params, project context, message queries, and derives `showEmptyState` / `isDesktopHero`.
- `src/pages/App.tsx:119-123`
  Mounts the chat header.
- `src/pages/App.tsx:126-131`
  Mobile empty-state split: mobile does not use `ChatEmptyState`; it renders `pages/MobileHome.tsx`.
- `src/pages/App.tsx:133-179`
  Desktop/tablet scroll container, max width, hero empty state, and message-list branch.
- `src/pages/App.tsx:183-209`
  Bottom-fixed vs hero-mode input mounting. This is the exact switch that controls whether the composer is centered in the empty state or docked to the bottom during an active chat.

### Chat header
- `src/components/chat/ChatHeader.tsx:14-84`
  Entire chat header for desktop plus floating mobile credits chip. Any Deepshi-style top bar work starts here.

### Empty state
- `src/components/chat/ChatEmptyState.tsx:35-73`
  Desktop empty state only. Title, subtitle, and suggestion pills.
- `src/pages/MobileHome.tsx:30-220`
  Separate mobile empty-state/home experience. This is not aligned with the desktop empty-state path and will need a deliberate decision during redesign.

### Message list and message renderer
- `src/components/chat/ChatMessagesList.tsx:15-90`
  Message list loop, motion wrapper, streaming message selection, and handoff into `NeoMessage`.
- `src/components/chat/NeoMessage.tsx:115-219`
  Top-level message renderer split. Desktop goes through `NeoMessage`; mobile is rerouted into `MobileMessageRenderer`.
- `src/components/chat/MobileMessageRenderer.tsx:562-727`
  Mobile-specific message UI, swipe actions, context menu, edit/share/copy behavior.

### Input area and composer
- `src/components/chat/ChatInputArea.tsx:17-90`
  Decides whether the composer is hero-style or bottom-docked, controls shell spacing, and mounts the prompt box.
- `src/components/ui/ai-prompt-box.tsx:610-1166`
  Core composer UI and behavior: textarea, auth gating, file/image upload, camera, mode chips, model picker trigger, voice/send/stop button, and submit behavior.

## Supporting state and behavior

- `src/hooks/use-chat-handlers.ts`
  Owns send flow, optimistic messages, chat creation, auto-title generation, upload flow, and streaming state. UI redesign can proceed without changing this first.
- `src/hooks/use-chat-effects.ts`
  Owns initial-message injection, onboarding redirect, native keyboard/update side effects.
- `src/lib/stores/chat-store.ts`
  Owns current chat ID, active model, model picker open state.
- `src/lib/stores/ui-store.ts`
  Owns mobile sidebar open state, global search open state, and focus/subway toggle.

## Highest-leverage implementation sequence

1. Lock the shell frame in `src/components/AppLayout.tsx`.
   Remove or suppress non-reference chrome on the assistant route first: extra onboarding/tour surfaces, quick actions, and any shell padding/panel treatment that keeps the chat from matching the Deepshi proportions.

2. Rebuild `src/components/layout/LiquidSidebar.tsx`.
   This controls the biggest visual mass besides the composer. Match structure first: width, spacing, nav grouping, chat list rhythm, footer/auth block. Do not tune message UI before the sidebar width and shell balance are stable.

3. Recompose `src/pages/App.tsx` and `src/components/chat/ChatHeader.tsx` together.
   The page-level max width, top spacing, and header placement determine whether the empty state and active chat align to the reference.

4. Rebuild the composer from `src/components/chat/ChatInputArea.tsx` into `src/components/ui/ai-prompt-box.tsx`.
   This is the highest-detail component and should be done after shell dimensions are final. Keep behavior, but simplify the visual language and control density to match the reference.

5. Normalize the empty state.
   Align `src/components/chat/ChatEmptyState.tsx` with the final composer/header proportions, then decide whether `src/pages/MobileHome.tsx` should be redesigned to match it or replaced with a simpler mobile variant of the same concept.

6. Restyle active chat flow.
   Use `src/components/chat/ChatMessagesList.tsx`, `src/components/chat/NeoMessage.tsx`, and `src/components/chat/MobileMessageRenderer.tsx` to bring message spacing, typography, avatars, and streaming visuals into the same system as the new shell/composer.

7. Final cleanup pass.
   Check `src/main.tsx` global overlays and any remaining route-wide elements that visually leak into the chat surface, especially `ConsentBanner`.

## Practical note

For desktop, the critical redesign path is:

`src/main.tsx` -> `src/components/AppLayout.tsx` -> `src/pages/App.tsx` -> `src/components/chat/ChatHeader.tsx` -> `src/components/chat/ChatInputArea.tsx` -> `src/components/ui/ai-prompt-box.tsx` -> `src/components/chat/ChatMessagesList.tsx` -> `src/components/chat/NeoMessage.tsx`

For mobile, the main divergence points are:

`src/pages/App.tsx` -> `src/pages/MobileHome.tsx` and `src/components/chat/NeoMessage.tsx` -> `src/components/chat/MobileMessageRenderer.tsx`
