import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030014] text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white/60 hover:text-white pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Cryonex ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and with our products and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This may include:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Personal identifiers (name, email address)</li>
              <li>Account credentials</li>
              <li>Payment information (processed securely by third-party providers)</li>
              <li>User-generated content (prompts, code snippets, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our service and hold certain information.
            </p>
            <p className="mt-2">
              <strong>Google AdSense:</strong> We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Ad Settings</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Personalize and improve your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@cryonex.ai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
