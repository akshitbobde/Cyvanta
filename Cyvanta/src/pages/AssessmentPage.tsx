import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Save, Building2, Briefcase, Coins, Sparkles, Globe } from "lucide-react";
import { QUESTIONS, AssessmentAnswer, UserRole } from "@/types";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { calculateScore, getMaturityLevel, getRiskLevel } from "@/lib/scoring";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export function AssessmentPage() {
  const { 
    currentStep, 
    answers, 
    notes, 
    companySize, 
    companyIndustry, 
    companyRevenue, 
    companyJurisdiction,
    setAnswer, 
    setNote, 
    setCompanySize, 
    setCompanyIndustry, 
    setCompanyRevenue, 
    setCompanyJurisdiction,
    nextStep, 
    prevStep, 
    setStep, 
    reset 
  } = useAssessmentStore();
  const { user, role } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [showStrategicOnboarding, setShowStrategicOnboarding] = useState(false);
  const navigate = useNavigate();

  const totalSteps = QUESTIONS.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleStart = () => {
    setShowStrategicOnboarding(true);
  };

  const handleAnswer = (answer: AssessmentAnswer) => {
    setAnswer(currentStep, answer);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setProcessingStatus("ANALYZING RESPONSES...");
    
    await new Promise(r => setTimeout(r, 1200));
    setProcessingStatus("CALCULATING RATINGS...");
    await new Promise(r => setTimeout(r, 1000));
    setProcessingStatus("FINALIZING SECURITY SCORE...");
    await new Promise(r => setTimeout(r, 800));

    // Calculate score using our updated weighted scoring module with industry specificity
    const score = calculateScore(answers, companyIndustry);
    const risk = getRiskLevel(score);
    const maturity = getMaturityLevel(score);

    const assessmentData = {
      user_id: user?.id,
      answers: answers,
      notes: notes,
      trust_score: score,
      risk_level: risk,
      maturity_level: maturity,
      company_size: companySize,
      company_industry: companyIndustry,
      company_revenue: companyRevenue,
      company_jurisdiction: companyJurisdiction,
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("assessments").insert([assessmentData]);
        if (error) throw error;
      }
      
      try {
        await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assessmentData),
        });
      } catch (e) {
        console.error("API Error:", e);
      }
      
      localStorage.setItem('latest_assessment', JSON.stringify({
        ...assessmentData,
        id: Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString()
      }));

      reset();
      navigate("/dashboard");
    } catch (err) {
      console.error("Save error:", err);
      reset();
      navigate("/dashboard");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.05)_0%,_transparent_70%)] animate-pulse" />
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center relative max-w-lg w-full"
        >
           <div className="relative z-10 space-y-12">
             <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-[spin_1.5s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-b-4 border-emerald-500/50 animate-[spin_2s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Shield className="h-10 w-10 text-blue-500" />
                </div>
             </div>
             <div className="space-y-4">
                <h2 className="text-2xl font-black text-foreground tracking-[0.2em] uppercase">{processingStatus}</h2>
                <div className="flex justify-center gap-1">
                   {[...Array(5)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="h-1 w-8 bg-blue-600 rounded-full"
                      />
                   ))}
                </div>
             </div>
           </div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 0) {
    if (showStrategicOnboarding) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4 py-8 transition-colors duration-500">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
          
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
             className="max-w-2xl w-full relative z-10"
          >
            <div className="glass-dark rounded-[3rem] border border-border p-8 md:p-12 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="space-y-2">
                <Badge className="bg-blue-600/15 text-blue-400 border-none font-black text-[9px] tracking-[0.25em] uppercase px-3 py-1">Risk Context Modeler</Badge>
                <h1 className="text-3xl font-black tracking-tight text-foreground">Strategic Company Profile</h1>
                <p className="text-muted-foreground text-sm italic">
                  Frame your organization's context to calibrate risk exposure estimates, critical pillar weighting, and custom industry benchmarks.
                </p>
              </div>

              {/* 3 Blocks for profiling */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] block mb-3 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-500" /> Primary Industry Sector
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Retail", "Finance", "Healthcare", "SaaS", "Manufacturing", "Education", "Professional Services"].map((ind) => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => setCompanyIndustry(ind)}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all text-center ${companyIndustry === ind ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20" : "bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground"}`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] block mb-3 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-indigo-500" /> Company Size (Workforce)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["1–10 employees", "11–50", "51–200", "201+"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setCompanySize(sz)}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all text-center ${companySize === sz ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20" : "bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground"}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] block mb-3 flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-emerald-500" /> Annual Revenue Range
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Less than ₹50L", "₹50L–₹5Cr", "₹5Cr–₹25Cr", "₹25Cr+"].map((rev) => (
                      <button
                        key={rev}
                        type="button"
                        onClick={() => setCompanyRevenue(rev)}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all text-center ${companyRevenue === rev ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground"}`}
                      >
                        {rev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] block mb-2 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-cyan-500" /> Compliance Jurisdiction & Regulatory Framework
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { key: "India (DPDP)", label: "India (DPDP Act)", sub: "Digital Personal Data Protection" },
                      { key: "EU (GDPR)", label: "Europe (GDPR)", sub: "General Data Protection" },
                      { key: "US / Global (NIST)", label: "US / Global (NIST)", sub: "NIST Sp 800-53 / NIST CSF" }
                    ].map((jur) => (
                      <button
                        key={jur.key}
                        type="button"
                        onClick={() => setCompanyJurisdiction(jur.key)}
                        className={`text-xs font-bold py-3 px-4 rounded-xl border transition-all text-left flex flex-col justify-between ${companyJurisdiction === jur.key ? "bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-500/20" : "bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground"}`}
                      >
                        <span className="font-extrabold uppercase text-[10px] tracking-tight">{jur.label}</span>
                        <span className={`text-[9px] font-medium leading-none.5 mt-1 block italic ${companyJurisdiction === jur.key ? "text-cyan-100" : "text-muted-foreground/60"}`}>{jur.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-muted/30 text-muted-foreground"
                  onClick={() => {
                    // Use defaults and proceed
                    setStep(1);
                    setShowStrategicOnboarding(false);
                  }}
                >
                  Skip Context Setup
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                  onClick={() => {
                    setStep(1);
                    setShowStrategicOnboarding(false);
                  }}
                >
                  Confirm & Start <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4 transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
        
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
           className="max-w-xl w-full relative z-10"
        >
          <div className="glass-dark rounded-[3.5rem] border border-border p-12 text-center space-y-10 shadow-2xl overflow-hidden group">
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-600/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              <Shield className="h-12 w-12 text-white" strokeWidth={2.5} />
            </div>
            
            <div className="space-y-4">
              <Badge className="bg-blue-600/10 text-blue-500 border-none font-black text-[10px] tracking-[0.3em] uppercase px-4 py-1.5 mb-2">Ready to Start</Badge>
              <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">Security Assessment</h1>
              <p className="text-muted-foreground font-medium leading-relaxed italic">Check your security practices, find gaps, and get standard recommendations with simple steps to secure your accounts.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4">
              <div className="p-6 rounded-[2rem] bg-muted/30 border border-border text-left hover:bg-muted/50 transition-all">
                <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] mb-1">Time to complete</p>
                <p className="text-2xl font-black text-foreground">~3 <span className="text-[10px] text-muted-foreground">MINS</span></p>
              </div>
              <div className="p-6 rounded-[2rem] bg-muted/30 border border-border text-left hover:bg-muted/50 transition-all">
                <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] mb-1">Complexity</p>
                <p className="text-2xl font-black text-foreground italic">Easy</p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-18 rounded-3xl text-xl font-black bg-blue-600 hover:bg-blue-700 shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-95 group" 
              onClick={handleStart}
            >
              START SECURITY CHECK
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentStep - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24 pb-12 px-4 relative overflow-hidden transition-colors duration-500">
      <div className="container mx-auto max-w-3xl relative z-10 flex flex-col flex-grow">
        <header className="mb-16 space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600/10 text-blue-500 border-none font-black text-[9px] tracking-[0.2em] uppercase px-3">Question {currentStep} OF {totalSteps}</Badge>
                <div className="h-1 w-1 rounded-full bg-muted" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{currentQuestion.category}</span>
              </div>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] font-mono italic mt-1">Assessment ID: {Math.random().toString(16).substring(2, 10).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-md rounded-full scale-x-105" style={{ width: `${progress}%` }} />
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden p-[1px] border border-border">
              <motion.div 
                className="h-full bg-blue-500 rounded-full glow-blue"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </header>

        <main className="flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40, rotateY: 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -40, rotateY: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="perspective-[1000px]"
            >
              <div className="glass-dark rounded-[3.5rem] border border-border overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8">
                  <div className="h-10 w-10 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-muted-foreground font-bold">
                    {currentStep}
                  </div>
                </div>
                
                <div className="px-8 md:px-16 pt-20 pb-16 space-y-12">
                  <div className="space-y-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black leading-tight text-foreground tracking-tighter">
                      {currentQuestion.text}
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium italic max-w-lg mx-auto">
                      {currentQuestion.description}
                    </p>
                  </div>

                  <div className="grid gap-4 max-w-xl mx-auto">
                    <AnswerTile 
                      label="YES, FULLY DONE" 
                      subLabel="Fully set up and in use"
                      selected={answers[currentStep] === "Yes"} 
                      onClick={() => handleAnswer("Yes")} 
                    />
                    <AnswerTile 
                      label="PARTIALLY DONE" 
                      subLabel="Partially set up or some employees do it"
                      selected={answers[currentStep] === "Partially"} 
                      onClick={() => handleAnswer("Partially")} 
                    />
                    <AnswerTile 
                      label="NO, NOT YET" 
                      subLabel="Not set up or planned yet"
                      selected={answers[currentStep] === "No"} 
                      onClick={() => handleAnswer("No")} 
                    />
                  </div>

                  <div className="max-w-xl mx-auto space-y-3 pt-6 border-t border-border/40">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] block">
                        What setup/tools do you have in place right now? (Optional)
                      </label>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase bg-[#1e293b]/60 px-2.5 py-0.5 rounded-lg border border-border/30">
                        Optional
                      </span>
                    </div>
                    <textarea
                      placeholder="e.g. We use password policies via group GPO, standard brand management tools, or custom enterprise SSO..."
                      value={notes[currentStep] || ""}
                      onChange={(e) => setNote(currentStep, e.target.value)}
                      className="w-full min-h-[96px] rounded-[1.5rem] border border-border/80 bg-[rgba(15,23,42,0.3)] p-4 text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="mt-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={currentStep === 1} 
            className="rounded-2xl h-14 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-30"
          >
            <ArrowLeft className="mr-3 h-4 w-4" /> PREVIOUS QUESTION
          </Button>

          <div className="flex gap-4">
             {currentStep === totalSteps ? (
               <Button 
                 size="lg" 
                 className="rounded-2xl font-black px-12 h-16 bg-blue-600 hover:bg-blue-700 shadow-[0_0_30px_rgba(37,99,235,0.4)] text-[11px] uppercase tracking-[0.2em] animate-bounce-subtle" 
                 disabled={!answers[currentStep]}
                 onClick={handleSubmit}
               >
                 SUBMIT & GET SCORE <ArrowRight className="ml-3 h-5 w-5" />
               </Button>
             ) : (
               <Button 
                 variant="ghost" 
                 onClick={nextStep} 
                 disabled={!answers[currentStep]} 
                 className="rounded-2xl h-14 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/30"
               >
                 NEXT QUESTION <ArrowRight className="ml-3 h-4 w-4" />
               </Button>
             )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function AnswerTile({ label, subLabel, selected, onClick }: { label: string, subLabel: string, selected: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full text-left p-6 rounded-[2rem] border transition-all duration-500 group overflow-hidden
        ${selected ? "bg-blue-600 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]" : "bg-muted/30 border-border hover:bg-muted/50 hover:border-border/50"}
      `}
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <p className={`text-xl font-black tracking-tight ${selected ? "text-white" : "text-foreground"}`}>{label}</p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${selected ? "text-blue-100/60" : "text-muted-foreground italic"}`}>{subLabel}</p>
        </div>
        <div className={`
          h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100
          ${selected ? "border-white bg-white text-blue-600 shadow-xl" : "border-border bg-muted"}
        `}>
          {selected && <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />}
        </div>
      </div>
    </button>
  );
}

