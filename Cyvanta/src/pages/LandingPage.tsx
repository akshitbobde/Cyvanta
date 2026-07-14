import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, Clock, CheckCircle2, ArrowRight, Zap, Lock, Users } from "lucide-react";
import { motion } from "motion/react";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-44 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-500/20 glow-blue">
              <Zap className="h-3 w-3 fill-current" />
              <span>Simple Security Check</span>
            </div>
            <h1 className="text-6xl md:text-[10rem] font-black tracking-[-0.05em] mb-10 leading-[0.8] bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent uppercase">
              CYV<span className="text-blue-500 italic drop-shadow-[0_0_35px_rgba(59,130,246,0.3)]">ANTA</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed font-medium italic">
              Easily check your security, get a clear score, and follow step-by-step instructions to protect your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="h-18 px-12 text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-[0_0_30px_rgba(37,99,235,0.4)] rounded-3xl group transition-all hover:scale-105 active:scale-95 w-full sm:w-auto" asChild>
                <Link to="/signup">
                  START SECURITY SURVEY
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="h-18 px-12 text-lg font-black border border-border glass text-muted-foreground hover:bg-muted/30 hover:text-foreground rounded-3xl w-full sm:w-auto transition-all" asChild>
                <Link to="/about">HOW IT WORKS</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Logo Section */}
      <section className="py-20 border-y border-border bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 grayscale group-hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-black text-foreground mb-2 tracking-tighter">75%+</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-tight">Apps Without <br /> Security Baseline</div>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-border text-center">
              <div className="text-4xl font-black text-foreground mb-2 tracking-tighter">39s</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-tight">Avg Attack <br /> Interval</div>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-border text-center">
              <div className="text-4xl font-black text-foreground mb-2 tracking-tighter">30k+</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-tight">Daily Targeted <br /> Attacks</div>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-border text-center">
              <div className="text-4xl font-black text-foreground mb-2 tracking-tighter">82%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-tight">SME Exposure <br /> Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mb-20">
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Core Benefits</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-6">Designed to make safety easy and clear.</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
              We turn complicated security topics into easy, actionable tasks so you have a straightforward checklist to protect your assets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Shield className="h-10 w-10 text-blue-500" />}
              title="Simple Setup Audit"
              description="Find any standard security gaps in your login habits, passwords, and security setup instantly."
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10 text-emerald-500" />}
              title="Instant Safety Score"
              description="Get a clear rating out of 100 based on your current setup, showing you where you are safe and what needs work."
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-indigo-500" />}
              title="Identity & Login Checks"
              description="Ensure double authentication, recovery backups, and offboarding systems are in place perfectly."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-44 relative overflow-hidden bg-blue-600">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[0.9]">Secure your <br /> digital future.</h2>
            <p className="text-blue-100 max-w-xl mx-auto mb-14 text-lg font-medium opacity-80">
              Don't leave your protection to chance. Answer a few simple questions to understand where you can secure your accounts today.
            </p>
            <Button size="lg" variant="secondary" className="h-16 px-14 text-lg font-black bg-white text-blue-600 hover:bg-slate-100 rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95 group" asChild>
              <Link to="/signup">
                Take the Security Quiz
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group p-10 bg-card/20 border border-border rounded-[2.5rem] hover:bg-card/40 hover:border-blue-500/30 transition-all duration-500 shadow-xl"
    >
      <div className="mb-8 p-4 bg-muted border border-border inline-block rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-xl">{icon}</div>
      <h3 className="text-2xl font-black tracking-tight text-foreground mb-4 uppercase italic">{title}</h3>
      <p className="text-muted-foreground font-medium leading-relaxed">{description}</p>
    </motion.div>
  );
}
