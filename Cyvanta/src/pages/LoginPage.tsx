import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle, ArrowRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types";
import { toast } from "sonner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthStore();

  const triggerWelcomeEmail = (recipientEmail: string, fullName?: string) => {
    fetch("/api/send-welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recipientEmail, fullName })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.simulated) {
            toast.info("Welcome Email Simulated", {
              description: "SMTP secrets are unconfigured. To receive real emails, configure your SMTP credentials in AI Studio Settings."
            });
          } else {
            toast.success("Welcome Email Sent!", {
              description: `A secure verification message has been dispatched to ${recipientEmail}.`
            });
          }
        } else {
          toast.error("Email Dispatch Interrupted", {
            description: data.message || "Failed to establish a secure connection to the mail server."
          });
        }
      })
      .catch(err => {
        console.error("Welcome email error:", err);
      });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      // Demo Logic
      await new Promise(r => setTimeout(r, 800));
      if (email && password) {
        // Simple demo simulation
        setUser({ id: "demo-user", email });
        setRole(UserRole.IT_ADMIN);
        
        triggerWelcomeEmail(email);

        navigate("/dashboard");
      } else {
        setError("Please enter email and password");
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setRole(UserRole.IT_ADMIN);

        triggerWelcomeEmail(data.user.email);

        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
        const demoEmail = "admin@example.com";
        setUser({ id: "demo-admin", email: demoEmail });
        setRole(UserRole.IT_ADMIN);
        
        triggerWelcomeEmail(demoEmail, "Demo Administrator");

        setLoading(false);
        navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4 py-20 transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />
      
      <Card className="w-full max-w-md shadow-2xl border-none bg-card/40 border border-border backdrop-blur-3xl rounded-[3rem] overflow-hidden relative z-10 transition-colors">
        <CardHeader className="space-y-4 text-center pt-12 px-10">
          <div className="flex justify-center mb-6">
             <div className="h-20 w-20 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 border border-white/10 flex items-center justify-center glow-blue shadow-2xl">
                <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
             </div>
          </div>
          <CardTitle className="text-4xl font-black text-foreground tracking-tighter uppercase font-mono italic">Access_Portal</CardTitle>
          <CardDescription className="text-muted-foreground font-medium italic">Protocol verification required for node authorization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          {!isSupabaseConfigured && (
            <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-[2rem] flex flex-col gap-4 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="h-12 w-12 text-blue-500" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Sandbox Credentials</h4>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center bg-muted/50 p-3 rounded-xl border border-border">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">IT Admin</span>
                    <code className="text-[10px] text-blue-500 font-bold">admin@secure.com</code>
                 </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic mt-2">
                Use any password for instant segment initialization.
              </p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase text-foreground tracking-widest ml-1">Identity (Email)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="identity@enterprise.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl h-14 bg-muted/20 border-border focus:bg-muted/40 transition-all px-6 text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-black uppercase text-foreground tracking-widest ml-1">Credentials</Label>
                <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                  Lost Key?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl h-14 bg-muted/20 border-border focus:bg-muted/40 transition-all px-6 text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
            {error && <p className="text-sm text-red-500 font-black uppercase tracking-widest text-center text-[10px]">{error}</p>}
            <Button type="submit" className="w-full h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all" disabled={loading}>
              {loading ? "INITIALIZING..." : "VERIFY & ENTER"}
            </Button>
          </form>

          {!isSupabaseConfigured && (
            <div className="pt-6 border-t border-border space-y-4">
              <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-widest">Rapid Sandbox Access</p>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="ghost" size="sm" onClick={() => handleDemoLogin()} className="justify-between h-11 px-6 rounded-xl border border-border text-muted-foreground hover:text-foreground font-black text-[10px] tracking-widest uppercase hover:bg-muted/50 transition-colors">
                  IT Admin <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest border-t border-border bg-muted/30 py-6">
          Access Required? 
          <Link to="/signup" className="text-blue-500 hover:text-blue-400 transition-colors ml-1">Generate Account</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
