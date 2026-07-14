import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Shield, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types";
import { toast } from "sonner";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role] = useState<UserRole>(UserRole.IT_ADMIN);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthStore();

  const triggerWelcomeEmail = (recipientEmail: string, recipientName?: string) => {
    fetch("/api/send-welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recipientEmail, fullName: recipientName })
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      // Demo logic
      await new Promise(r => setTimeout(r, 800));
      setUser({ id: "demo-user", email, user_metadata: { full_name: fullName, role } });
      setRole(role);

      triggerWelcomeEmail(email, fullName);

      navigate("/assessment");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        setRole(role);

        triggerWelcomeEmail(data.user.email, data.user.user_metadata?.full_name || fullName);

        navigate("/assessment");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4 py-20 transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />
      
      <Card className="w-full max-w-md shadow-2xl border-none bg-card/40 border border-border backdrop-blur-3xl rounded-[3rem] overflow-hidden relative z-10 transition-colors">
        <CardHeader className="space-y-4 text-center pt-12 px-10">
          <div className="flex justify-center mb-6">
             <div className="h-20 w-20 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 border border-white/10 flex items-center justify-center glow-blue shadow-2xl">
                <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
             </div>
          </div>
          <CardTitle className="text-4xl font-black text-foreground tracking-tighter uppercase font-mono italic">Node_Provision</CardTitle>
          <CardDescription className="text-muted-foreground font-medium italic">Establish your security officer credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          {!isSupabaseConfigured && (
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-4 mb-6 transition-colors">
              <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest leading-relaxed">
                <p className="mb-1">Demo Mode Activated</p>
                <p className="opacity-60 normal-case font-medium text-muted-foreground">Remote database not detected. Initializing sandbox session.</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase text-foreground tracking-widest ml-1">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Cyber Security Lead" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-2xl h-14 bg-muted/20 border-border focus:bg-muted/40 transition-all px-6 text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
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
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <Label htmlFor="role" className="text-xs font-black uppercase text-foreground tracking-widest ml-1">Access Tier</Label>
              <Input 
                id="role" 
                value="IT Administrator" 
                disabled 
                className="rounded-2xl h-14 bg-muted/10 border-border px-6 text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-black uppercase text-foreground tracking-widest ml-1">Credentials (Password)</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl h-14 bg-muted/20 border-border focus:bg-muted/40 transition-all px-6 text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
            {error && <p className="text-sm text-red-500 font-black uppercase tracking-widest text-center text-[10px]">{error}</p>}
            <Button type="submit" className="w-full h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all" disabled={loading}>
              {loading ? "INITIALIZING..." : "START BASELINE SCAN"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest border-t border-border bg-muted/30 py-6 transition-colors">
          Identity Exists? 
          <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors ml-1">Verify Credentials</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
