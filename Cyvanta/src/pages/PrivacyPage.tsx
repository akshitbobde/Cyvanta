import React from "react";
import { motion } from "motion/react";
import { Shield, Eye, Lock, Database, Globe, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PrivacyPage() {
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
              Data Sovereignty v2.1
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-none italic uppercase">
              Privacy <span className="text-blue-500">Manifesto</span>
            </h1>
            <div className="prose prose-invert max-w-none space-y-12 text-slate-400 font-medium leading-relaxed">
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <Eye className="h-6 w-6 text-blue-500" /> Information Synthesis
                </h2>
                <p>
                  Secure Future operates on a zero-knowledge substrate. We do not ingest your proprietary architecture; we analyze mathematical representations of your security state. Any data processed through our Diagnostic Engine is fragmented and encrypted at the edge before reaching our Neural Matrix.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <PrivacyItem 
                    title="Identity Metadata" 
                    text="We store basic cryptographic fragments of your identity (email, role) solely for node authorization."
                  />
                  <PrivacyItem 
                    title="Diagnostic Telemetry" 
                    text="Assessment responses are aggregated as weighted vectors to calculate maturity scores without leaking specific stack details."
                  />
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <Lock className="h-6 w-6 text-blue-500" /> Logic Guardians
                </h2>
                <p>
                  Our internal policies forbid the unauthorized interrogation of user datasets. Access to your Archive is restricted to your specific UID via Firebase Security Rules, ensuring that your security posture remains your exclusive intellectual asset.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <Share2 className="h-6 w-6 text-blue-500" /> Third-Party Isolation
                </h2>
                <p>
                  We do not monetize your vulnerability data. Information is never shared with external actors unless required by high-level jurisdictional mandates or explicitly authorized by your Node Administrator for integration purposes.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function PrivacyItem({ title, text }: { title: string, text: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
      <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest">{title}</h4>
      <p className="text-sm italic">{text}</p>
    </div>
  );
}
