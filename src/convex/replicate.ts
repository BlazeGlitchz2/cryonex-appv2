"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generate = action({
  args: {
    model: v.string(),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new Error("REPLICATE_API_TOKEN is not configured. Please add it in the Integrations tab.");
    }

    // Construct the API URL
    // We use the model deployments endpoint which is safer for some models, 
    // but the standard is https://api.replicate.com/v1/models/{owner}/{name}/predictions
    const apiUrl = `https://api.replicate.com/v1/models/${args.model}/predictions`;

    console.log(`Starting Replicate generation for model: ${args.model}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: args.input,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Replicate API Error (${apiUrl}):`, errorText);
      throw new Error(`Replicate API error (${response.status}) for ${args.model}: ${errorText}`);
    }

    let prediction = await response.json();
    console.log("Prediction started:", prediction.id);

    // Poll for completion
    const maxAttempts = 60; // 1 minute timeout roughly (depending on sleep)
    let attempts = 0;

    while (
      prediction.status !== "succeeded" && 
      prediction.status !== "failed" && 
      prediction.status !== "canceled" &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
      attempts++;

      const pollResponse = await fetch(prediction.urls.get, {
        headers: {
          "Authorization": `Token ${token}`,
        },
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        throw new Error(`Replicate polling error: ${errorText}`);
      }

      prediction = await pollResponse.json();
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(`Generation failed: ${prediction.error}`);
    }

    if (attempts >= maxAttempts) {
      throw new Error("Generation timed out");
    }

    return prediction.output;
  },
});