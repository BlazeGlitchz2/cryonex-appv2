import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020005] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 text-white/50 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-white/40 mb-8">Last updated: January 2026</p>

          <div className="space-y-8 text-white/70 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                1. Agreement to Terms
              </h2>
              <p>
                By accessing our website and using our services, you agree to be
                bound by these Terms of Service and to comply with all
                applicable laws and regulations. If you do not agree with these
                terms, you are prohibited from using or accessing this site or
                using any other services provided by Cryonex.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily access the materials
                (information or software) on Cryonex's website for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 marker:text-blue-500">
                <li>modify or copy the materials;</li>
                <li>
                  use the materials for any commercial purpose, or for any
                  public display (commercial or non-commercial);
                </li>
                <li>
                  attempt to decompile or reverse engineer any software
                  contained on Cryonex's website;
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials; or
                </li>
                <li>
                  transfer the materials to another person or "mirror" the
                  materials on any other server.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                3. Disclaimer
              </h2>
              <p>
                The materials on Cryonex's website are provided on an 'as is'
                basis. Cryonex makes no warranties, expressed or implied, and
                hereby disclaims and negates all other warranties including,
                without limitation, implied warranties or conditions of
                merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                4. Limitations
              </h2>
              <p>
                In no event shall Cryonex or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on Cryonex's website, even
                if Cryonex or a Cryonex authorized representative has been
                notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                5. Governing Law
              </h2>
              <p>
                These terms and conditions are governed by and construed in
                accordance with the laws of Delaware, USA and you irrevocably
                submit to the exclusive jurisdiction of the courts in that State
                or location.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
