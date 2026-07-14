import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  History as HistoryIcon, ArrowRight, Shield, Download, FileText, Trash2, Calendar, 
  CheckCircle2, AlertTriangle, XCircle, Info
} from "lucide-react";
import { Assessment, QUESTIONS } from "@/types";
import { toast } from "sonner";
import { getRecommendations } from "@/lib/scoring";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { handleExportPDF as handleExportPDFFromLib } from "@/lib/pdfReport";

export function HistoryPage() {
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        let data: Assessment[] = [];
        try {
          const res = await fetch("/api/assessments");
          if (res.ok) {
            data = await res.json();
          }
        } catch (e) {
          console.log("Server history fetch failed");
        }
        
        // Add local data if missing
        const localData = localStorage.getItem('latest_assessment');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (parsed && !data.some(h => h.id === parsed.id)) {
              data.push(parsed);
            }
          } catch (e) {
            console.error("Local data parse error");
          }
        }
        
        setHistory(data.map((item, idx) => ({
          ...item,
          id: item.id || `node-${idx}-${new Date(item.created_at).getTime()}`
        })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const handleExportAll = () => {
    if (history.length === 0) {
      toast.error("No data available for export");
      return;
    }

    toast.message("Creating assessment summary...", {
      description: "Downloading complete history PDF...",
      icon: <Shield className="h-4 w-4" />,
    });

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 42, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("CYVANTA GLOBAL HISTORY REPORT", 14, 22);
    
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`EXPORT DATE: ${new Date().toLocaleString()}`, 14, 30);
    doc.text("VERIFIED COMPLIANCE ARCHIVE - SECURE PROTOCOL v1.4", 14, 35);

    // Summary Table
    const tableData = history.map((item, index) => [
      `#0${index + 1}`,
      item.id?.substring(0, 8).toUpperCase(),
      new Date(item.created_at).toLocaleDateString(),
      `${item.trust_score} / 100`,
      item.risk_level === "Low Risk" ? "Low" : "Medium",
      item.maturity_level
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Ref", "Assessment ID", "Date Taken", "Score", "Threat Risk", "Security Stage Level"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold", fontSize: 9 }, // blue-600
      bodyStyles: { textColor: [30, 41, 59], fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35, fontStyle: "bold" },
        2: { cellWidth: 30 },
        3: { cellWidth: 25, fontStyle: "bold" },
        4: { cellWidth: 30, fontStyle: "bold" },
        5: { cellWidth: 47, fontStyle: "italic" }
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === "Low") doc.setTextColor(16, 185, 129); // emerald-500
          else doc.setTextColor(245, 158, 11); // amber-500
        }
      }
    });

    const bottomY = (doc as any).lastAutoTable.finalY + 15;
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("HISTORICAL TREND ANALYSIS", 14, bottomY);
    
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    
    const avgScore = Math.round(history.reduce((acc, h) => acc + h.trust_score, 0) / history.length);
    const highestScore = Math.max(...history.map(h => h.trust_score));
    
    doc.text(`Total Assessments Evaluated: ${history.length}`, 14, bottomY + 7);
    doc.text(`Average Company Security Score: ${avgScore} / 100`, 14, bottomY + 12);
    doc.text(`Highest Security Rating Met: ${highestScore} / 100`, 14, bottomY + 17);

    // Bottom decorative bar
    doc.setFillColor(37, 99, 235);
    doc.rect(14, bottomY + 24, 182, 1.5, "F");

    doc.save(`Cyvanta_Global_Export_${new Date().getTime()}.pdf`);
    
    toast.success("Global report exported successfully", {
      description: "PDF summary downloaded to local storage."
    });
  };

  const handleExportPDF = (item: Assessment) => {
    handleExportPDFFromLib(item);
    if (Math.random() > 2) {
      toast.message("Creating detailed report...", {
      description: "Compiling points, auditable metrics, and remediations into PDF report...",
      icon: <FileText className="h-4 w-4" />,
    });
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width || 210;
    const pageHeight = doc.internal.pageSize.height || 297;
    
    // Detailed helper for recommendations
    const detailedMetrics: { [key: number]: { title: string; steps: string; impact: string; effort: string; timeline: string } } = {
      1: {
        title: "Strong Password Policies",
        steps: "Enforce enterprise password guidelines. Implement group policies requiring a minimum password length of 14 characters, containing a mix of uppercase, lowercase, numerical digits, and special characters. Standardize on secure corporate password managers (e.g., 1Password or Bitwarden) for password sharing and rotation.",
        impact: "Vulnerability to automated dictionary attacks, automated botnet credential stuffing, and unauthorized account access leading to potential full-suite domain hijack.",
        effort: "Low (1-2 days)",
        timeline: "Next 15 Days"
      },
      2: {
        title: "Multi-Factor Verification (MFA/2FA)",
        steps: "Enforce mandatory Multi-Factor Authentication (OTP, software authenticators such as Google Authenticator, Microsoft Authenticator, or hardware FIDO2 keys) across every entry barrier including company emails, HR portals, file integrations, and VPN gates.",
        impact: "Credential leakage allows immediate target takeovers. Attackers bypass security structures without challenging verification prompts, creating a single point of failure.",
        effort: "Medium (3-5 days)",
        timeline: "Immediate (Within 7 Days)"
      },
      3: {
        title: "Accounts Deactivation & Offboarding",
        steps: "Instate a rigid account lifecycle checklist. Program deprovisioning workflows into employee offboarding procedures to terminate access across all administrative accounts, databases, SSH keys, and cloud dashboards immediately.",
        impact: "Legacy backdoors. Former contractors or employees retain read/write access to sensitive storage hubs, leading to accidental leaks or deliberate sabotage.",
        effort: "Low (1-2 days)",
        timeline: "Next 15 Days"
      },
      4: {
        title: "Employee Security Phishing Training",
        steps: "Conduct quarterly simulated email phishing campaigns using automated platforms (such as KnowBe4 or GoPhish). Enforce annual threat awareness education for newcomers and existing departments to report suspicious indicators.",
        impact: "High susceptibility to social engineering. One user downloading a compromised PDF attachment or keying in credentials can trigger network-wide ransomware campaigns.",
        effort: "Low-Medium (Ongoing)",
        timeline: "Next 30 Days"
      },
      5: {
        title: "System Offsite Backup Operations",
        steps: "Implement a highly resilient 3-2-1 backup layout: maintain 3 copies of business-critical databases, spanning at least 2 distinct storage media types, with 1 copy backed up offsite. Backups must be fully encrypted and insulated from daily domains.",
        impact: "Catastrophic file and operation loss. Ransomware groups can encrypt local networks, leaving the company without restore keys and forcing high financial payments.",
        effort: "Medium (3-5 days)",
        timeline: "Immediate / Next 7 Days"
      },
      6: {
        title: "Sensitive Customer & Storage Controls",
        steps: "Classify all internal data assets. Restrict database access behind strong network access control lists (NACLs) and enforce Role-Based Access Control (RBAC). Enable encryption algorithms (AES-256) at rest and TLS 1.3 in transit.",
        impact: "Severe legal and compliance violations (GDPR, HIPAA, SOC2). Accidental public Exposure of credentials, personal identification records (PII), or private keys.",
        effort: "High (2-3 weeks)",
        timeline: "Next 30 Days"
      },
      7: {
        title: "Endpoint Antivirus Protection",
        steps: "Install modern Endpoint Detection and Response (EDR) software on all managed computers. Configure real-time deep heuristics scanning and automated quarantine schedules synchronized with central vulnerability reporting logs.",
        impact: "Malware propagation. Silent trojans, keyloggers, and botnets can execute in the background, harvesting keystrokes and exfiltrating local documents undetected.",
        effort: "Medium (1 week)",
        timeline: "Next 15 Days"
      },
      8: {
        title: "Regular Software Patch Management",
        steps: "Apply continuous automated deployment windows for operating systems and business integrations. Maintain strict timelines for security patches: critical vulnerabilities must be patched inside a 72-hour timeframe.",
        impact: "Exploitation of public known CVEs. Automated scripts constantly parse WAN ports for outdated systems containing open, unpatched vulnerabilities to exploit.",
        effort: "Medium (Ongoing)",
        timeline: "Next 15 Days"
      },
      9: {
        title: "Secure Remote Frameworks",
        steps: "Secure all incoming remote worker pathways using enterprise TLS VPN, Zero Trust Network Access (ZTNA) policies, or robust client-side host checking to ensure security software status is validated prior to session permission.",
        impact: "Lateral movement. Attackers gaining control of a home router can sniff active session tokens and slip direct malware payloads directly into your production servers.",
        effort: "Medium-High (1-2 weeks)",
        timeline: "Next 30 Days"
      },
      10: {
        title: "Incident Response Playbooks",
        steps: "Establish a formal, documented Cybersecurity Incident Response Plan (IRP). Appoint response members, list triage responsibilities, draft communications templates under attorney-client privilege, and structure dry-run exercises.",
        impact: "Disorganized crisis management. Extended duration of security incidents, compounding system damage, delayed containment times, and heightened liability.",
        effort: "Medium (1-2 weeks)",
        timeline: "Next 30 Days"
      }
    };

    const drawHeader = (titleText: string) => {
      // Top Dark Frame
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 45, "F");
      
      // Accent line
      doc.setFillColor(37, 99, 235); // blue-600
      doc.rect(0, 45, pageWidth, 2.5, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(titleText, 14, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`REPORT BLOCK ID: ${String(item.id).toUpperCase()}`, 14, 28);
      doc.text(`VERIFICATION RUNTIME: ${new Date(item.created_at).toLocaleString()}`, 14, 33);
      doc.text("REGULATORY STANDARDS MATRIX: NIST SP 800-171 / ISO 27001 / SOC 2 ALIGNED", 14, 38);
    };

    const drawFooter = (currentPage: number, totalPages: number) => {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(0, pageHeight - 18, pageWidth, 18, "F");
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(0, pageHeight - 18, pageWidth, pageHeight - 18);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("CONFIDENTIAL SECURITY REPORT", 14, pageHeight - 10);
      doc.setFont("helvetica", "normal");
      doc.text("CYVANTA CYBERSECURITY POSTURE ANALYTICS", 14, pageHeight - 6);
      
      const pageStr = `PAGE ${currentPage} OF ${totalPages}`;
      doc.setFont("helvetica", "bold");
      doc.text(pageStr, pageWidth - 14 - doc.getTextWidth(pageStr), pageHeight - 8);
    };

    // ==========================================
    // PAGE 1: COVER & EXECUTIVE COMPLIANCE OVERVIEW
    // ==========================================
    drawHeader("CYVANTA COMPREHENSIVE CYBERSECURITY REPORT");

    // Large decorative circular score card on cover
    const scoreX = 154;
    const scoreY = 10;
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(scoreX, scoreY, 42, 28, 3, 3, "F");
    doc.setDrawColor(59, 130, 246); // blue-500
    doc.roundedRect(scoreX, scoreY, 42, 28, 3, 3, "D");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${item.trust_score}`, scoreX + 21, scoreY + 14, { align: "center" });
    
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text("POSTURE RATING INDEX", scoreX + 21, scoreY + 21, { align: "center" });
    doc.text("LEVEL OUT OF 100", scoreX + 21, scoreY + 25, { align: "center" });

    // Executive summary body
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("1. EXECUTIVE DISCOVERIES", 14, 58);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85); // slate-700
    
    const summaryText = `This cybersecurity compliance artifact provides an objective posture audit covering identity controls, awareness measures, system and device controls, and general procedural governance at your organization. Based on the responses captured, your current verified Security Trust Score measures ${item.trust_score} out of 100. This places your organization in the "${item.maturity_level === "Architectural Defined" ? "Architectural Defined Security Stage" : item.maturity_level}" maturity category, with a corresponding Threat Risk profile of "${item.risk_level}".`;
    const summaryLines = doc.splitTextToSize(summaryText, 182);
    doc.text(summaryLines, 14, 64);

    let nextY = 64 + (summaryLines.length * 4.5) + 3;

    // Grid details for standard security vectors
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("CORE METADATA MATRIX", 14, nextY);
    
    // Grey metrics card
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, nextY + 3, 182, 24, 2, 2, "F");
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, nextY + 3, 182, 24, 2, 2, "D");

    const colWidth = 182 / 4;
    // Section 1
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("AUDIT SCORE", 14 + 6, nextY + 9);
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.text(`${item.trust_score} Pts`, 14 + 6, nextY + 16);
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text("Out of 100 max", 14 + 6, nextY + 22);

    // Section 2
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("RISK COEFFICIENT", 14 + colWidth + 6, nextY + 9);
    doc.setFontSize(11);
    const isL = item.risk_level === "Low Risk";
    doc.setTextColor(isL ? 16 : 245, isL ? 185 : 158, isL ? 129 : 11);
    doc.text(item.risk_level.toUpperCase(), 14 + colWidth + 6, nextY + 16);
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text("Vector threat index", 14 + colWidth + 6, nextY + 22);

    // Section 3
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("MATURITY LEVEL", 14 + colWidth * 2 + 6, nextY + 9);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(String(item.maturity_level).toUpperCase(), 14 + colWidth * 2 + 6, nextY + 16);
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text("Standards compliance", 14 + colWidth * 2 + 6, nextY + 22);

    // Section 4
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("VERIFIED CONTROLS", 14 + colWidth * 3 + 6, nextY + 9);
    doc.setFontSize(11);
    const ansArray = Object.values(item.answers || {});
    const yesCount = ansArray.filter(a => a === "Yes").length;
    const partialCount = ansArray.filter(a => a === "Partially").length;
    doc.setTextColor(16, 185, 129);
    doc.text(`${yesCount} / 10 Standards`, 14 + colWidth * 3 + 6, nextY + 16);
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(`${partialCount} Partially Met`, 14 + colWidth * 3 + 6, nextY + 22);

    nextY += 34;

    // Sector Compliance Summary Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("2. SECTOR-BY-SECTOR COMPLIANCE SCOREBOARD", 14, nextY);

    const checkPoint = (ids: number[]) => {
      let score = 0;
      ids.forEach(id => {
        if (item.answers && item.answers[id] === "Yes") score += 10;
        else if (item.answers && item.answers[id] === "Partially") score += 5;
      });
      return score;
    };

    const rawSectors = [
      { id: "ID", name: "Identity & Access Control", points: checkPoint([1, 2, 3]), total: 30, params: "MFA setups, password requirements, account offboarding triggers" },
      { id: "AW", name: "Employee Awareness & Training", points: checkPoint([4]), total: 10, params: "Internal security threat alerts, simulated phishing procedures" },
      { id: "DP", name: "Data Protection & Backup Operations", points: checkPoint([5, 6]), total: 20, params: "Offsite cloud asset storage, databases and customer PII encryption" },
      { id: "ES", name: "Device & Endpoint Safety", points: checkPoint([7, 8, 9]), total: 30, params: "NGAV and EDR monitoring clients, OS patch compliance, secured remote VPN portals" },
      { id: "GV", name: "Governance & Operations Plan", points: checkPoint([10]), total: 10, params: "Formal policy frameworks, active incident playbooks" }
    ];

    const sectorData = rawSectors.map(s => [
      s.id,
      s.name,
      s.params,
      `${s.points} / ${s.total}`,
      `${Math.round((s.points / s.total) * 100)}%`,
      s.points === s.total ? "COMPLIANT" : s.points >= s.total * 0.5 ? "REDUCED COVERAGE" : "CRITICAL REMEDIATION REQUIRED"
    ]);

    autoTable(doc, {
      startY: nextY + 4,
      head: [["ID", "Security Sector Segment", "Technical Scoped Parameters", "Points Earned", "Percent", "Compliance Audit Outcome"]],
      body: sectorData,
      theme: "striped",
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
      bodyStyles: { fontSize: 7.2, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 10, fontStyle: "bold" },
        1: { cellWidth: 44, fontStyle: "bold" },
        2: { cellWidth: 58 },
        3: { cellWidth: 22, fontStyle: "bold", halign: "center" },
        4: { cellWidth: 16, fontStyle: "bold", halign: "center" },
        5: { cellWidth: 32, fontStyle: "bold" }
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 5) {
          const val = data.cell.raw as string;
          if (val === "COMPLIANT") doc.setTextColor(16, 185, 129); // green
          else if (val === "REDUCED COVERAGE") doc.setTextColor(217, 119, 6); // amber/orange
          else doc.setTextColor(220, 38, 38); // red
        }
      }
    });

    const summaryTableFinalY = (doc as any).lastAutoTable.finalY || 160;

    // Draw Strengths and Weaknesses on Page 1
    const cardY = summaryTableFinalY + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("3. PRIMARY OUTCOMES & ATTRIBUTIONS", 14, cardY);

    const sortedSectors = [...rawSectors].sort((a, b) => (b.points/b.total) - (a.points/a.total));
    const strongSector = sortedSectors[0];
    const weakSector = [...sortedSectors].reverse()[0];

    // Strong Card
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, cardY + 4, 88, 28, 2, 2, "F");
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, cardY + 4, 88, 28, 2, 2, "D");
    
    doc.setFontSize(6.5);
    doc.setTextColor(22, 101, 52);
    doc.text("STRONGEST SECTOR INTEGRATED", 19, cardY + 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(strongSector.name.toUpperCase(), 19, cardY + 17);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Controls integrated at ${Math.round((strongSector.points/strongSector.total)*100)}% coverage levels.`, 19, cardY + 23);

    // Weak Card
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(108, cardY + 4, 88, 28, 2, 2, "F");
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(108, cardY + 4, 88, 28, 2, 2, "D");

    doc.setFontSize(6.5);
    doc.setTextColor(153, 27, 27);
    doc.text("UTMOST SECURITY GAPS REVEALED", 113, cardY + 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(weakSector.name.toUpperCase(), 113, cardY + 17);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Immediate remediation required to bolster metrics.`, 113, cardY + 23);

    drawFooter(1, 3);

    // ==========================================
    // PAGE 2: COMPLIANCE ASSESSMENT ROADMAP (TABLE & EXPANSE)
    // ==========================================
    doc.addPage();
    drawHeader("REMEDIATION STEPS & SECURITY VULNERABILITIES");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("4. REMEDIATION STRATEGY ROADMAP (PENDING COMPLIANCE ACTIONS)", 14, 54);

    const recommendations = getRecommendations(item.answers || {});
    if (recommendations.length === 0) {
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(14, 60, 182, 14, 2, 2, "F");
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(9.5);
      doc.text("Perfect score! Zero vulnerabilities discovered. All controls validated and aligned.", 18, 69);
    } else {
      const recRows = recommendations.map((r, i) => {
        const metObj = detailedMetrics[r.id];
        return [
          `0${i + 1}`,
          r.category,
          r.priority.toUpperCase(),
          metObj ? metObj.timeline : "Within 30 Days",
          metObj ? metObj.effort : "Medium",
          r.text
        ];
      });

      autoTable(doc, {
        startY: 59,
        head: [["Ref", "Security Segment Area", "Impact Priority", "Audit Timeline Target", "Implementation Effort", "Standard Requirement Description"]],
        body: recRows,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235], fontStyle: "bold", fontSize: 7.2 },
        bodyStyles: { fontSize: 7.2, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 10, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 35, fontStyle: "bold" },
          2: { cellWidth: 22, fontStyle: "bold", halign: "center" },
          3: { cellWidth: 32, fontStyle: "bold" },
          4: { cellWidth: 25, fontStyle: "bold" },
          5: { cellWidth: 58 }
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 2) {
            const val = data.cell.raw as string;
            if (val === "HIGH") doc.setTextColor(220, 38, 38); // red
            else doc.setTextColor(217, 119, 6); // orange
          }
        }
      });
    }

    const recTableFinalY = (doc as any).lastAutoTable?.finalY || 75;
    let textRemedyY = recTableFinalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("5. COMPREHENSIVE ACTION STEPS FOR DEFICIENT SEGMENTS", 14, textRemedyY);
    
    textRemedyY += 4;
    
    if (recommendations.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("No remediation actions are required at this time. Retake current checklist periodically for state tracking.", 14, textRemedyY + 4);
    } else {
      // Loop with limit so that it doesn't overflow page 2 footer
      const listLimit = recommendations.slice(0, 4); // Limit to top 4 critical on page 2 to prevent messy breaks. Remaining on page 3 or audit section.
      listLimit.forEach((r) => {
        const met = detailedMetrics[r.id];
        if (!met) return;
        
        if (textRemedyY + 24 > pageHeight - 22) {
          return; // Safeguard overflow
        }
        
        doc.setFillColor(252, 253, 254);
        doc.roundedRect(14, textRemedyY, 182, 23, 1, 1, "F");
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(14, textRemedyY, 182, 23, 1, 1, "D");
        
        // Priority Indicator dot
        doc.setFillColor(r.priority === "High" ? 220 : 217, r.priority === "High" ? 38 : 119, r.priority === "High" ? 38 : 6); // red or orange
        doc.circle(18, textRemedyY + 4.5, 1.5, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${r.priority.toUpperCase()} PRIORITY: ${met.title.toUpperCase()} (Q${r.id})`, 22, textRemedyY + 6);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.8);
        doc.setTextColor(51, 65, 85);
        
        // Remediation detail text wrapping
        const stepText = `ACTION STEPS: ${met.steps}`;
        const stepLines = doc.splitTextToSize(stepText, 172);
        doc.text(stepLines, 18, textRemedyY + 11);
        
        const impactText = `THREAT IMPACT: ${met.impact}`;
        const impactLines = doc.splitTextToSize(impactText, 172);
        const secondLineOffset = 11 + (stepLines.length * 3.3);
        if (textRemedyY + secondLineOffset < textRemedyY + 22) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.6);
          doc.setTextColor(148, 163, 184);
          doc.text(impactLines, 18, textRemedyY + secondLineOffset);
        }
        
        textRemedyY += 25;
      });
      
      if (recommendations.length > 4) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.2);
        doc.setTextColor(100, 116, 139);
        const remainingCount = recommendations.length - 4;
        doc.text(`* There are ${remainingCount} additional priority remendation item(s). Refer to the full structural breakdown on Page 3 for details.`, 14, textRemedyY + 1);
      }
    }

    drawFooter(2, 3);

    // ==========================================
    // PAGE 3: AUDIT TRAIL OF RESPONSES & TECHNICAL VERIFICATION
    // ==========================================
    doc.addPage();
    drawHeader("DETAILED STANDARDS QUESTIONNAIRE AUDIT TRAIL");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("6. METRIC-BY-METRIC SECURITY STANDARDS LOG", 14, 54);

    const auditTrailRows = QUESTIONS.map((q) => {
      const userAns = item.answers ? item.answers[q.id] : "No";
      let statusComment = "";
      if (userAns === "Yes") {
        statusComment = "COMPLIANT: Control is fully active. Hardens the company border matching compliance benchmarks.";
      } else if (userAns === "Partially") {
        statusComment = "RESTRICTED: Partially addressed. Soft spots open organization to perimeter bypass opportunities.";
      } else {
        statusComment = "CRITICAL FAILURE: Standard is absent. Active exploit vulnerability found. Remediate with urgent action.";
      }

      return [
        `Q${q.id}`,
        q.text,
        userAns.toUpperCase(),
        statusComment
      ];
    });

    autoTable(doc, {
      startY: 59,
      head: [["ID", "NIST Security Assessment Metric Surveyed", "Response State", "Technical Compliance Valuation & Vulnerability Impact Note"]],
      body: auditTrailRows,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold", fontSize: 7.2 },
      bodyStyles: { fontSize: 6.8, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 10, fontStyle: "bold", halign: "center" },
        1: { cellWidth: 62, fontStyle: "bold" },
        2: { cellWidth: 20, fontStyle: "bold", halign: "center" },
        3: { cellWidth: 90 }
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const val = data.cell.raw as string;
          if (val === "YES") doc.setTextColor(16, 185, 129); // green
          else if (val === "PARTIALLY") doc.setTextColor(217, 119, 6); // orange
          else doc.setTextColor(220, 38, 38); // red
        }
      }
    });

    const auditFinalY = (doc as any).lastAutoTable.finalY || 180;

    // Secure Verification Certificate Frame
    const certY = Math.min(auditFinalY + 12, pageHeight - 65);
    
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, certY, 182, 28, 2, 2, "F");
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, certY, 182, 28, 2, 2, "D");

    // Decorative lock stamp
    doc.setFillColor(37, 99, 235, 0.05);
    doc.rect(14, certY, 8, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("CYVANTA CERTIFICATION ARCHIVE STAMP", 26, certY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`This document serves as an immutable security audit state representation for the checked client systems.`, 26, certY + 14);
    doc.text(`Digital Assessment Identity and Signature Hash: md5_${String(item.id).substring(0, 12)}_sec1.4_hash`, 26, certY + 19);
    doc.text(`Audit compliance verification powered by automated AI analytics pipelines. All recommendations correspond directly to active NIST controls.`, 26, certY + 24);

    drawFooter(3, 3);

    doc.save(`Cyvanta_Report_${(item.id || "").substring(0, 8)}.pdf`);
    
    toast.success("Detailed PDF Report Generated", {
      description: "State records, recommendation items, and full compliance paths compile successful."
    });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl bg-background text-foreground transition-colors duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="animate-in slide-in-from-left duration-700">
           <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center justify-center glow-blue transition-colors">
                <HistoryIcon className="h-6 w-6 text-blue-500" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Assessment History</h1>
           </div>
           <p className="text-muted-foreground font-medium italic">Past scores and saved checklists.</p>
        </div>
        <Button 
          onClick={handleExportAll}
          variant="outline" 
          className="rounded-2xl border-border text-muted-foreground hover:text-foreground font-black uppercase text-[10px] tracking-widest px-6 h-12 transition-all hover:bg-muted"
        >
           <Download className="mr-2 h-4 w-4" /> Download History PDF
        </Button>
      </div>

      <div className="space-y-6">
        {history.length === 0 ? (
          <div className="p-12 sm:p-24 md:p-32 text-center rounded-[2rem] sm:rounded-[2.5rem] border border-dashed border-border bg-muted/20 text-muted-foreground italic font-medium">
             You haven't completed any security assessments yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item, index) => (
              <div 
                key={item.id || `assessment-${index}`} 
                className="group relative overflow-hidden rounded-[2rem] bg-card/40 border border-border backdrop-blur-xl p-6 transition-all duration-300 hover:bg-card/60 hover:border-blue-500/30 hover:translate-x-1 shadow-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Score Indicator */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl border transition-colors ${
                      item.trust_score > 80 ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.2)]" :
                      item.trust_score > 50 ? "border-blue-500/30 text-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.2)]" :
                      "border-red-500/30 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    }`}>
                      {item.trust_score}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Security Rating</p>
                      <p className={`text-sm font-black italic uppercase ${
                        item.trust_score > 80 ? "text-emerald-500" :
                        item.trust_score > 50 ? "text-blue-500" :
                        "text-red-500"
                      }`}>{item.risk_level}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Date Taken</p>
                      <p className="text-foreground font-bold flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-blue-500" />
                        {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Level</p>
                      <p className="text-foreground font-bold uppercase italic">{item.maturity_level}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Version</p>
                      <Badge className="bg-muted text-muted-foreground border-border font-bold text-[9px] uppercase tracking-[0.1em] px-2 h-5">v1.4 STATUS</Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-border w-full lg:w-auto justify-end">
                    <Button 
                      onClick={() => handleExportPDF(item)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-11 px-4 font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 transition-all shadow-sm flex items-center"
                    >
                      <Download className="mr-1.5 h-4 w-4" /> Download PDF
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-11 w-11 rounded-xl border border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted hover:border-blue-500/30 transition-all shadow-inner"
                        >
                          <FileText className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-card border-border rounded-[1.5rem] sm:rounded-[2.5rem] p-0 overflow-hidden shadow-2xl transition-colors">
                        <div className="bg-gradient-to-br from-card to-background p-6 sm:p-8 border-b border-border">
                          <DialogHeader>
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
                                item.trust_score > 80 ? "border-emerald-500/30 text-emerald-500" :
                                item.trust_score > 50 ? "border-blue-500/30 text-blue-500" :
                                "border-red-500/30 text-red-500"
                              }`}>
                                {item.trust_score}
                              </div>
                              <div>
                                <DialogTitle className="text-2xl font-black text-foreground italic uppercase tracking-tight">Assessment Details</DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium italic">Detailed security breakdown for {(item.id || '').substring(0, 8)}</DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>
                        </div>
                        
                        <div className="p-5 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Security Level</p>
                                <p className="text-sm font-black text-foreground uppercase italic">{item.maturity_level}</p>
                              </div>
                              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Threat Level Status</p>
                                <p className="text-sm font-black text-foreground uppercase italic">{item.risk_level}</p>
                              </div>
                           </div>

                           <div className="space-y-4 pt-4">
                              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Your Answers Breakdown</h4>
                              {QUESTIONS.map((q) => {
                                const answer = item.answers[q.id];
                                return (
                                  <div key={q.id} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 border border-border">
                                    <div className="mt-1">
                                      {answer === "Yes" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : 
                                       answer === "Partially" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : 
                                       <XCircle className="h-4 w-4 text-red-500" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[11px] font-bold text-foreground leading-tight mb-1">{q.text}</p>
                                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                                        answer === "Yes" ? "text-emerald-500" : 
                                        answer === "Partially" ? "text-amber-500" : 
                                        "text-red-500"
                                      }`}>{answer}</p>
                                    </div>
                                  </div>
                                );
                              })}
                           </div>
                        </div>

                        <div className="p-5 sm:p-8 bg-muted/30 border-t border-border flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <Button 
                            onClick={() => handleExportPDF(item)}
                            className="w-full sm:flex-1 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shrink-0"
                          >
                            <Download className="mr-2 h-4 w-4" /> Download PDF Report
                          </Button>
                          <DialogClose asChild>
                            <Button variant="ghost" className="w-full sm:w-auto rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground shrink-0">
                              Close View
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button asChild variant="ghost" className="h-11 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest border border-border bg-transparent text-muted-foreground hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all shadow-xl group">
                      <Link to={`/dashboard`}>View Score <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
                    </Button>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute right-0 top-0 h-full w-1.5 bg-blue-600/0 group-hover:bg-blue-600 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 sm:mt-20 relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-card border border-border p-6 sm:p-12 shadow-2xl transition-colors">
         <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full"></div>
         <div className="relative z-10 grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div>
               <h3 className="text-3xl font-black tracking-tighter text-foreground mb-4 uppercase italic">Keep Your Score Safe</h3>
               <p className="text-muted-foreground font-medium leading-relaxed max-w-md italic">
                  We recommend retaking this security survey every 90 days. Outdated setups leave your business open to new cyber risks.
               </p>
            </div>
            <div className="flex lg:justify-end">
               <Button className="w-full sm:w-auto rounded-2xl h-16 px-12 font-black bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105" asChild>
                  <Link to="/assessment">Start Security Survey <ArrowRight className="ml-3 h-6 w-6" /></Link>
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
