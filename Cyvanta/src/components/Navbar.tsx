import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Shield, 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  LayoutGrid, 
  UserCircle, 
  Activity,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobMenuOpen, setMobMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMobMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="sticky top-0 z-50 w-full">
      <nav className="border-b border-border bg-background/80 backdrop-blur-2xl h-20 flex items-center transition-colors relative z-20">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group transition-all duration-300">
            <div className="relative">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105 group-hover:rotate-3 border border-white/10">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_10px_#10b981] animate-pulse" />
            </div>
            <div className="hidden sm:flex flex-col justify-center translate-y-[1px]">
              <span className="text-2xl font-black tracking-[-0.05em] text-foreground block leading-none group-hover:text-blue-400 transition-colors">
                CYV<span className="text-blue-500 group-hover:text-foreground transition-colors">ANTA</span>
              </span>
              <span className="text-[9px] font-black tracking-[0.4em] text-muted-foreground uppercase mt-1 block opacity-60">
                OPERATIONAL_NODE v1.4
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="hidden lg:flex items-center gap-2">
                  <NavButton to="/dashboard" active={location.pathname === "/dashboard"}>Console</NavButton>
                  <NavButton to="/assessment" active={location.pathname === "/assessment"}>Diagnostic</NavButton>
                  <NavButton to="/history" active={location.pathname === "/history"}>Archives</NavButton>
                </div>

                <div className="h-8 w-px bg-border mx-2 hidden lg:block" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-11 w-11 rounded-xl p-0 overflow-hidden border border-border hover:border-blue-500/30 transition-all group flex items-center justify-center bg-muted/50">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                        alt="Avatar" 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-card/95 backdrop-blur-2xl border-border rounded-2xl p-2 shadow-2xl mr-4 mt-2" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="p-4">
                        <div className="flex flex-col space-y-1">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Authenticated Node</p>
                          <p className="text-sm font-black text-foreground truncate leading-tight">{user.email}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Badge className="bg-blue-600/10 text-blue-500 border-none px-2 py-0 h-4 font-black text-[8px] tracking-widest uppercase">IT_ADMIN</Badge>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuGroup className="p-1">
                      <DropdownMenuItem className="rounded-xl h-11 px-3 font-black text-[10px] tracking-widest uppercase hover:bg-accent cursor-pointer outline-none group" asChild>
                        <Link to="/account">
                          <UserCircle className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" /> 
                          Account Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl h-11 px-3 font-black text-[10px] tracking-widest uppercase hover:bg-accent cursor-pointer outline-none group" asChild>
                        <Link to="/node">
                          <Activity className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" /> 
                          Node Profile
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem 
                        className="rounded-xl h-11 px-3 font-black text-[10px] tracking-widest uppercase text-red-400 hover:text-white hover:bg-red-500/20 cursor-pointer outline-none"
                        onClick={logout}
                      >
                        <LogOut className="mr-3 h-4 w-4" /> Terminate Session
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Hamburger Switcher on Mobile/Tablet */}
                <Button
                  variant="ghost"
                  onClick={() => setMobMenuOpen(!mobMenuOpen)}
                  className="lg:hidden h-11 w-11 rounded-xl p-0 border border-border hover:bg-muted/50 flex items-center justify-center text-foreground transition-all shrink-0 active:scale-95"
                  id="hamburger-menu-btn"
                >
                  {mobMenuOpen ? <X className="h-5 w-5 text-blue-500" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-6">
                <Link 
                  to="/about" 
                  className="font-black text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-blue-400 transition-colors hidden sm:block"
                >
                  System Protocol
                </Link>
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] tracking-[0.2em] uppercase h-11 px-8 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 group" asChild>
                  <Link to="/login">Access Portal <Activity className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" /></Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dynamic Slide-down Panel */}
      <AnimatePresence>
        {mobMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden w-full border-b border-border bg-background/95 backdrop-blur-3xl overflow-hidden shadow-2xl absolute left-0 right-0 top-20 z-10"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-3">
              <Link
                to="/dashboard"
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase transition-all ${
                  location.pathname === "/dashboard"
                    ? "text-blue-400 bg-blue-600/10 shadow-[inset_0_0_15px_rgba(37,99,235,0.05)] border border-blue-500/20"
                    : "text-slate-400 hover:text-blue-400 hover:bg-muted/20 border border-transparent"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-blue-500" />
                Console Dashboard
              </Link>
              <Link
                to="/assessment"
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase transition-all ${
                  location.pathname === "/assessment"
                    ? "text-blue-400 bg-blue-600/10 shadow-[inset_0_0_15px_rgba(37,99,235,0.05)] border border-blue-500/20"
                    : "text-slate-400 hover:text-blue-400 hover:bg-muted/20 border border-transparent"
                }`}
              >
                <Activity className="h-4 w-4 text-blue-500" />
                Diagnostic Survey
              </Link>
              <Link
                to="/history"
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase transition-all ${
                  location.pathname === "/history"
                    ? "text-blue-400 bg-blue-600/10 shadow-[inset_0_0_15px_rgba(37,99,235,0.05)] border border-blue-500/20"
                    : "text-slate-400 hover:text-blue-400 hover:bg-muted/20 border border-transparent"
                }`}
              >
                <History className="h-4 w-4 text-blue-500" />
                Compliance Archives
              </Link>
              
              <div className="h-px bg-border/45 my-3" />
              
              <div className="flex flex-col gap-3 px-4">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Device shortcuts</p>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <Link 
                    to="/account" 
                    className={`text-[9px] font-bold p-3 rounded-lg border border-border hover:border-blue-500/30 transition-all text-center uppercase tracking-widest ${
                      location.pathname === "/account" ? "text-blue-400 bg-blue-600/5 min-w-[100px]" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Account
                  </Link>
                  <Link 
                    to="/node" 
                    className={`text-[9px] font-bold p-3 rounded-lg border border-border hover:border-blue-500/30 transition-all text-center uppercase tracking-widest ${
                      location.pathname === "/node" ? "text-blue-400 bg-blue-600/5 min-w-[100px]" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Node Stats
                  </Link>
                </div>
              </div>

              <div className="h-px bg-border/45 my-2" />
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-extrabold text-[10px] tracking-[0.28em] uppercase transition-all"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Terminate Session
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Button 
      variant="ghost" 
      className={`font-black text-[10px] tracking-[0.2em] uppercase transition-all relative group h-10 px-4 ${
        active ? "text-blue-400 bg-blue-600/10" : "text-slate-500 hover:text-blue-400 hover:bg-transparent"
      }`}
      asChild
    >
      <Link to={to}>
        {children}
        <span className={`absolute -bottom-1 left-4 right-4 h-0.5 bg-blue-500 transition-transform origin-left ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`} />
      </Link>
    </Button>
  );
}

