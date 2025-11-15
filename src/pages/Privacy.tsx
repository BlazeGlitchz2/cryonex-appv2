import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-[#d1d1d1]">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Overview</h2>
          <p>
            Cryonex uses cookies and similar technologies to operate the site, analyze usage,
            and deliver ads via Google AdSense. Some cookies may be used for ad personalization
            if you grant consent.
          </p>

          <h2>Advertising (Google AdSense)</h2>
          <p>
            We display ads provided by Google. Google and its partners may use cookies to serve ads
            based on your visits to this and other websites. Learn more at{" "}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
              Google’s Advertising Policies
            </a>.
          </p>

          <h2>Consent & Cookies</h2>
          <p>
            We use Google Consent Mode v2. Until you choose, ad storage, ad user data, ad personalization,
            and analytics storage are set to “denied.” You can change your selection at any time using
            the “Cookie settings” control.
          </p>
          <p>
            To review or change your cookie settings,{" "}
            <button
              className="underline"
              onClick={() => window.dispatchEvent(new Event("openConsentBanner"))}
            >
              open cookie settings
            </button>.
          </p>

          <h2>Data</h2>
          <ul>
            <li>Account data (email) used for authentication.</li>
            <li>Study content you upload or generate.</li>
            <li>Log data used to secure and improve the service.</li>
          </ul>

          <h2>Contact</h2>
          <p>
            For privacy inquiries, contact{" "}
            <a href="mailto:ratrampage324@gmail.com">ratrampage324@gmail.com</a>.
          </p>
        </div>

        <div className="mt-8">
          <Link to="/">
            <Button variant="outline" className="border-[#2a2a2a] text-[#d0d0d0]">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
