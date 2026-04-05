# Plan: Summarize All Lessons & Global Deployment

Enhance the PDF summarization engine to process comprehensive, multi-lesson documents and perform a production-grade deployment to all platforms.

## 🎯 Objectives
1.  **Multi-Lesson Summarization**: Update `studyExtractor.ts` to process full documents, identifying and summarizing all lessons/chapters instead of just the first 12k characters.
2.  **Enhanced Prompting**: Refine the AI prompt to enforce a structured output that covers the entire scope of the uploaded material.
3.  **Global Deployment**: Execute a full-stack deployment cycle to Convex (backend), Vercel (frontend), GitHub (version control), and Mobile (iOS/Android via Capacitor).

## 🛠️ Proposed Changes

### 1. Backend Logic (`src/convex/studyExtractor.ts`)
- **Text Slicing**: Increase `trimmed` length or implement a chunking strategy for summaries.
- **Section-Based Summarization**: Utilize existing `sections` from `parseMarkdownSections` to provide context for each lesson.
- **Prompt Update**: Modify the system prompt to explicitly request a "Table of Contents" style summary with breakdowns for each detected lesson.
- **Scaling**: Ensure the summarization logic doesn't exceed Convex action timeout limits for very large files.

### 2. Frontend Polish
- **Summary Rendering**: Ensure the UI handles longer, structured summaries gracefully without excessive scrolling or layout breakage.

### 3. Deployment Pipeline
- **GitHub**: Commit and push changes to `main`.
- **Convex**: Deploy updated actions and mutations (`npx convex deploy`).
- **Vercel**: Trigger production build.
- **Mobile**: Synchronize Capacitor and prepare builds for iOS/Android.

## 📅 Phases

### Phase 1: Logic Enhancement
- [ ] Modify `generateSummaries` in `studyExtractor.ts`.
- [ ] Test with a multi-page PDF sample.

### Phase 2: Verification
- [ ] Run local tests for PDF extraction.
- [ ] Verify summary output structure.

### Phase 3: Deployment
- [ ] Push to GitHub.
- [ ] Deploy to Convex.
- [ ] Deploy to Vercel.
- [ ] Build for Mobile (Capacitor sync).

## 🧪 Verification Plan
- **Summarization Test**: Upload a 20+ page document and verify that the summary includes content from later chapters.
- **Deployment Check**: Verify live URL and mobile app functionality.

---
> [!NOTE]
> I will prioritize using Gemini 2.5 Flash / 3 Flash for extraction as it has a much larger context window compared to the legacy models currently being used as fallbacks.
