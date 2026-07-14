import React from "react";
import { motion } from "motion/react";
import { FileText, Scale, Gavel, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50" />
      
      <section className="relative pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-blue-600/10 text-blue-500 border-none font-black text-[10px] tracking-[0.3em] uppercase px-4 py-1.5 mb-6">
              Legal Framework v1.0
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-none italic uppercase">
              Operational <span className="text-blue-500">Terms</span>
            </h1>
            <div className="prose prose-invert max-w-none space-y-12 text-slate-400 font-medium leading-relaxed">
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <Scale className="h-6 w-6 text-blue-500" /> Usage License
                </h2>
                <p>
                  By accessing the Secure Future Portal, you are granted a non-exclusive, non-transferable license to utilize our Diagnostic Engine. This license is contingent upon your agreement not to reverse-engineer our proprietary scoring algorithms or use the trust matrix for malicious penetration orchestration.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <AlertTriangle className="h-6 w-6 text-amber-500" /> Liability Disclaimer
                </h2>
                <p>
                  While our Neural Engine provides high-fidelity security insights, it is a diagnostic tool, not a defensive silver bullet. We are not liable for breaches occurring on systems that follow or disregard our Strategic Directives. Final security accountability remains with the Node Administrator.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <Zap className="h-6 w-6 text-blue-500" /> Service Integrity
                </h2>
                <p>
                  We reserve the right to terminate session access (Terminate Session) for any identity node found to be violating protocol integrity. Service availability is maintained at a target 99.9% but is subject to maintenance cycles for neural schema updates.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
