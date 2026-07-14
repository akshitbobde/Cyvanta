import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Cpu, 
  Settings, 
  Activity, 
  Database, 
  Globe, 
  Zap, 
  Server, 
  Wifi, 
  Lock, 
  RefreshCcw, 
  Terminal,
  Signal,
  Component,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

type TabType = "telemetry" | "network" | "security" | "logs";

export function NodeProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("telemetry");
  const [cpuUsage, setCpuUsage] = useState(42);
  const [ramUsage, setRamUsage] = useState(68);
  const [diskUsage, setDiskUsage] = useState(24);

  // Simulate real-time telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      setRamUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nodeId = React.useMemo(() => `NODE-X-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-white/5 pb-8">
        <div>
          <Badge className="bg-blue-600/10 text-blue-500 border-none font-black text-[10px] tracking-widest uppercase px-3 mb-2">Scanner Profile</Badge>
          <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">Scanner Status</h1>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground font-medium italic text-sm">System ID: {nodeId}</p>
          <div className="flex items-center gap-2 justify-end mt-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Active</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 md:gap-12">
        <aside className="flex flex-row md:flex-col overflow-x-auto gap-3 pb-4 md:pb-0 md:space-y-4 scrollbar-none shrink-0 border-b border-border/10 md:border-b-0">
          <SettingsNavLink 
            icon={<Activity className="h-4 w-4" />} 
            label="Performance" 
            active={activeTab === "telemetry"} 
            onClick={() => setActiveTab("telemetry")}
          />
          <SettingsNavLink 
            icon={<Globe className="h-4 w-4" />} 
            label="Network" 
            active={activeTab === "network"} 
            onClick={() => setActiveTab("network")}
          />
          <SettingsNavLink 
            icon={<Lock className="h-4 w-4" />} 
            label="Data Security" 
            active={activeTab === "security"} 
            onClick={() => setActiveTab("security")}
          />
          <SettingsNavLink 
            icon={<Terminal className="h-4 w-4" />} 
            label="Activity Logs" 
            active={activeTab === "logs"} 
            onClick={() => setActiveTab("logs")}
          />
        </aside>

        <div className="md:col-span-3 space-y-10">
          {/* TELEMETRY TAB */}
          {activeTab === "telemetry" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[2rem] sm:rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl transition-colors">
                <div className="bg-muted/30 border-b border-border p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Performance Diagnostics</h3>
                    <p className="text-muted-foreground font-medium italic mt-1 text-sm">Real-time resources and workspace scanning performance.</p>
                  </div>
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Cpu className="h-7 w-7" />
                  </div>
                </div>
                
                <div className="p-6 sm:p-10 space-y-8 sm:space-y-12">
                   <div className="grid gap-10">
                     <ResourceMetric 
                        label="Processor Load" 
                        value={Math.round(cpuUsage)} 
                        icon={<Zap className="h-5 w-5 text-yellow-500" />}
                        description="Computing power used to analyze your responses."
                     />
                     <ResourceMetric 
                        label="System Memory Usage" 
                        value={Math.round(ramUsage)} 
                        icon={<Component className="h-5 w-5 text-blue-500" />}
                        description="Active buffers for quick-checking security."
                     />
                     <ResourceMetric 
                        label="Storage Capacity" 
                        value={diskUsage} 
                        icon={<HardDrive className="h-5 w-5 text-emerald-500" />}
                        description="Space occupied by safe local and remote assets."
                     />
                   </div>

                   <div className="pt-8 sm:pt-10 border-t border-border">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <StatsCard label="Uptime" value="142:24:12" subtitle="Continuous Runtime" />
                        <StatsCard label="Threads" value="1,024" subtitle="Active Processes" />
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* NETWORK TAB */}
          {activeTab === "network" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[2rem] sm:rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl transition-colors">
                <div className="bg-muted/30 border-b border-border p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Connection Information</h3>
                    <p className="text-muted-foreground font-medium italic mt-1 text-sm">Detailed IP routes and network channels.</p>
                  </div>
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Wifi className="h-7 w-7" />
                  </div>
                </div>
                
                <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                  <div className="grid gap-6">
                    <InfoRow label="Internal Address" value="10.42.0.128" />
                    <InfoRow label="External Server" value="192.168.1.1" />
                    <InfoRow label="DNS Route" value="8.8.8.8 (Google Public)" />
                    <InfoRow label="Transfer Speed" value="1.2 Gbps" />
                  </div>
 
                  <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="font-black text-foreground uppercase tracking-tight italic">Fast Loading Mode</p>
                      <p className="text-xs font-medium text-muted-foreground italic">Reduces standard loading waiting times.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <div className="rounded-[2rem] sm:rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl transition-colors">
                <div className="bg-muted/30 border-b border-border p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Secure Encryption</h3>
                    <p className="text-muted-foreground font-medium italic mt-1 text-sm">Automatic cryptography and security keys.</p>
                  </div>
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Lock className="h-7 w-7" />
                  </div>
                </div>
                
                <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                  <div className="bg-blue-600/5 border border-blue-600/20 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
                    <div className="h-20 w-20 shrink-0 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-inner">
                      <RefreshCcw className="h-10 w-10 animate-spin-slow" />
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-2">
                       <h4 className="font-black text-2xl text-foreground uppercase tracking-tight italic">Key Rotation</h4>
                       <p className="text-xs font-medium text-muted-foreground italic max-w-md">Your database security keys are rotated automatically every 24 hours to keep files secure.</p>
                    </div>
                    <Button className="w-full sm:w-auto rounded-2xl h-14 px-10 bg-blue-600 hover:bg-blue-700 font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-lg active:scale-95">
                       ROTATE NOW
                    </Button>
                  </div>
 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <SecurityFeature label="SSL/TLS 1.3" status="Active" enabled />
                     <SecurityFeature label="AES-256 GCM" status="Active" enabled />
                     <SecurityFeature label="Standard Firewall" status="Active" enabled />
                     <SecurityFeature label="Backup Storage Plan" status="Ready" enabled={false} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === "logs" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <div className="rounded-[2rem] sm:rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl transition-colors">
                <div className="bg-muted/30 border-b border-border p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Activity Console</h3>
                    <p className="text-muted-foreground font-medium italic mt-1 text-sm">Continuous running actions and audit streams.</p>
                  </div>
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Terminal className="h-7 w-7" />
                  </div>
                </div>
                
                <div className="p-4 sm:p-8">
                   <div className="bg-black/80 rounded-[1.5rem] sm:rounded-3xl p-4 sm:p-8 font-mono text-[10px] space-y-3 max-h-[500px] overflow-y-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                      <LogEntry time="11:42:01" level="INFO" message="Establishing secure connection to sector 7..." />
                      <LogEntry time="11:42:04" level="SUCCESS" message="Data stream validation successful." />
                      <LogEntry time="11:43:12" level="INFO" message="Key rotation complete. New certificate issued." />
                      <LogEntry time="11:45:30" level="WARN" message="Spike in browser traffic detected." />
                      <LogEntry time="11:46:12" level="INFO" message="Resource allocation normalized." />
                      <LogEntry time="11:48:00" level="INFO" message="Incremental data backup saved safely." />
                      <LogEntry time="11:50:00" level="INFO" message="Awaiting next scanning request..." />
                      <div className="h-4 w-1.5 bg-blue-500 animate-pulse mt-2" />
                   </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-10 flex flex-col sm:flex-row items-center gap-6">
             <Button variant="outline" className="w-full sm:w-auto rounded-2xl h-16 px-12 font-black text-foreground hover:bg-muted transition-all gap-3 border border-border shrink-0">
                <RefreshCcw className="h-5 w-5" /> RESTART SCANNER
             </Button>
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic flex items-center gap-2">
               <Shield className="h-3 w-3 text-blue-500" />
               Scanner authorization verified with Cyvanta Control v1
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, subtitle }: { label: string, value: string, subtitle: string }) {
  return (
    <div className="p-6 sm:p-8 bg-muted/20 rounded-[2rem] sm:rounded-[2.5rem] border border-border hover:bg-muted/30 transition-all group">
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3">{label}</p>
      <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter group-hover:text-blue-500 transition-colors uppercase italic">{value}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2 italic">{subtitle}</p>
    </div>
  );
}

function ResourceMetric({ label, value, icon, description }: { label: string, value: number, icon: React.ReactNode, description: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h4 className="font-black text-foreground uppercase tracking-tight italic">{label}</h4>
            <p className="text-[10px] font-medium text-muted-foreground italic">{description}</p>
          </div>
        </div>
        <span className="text-2xl font-black italic text-foreground tracking-tighter">{value}%</span>
      </div>
      <Progress value={value} className="h-3 rounded-full bg-muted border border-border" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/40 last:border-0 hover:bg-muted/5 px-2 rounded-lg transition-colors">
      <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-xs font-mono font-bold text-foreground bg-muted/30 px-3 py-1 rounded-md">{value}</span>
    </div>
  );
}

function SecurityFeature({ label, status, enabled }: { label: string, status: string, enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 bg-muted/10 rounded-2xl border border-border group hover:bg-muted/20 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("h-3 w-3 rounded-full", enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-muted-foreground/30")}></div>
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <Badge variant="outline" className={cn("text-[8px] font-black tracking-widest uppercase border-none", enabled ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground bg-muted/20")}>
        {status}
      </Badge>
    </div>
  );
}

function LogEntry({ time, level, message }: { time: string, level: string, message: string }) {
  const color = level === "SUCCESS" ? "text-emerald-500" : level === "WARN" ? "text-yellow-500" : "text-blue-500";
  return (
    <div className="flex gap-4 group">
      <span className="text-white/20 shrink-0 select-none group-hover:text-white/40 transition-colors">[{time}]</span>
      <span className={cn("font-black tracking-widest shrink-0 w-16", color)}>{level}</span>
      <span className="text-white/60 group-hover:text-white transition-colors">{message}</span>
    </div>
  );
}

function SettingsNavLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 md:gap-4 w-auto md:w-full px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left group shrink-0 whitespace-nowrap",
        active ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-blue-500")}>
        {icon}
      </span>
      {label}
    </button>
  );
}
