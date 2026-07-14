import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, User, Lock, Bell, Palette, Globe, LogOut, Camera, UserCircle, Key, Fingerprint, Smartphone, Laptop, Mail, Zap, Monitor, Trash2, HelpCircle, LifeBuoy, Search, MessageSquare, ExternalLink, Cpu, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

type TabType = "profile" | "authentication" | "alerts" | "interface" | "support";

export function AccountPage() {
  const { user, logout, role } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem(`profile_image_${user?.id}`) || null;
  });
  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    return localStorage.getItem(`biometric_enabled_${user?.id}`) === "true";
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);

  const handleBiometricToggle = () => {
    if (!biometricEnabled) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        const newState = true;
        setBiometricEnabled(newState);
        localStorage.setItem(`biometric_enabled_${user?.id}`, newState.toString());
        import("sonner").then(({ toast }) => {
          toast.success("Biometric scan successful", {
            description: "Neural fingerprint linked to hardware node.",
          });
        });
      }, 2000);
    } else {
      const newState = false;
      setBiometricEnabled(newState);
      localStorage.setItem(`biometric_enabled_${user?.id}`, newState.toString());
      import("sonner").then(({ toast }) => {
        toast.info("Biometric access revoked", {
          description: "Hardware validation protocols deactivated.",
        });
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        import("sonner").then(({ toast }) => toast.error("File dimension too large. Limit: 2MB for neural sync."));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem(`profile_image_${user?.id}`, base64String);
        import("sonner").then(({ toast }) => toast.success("Genetic visual artifact synchronized successfully."));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem(`profile_image_${user?.id}`);
    import("sonner").then(({ toast }) => toast.info("Profile artifact reverted to default identifier."));
  };

  const sessionId = React.useMemo(() => `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in duration-500">
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl transition-all duration-500">
          <div className="text-center space-y-8 max-w-sm px-6">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-blue-600/20 rounded-[2.5rem] animate-pulse" />
              <div className="absolute inset-0 border-t-4 border-blue-600 rounded-[2.5rem] animate-spin" />
              <Fingerprint className="h-16 w-16 text-blue-500 animate-pulse" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-blue-600/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Neural Scanning</h3>
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.2em] animate-pulse">Syncing hardware fingerprint with distributed node certificate...</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-white/5 pb-8">
        <div>
          <Badge className="bg-blue-600/10 text-blue-500 border-none font-black text-[10px] tracking-widest uppercase px-3 mb-2">Account Node</Badge>
          <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">Identity Terminal</h1>
        </div>
        <p className="text-muted-foreground font-medium italic text-sm">Active Session Instance: {sessionId}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-12">
        <aside className="space-y-4">
          <SettingsNavLink 
            icon={<User className="h-4 w-4" />} 
            label="Profile" 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")}
          />
          <SettingsNavLink 
            icon={<Lock className="h-4 w-4" />} 
            label="Security" 
            active={activeTab === "authentication"} 
            onClick={() => setActiveTab("authentication")}
          />
          <SettingsNavLink 
            icon={<Bell className="h-4 w-4" />} 
            label="Notifications" 
            active={activeTab === "alerts"} 
            onClick={() => setActiveTab("alerts")}
          />
          <SettingsNavLink 
            icon={<Palette className="h-4 w-4" />} 
            label="Display" 
            active={activeTab === "interface"} 
            onClick={() => setActiveTab("interface")}
          />
          <SettingsNavLink 
            icon={<HelpCircle className="h-4 w-4" />} 
            label="Help & Support" 
            active={activeTab === "support"} 
            onClick={() => setActiveTab("support")}
          />
        </aside>

        <div className="md:col-span-3 space-y-10">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl transition-colors">
                <div className="bg-muted/30 border-b border-border p-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Account Details</h3>
                    <p className="text-muted-foreground font-medium italic mt-1 text-sm">View and update your personal information.</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Shield className="h-7 w-7" />
                  </div>
                </div>
                
                <div className="p-10 space-y-12">
                   <div className="flex flex-col sm:flex-row items-center gap-8">
                      <div className="relative group">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                        />
                        <div className="h-28 w-28 rounded-[2.5rem] bg-slate-800 flex items-center justify-center text-blue-500 text-4xl font-black border border-white/5 transition-transform group-hover:scale-105 glow-blue overflow-hidden relative">
                           {profileImage ? (
                             <img 
                               src={profileImage} 
                               alt="Avatar" 
                               className="h-full w-full object-cover"
                             />
                           ) : (
                             <img 
                               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                               alt="Avatar" 
                               className="h-full w-full object-cover"
                             />
                           )}
                          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white opacity-40" />
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex gap-2">
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            variant="secondary" 
                            className="h-10 w-10 rounded-xl p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-xl border-4 border-[#020617]"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                          {profileImage && (
                            <Button 
                              onClick={removeProfileImage}
                              variant="destructive" 
                              className="h-10 w-10 rounded-xl p-0 bg-red-600 hover:bg-red-700 text-white shadow-xl border-4 border-[#020617]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="font-black text-3xl text-foreground tracking-tight leading-tight mb-2 uppercase italic">{user?.user_metadata?.full_name || "Protocol Officer"}</h3>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black text-[9px] tracking-widest uppercase">Verified</Badge>
                          <Badge className="bg-blue-600/10 text-blue-500 border-none px-3 py-1 font-black text-[9px] tracking-widest uppercase">Tier: {role}</Badge>
                        </div>
                      </div>
                      <div className="sm:ml-auto">
                        <Button 
                          variant="outline" 
                          className={cn("rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-[0.2em] transition-all", isEditingProfile ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700" : "glass text-muted-foreground hover:text-foreground")}
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                        >
                          {isEditingProfile ? "SAVE CHANGES" : "EDIT PROFILE"}
                        </Button>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-border">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Full Name</Label>
                         <div className="relative">
                           <Input 
                            defaultValue={user?.user_metadata?.full_name || "Priority Officer"} 
                            disabled={!isEditingProfile} 
                            className="rounded-2xl h-16 bg-muted/20 border-border focus:bg-muted/40 focus:border-primary/50 transition-all px-6 text-foreground font-bold placeholder:text-muted-foreground/30" 
                           />
                           {!isEditingProfile && <Lock className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />}
                         </div>
                      </div>
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Account Role</Label>
                         <div className="h-16 bg-white/[0.01] rounded-2xl border border-white/[0.05] flex items-center px-6 grayscale">
                            <Badge variant="outline" className="px-4 py-1.5 font-black text-[10px] tracking-widest bg-blue-600/10 text-blue-500 border-blue-500/30 uppercase">{role}</Badge>
                            <p className="ml-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest italic leading-none">System Only</p>
                         </div>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                         <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Email Address</Label>
                         <div className="relative">
                           <Input 
                            defaultValue={user?.email || ""} 
                            disabled 
                            className="rounded-2xl h-16 bg-white/[0.01] border-white/[0.05] px-6 text-slate-600 font-bold opacity-40 italic" 
                           />
                           <Lock className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-800" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* AUTHENTICATION TAB */}
          {activeTab === "authentication" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl transition-colors">
                <div className="bg-muted/30 border-b border-border p-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Security</h3>
                    <p className="text-muted-foreground font-medium italic mt-1 text-sm">Keep your account safe and secure.</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Key className="h-7 w-7" />
                  </div>
                </div>
                
                <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between p-8 bg-muted/20 rounded-3xl border border-border transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Smartphone className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-black text-foreground uppercase tracking-tight">Two-Factor Authentication</p>
                        <p className="text-xs font-medium text-muted-foreground italic mt-1">Extra security for your login.</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-2 font-black text-[10px] tracking-widest uppercase">Active_Link</Badge>
                  </div>

                  <div className="flex items-center justify-between p-8 bg-muted/20 rounded-3xl border border-border transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Fingerprint className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-black text-foreground uppercase tracking-tight">Fingerprint Login</p>
                        <p className="text-xs font-medium text-muted-foreground italic mt-1">Use your device fingerprint for faster access.</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleBiometricToggle}
                      variant={biometricEnabled ? "default" : "outline"} 
                      className={cn(
                        "rounded-xl font-black text-[10px] tracking-widest uppercase h-10 px-6 transition-all",
                        biometricEnabled ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 glow-emerald" : "border-border text-muted-foreground glass"
                      )}
                    >
                      {biometricEnabled ? "ACTIVE" : "CONFIGURE"}
                    </Button>
                  </div>

                  <div className="pt-8 border-t border-border space-y-6">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Logged In Devices</h4>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between px-6 py-4 bg-muted/10 rounded-2xl border border-border">
                        <div className="flex items-center gap-4">
                          <Laptop className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs font-bold text-foreground uppercase tracking-tight">MacBook Pro M3 x 0xFA2</p>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black tracking-widest border-emerald-500/20 text-emerald-500 uppercase">Primary</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === "alerts" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl transition-colors">
                <div className="bg-muted/30 border-b border-border p-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Notifications</h3>
                    <p className="text-muted-foreground font-medium italic mt-1 text-sm">Choose how you want to be notified about updates.</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Bell className="h-7 w-7" />
                  </div>
                </div>
                
                <div className="p-10 space-y-6">
                  <div className="grid gap-4">
                    <AlertToggle 
                      icon={<Zap className="h-5 w-5" />}
                      title="Security Alerts"
                      description="Get notified about suspicious activity."
                      defaultChecked
                    />
                    <AlertToggle 
                      icon={<Monitor className="h-5 w-5" />}
                      title="Login Logs"
                      description="See when and where you logged in."
                      defaultChecked
                    />
                    <AlertToggle 
                      icon={<Mail className="h-5 w-5" />}
                      title="App News"
                      description="Updates about new features and improvements."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INTERFACE TAB */}
          {activeTab === "interface" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl transition-all hover:bg-card/50">
                 <div className="bg-muted/30 border-b border-border p-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Settings</h3>
                      <p className="text-muted-foreground font-medium italic mt-1 text-sm">Change yours app's appearance and language.</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <Palette className="h-7 w-7" />
                    </div>
                 </div>
                 <div className="p-10 space-y-6">
                    <div className="flex items-center justify-between p-8 bg-muted/20 rounded-3xl border border-border hover:bg-muted/30 transition-all group">
                       <div className="space-y-2">
                          <p className="font-black text-lg text-foreground flex items-center gap-3">
                             <Palette className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" /> Appearance
                          </p>
                          <p className="text-xs font-medium text-muted-foreground italic">Switch between light and dark themes.</p>
                       </div>
                       <ThemeToggle />
                    </div>

                    <div className="flex items-center justify-between p-8 bg-muted/20 rounded-3xl border border-border hover:bg-muted/30 transition-all group">
                       <div className="space-y-2">
                          <p className="font-black text-lg text-foreground flex items-center gap-3">
                             <Globe className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" /> Language
                          </p>
                          <p className="text-xs font-medium text-muted-foreground italic">Choose your preferred language.</p>
                       </div>
                       <Badge variant="outline" className="rounded-xl font-black text-[10px] tracking-[0.2em] border-border text-muted-foreground bg-muted/50 px-6 h-12 uppercase">English</Badge>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* HELP & SUPPORT TAB */}
          {activeTab === "support" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[3rem] bg-card/40 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl">
                <div className="bg-muted/30 border-b border-border p-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Help & Support</h3>
                    <p className="text-muted-foreground font-medium italic mt-1 text-sm">Find guides, contact support, or check our status.</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <LifeBuoy className="h-7 w-7" />
                  </div>
                </div>
                
                <div className="p-10 space-y-10">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="SEARCH FOR HELP..." 
                      className="rounded-3xl h-16 pl-16 bg-muted/20 border-border focus:bg-muted/30 transition-all font-black text-xs tracking-widest uppercase italic"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <SupportCard 
                      icon={<HelpCircle className="h-6 w-6" />}
                      title="Guides & FAQs"
                      description="Browse our guides and common questions."
                      action="OPEN"
                      items={["Getting Started", "Security Basics", "Advanced Config", "Manual Override", "Node Clustering"]}
                    />
                    <SupportCard 
                      icon={<MessageSquare className="h-6 w-6" />}
                      title="Contact Us"
                      description="Talk to a person if you're having trouble."
                      action="START"
                      items={["Agent ID: 442", "Response time: 4m", "Global Support", "Sector 7 Hotline"]}
                    />
                    <SupportCard 
                      icon={<Cpu className="h-6 w-6" />}
                      title="System Status"
                      description="Check if our servers are running correctly."
                      action="CHECK"
                      items={["Latency: 24ms", "Uptime: 99.99%", "Node: AMS-01", "Traffic: Low"]}
                    />
                    <SupportCard 
                      icon={<ExternalLink className="h-6 w-6" />}
                      title="Community"
                      description="Join the discussion on our forums."
                      action="GO TO"
                      items={["Active Users: 1,204", "New threads: 12", "Join Discord", "Reddit Portal"]}
                    />
                  </div>

                  <div className="pt-10 border-t border-border">
                    <div className="bg-blue-600/5 border border-blue-600/20 rounded-[2rem] p-8 flex flex-col sm:flex-row gap-6 items-center">
                      <div className="h-16 w-16 shrink-0 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Zap className="h-8 w-8" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-black text-lg text-foreground uppercase tracking-tight italic">Clear Account Data</h4>
                        <p className="text-xs font-medium text-muted-foreground italic mt-1">Instantly clear your local caches and reset the app node.</p>
                      </div>
                      <Button variant="outline" className="rounded-2xl h-12 px-8 border-red-900/30 text-red-500 font-black text-[10px] tracking-widest uppercase glass hover:bg-red-600 hover:text-white transition-all">
                        CLEAR ALL DATA
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-10 flex flex-col sm:flex-row items-center gap-6">
             <Button variant="ghost" className="w-full sm:w-auto rounded-2xl h-16 px-12 font-black text-red-500 hover:text-white hover:bg-red-600 transition-all gap-3 border border-red-900/20 shrink-0" onClick={logout}>
                <LogOut className="h-5 w-5" /> TERMINATE SESSION
             </Button>
             <Link to="/node" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic flex items-center gap-2 hover:text-blue-500 transition-colors group">
               <ActivityIcon className="h-3 w-3 animate-pulse text-emerald-500 group-hover:text-blue-500" />
               Node Authorization verified by 0x7A2 Control <ExternalLink className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportCard({ icon, title, description, action, items = [] }: { icon: React.ReactNode, title: string, description: string, action: string, items?: string[] }) {
  const handleAction = () => {
    import("sonner").then(({ toast }) => {
      toast.info(`${title} Protocol Initiated`, {
        description: `Connecting to ${title.toLowerCase()} systems...`,
      });
    });
  };

  return (
    <div className="p-8 bg-muted/10 rounded-[2rem] border border-border hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <div className="space-y-4 flex-1">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h4 className="font-black text-foreground uppercase tracking-tight italic">{title}</h4>
          <p className="text-xs font-medium text-muted-foreground italic mt-1 leading-relaxed">{description}</p>
        </div>
        
        {items.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[9px] font-black text-blue-500/60 uppercase tracking-widest">
                <div className="h-1 w-1 rounded-full bg-blue-500" />
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border/40">
        <Button 
          variant="link" 
          onClick={handleAction}
          className="p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400 gap-2"
        >
          {action} PROTOCOL
        </Button>
      </div>
    </div>
  );
}

function SettingsNavLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left group",
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

function AlertToggle({ icon, title, description, defaultChecked }: { icon: React.ReactNode, title: string, description: string, defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between p-8 bg-muted/10 rounded-3xl border border-border hover:bg-muted/20 transition-all group">
      <div className="flex items-center gap-6">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform text-blue-500">
          {icon}
        </div>
        <div>
          <p className="font-black text-foreground uppercase tracking-tight italic">{title}</p>
          <p className="text-xs font-medium text-muted-foreground italic mt-1">{description}</p>
        </div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
