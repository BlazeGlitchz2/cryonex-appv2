import { generateTextWithFallback } from "./lib/aiRouting";

export default async function testRouting() {
  console.log("Testing Study Summary workload...");
  try {
    const res = await generateTextWithFallback({
      workload: "study-summary",
      messages: [{ role: "user", content: "Say 'Hello from Summary'" }],
      maxTokens: 10,
    });
    console.log("Success:", res.model, res.provider);
  } catch (e) {
    console.error("Failed:", e);
  }

  console.log("\nTesting Study JSON workload...");
  try {
    const res = await generateTextWithFallback({
      workload: "study-json",
      messages: [{ role: "user", content: "Return JSON: {\"test\": true}" }],
      json: true,
      maxTokens: 20,
    });
    console.log("Success:", res.model, res.provider);
  } catch (e) {
    console.error("Failed:", e);
  }
}
