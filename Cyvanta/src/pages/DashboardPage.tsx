import React, { useEffect, useState } from "react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { 
  Shield, AlertTriangle, CheckCircle2, TrendingUp, Calendar, 
  ArrowRight, Info, Plus, ChevronRight, LayoutGrid, ListFilter,
  Activity, ShieldCheck, AlertCircle, Target, RefreshCw, Zap, Lock,
  Download, Building2, Briefcase, Coins, Sparkles, Sliders, 
  ArrowUpRight, ArrowDownRight, Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Assessment, UserRole, QUESTIONS } from "@/types";
import { 
  getRecommendations, 
  calculateCTI, 
  getOperationalCyberExposure, 
  getIndustryConfig, 
  getRiskLevel, 
  getMaturityLevel 
} from "@/lib/scoring";
import { handleExportPDF } from "@/lib/pdfReport";

// Standard fallback if no record exists
const DEMO_ASSESSMENT: Assessment = {
  id: "demo-alpha",
  user_id: "demo-user",
  created_at: new Date().toISOString(),
  trust_score: 74,
  risk_level: "Moderate Risk",
  maturity_level: "Advanced Governance",
  answers: {
    1: "Yes",
    2: "Partially",
    3: "Yes",
    4: "Partially",
    5: "No",
    6: "Yes",
    7: "Partially",
    8: "Yes",
    9: "Yes",
    10: "No"
  },
  company_size: "11–50",
  company_industry: "Retail",
  company_revenue: "₹50L–₹5Cr"
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(() => {
    const localData = localStorage.getItem('latest_assessment');
    return localData ? JSON.parse(localData) : null;
  });
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  // States for interactive Strategic Simulation (What-If sandbox)
  const [simPassword, setSimPassword] = useState(false);
  const [simMFA, setSimMFA] = useState(false);
  const [simTraining, setSimTraining] = useState(false);
  const [simBackups, setSimBackups] = useState(false);
  const [simDeviceSecurity, setSimDeviceSecurity] = useState(false);
  const [simIRPlan, setSimIRPlan] = useState(false);



  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let dataLatest = null;
        try {
          const resLatest = await fetch("/api/assessments/latest");
          if (resLatest.ok) {
            dataLatest = await resLatest.json();
          }
        } catch (e) {
          console.log("Server fetch failed, using local storage");
        }
        
        if (!dataLatest || Object.keys(dataLatest).length === 0) {
          const localData = localStorage.getItem('latest_assessment');
          if (localData) {
            try {
              dataLatest = JSON.parse(localData);
            } catch (e) {
              console.error("Local data parse error", e);
            }
          }
        }

        if (dataLatest && Object.keys(dataLatest).length > 0) {
          setLatestAssessment(dataLatest);
        }
        
        try {
          const resHistory = await fetch("/api/assessments");
          if (resHistory.ok) {
            let dataHistory = await resHistory.json();
            const localData = localStorage.getItem('latest_assessment');
            if (localData) {
              const parsed = JSON.parse(localData);
              if (!dataHistory.some((h: any) => h.id === parsed.id)) {
                dataHistory = [parsed, ...dataHistory];
              }
            }
            setHistory(dataHistory);
          }
        } catch (e) {
          console.log("History fetch failed");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setTimeout(() => setLoading(false), 1200);
      }
    }
    fetchData();
  }, []);

  const displayAssessment = latestAssessment || history[0] || DEMO_ASSESSMENT;

  // Retrieve current active strategic configuration
  const companySize = displayAssessment.company_size || "11–50";
  const companyIndustry = displayAssessment.company_industry || "Retail";
  const companyRevenue = displayAssessment.company_revenue || "₹50L–₹5Cr";

  // Calculate dynamic CTI and strategic modules
  const currentCtiDataset = calculateCTI(displayAssessment.answers || {}, companyIndustry);
  const currentExposure = getOperationalCyberExposure(
    currentCtiDataset.overallScore, 
    companySize, 
    companyIndustry, 
    companyRevenue
  );
  const industryConfig = getIndustryConfig(companyIndustry);

  // Recommendations calculated standardly
  const recommendations = getRecommendations(displayAssessment.answers || {});

  // Solve strongest and weakest pillars for consultative intelligence insights
  const pillarList = [
    { name: "Identity Confidence", key: "identity", val: currentCtiDataset.pillars.identity, weight: currentCtiDataset.weightsUsed.identity, desc: "Mandatory multifactor barriers and managed administrator life-cycles." },
    { name: "Workforce Readiness", key: "workforce", val: currentCtiDataset.pillars.workforce, weight: currentCtiDataset.weightsUsed.workforce, desc: "Employee phishing campaigns and incident threat education campaigns." },
    { name: "Data Resilience", key: "resilience", val: currentCtiDataset.pillars.resilience, weight: currentCtiDataset.weightsUsed.resilience, desc: "Resilient offsite backup systems and secure customer classification grids." },
    { name: "Operational Security", key: "operational", val: currentCtiDataset.pillars.operational, weight: currentCtiDataset.weightsUsed.operational, desc: "Continuous end-posture software and software upgrade policies." },
    { name: "Governance Maturity", key: "governance", val: currentCtiDataset.pillars.governance, weight: currentCtiDataset.weightsUsed.governance, desc: "Legal emergency cybersecurity playbooks and formal risk frameworks." }
  ];

  const sortedPillars = [...pillarList].sort((a,b) => b.val - a.val);
  const strongestPillar = sortedPillars[0];
  const weakestPillar = sortedPillars[sortedPillars.length - 1];

  // Radar Data calibrated on weighted pillars
  const radarData = pillarList.map(p => ({
    subject: p.name,
    A: p.val,
    fullMark: 100,
  }));

  // Calibrate simulation metrics
  const simAnswers = { ...(displayAssessment.answers || {}) };
  if (simPassword) simAnswers[1] = "Yes";
  if (simMFA) simAnswers[2] = "Yes";
  if (simTraining) simAnswers[4] = "Yes";
  if (simBackups) simAnswers[5] = "Yes";
  if (simDeviceSecurity) simAnswers[7] = "Yes";
  if (simIRPlan) simAnswers[10] = "Yes";

  const simulatedCtiDataset = calculateCTI(simAnswers, companyIndustry);
  const simulatedRiskLevel = getRiskLevel(simulatedCtiDataset.overallScore);
  const simulatedMaturity = getMaturityLevel(simulatedCtiDataset.overallScore);
  const simulatedExposure = getOperationalCyberExposure(
    simulatedCtiDataset.overallScore,
    companySize,
    companyIndustry,
    companyRevenue
  );

  // Financial delta risk reduction
  const riskReductionValue = Math.max(0, currentExposure.maxVal - simulatedExposure.maxVal);
  const formatRupee = (val: number): string => {
    if (val >= 100000) {
      return `₹${Math.round(val / 100000)}L`;
    }
    return `₹${val}`;
  };



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] bg-background">
        <div className="relative mb-12">
          <div className="h-32 w-32 rounded-[2.5rem] border-[6px] border-blue-600/10 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="h-10 w-10 text-blue-500 animate-pulse" />
          </div>
        </div>
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-black tracking-[0.3em] text-foreground uppercase italic animate-pulse">Running Decision Engine</h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Compiling trust pillars and cyber exposure grids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl animate-in fade-in duration-1000 bg-background transition-colors duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-blue-600/10 text-blue-500 border-blue-500/20 font-black text-[10px] tracking-widest px-3 py-1 uppercase rounded-lg">
              Enterprise Cyber Context Calibrated
            </Badge>
            <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
               <Building2 className="h-3 w-3 text-indigo-500" />
               <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{companyIndustry} sector</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
               <Coins className="h-3 w-3 text-emerald-500" />
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{companyRevenue} revenue</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-none">Decision Intelligence</h1>
          <p className="text-muted-foreground font-medium italic flex items-center gap-3 text-sm md:text-base">
            <span className="h-px w-10 bg-border" /> Operational trust indexing, firmographic risk modeling, and strategic projection.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest glass text-muted-foreground hover:text-foreground transition-all hover:scale-105"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4 text-blue-500 animate-spin-slow" /> Re-examine Score
          </Button>
          <Button 
            onClick={() => handleExportPDF({
              ...displayAssessment,
              trust_score: currentCtiDataset.overallScore, // Dynamic compliance Index
            })}
            className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
          >
            <Download className="mr-2 h-4 w-4" /> Download Executive PDF
          </Button>
          <Button className="rounded-2xl h-14 px-10 font-black bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105" asChild>
            <Link to="/assessment">
              <Plus className="mr-2 h-5 w-5" /> Adjust Profile
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Dynamic consulting strategic KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KpiCard 
          title="Cyber Trust Index (CTI)" 
          value={currentCtiDataset.overallScore} 
          subtitle="Weighted protective posture index"
          icon={<Shield className="h-6 w-6 text-blue-500" />}
          progress={currentCtiDataset.overallScore}
          statusColor="text-blue-500"
        />
        <KpiCard 
          title="Operational Cyber Exposure" 
          value={currentExposure.range} 
          subtitle="Estimated operational financial risk"
          icon={<Coins className="h-6 w-6 text-emerald-500" />}
          progress={Math.max(10, 100 - currentCtiDataset.overallScore)}
          statusColor={currentCtiDataset.overallScore >= 75 ? "text-emerald-500" : currentCtiDataset.overallScore >= 50 ? "text-amber-500" : "text-red-500"}
        />
        <KpiCard 
          title="Security Maturity Stage" 
          value={getMaturityLevel(currentCtiDataset.overallScore).split(" ")[0]} 
          subtitle={`Level matches ${getMaturityLevel(currentCtiDataset.overallScore)}`}
          icon={<Zap className="h-6 w-6 text-indigo-500" />}
          progress={currentCtiDataset.overallScore}
          statusColor="text-indigo-500"
        />
        <KpiCard 
          title="Industry Peer Benchmark" 
          value={`${companyIndustry} (${industryConfig.benchmark})`} 
          subtitle={
            currentCtiDataset.overallScore >= industryConfig.benchmark 
              ? `${currentCtiDataset.overallScore - industryConfig.benchmark} pts above sector average`
              : `${industryConfig.benchmark - currentCtiDataset.overallScore} pts below sector average`
          }
          icon={<Building2 className="h-6 w-6 text-amber-500" />}
          progress={industryConfig.benchmark}
          statusColor={currentCtiDataset.overallScore >= industryConfig.benchmark ? "text-emerald-500" : "text-amber-500"}
        />
      </div>

      {/* Main Analysis and Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Side: CTI Breakdown and Pillars */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
          <div className="rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <Badge className="bg-blue-600/10 text-blue-400 border-none px-3 font-semibold text-[9px] tracking-wider uppercase mb-1">Pillar Breakdown</Badge>
                  <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Cyvanta Cyber Trust Index (CTI) Framework</h3>
                  <p className="text-muted-foreground text-sm italic mt-0.5">Weighted calibration mapped precisely across five foundational risk disciplines.</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0 select-none">
                  <Target className="h-6 w-6" />
                </div>
              </div>

              {/* Pillars progress and details list */}
              <div className="space-y-6 mt-8">
                {pillarList.map((pillar) => (
                  <div key={pillar.key} className="p-4 rounded-2xl bg-muted/20 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-muted/40">
                    <div className="space-y-1 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm tracking-tight">{pillar.name}</span>
                        <Badge className="bg-indigo-500/10 text-indigo-400 text-[8px] font-bold py-0.5 border-none">
                          Weight {Math.round(pillar.weight * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">{pillar.desc}</p>
                    </div>
                    
                    <div className="flex-1 max-w-xs space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Compliance Rating</span>
                        <span className={`font-black ${pillar.val >= 80 ? "text-emerald-400" : pillar.val >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {pillar.val}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden p-[0.5px]">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            pillar.val >= 80 ? "bg-emerald-500" : pillar.val >= 50 ? "bg-amber-500" : "bg-red-500"
                          }`} 
                          style={{ width: `${pillar.val}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strongest and Weakest Pillar Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[2rem] bg-emerald-500/5 p-6 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 block">Strongest Pillar Advantage</span>
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 shrink-0 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-md">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-1">{strongestPillar.name}</h4>
                  <p className="text-xs text-muted-foreground italic leading-snug">
                    Currently performing at {strongestPillar.val}% protection rating, acting as a reliable shield for critical assets.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-red-500/5 p-6 border border-red-500/10 hover:bg-red-500/10 transition-all">
              <span className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em] mb-4 block">Largest Structural Opportunity</span>
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 shrink-0 rounded-xl bg-red-500/15 flex items-center justify-center text-red-500 border border-red-500/20 shadow-md">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-1">{weakestPillar.name}</h4>
                  <p className="text-xs text-muted-foreground italic leading-snug">
                    {weakestPillar.name} is currently the weakest dimension and presents the largest opportunity for improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Radar and Industry insights */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          
          {/* Radar Representation */}
          <div className="rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border p-6 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Badge className="bg-indigo-600/10 text-indigo-400 border-none px-3 font-semibold text-[9px] tracking-wider uppercase mb-1">Visual Index Mapping</Badge>
                <h3 className="text-lg font-black text-foreground tracking-tight uppercase italic">Strategic Posture Grid</h3>
              </div>
            </div>
            
            <div className="h-[280px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="currentColor" className="text-border" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "currentColor", className: "text-muted-foreground", fontSize: 9, fontWeight: 900, letterSpacing: "0.05em" }} />
                  <Radar
                     name="CTI Rating"
                     dataKey="A"
                     stroke="#2563eb"
                     strokeWidth={3}
                     fill="#2563eb"
                     fillOpacity={0.15}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Consultation Level: Cyber Risk Exposure Card */}
          <div className="rounded-[2.5rem] bg-gradient-to-br from-card/30 to-muted/20 border border-border p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <AlertTriangle className="h-32 w-32" />
            </div>
            
            <div className="space-y-4 mb-6">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.25em] block">Exposure Intelligence</span>
              <h3 className="text-2xl font-black text-white uppercase italic leading-none">Operational Cyber Exposure</h3>
              <p className="text-muted-foreground text-xs italic">
                Active business exposure model calculated on current company revenue scale ({companyRevenue}) mapped against trust score limits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-muted/40 border border-border/80 text-left mb-6 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.06),_transparent)]">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-2">Projected Operational Range</div>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-tight glow-emerald">{currentExposure.range}</div>
              <div className="flex gap-2 items-center mt-3 text-[10px] text-muted-foreground font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Confidence Rating: <span className="text-white font-black">{currentExposure.confidence}</span></span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest block">Contributing Risk Factors:</span>
              <ul className="space-y-2">
                {currentExposure.factors.map((f, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2 italic">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-border/40 mt-6 pt-4">
              <p className="text-[10px] text-muted-foreground/50 leading-normal italic text-center">
                * Operational Exposure estimate is designed for risk mitigation priorities and does not constitute structural legal evaluation or compliance liability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 4 — STRATEGIC WHAT-IF SYSTEM SIMULATOR */}
      <div className="rounded-[2.5rem] bg-gradient-to-tr from-card/40 to-[#0c1328]/30 border border-border p-8 lg:p-12 shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Sliders className="h-44 w-44 text-blue-500" />
        </div>
        
        <div className="flex flex-col xl:flex-row justify-between gap-10 mb-10 pb-8 border-b border-border/40">
          <div className="space-y-4 max-w-xl">
            <Badge className="bg-indigo-600/10 text-indigo-400 border-none px-3 font-semibold text-[9px] uppercase tracking-widest py-1">Interactive Sandbox Tool</Badge>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-tight">Interactive What-If Simulator</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs font-black uppercase text-indigo-400 tracking-wider block mb-1">🎯 The Objective (What this does):</span>
                <p className="text-slate-700 dark:text-muted-foreground text-sm leading-relaxed">
                  This tool lets you test and visualize security upgrades for your business. By selecting the security options below, you can see in real-time how your security score rises and how your projected financial risk drops.
                </p>
              </div>
              
              <div>
                <span className="text-xs font-black uppercase text-indigo-400 tracking-wider block mb-1">💡 The Reason (Why use this):</span>
                <p className="text-slate-700 dark:text-muted-foreground text-sm leading-relaxed">
                  Enterprise security measures are investments that require planning. This simulator helps you prioritize the most critical upgrades, build a business case for budgets, and protect your enterprise with maximum efficiency before spending any money.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 bg-muted/20 border border-border/50 p-6 rounded-2xl max-w-md">
            <div className="flex items-center gap-3">
              <Sliders className="h-6 w-6 text-indigo-500 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">Simple Planning Guide</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-muted-foreground italic leading-relaxed">
              Think of these toggles as a plan. Activating them shows how taking these security actions turns unfinished items into reliable, protective shields for your business data and computers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Left: Checkboxes */}
          <div className="xl:col-span-5 space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-widest block mb-4">Select Upgrades to Simulation Mode:</h4>
            
            <div className="space-y-3">
              <SimulatorToggle 
                label="Enable Multi-Factor Authentication (MFA)" 
                sub="Require a secure code sent to phones or apps when logging in to prevent password leaks"
                active={simMFA} 
                onClick={() => setSimMFA(!simMFA)} 
              />
              <SimulatorToggle 
                label="Formulate Strong Password Rules" 
                sub="Enforce strict requirements on length and characters for all company accounts"
                active={simPassword} 
                onClick={() => setSimPassword(!simPassword)} 
              />
              <SimulatorToggle 
                label="Educating Workers Against Phishing Emails" 
                sub="Regular training so your team can spot and avoid clicking on fake online scams"
                active={simTraining} 
                onClick={() => setSimTraining(!simTraining)} 
              />
              <SimulatorToggle 
                label="Store Secure, Separate Offsite Backups" 
                sub="Automatically back up files to multiple locations so you never lose control of data"
                active={simBackups} 
                onClick={() => setSimBackups(!simBackups)} 
              />
              <SimulatorToggle 
                label="Secure All Computers & Devices" 
                sub="Use advanced antivirus and threat monitoring on all work laptops and phones"
                active={simDeviceSecurity} 
                onClick={() => setSimDeviceSecurity(!simDeviceSecurity)} 
              />
              <SimulatorToggle 
                label="Write an Emergency Security Action Plan" 
                sub="Provide clear instructions for how your team should respond if a security incident occurs"
                active={simIRPlan} 
                onClick={() => setSimIRPlan(!simIRPlan)} 
              />
            </div>
          </div>

          {/* Right: Comparative outcomes */}
          <div className="xl:col-span-7 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* CURRENT STATE CARD */}
              <div className="rounded-3xl border border-border/60 bg-muted/10 p-6 space-y-4 cursor-default">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Your Current Status</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground italic">Security Level Score</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{currentCtiDataset.overallScore} <span className="text-xs text-muted-foreground">/100</span></span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground italic">Possible Fire Damage Cost</span>
                    <span className="font-extrabold text-slate-700 dark:text-[#94a3b8]">{currentExposure.range}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground italic">Threat Risk Category</span>
                    <span className={`font-black ${getRiskLevel(currentCtiDataset.overallScore) === "Low Risk" ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"}`}>
                      {getRiskLevel(currentCtiDataset.overallScore)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground italic">Business Security Readiness</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-right">{getMaturityLevel(currentCtiDataset.overallScore)}</span>
                  </div>
                </div>
              </div>

              {/* SIMULATED PROJECTED STATE */}
              <div className="rounded-3xl border border-blue-500/20 bg-blue-600/5 p-6 space-y-4 cursor-default relative overflow-hidden">
                <div className="absolute -top-12 -right-12 h-24 w-24 bg-blue-500/10 blur-xl rounded-full" />
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block font-sans">Projected Upgraded Status</span>
                  <Badge className="bg-blue-600/15 text-blue-400 text-[8px] font-black uppercase border-none py-0.5">Simulated sandbox</Badge>
                </div>
                
                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground italic">Simulated Security Score</span>
                    <span className="text-3xl font-black text-blue-400">
                      {simulatedCtiDataset.overallScore} 
                      <span className="text-xs text-muted-foreground"> /100</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground italic">Simulated Damage Cost</span>
                    <span className="font-extrabold text-emerald-400">{simulatedExposure.range}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground italic">Simulated Risk Category</span>
                    <span className={`font-black uppercase text-[10px] ${simulatedRiskLevel === "Low Risk" ? "text-emerald-400" : "text-amber-400"}`}>
                      {simulatedRiskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground italic">Simulated Security Readiness</span>
                    <span className="font-extrabold text-blue-300 text-right">{simulatedMaturity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Deltas Feedback */}
            <div className="mt-6 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="space-y-1">
                <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Expected Score Increase</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" strokeWidth={3} />
                  <span>+{simulatedCtiDataset.overallScore - currentCtiDataset.overallScore} points</span>
                </div>
                <div className="text-[10px] text-muted-foreground italic leading-tight">Your rating increases when security improves.</div>
              </div>

              <div className="space-y-1">
                <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Threat Protection Boost</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>
                    {getRiskLevel(currentCtiDataset.overallScore) !== simulatedRiskLevel ? (
                      <span className="text-emerald-500 dark:text-emerald-400 text-lg uppercase font-black">{getRiskLevel(currentCtiDataset.overallScore).split(" ")[0]} → {simulatedRiskLevel.split(" ")[0]}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm uppercase">Posture Strengthened</span>
                    )}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground italic leading-tight">Stepping up your business defenses.</div>
              </div>

              <div className="space-y-1">
                <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Potential Money Saved</div>
                <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                  <ArrowDownRight className="h-5 w-5 text-emerald-500" strokeWidth={3} />
                  <span>{formatRupee(riskReductionValue)} saved</span>
                </div>
                <div className="text-[10px] text-muted-foreground italic leading-tight">Estimated savings from avoiding cyber-attacks.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Actions Mapped Standardly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border p-8 shadow-2xl flex flex-col transition-colors">
          <div className="flex flex-row items-center justify-between gap-4 mb-6">
            <div>
              <Badge className="bg-indigo-600/10 text-indigo-400 border-none px-3 font-semibold text-[9px] tracking-wider uppercase mb-1">Peer Compliance Index</Badge>
              <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">{companyIndustry} Risk Profile</h3>
              <p className="text-muted-foreground font-medium italic text-xs mt-0.5">Consultative guidelines based strictly on sector parameters.</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-grow space-y-6">
            <div className="p-5 rounded-2xl bg-muted/25 border border-border/60">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block mb-2">Industry Strategic Outlook:</span>
              <p className="text-sm font-semibold text-white leading-relaxed italic">"{industryConfig.insights}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/20 border border-border text-left">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Target Sector Benchmark</span>
                <span className="text-2xl font-extrabold text-white">{industryConfig.benchmark} / 100</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/20 border border-border text-left">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Compliance Status</span>
                <span className={`text-xl font-black ${currentCtiDataset.overallScore >= industryConfig.benchmark ? "text-emerald-400" : "text-amber-400"}`}>
                  {currentCtiDataset.overallScore >= industryConfig.benchmark ? "BEATING AVG" : "ATTN REQUIRED"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border p-8 shadow-2xl flex flex-col transition-colors">
          <div className="flex flex-row items-center justify-between gap-4 mb-6">
            <div>
              <Badge className="bg-[#ef4444]/10 text-[#ef4444] border-none px-3 font-semibold text-[9px] tracking-wider uppercase mb-1">Remediation Roadmap</Badge>
              <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Targeted System Upgrades</h3>
              <p className="text-muted-foreground font-medium italic mt-0.5 text-xs">Best steps prioritized dynamically based on failed checkpoints.</p>
            </div>
            <Badge className="bg-muted text-muted-foreground border border-border font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-lg shrink-0">
              {recommendations.length} Pending
            </Badge>
          </div>
          
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {recommendations.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border rounded-2xl">
                <p className="text-emerald-400 font-extrabold leading-normal uppercase">Perfect Compliance Index Met!</p>
                <p className="text-xs text-muted-foreground italic mt-1">Checklist has resolved zero pending security vulnerabilities.</p>
              </div>
            ) : (
              recommendations.map((rec: any, idx: number) => {
                const userNote = displayAssessment.notes?.[rec.id];
                return (
                  <div key={idx} className="group relative rounded-2xl bg-muted/20 border border-border p-5 transition-all hover:bg-muted/40 hover:border-blue-500/50 hover:translate-x-1">
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border transition-colors ${
                        rec.priority === "High" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }`}>
                        {String(rec.id).toLowerCase().includes("mfa") || rec.text.toLowerCase().includes("mfa") ? <Shield className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-foreground group-hover:text-blue-400 transition-colors leading-tight mb-2 uppercase italic">{rec.text}</p>
                        <div className="flex items-center gap-3">
                           <Badge className={`h-4 text-[8px] font-black uppercase tracking-widest px-2 border-none ${
                             rec.priority === "High" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-400"
                           }`}>
                             {rec.priority}
                           </Badge>
                           <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{rec.category}</span>
                        </div>
                        
                        {userNote && userNote.trim() && (
                          <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-muted-foreground leading-relaxed">
                            <span className="font-extrabold text-blue-400 block mb-1 uppercase tracking-wider text-[9px]">Your Custom Setup Details:</span>
                            <span className="italic">"{userNote}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button variant="ghost" className="mt-6 w-full rounded-2xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted font-black text-[10px] tracking-widest uppercase h-14 transition-all" asChild>
            <Link to="/history">View Configuration Vault <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Infrastructure Notes log */}
      {displayAssessment.notes && Object.values(displayAssessment.notes).some(n => (n as string)?.trim().length > 0) && (
        <div className="rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border p-8 shadow-2xl flex flex-col transition-colors">
          <div className="flex flex-row items-center justify-between gap-4 mb-6">
            <div>
              <Badge className="bg-indigo-600/10 text-indigo-400 border-none px-3 font-semibold text-[9px] tracking-wider uppercase mb-1">Configuration Ledger</Badge>
              <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Active Operations Log</h3>
              <p className="text-muted-foreground font-medium italic mt-0.5 text-sm">Documented setups input by the audit administrator.</p>
            </div>
            <Badge className="bg-blue-600/15 text-blue-400 border border-blue-500/20 font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-lg">
              Active Logs Mapped
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {QUESTIONS.map((q) => {
              const note = displayAssessment.notes?.[q.id];
              if (!note || !note.trim()) return null;
              const ans = displayAssessment.answers?.[q.id] || "No";
              
              return (
                <div key={q.id} className="rounded-2xl bg-muted/10 border border-border/60 p-5 space-y-4 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-1">{q.category}</span>
                        <p className="text-sm font-black text-foreground leading-snug">{q.text}</p>
                      </div>
                      <Badge className={`h-5 text-[8px] font-black uppercase tracking-widest px-2.5 shrink-0 select-none border-none ${
                        ans === "Yes" ? "bg-emerald-500/10 text-emerald-400" :
                        ans === "Partially" ? "bg-amber-500/10 text-amber-400" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {ans === "Yes" ? "Fully Done" : ans === "Partially" ? "Partially" : "Not Yet"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[#0f172a]/40 border border-border/30 text-xs italic text-slate-300">
                    <span className="not-italic font-black text-blue-400 text-[8px] uppercase tracking-widest block mb-1">Administrator Entry:</span>
                    "{note}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, progress, statusColor }: any) {
  return (
    <div className="group relative rounded-[2rem] bg-card/40 backdrop-blur-3xl border border-border p-6 overflow-hidden transition-all hover:bg-card/60 hover:border-blue-500/30 hover:scale-[1.03] cursor-default">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12">
        {icon}
      </div>
      
      <div className="relative z-10 w-full min-w-0">
        <h3 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-[0.25em] mb-4">{title}</h3>
        <div className="flex items-baseline gap-2 mb-6 min-w-0">
          <p className={`font-black text-foreground tracking-tighter text-glow-blue uppercase italic truncate ${
            typeof value === "number"
              ? "text-5xl"
              : String(value).length > 10
                ? "text-xl sm:text-2xl"
                : "text-2xl sm:text-3xl"
          }`} title={String(value)}>
            {value}
          </p>
          {typeof value === "number" && <span className="text-muted-foreground font-bold text-lg shrink-0">/100</span>}
        </div>
        
        <div className="space-y-4">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-[1px] border border-border">
            <div className={`h-full rounded-full transition-all duration-1500 ${statusColor.replace("text-", "bg-")} shadow-[0_0_15px_rgba(37,99,235,0.4)]`} style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`h-2 w-2 rounded-full ${statusColor.replace("text-", "bg-")} shadow-[0_0_10px_currentColor]`} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulatorToggle({ label, sub, active, onClick }: { label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-300 ${
        active 
          ? "bg-blue-600/15 border-blue-500/70 text-blue-900 dark:text-white shadow-[0_0_15px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/30"
          : "bg-muted/10 border-slate-200 dark:border-slate-800 hover:bg-muted/20 hover:border-slate-300 dark:hover:border-slate-700 text-muted-foreground"
      }`}
    >
      <div className="space-y-0.5">
        <div className={`text-xs font-black uppercase tracking-tight transition-colors ${
          active ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
        }`}>{label}</div>
        <div className="text-[10px] italic text-slate-500 dark:text-muted-foreground">{sub}</div>
      </div>
      <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
        active 
          ? "bg-blue-600 border-blue-500 text-white scale-110 shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
          : "border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 group-hover:border-blue-500/50"
      }`}>
        {active ? (
          <Check className="h-4 w-4 stroke-[3px]" />
        ) : (
          <span className="block h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 opacity-20" />
        )}
      </div>
    </button>
  );
}
