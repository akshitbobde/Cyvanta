import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, Fingerprint, Lock, ShieldCheck, Activity, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SecurityProtocolPage() {
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
              Hardened Stack v4.4
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-none italic uppercase">
              Security <span className="text-blue-500">Protocol</span>
            </h1>
            <div className="prose prose-invert max-w-none space-y-12 text-slate-400 font-medium leading-relaxed">
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <ShieldCheck className="h-6 w-6 text-blue-500" /> Defense-in-Depth
                </h2>
                <p>
                  Our architecture is built on a multi-layered security substrate. We utilize modern cryptographic primitives to ensure data integrity at every stage of the lifecycle.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <Fingerprint className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Biometric Auth</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <Lock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Encryption at Rest</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Real-time Auditing</span>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <Cpu className="h-6 w-6 text-blue-500" /> Automated Remediation
                </h2>
                <p>
                  The Neural Trust Matrix doesn't just identify gaps—it initiates automated directives. By integrating with your existing identity providers, we can trigger security challenges or session expirations based on real-time risk fluctuations.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase italic tracking-tight">
                  <ShieldAlert className="h-6 w-6 text-blue-500" /> Threat Intelligence
                </h2>
                <p>
                  We consume global threat vectors in real-time, adjusting your Trust Score dynamically as new zero-day vulnerabilities are discovered. This proactive stance allows our nodes to stay ahead of the adversarial curve.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
