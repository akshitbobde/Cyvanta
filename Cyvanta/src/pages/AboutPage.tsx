import React from "react";
import { motion } from "motion/react";
import { Shield, Target, Activity, Cpu, Zap, ShieldCheck, Lock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50" />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-blue-600/10 text-blue-500 border-none font-black text-[10px] tracking-[0.3em] uppercase px-4 py-1.5 mb-6">
              Cyvanta v1.4
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-none">
              Simple Security Check <span className="text-blue-500">Methodology</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium italic leading-relaxed">
              Cyvanta is an easy-to-use tool that assesses your cybersecurity practices and gives you a clear score with simple, step-by-step security guidelines.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mechanics Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={<Cpu className="h-8 w-8 text-blue-500" />}
              title="Identity & Logins"
              description="Verify logins, multi-factor authentication (MFA), and passwords to make sure your company access holds strong."
            />
            <FeatureItem 
              icon={<ShieldCheck className="h-8 w-8 text-emerald-500" />}
              title="Threat Prevention"
              description="Compare your current setup against standard security practices to point out any risks before they become a problem."
            />
            <FeatureItem 
              icon={<Target className="h-8 w-8 text-indigo-500" />}
              title="Simple Scoring"
              description="Get a clear and simple rating out of 100 based entirely on standard best practices."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black tracking-tighter text-white">How it Works</h2>
              <div className="space-y-6">
                <Step 
                  number="01" 
                  title="Initialize Check" 
                  text="Run the security survey to map your current setups across logins, data backup, and devices."
                />
                <Step 
                  number="02" 
                  title="Generate Score" 
                  text="Our logic engine processes your responses instantly against industry standards to find safety gaps."
                />
                <Step 
                  number="03" 
                  title="Follow Simple Steps" 
                  text="Get plain-English recommendations to lock down your accounts and improve your score step by step."
                />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="glass-dark p-12 rounded-[3.5rem] border border-white/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                   <Activity className="h-40 w-40 text-blue-500" />
                 </div>
                 <div className="relative z-10 space-y-8">
                   <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                     <Lock className="h-8 w-8 text-white" />
                   </div>
                   <h3 className="text-2xl font-black text-white italic">"Data security should be simple, helpful, and protective for everyone."</h3>
                   <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700" />
                     <div>
                       <p className="text-sm font-black text-white">Technical Lead</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cyvanta Engineering</p>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-dark p-10 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all hover:translate-y-[-8px] group">
      <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase italic">{title}</h3>
      <p className="text-slate-500 font-medium text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, text }: { number: string, title: string, text: string }) {
  return (
    <div className="flex gap-6 group">
      <span className="text-4xl font-black text-slate-800 group-hover:text-blue-500 transition-colors duration-500">{number}</span>
      <div className="space-y-1">
        <h4 className="text-lg font-black text-white uppercase tracking-tight">{title}</h4>
        <p className="text-slate-500 font-medium text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
