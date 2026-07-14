import { Outlet, Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Shield } from "lucide-react";
import { Toaster } from "sonner";

export function Layout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/10 transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Toaster position="top-center" expand visibleToasts={3} theme="dark" />
      <footer className="border-t border-border py-12 mt-20 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center glow-blue">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter text-foreground">Cyvanta</span>
            </div>
            
            <p className="text-xs font-medium text-muted-foreground text-center lg:text-left">
              © {new Date().getFullYear()} Cyvanta. Architectural Trust Verification for Enterprise SMEs.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                <span>Contact: support@cyvanta.com</span>
              </div>
              
              <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-blue-500 transition-colors">Terms</Link>
                <Link to="/security" className="hover:text-blue-500 transition-colors">Security</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
