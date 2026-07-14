import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { LandingPage } from "@/pages/LandingPage";
import { AboutPage } from "@/pages/AboutPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AssessmentPage } from "@/pages/AssessmentPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { AccountPage } from "@/pages/AccountPage";
import { NodeProfilePage } from "@/pages/NodeProfilePage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { TermsPage } from "@/pages/TermsPage";
import { SecurityProtocolPage } from "@/pages/SecurityProtocolPage";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types";
import { supabase } from "@/lib/supabase";

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, role: userRole, loading } = useAuthStore();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground uppercase tracking-[0.3em] font-black italic animate-pulse">Initializing Command Console...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

export default function App() {
  const { setUser, setRole, setLoading } = useAuthStore();

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "dark");
    }

    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setRole(UserRole.IT_ADMIN);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setRole(UserRole.IT_ADMIN);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setRole, setLoading]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="assessment" element={
            <ProtectedRoute role="Edit">
              <AssessmentPage />
            </ProtectedRoute>
          } />
          
          <Route path="history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="account" element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } />
          <Route path="node" element={
            <ProtectedRoute>
              <NodeProfilePage />
            </ProtectedRoute>
          } />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="security" element={<SecurityProtocolPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
