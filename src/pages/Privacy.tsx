import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020005] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 text-white/50 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Cryonex. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you as to how we look after your personal data when you visit our website
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal or regulatory obligation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Google AdSense & Third Party Cookies</h2>
            <p className="mb-4">
              We use Google AdSense Advertising on our website. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet.
            </p>
            <p className="mb-4">
              Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet.
            </p>
            <p className="mb-4">
              You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">www.aboutads.info</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. EU User Consent Policy</h2>
            <p className="mb-4">
              If you are located in the European Economic Area (EEA), the United Kingdom, or Switzerland, we comply with the EU User Consent Policy. This means:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>We obtain your consent before storing or accessing cookies and other information on your device.</li>
              <li>We obtain your consent before collecting, sharing, and using personal data for personalization of ads.</li>
              <li>You can withdraw your consent at any time by adjusting your cookie settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Cookie Management</h2>
            <p className="mb-4">
              You can manage your cookie preferences at any time. To change your cookie settings:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Click on "Cookie Settings" in the footer of any page</li>
              <li>Adjust your browser settings to block or delete cookies</li>
              <li>Visit the Google Ad Settings page to control personalized advertising</li>
            </ul>
            <p className="mt-4">
              Please note that blocking certain cookies may impact your experience on our website and limit the functionality of some features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Sharing with Third Parties</h2>
            <p className="mb-4">
              We may share your information with third parties in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Advertising Partners:</strong> We work with Google AdSense and other advertising partners who may collect information about your browsing activities to provide relevant advertisements.</li>
              <li><strong>Service Providers:</strong> We may share data with trusted service providers who assist us in operating our website and conducting our business.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Device Tracking & Security Monitoring</h2>
            <p className="mb-4">
              To ensure the security of your account and our platform, we collect and monitor device and session information when you use Cryonex. This helps us detect unauthorized access and protect all users.
            </p>
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">Information We Collect</h3>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Device Information:</strong> Browser type/version, operating system, device type (mobile/desktop/tablet)</li>
              <li><strong>Network Information:</strong> IP address, approximate geographic location (city, region, country)</li>
              <li><strong>Session Data:</strong> Login timestamps, session duration, and last activity time</li>
            </ul>
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">How This Information Is Used</h3>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Detecting and preventing unauthorized account access</li>
              <li>Alerting you to suspicious login activity from new devices or locations</li>
              <li>Enabling you to view and manage your active sessions</li>
              <li>Complying with legal requirements and protecting against abuse</li>
            </ul>
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">Your Rights</h3>
            <p className="mb-4">
              You have the right to view your active sessions and terminate any session at any time through your account settings. Administrators may also review session data for security purposes. Session data is retained for 90 days after the session ends, after which it is automatically deleted.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
              <p className="text-yellow-400 font-medium mb-2">Important Notice</p>
              <p className="text-white/70">
                By using Cryonex, you consent to the collection and processing of device and location information as described above. This monitoring is essential for maintaining the security of our platform and protecting user accounts. If you do not consent to this monitoring, please discontinue use of our services.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Your Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Access:</strong> You can request access to the personal data we hold about you.</li>
              <li><strong>Correction:</strong> You can request that we correct any inaccurate personal data.</li>
              <li><strong>Deletion:</strong> You can request that we delete your personal data, subject to certain exceptions.</li>
              <li><strong>Objection:</strong> You can object to the processing of your personal data for certain purposes.</li>
              <li><strong>Data Portability:</strong> You can request a copy of your data in a structured, machine-readable format.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us at support@cryonex.ai.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at support@cryonex.ai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}