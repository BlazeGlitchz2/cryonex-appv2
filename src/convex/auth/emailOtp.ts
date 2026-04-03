import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { alphabet, generateRandomString } from "oslo/crypto";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const appName = process.env.VLY_APP_NAME || "Cryonex Workspace";
    try {
      const response = await axios.post(
        "https://email.vly.ai/send_otp",
        {
          to: email,
          otp: token,
          appName,
        },
        {
          headers: {
            "x-api-key": "vlytothemoon2025",
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      if (response.status !== 200) {
        throw new Error(
          `Vly email service returned status ${response.status}: ${JSON.stringify(response.data)}`,
        );
      }
    } catch (error: any) {
      console.error("Failed to send verification email:", error.message || error);
      throw new Error(`Email delivery failed: ${error.message || "Unknown error"}`);
    }
  },
});
