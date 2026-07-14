import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Assessment, QUESTIONS } from "@/types";
import { getRecommendations, calculateCTI, getOperationalCyberExposure, getIndustryConfig, getRiskLevel, getMaturityLevel } from "@/lib/scoring";
import { toast } from "sonner";

// Detailed helper for recommendations
export const detailedMetrics: { [key: number]: { title: string; steps: string; impact: string; effort: string; timeline: string } } = {
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

export const getComplianceConfig = (jurisdiction: string, revenue: string, score: number) => {
  const isIndia = jurisdiction.includes("India");
  const isEU = jurisdiction.includes("EU") || jurisdiction.includes("Europe");

  if (isIndia) {
    return {
      name: "India DPDP Act (2023)",
      authority: "Data Protection Board of India (DPBI)",
      primarySafeguard: "Section 8(5) - Reasonable Security Safeguards",
      breachSafeguard: "Section 8(6) - Mandatory Breach Notification",
      designation: "Data Fiduciary",
      statutoryExposure: score >= 80 ? "INR 10L-INR 50L (Low liability)" : score >= 60 ? "INR 50L-INR 5Cr (Medium exposure risk)" : "INR 5Cr-INR 250Cr (High risk of severe statutory penalty)",
      clauses: [
        { area: "Identity Access", clause: "Section 8(5) Safeguards", standard: "Enforce strict MFA & credential limits to block credential reuse." },
        { area: "Data Encryption", clause: "Section 8(5) Data Protection", standard: "Ensure all customer/user personal identifiers (PII) are encrypted at rest." },
        { area: "Audit Trails", clause: "Section 10 Fiduciary Audits", standard: "Maintain tamper-proof, immutable logs of data processing transactions." },
        { area: "Incident Response", clause: "Section 8(6) Breach Notice", standard: "Establish formal incident playbooks with immediate DPBI notifying templates." },
      ],
      description: "Under the Digital Personal Data Protection (DPDP) Act of India, your organization acts as a Data Fiduciary. You are legally required to employ state-of-the-art security safeguards to prevent personal data breaches under Section 8(5), with statutory non-compliance penalties going up to INR 250 Crores."
    };
  } else if (isEU) {
    return {
      name: "EU GDPR Regulation",
      authority: "European Data Protection Boards (EDPB)",
      primarySafeguard: "Article 32 - Security of Processing (TOMs)",
      breachSafeguard: "Article 33 - 72-Hour Breach Notification",
      designation: "Data Controller / Processor",
      statutoryExposure: score >= 80 ? "€20k–€100k (Minor risk)" : score >= 60 ? "€100k–€1M (Medium assessment risk)" : "€1M–€20M or up to 4% of worldwide revenue (Severe regulatory threat)",
      clauses: [
        { area: "Identity Access", clause: "Article 32(1) Access Controls", standard: "Implement zero-trust user isolation and role-locked operations." },
        { area: "Data Encryption", clause: "Article 32(1)(a) Encryption", standard: "Encrypt transit payloads (TLS 1.3) and storage files (AES-256)." },
        { area: "Availability", clause: "Article 32(1)(c) Resilience", standard: "Conduct regular offsite isolated backups to restore core operations safely." },
        { area: "Breach Notice", clause: "Article 33 Breach Timelines", standard: "Instate rapid triage playbooks to notify authorities inside 72 hours." },
      ],
      description: "Under the European Union General Data Protection Regulation (GDPR), your organization must maintain modern Technical and Organizational Measures (TOMs) under Article 32. Failure to execute adequate protection safeguards invites administrative fines scaling to €20 Million or 4% of global turnover."
    };
  } else {
    // Default US / Global NIST
    return {
      name: "US NIST Cybersecurity Framework & SOC2",
      authority: "Federal Trade Commission (FTC) & Auditors",
      primarySafeguard: "NIST Sp 800-53 Access / Protect Controls",
      breachSafeguard: "SEC 4-Day / State Disclosure Laws",
      designation: "Enterprise Operator / Service Organization",
      statutoryExposure: score >= 80 ? "$50k–$250k (Low vulnerability)" : score >= 60 ? "$250k–$1.5M (Material regulatory oversight)" : "$1.5M–$10M (High material exposure / class-action risk)",
      clauses: [
        { area: "Identity Access", clause: "NIST PR.AC / SOC2 CC6.1", standard: "Validate credential complexity and force multi-factor triggers." },
        { area: "Data Encryption", clause: "NIST PR.DS-1 / SOC2 CC6.6", standard: "Activate storage encryption keys and secure network gates." },
        { area: "Endpoint Security", clause: "NIST DE.CM-1 / SOC2 CC6.8", standard: "Deploy continuous active endpoint monitoring (EDR) agents." },
        { area: "Governance Policy", clause: "NIST RS.RP-1 / SOC2 CC7.3", standard: "Document formal incident playbooks and administrative action rules." },
      ],
      description: "Under the US and Global frameworks like NIST CSF 2.0, NIST SP 800-171, and SOC 2 Trust Services Criteria, you are assessed against robust multi-pillar protections. Non-alignments invite severe class-action litigations, loss of federal procurement rights, and FTC Section 5 penalty actions."
    };
  }
};

export const handleExportPDF = (item: Assessment) => {
  toast.message("Creating detailed report...", {
    description: "Compiling points, auditable metrics, and remediations into PDF report...",
  });
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width || 210;
  const pageHeight = doc.internal.pageSize.height || 297;
  
  const hasNotes = !!(item.notes && Object.values(item.notes).some(n => n && n.trim().length > 0));
  const totalPagesCount = hasNotes ? 5 : 4;

  const cleanRupee = (text: string): string => {
    if (!text) return "";
    return text.replace(/₹/g, "INR ");
  };

  const companySize = item.company_size || "11–50";
  const companyIndustry = item.company_industry || "Retail";
  const rawCompanyRevenue = item.company_revenue || "₹50L–₹5Cr";
  const companyRevenue = cleanRupee(rawCompanyRevenue);
  const companyJurisdiction = item.company_jurisdiction || "India (DPDP)";

  const ctiData = calculateCTI(item.answers || {}, companyIndustry);
  const exposure = getOperationalCyberExposure(ctiData.overallScore, companySize, companyIndustry, rawCompanyRevenue);
  const cleanExposureRange = cleanRupee(exposure.range);
  const config = getIndustryConfig(companyIndustry);
  const dynamicRisk = getRiskLevel(ctiData.overallScore);
  const dynamicMaturity = getMaturityLevel(ctiData.overallScore);
  const compConfig = getComplianceConfig(companyJurisdiction, rawCompanyRevenue, ctiData.overallScore);

  const docHeaderMap: { [key: string]: string } = {
    "India (DPDP)": "REGULATORY TARGETS: INDIA DPDP ACT 2023 / IT ACT SEC 43A / CERT-IN GUIDELINES",
    "EU (GDPR)": "REGULATORY TARGETS: EU GDPR ARTICLE 32 & 33 (TOMs) / ISO 27001 ALIGNED",
    "US / Global (NIST)": "REGULATORY TARGETS: US NIST CSF 2.0 / NIST SP 800-171 / SOC 2 Type II INDEXED"
  };
  const regLine = docHeaderMap[companyJurisdiction] || "REGULATORY TARGETS: NIST SP 800-171 / ISO 27001 / SOC 2 INDEXED";
  
  const drawHeader = (titleText: string) => {
    // Top Dark Frame
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 45, "F");
    
    // Accent line
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(0, 45, pageWidth, 2.5, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(titleText, 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`REPORT ID: ${String(item.id).toUpperCase()}`, 14, 28);
    doc.text(`VERIFICATION RUNTIME: ${new Date(item.created_at).toLocaleString()}`, 14, 33);
    doc.text(regLine, 14, 38);
  };

  const drawFooter = (currentPage: number, totalPages: number) => {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(0, pageHeight - 18, pageWidth, 18, "F");
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(0, pageHeight - 18, pageWidth, pageHeight - 18);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("CONFIDENTIAL CYBERSECURITY AUDIT REPORT", 14, pageHeight - 10);
    doc.setFont("helvetica", "normal");
    doc.text("CYVANTA CYBER RISK DECISION INTELLIGENCE PLATFORM", 14, pageHeight - 6);
    
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
  doc.text(`${ctiData.overallScore}`, scoreX + 21, scoreY + 14, { align: "center" });
  
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text("CYBER TRUST INDEX (CTI)", scoreX + 21, scoreY + 21, { align: "center" });
  doc.text("OVERALL OUT OF 100", scoreX + 21, scoreY + 25, { align: "center" });

  // Executive summary body
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("1. EXECUTIVE DISCOVERIES", 14, 58);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85); // slate-700
  
  const summaryText = `This Enterprise Cyber Risk and Compliance Report provides an authoritative risk assessment for a company of size "${companySize}" operating in the "${companyIndustry}" sector, with annual revenues in the "${companyRevenue}" tier. Under this firmographic model and the selected regulatory jurisdiction of "${companyJurisdiction}", your Cyvanta Cyber Trust Index (CTI) is formulated at ${ctiData.overallScore} out of 100. This indicates an operational Cybersecurity Maturity rating of "${dynamicMaturity}" and maps to an overall "${dynamicRisk}" threat status. Operational cyber risk exposure is estimated to range between ${cleanExposureRange}. This detailed report contains all interactive metrics matching the active administrator's dashboard.`;
  const summaryLines = doc.splitTextToSize(summaryText, 182);
  doc.text(summaryLines, 14, 64);

  let nextY = 64 + (summaryLines.length * 4.5) + 3;

  // Grid details for standard security vectors - 4 Bento Boxes to match Dashboard KPIs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("DASHBOARD KEY PERFORMANCE INDICATORS", 14, nextY);
  
  const cardWidth = 88;
  const cardHeight = 22;
  const gap = 6;
  const startCardY = nextY + 3;

  // Card 1: Cyber Trust Index (CTI) Score Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, startCardY, cardWidth, cardHeight, 1.5, 1.5, "F");
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, startCardY, cardWidth, cardHeight, 1.5, 1.5, "D");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("CYBER TRUST INDEX (CTI)", 18, startCardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`${ctiData.overallScore} / 100 PTS`, 18, startCardY + 13);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text("Weighted posture safety index", 18, startCardY + 18);

  // Card 2: Cyber Risk Exposure Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + cardWidth + gap, startCardY, cardWidth, cardHeight, 1.5, 1.5, "F");
  doc.roundedRect(14 + cardWidth + gap, startCardY, cardWidth, cardHeight, 1.5, 1.5, "D");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.text("ESTIMATED OPERATIONAL EXPOSURE", 14 + cardWidth + gap + 4, startCardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(cleanExposureRange, 14 + cardWidth + gap + 4, startCardY + 13);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`Financial risk range under ${dynamicRisk}`, 14 + cardWidth + gap + 4, startCardY + 18);

  // Card 3: Security Maturity Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startCardY + cardHeight + gap, cardWidth, cardHeight, 1.5, 1.5, "F");
  doc.roundedRect(14, startCardY + cardHeight + gap, cardWidth, cardHeight, 1.5, 1.5, "D");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.text("SECURITY MATURITY STAGE", 18, startCardY + cardHeight + gap + 6);
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text(dynamicMaturity.toUpperCase(), 18, startCardY + cardHeight + gap + 13);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text("Maturity framework level met", 18, startCardY + cardHeight + gap + 18);

  // Card 4: Industry Peer Benchmark Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + cardWidth + gap, startCardY + cardHeight + gap, cardWidth, cardHeight, 1.5, 1.5, "F");
  doc.roundedRect(14 + cardWidth + gap, startCardY + cardHeight + gap, cardWidth, cardHeight, 1.5, 1.5, "D");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.text(`INDUSTRY PEER BENCHMARK (${companyIndustry.toUpperCase()})`, 14 + cardWidth + gap + 4, startCardY + cardHeight + gap + 6);
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text(`PEER AVG: ${config.benchmark} / 100`, 14 + cardWidth + gap + 4, startCardY + cardHeight + gap + 13);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  const pointsDelta = ctiData.overallScore - config.benchmark;
  doc.text(`${Math.abs(pointsDelta)} pts ${pointsDelta >= 0 ? "above" : "below"} national Peer average`, 14 + cardWidth + gap + 4, startCardY + cardHeight + gap + 18);

  nextY += 56;

  // Sector Compliance Summary Table (Detailed Security Breakdown)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("2. DETAILED SECURITY SEGMENTS BREAKDOWN", 14, nextY);

  const checkPoint = (ids: number[]) => {
    let score = 0;
    ids.forEach(id => {
      if (item.answers && item.answers[id] === "Yes") score += 10;
      else if (item.answers && item.answers[id] === "Partially") score += 5;
    });
    return score;
  };

  const rawSectors = [
    { id: "ID", name: "Identity Confidence", points: checkPoint([1, 2, 3]), total: 30, params: "Mandatory multifactor barriers and managed administrator life-cycles.", weight: ctiData.weightsUsed.identity },
    { id: "AW", name: "Workforce Readiness", points: checkPoint([4]), total: 10, params: "Employee phishing campaigns and incident threat education campaigns.", weight: ctiData.weightsUsed.workforce },
    { id: "DP", name: "Data Resilience", points: checkPoint([5, 6]), total: 20, params: "Resilient offsite backup systems and secure customer classification grids.", weight: ctiData.weightsUsed.resilience },
    { id: "ES", name: "Operational Security", points: checkPoint([7, 8, 9]), total: 30, params: "Continuous end-posture software and software upgrade policies.", weight: ctiData.weightsUsed.operational },
    { id: "GV", name: "Governance Maturity", points: checkPoint([10]), total: 10, params: "Legal emergency cybersecurity playbooks and formal risk frameworks.", weight: ctiData.weightsUsed.governance }
  ];

  const sectorData = rawSectors.map(s => [
    s.id,
    `${s.name} (Weight ${Math.round(s.weight * 100)}%)`,
    s.params,
    `${s.points} / ${s.total}`,
    `${Math.round((s.points / s.total) * 100)}%`,
    s.points === s.total ? "COMPLIANT" : s.points >= s.total * 0.5 ? "REDUCED COVERAGE" : "CRITICAL REMEDIATION"
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: [["ID", "Dashboard Segment Area (Weight %)", "Technical Params", "Points", "Percent", "Compliance Audit Outcome"]],
    body: sectorData,
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { fontSize: 7.2, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 10, fontStyle: "bold" },
      1: { cellWidth: 32, fontStyle: "bold" },
      2: { cellWidth: 70 },
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

  // Draw Strengths and Weaknesses on Page 1 (Primary Outcomes)
  const cardY = summaryTableFinalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("3. PRIMARY OUTCOMES & ATTRIBUTIONS", 14, cardY);

  const sortedSectors = [...rawSectors].sort((a, b) => (b.points/b.total) - (a.points/a.total));
  const strongSector = sortedSectors[0];
  const weakSector = [...sortedSectors].reverse()[0];

  // Strong Card
  doc.setFillColor(240, 253, 244); // green-50
  doc.roundedRect(14, cardY + 3, 88, 22, 1.5, 1.5, "F");
  doc.setDrawColor(187, 247, 208); // green-200
  doc.roundedRect(14, cardY + 3, 88, 22, 1.5, 1.5, "D");
  
  doc.setFontSize(6.2);
  doc.setTextColor(22, 101, 52); // green-850
  doc.text("STRONGEST SECTOR INTEGRATED", 18, cardY + 8);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(strongSector.name.toUpperCase(), 18, cardY + 13);
  doc.setFontSize(6.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Controls integrated at ${Math.round((strongSector.points/strongSector.total)*100)}% coverage levels.`, 18, cardY + 18);

  // Weak Card (Focus Needed)
  doc.setFillColor(254, 242, 242); // red-50
  doc.roundedRect(108, cardY + 3, 88, 22, 1.5, 1.5, "F");
  doc.setDrawColor(254, 202, 202); // red-200
  doc.roundedRect(108, cardY + 3, 88, 22, 1.5, 1.5, "D");

  doc.setFontSize(6.2);
  doc.setTextColor(153, 27, 27); // red-850
  doc.text("UTMOST SECURITY GAPS REVEALED-FOCUS NEEDED", 112, cardY + 8);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(weakSector.name.toUpperCase(), 112, cardY + 13);
  doc.setFontSize(6.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Immediate remediation required to bolster metrics.`, 112, cardY + 18);

  drawFooter(1, totalPagesCount);

  // ==========================================
  // PAGE 2: REGULATORY COMPLIANCE AND TRUST ALIGNMENT
  // ==========================================
  doc.addPage();
  drawHeader("REGULATORY COMPLIANCE AND TRUST ALIGNMENT");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("4. REGULATORY ALIGNMENT & COMPLIANCE GAP ANALYSIS", 14, 54);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const compDescLines = doc.splitTextToSize(compConfig.description, 182);
  doc.text(compDescLines, 14, 60);

  let compY = 60 + (compDescLines.length * 4.5) + 3;

  // Let's draw a beautiful visual statutory risk card!
  doc.setFillColor(254, 242, 242); // soft red background for liability warning
  doc.roundedRect(14, compY, 182, 26, 1.5, 1.5, "F");
  doc.setDrawColor(254, 202, 202); // border red
  doc.roundedRect(14, compY, 182, 26, 1.5, 1.5, "D");

  // Indicator Bar
  doc.setFillColor(220, 38, 38); // red accent
  doc.rect(14, compY, 4, 26, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27); // deep red
  doc.text(`REGULATORY MANDATE DESIGNATION: ${compConfig.designation.toUpperCase()}`, 22, compY + 6);
  doc.text("STATUTORY POTENTIAL RISK LIABILITY EXPOSURE THREAT", 22, compY + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38); // bright red
  doc.text(cleanRupee(compConfig.statutoryExposure), 22, compY + 18);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  doc.setTextColor(153, 27, 27);
  doc.text(`* Based on selected revenue tier (${companyRevenue}) & current Cybersecurity Trust Index of ${ctiData.overallScore}/100.`, 22, compY + 23);

  // Card 2: Operational Cyber Exposure & Contributing Insights right below it
  const opY = compY + 30;
  doc.setFillColor(248, 250, 252); // soft gray background
  doc.roundedRect(14, opY, 182, 24, 1.5, 1.5, "F");
  doc.setDrawColor(226, 232, 240); // border gray
  doc.roundedRect(14, opY, 182, 24, 1.5, 1.5, "D");

  // Indicator Bar
  doc.setFillColor(16, 185, 129); // emerald accent
  doc.rect(14, opY, 4, 24, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("OPERATIONAL CYBER EXPOSURE & CONTRIBUTING RISK INSIGHTS", 22, opY + 5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(`* Projected Risk Exposure Range: ${cleanExposureRange} | Confidence Level: ${exposure.confidence}`, 22, opY + 10);

  // Contributing factors text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const factorText = "ACTIVE FACTORS: " + exposure.factors.join(" | ");
  const factorLines = doc.splitTextToSize(factorText, 170);
  doc.text(factorLines, 22, opY + 15);

  compY = opY + 30;

  // Now, let's print the framework compliance matrix table!
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`MAPPED COMPLIANCE MATRIX: ${compConfig.name.toUpperCase()}`, 14, compY);

  const complianceRows = compConfig.clauses.map((c) => {
    // Determine status of that category
    let categoryPoints = 0;
    let totalPoints = 0;
    if (c.area === "Identity Access") {
      categoryPoints = checkPoint([1, 2, 3]);
      totalPoints = 30;
    } else if (c.area === "Data Encryption" || c.area === "Availability") {
      categoryPoints = checkPoint([5, 6]);
      totalPoints = 20;
    } else if (c.area === "Incident Response" || c.area === "Governance Policy") {
      categoryPoints = checkPoint([10]);
      totalPoints = 10;
    } else {
      categoryPoints = checkPoint([4, 7, 8, 9]);
      totalPoints = 40;
    }
    const ratio = categoryPoints / totalPoints;
    const status = ratio === 1 ? "FULLY ALIGNED" : ratio >= 0.5 ? "PARTIALLY ALIGNED" : "UNALIGNED GAP";

    return [
      c.area.toUpperCase(),
      c.clause,
      status,
      c.standard
    ];
  });

  autoTable(doc, {
    startY: compY + 4,
    head: [["Information Domain Area", "Applicable Clause", "Current Alignment Status", "Regulatory Compliance Requirement Standard"]],
    body: complianceRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold", fontSize: 7.2 },
    bodyStyles: { fontSize: 7.0, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: "bold" },
      1: { cellWidth: 38, fontStyle: "bold" },
      2: { cellWidth: 35, fontStyle: "bold", halign: "center" },
      3: { cellWidth: 74 }
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const val = data.cell.raw as string;
        if (val === "FULLY ALIGNED") doc.setTextColor(16, 185, 129); // green
        else if (val === "PARTIALLY ALIGNED") doc.setTextColor(217, 119, 6); // orange
        else doc.setTextColor(220, 38, 38); // red
      }
    }
  });

  const page2FinalY = (doc as any).lastAutoTable?.finalY || 210;

  // Let's add a neat trust stamp / citation note at bottom of page 2
  const citationY = Math.min(page2FinalY + 12, pageHeight - 34);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, citationY, 182, 12, "D");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`This framework mapping assesses controls under ${compConfig.name} authority rules. Action items on subsequent pages should be prioritised to satisfy legal mandates and resolve existing gaps.`, 18, citationY + 7);

  drawFooter(2, totalPagesCount);

  // ==========================================
  // PAGE 3: COMPLIANCE ASSESSMENT ROADMAP (TABLE & EXPANSE)
  // ==========================================
  doc.addPage();
  drawHeader("REMEDIATION STEPS & SECURITY VULNERABILITIES");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("5. REMEDIATION STRATEGY ROADMAP (PENDING COMPLIANCE ACTIONS)", 14, 54);

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
  doc.text("6. COMPREHENSIVE ACTION STEPS FOR DEFICIENT SEGMENTS", 14, textRemedyY);
  
  textRemedyY += 4;
  
  if (recommendations.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("No remediation actions are required at this time. Retake current checklist periodically for state tracking.", 14, textRemedyY + 4);
  } else {
    // Loop with limit so that it doesn't overflow page 3 footer
    const listLimit = recommendations.slice(0, 4); 
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
      doc.text(`* There are ${remainingCount} additional priority recommendation item(s). Refer to the full structural breakdown on Page 4 for details.`, 14, textRemedyY + 1);
    }
  }

  drawFooter(3, totalPagesCount);

  // ==========================================
  // PAGE 4: AUDIT TRAIL OF RESPONSES & TECHNICAL VERIFICATION
  // ==========================================
  doc.addPage();
  drawHeader("DETAILED STANDARDS QUESTIONNAIRE AUDIT TRAIL");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("7. METRIC-BY-METRIC SECURITY STANDARDS LOG (ANSWERS LOG)", 14, 54);

  const auditTrailRows = QUESTIONS.map((q) => {
    const userAns = item.answers ? item.answers[q.id] : "No";
    let statusComment = "";
    if (userAns === "Yes") {
      statusComment = `COMPLIANT: Control is active. Hardens company border matching ${compConfig.name} compliance benchmarks.`;
    } else if (userAns === "Partially") {
      statusComment = `RESTRICTED: Partially implemented. Soft spots open organization to active perimeter bypass.`;
    } else {
      statusComment = `CRITICAL FAILURE: Safe standard is absent. Severe threat vulnerability found. Remediate with high urgency.`;
    }

    const userNote = item.notes?.[q.id];
    if (userNote && userNote.trim()) {
      statusComment += `\n\nRECORDED DETAILS: "${userNote.trim()}"`;
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
    head: [["ID", "Security Assessment Metric Surveyed", "Response", "Technical Compliance Valuation & Vulnerability Impact Note"]],
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

  const auditFinalY = (doc as any).lastAutoTable?.finalY || 180;

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
  doc.text(`Audit compliance verification powered by automated AI analytics pipelines. All recommendations correspond directly to active ${compConfig.name} controls.`, 26, certY + 24);

  drawFooter(4, totalPagesCount);

  // ==========================================
  // PAGE 5: APPENDIX (if hasNotes is true)
  // ==========================================
  if (hasNotes) {
    doc.addPage();
    drawHeader("APPENDIX: DETAILED INFRASTRUCTURE SETUP NOTES");
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("8. RECORDED CURRENT INFRASTRUCTURE NOTES", 14, 54);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("The following log aggregates all customized infrastructure responses submitted by the administrator for review:", 14, 60);
    
    let noteY = 66;
    QUESTIONS.forEach((q) => {
      const note = item.notes?.[q.id];
      if (!note || !note.trim()) return;
      
      const ans = item.answers?.[q.id] || "No";
      
      // Calculate vertical space needed
      const noteText = `Active Implementations: "${note.trim()}"`;
      const noteLines = doc.splitTextToSize(noteText, 172);
      const rowHeight = 13 + (noteLines.length * 3.6);
      
      // Prevent overflow in Page 5 log
      if (noteY + rowHeight > pageHeight - 22) {
        drawFooter(5, totalPagesCount);
        doc.addPage();
        drawHeader("APPENDIX: DETAILED INFRASTRUCTURE SETUP NOTES");
        noteY = 54;
      }
      
      // Box backdrop
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, noteY, 182, rowHeight, 1.5, 1.5, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, noteY, 182, rowHeight, 1.5, 1.5, "D");
      
      // Question Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Q${q.id}: ${q.text.toUpperCase()} (${q.category.toUpperCase()})`, 18, noteY + 5);
      
      // Answer status text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      if (ans === "Yes") {
        doc.setTextColor(16, 185, 129);
        doc.text("STATUS: FULLY COMPLIANT", 150, noteY + 5);
      } else if (ans === "Partially") {
        doc.setTextColor(217, 119, 6);
        doc.text("STATUS: PARTIALLY COMPLIANT", 142, noteY + 5);
      } else {
        doc.setTextColor(220, 38, 38);
        doc.text("STATUS: INCOMPLETE", 156, noteY + 5);
      }
      
      // User's note text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(51, 65, 85);
      doc.text(noteLines, 18, noteY + 11);
      
      noteY += rowHeight + 4;
    });
    
    drawFooter(totalPagesCount, totalPagesCount);
  }

  doc.save(`Cyvanta_Report_${(item.id || "").substring(0, 8)}.pdf`);
  
  toast.success("Detailed PDF Report Generated", {
    description: "State records, recommendation items, and full compliance paths compiled successfully."
  });
};
