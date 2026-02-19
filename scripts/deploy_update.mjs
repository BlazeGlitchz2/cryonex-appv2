
import { ConvexHttpClient } from "convex/browser";
import { api } from "../src/convex/_generated/api.js";
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";

if (!global.fetch) {
    global.fetch = fetch;
}

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
    console.error("Error: VITE_CONVEX_URL not found in .env.local");
    process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function deployUpdate(filePath, version, platform, notes) {
    console.log(`Deploying update for ${platform} version ${version}...`);

    // 1. Generate Upload URL
    const uploadUrl = await client.mutation(api.updates.generateUploadUrl, {});
    console.log("Upload URL generated:", uploadUrl);

    // 2. Upload File
    const fileBuffer = fs.readFileSync(filePath);
    const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/zip" },
        body: fileBuffer,
    });

    if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const { storageId } = await response.json();
    console.log("File uploaded. Storage ID:", storageId);

    // 3. Register Version
    await client.mutation(api.updates.registerVersion, {
        version,
        platform,
        storageId,
        notes,
        mandatory: false,
    });

    console.log("Version registered successfully!");
}

const args = process.argv.slice(2);
if (args.length < 3) {
    console.log("Usage: node scripts/deploy_update.mjs <zip_path> <version> <platform> [notes]");
    process.exit(1);
}

const [zipPath, version, platform, notes] = args;
deployUpdate(zipPath, version, platform, notes).catch(console.error);
