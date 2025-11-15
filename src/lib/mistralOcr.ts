import { Client } from "@gradio/client";

/**
 * Extracts text + images from a PDF/image using the Mistral-OCR HF Space.
 * - Pass either a File (preferred) OR a URL
 * - If the Space is private, set VITE_HF_TOKEN
 * - Mistral API key is read from VITE_MISTRAL_API_KEY
 */
export async function mistralOcrExtract({
  file,
  url,
  mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY,
}: {
  file?: File;
  url?: string;
  mistralApiKey?: string;
}) {
  if (!file && !url) throw new Error("Provide either a file or a url");

  const hfSpaceId = import.meta.env.VITE_HF_SPACE_ID || "merterbak/Mistral-OCR";
  const hfToken = import.meta.env.VITE_HF_TOKEN?.trim() || undefined;

  const client = await Client.connect(hfSpaceId, { token: hfToken });

  // Choose input type based on what we have
  const input_type = url ? "URL" : "FILE";

  // Gradio args must include all keys defined by the Space inputs
  const args: Record<string, any> = {
    input_type,
    url: url ?? "",
    file: file ?? null,
    api_key: mistralApiKey ?? "",
  };

  const res = await client.predict("/do_ocr", args);

  // res.data = [plainText, markdown, gallery]
  const [plainText, markdown, gallery] = res.data as [string, string, any];

  // Normalize gallery images (Gradio returns an array of items with url/path)
  const images =
    Array.isArray(gallery)
      ? gallery.map((g: any) => (typeof g === "string" ? g : g?.url || g?.path || g))
      : [];

  return { plainText, markdown, images };
}
