"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const processPDFEnhanced = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args): Promise<{
    docId: string;
    text: string;
    sections: any[];
    tables: any[];
    figures: any[];
    pageCount: number;
    isSTEM: boolean;
    summaries: { short: string; detailed: string };
    chunks: any[];
  }> => {
    // Call the extractPDF action directly using api instead of internal
    // @ts-expect-error - Convex 1.29.0 type instantiation depth issue
    const extracted = await ctx.runAction(api.studyExtractor.extractPDF, {
      storageId: args.storageId,
    });

    return {
      docId: extracted.docId,
      text: extracted.text,
      sections: extracted.sections,
      tables: extracted.tables,
      figures: extracted.figures,
      pageCount: extracted.pageCount,
      isSTEM: extracted.isSTEM,
      summaries: extracted.summaries,
      chunks: extracted.chunks,
    };
  },
});