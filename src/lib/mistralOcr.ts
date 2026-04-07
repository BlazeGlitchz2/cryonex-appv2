import { Client } from "@gradio/client";

/**
 * Extracts text + images from a PDF/image using the Mistral-OCR HF Space.
 * - Pass either a File (preferred) OR a URL
 * - SECURITY: API keys must be passed from a server function (Convex),
 *   NOT read from VITE_ env vars which expose them in the frontend bundle.
 * - hfSpaceId defaults to "merterbak/Mistral-OCR" if not provided.
 */
export async function mistralOcrExtract({
  file,
  url,
  mistralApiKey,
  hfSpaceId = "merterbak/Mistral-OCR",
  hfToken,
}: {
  file?: File;
  url?: string;
  mistralApiKey: string;
  hfSpaceId?: string;
  hfToken?: string;
}) {
  if (!file && !url) throw new Error("Provide either a file or a url");
  if (!mistralApiKey) throw new Error("Mistral API key is required");

  const client = await Client.connect(hfSpaceId, {
    token: hfToken?.trim() as `hf_${string}` | undefined,
  });

  // Choose input type based on what we have
  const input_type = url ? "URL" : "FILE";

  // Gradio args must include all keys defined by the Space inputs
  const args: Record<string, any> = {
    input_type,
    url: url ?? "",
    file: file ?? null,
    api_key: mistralApiKey,
  };

  const res = await client.predict("/do_ocr", args);

  // res.data = [plainText, markdown, gallery]
  const [plainText, markdown, gallery] = res.data as [string, string, any];

  // Normalize gallery images (Gradio returns an array of items with url/path)
  const images = Array.isArray(gallery)
    ? gallery.map((g: any) =>
        typeof g === "string" ? g : g?.url || g?.path || g,
      )
    : [];

  return { plainText, markdown, images };
}
