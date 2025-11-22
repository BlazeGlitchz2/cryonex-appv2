import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Cryonex, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Cryonex's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>Attempt to decompile or reverse engineer any software contained on Cryonex's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Disclaimer</h2>
            <p>
              The materials on Cryonex's website are provided on an "as is" basis. Cryonex makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Limitations</h2>
            <p>
              In no event shall Cryonex or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Cryonex's website, even if Cryonex or a Cryonex authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Cryonex operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@cryonex.ai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
