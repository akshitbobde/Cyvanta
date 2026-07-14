import { AssessmentAnswers, CATEGORIES } from "@/types";

// Dynamic weights mapping based on the industry
const DEFAULT_WEIGHTS = {
  identity: 0.25,
  workforce: 0.20,
  resilience: 0.20,
  operational: 0.20,
  governance: 0.15,
};

export const INDUSTRY_CONFIGS: {
  [key: string]: {
    benchmark: number;
    profile: string;
    insights: string;
    weights: {
      identity: number;
      workforce: number;
      resilience: number;
      operational: number;
      governance: number;
    };
  };
} = {
  Finance: {
    benchmark: 82,
    profile: "High Scrutiny & Regulatory Pressure",
    insights: "Financial entities face severe phishing and transaction fraud risks. Strong identity confirmation controls and administrative compliance planning are fundamental safeguards.",
    weights: {
      identity: 0.35,
      governance: 0.25,
      resilience: 0.20,
      operational: 0.10,
      workforce: 0.10,
    }
  },
  Healthcare: {
    benchmark: 80,
    profile: "High Sensitive Data Security Compliance",
    insights: "Healthcare providers are prioritized targets for patient identification and ransomware exfiltration. Endpoint resilience and active governance are vital.",
    weights: {
      resilience: 0.35,
      governance: 0.25,
      identity: 0.20,
      operational: 0.10,
      workforce: 0.10,
    }
  },
  SaaS: {
    benchmark: 78,
    profile: "Continuous Availability & API Exposure Risks",
    insights: "Software platform providers are exposed to malicious service disruption and account takeovers. Identity access policies and device verification protect operational up-times.",
    weights: {
      identity: 0.35,
      operational: 0.30,
      resilience: 0.15,
      workforce: 0.10,
      governance: 0.10,
    }
  },
  Retail: {
    benchmark: 65,
    profile: "Distributed Endpoint Security Challenge",
    insights: "Retail stores face heavy phishing vectors and point-of-sale device threats. Upgrading employee training and secure remote gates is highly impactful.",
    weights: {
      workforce: 0.30,
      operational: 0.30,
      identity: 0.20,
      resilience: 0.10,
      governance: 0.10,
    }
  },
  Manufacturing: {
    benchmark: 62,
    profile: "Critical Operational Infrastructure Resilience",
    insights: "Manufacturing sectors are vulnerable to supply-chain disruption. Restoring systems rapidly through robust isolated backups reduces outage windows.",
    weights: DEFAULT_WEIGHTS
  },
  Education: {
    benchmark: 60,
    profile: "Open Infrastructure & Decentralized Access",
    insights: "Educational facilities manage numerous public credentials. Standardizing account offboarding and basic anti-malware guards prevents unauthorized intrusions.",
    weights: DEFAULT_WEIGHTS
  },
  "Professional Services": {
    benchmark: 70,
    profile: "Client Data Privacy & Email Compromise Focus",
    insights: "Professional consultancies handle sensitive intellectual and legal records. Enhancing corporate password regulations and e-signatures secures communications.",
    weights: DEFAULT_WEIGHTS
  }
};

export function getIndustryConfig(industry: string) {
  return INDUSTRY_CONFIGS[industry] || {
    benchmark: 70,
    profile: "Standard SMB Compliance & Protection Guidelines",
    insights: "Ensure standard multi-factor verification, clean employee awareness schedules, and resilient backup procedures to minimize generic cyber threats.",
    weights: DEFAULT_WEIGHTS
  };
}

// Calculates dynamic CTI score with pillar-level weights
export function calculateCTI(answers: AssessmentAnswers, industry?: string) {
  const config = getIndustryConfig(industry || "Retail");
  const weights = config.weights;

  const scoreMap = (ans: string | undefined) => {
    if (ans === "Yes") return 100;
    if (ans === "Partially") return 50;
    return 0;
  };

  // 1. Identity Confidence (Q1, Q2, Q3)
  const q1 = scoreMap(answers[1]);
  const q2 = scoreMap(answers[2]);
  const q3 = scoreMap(answers[3]);
  const identity = (q1 + q2 + q3) / 3;

  // 2. Workforce Readiness (Q4)
  const workforce = scoreMap(answers[4]);

  // 3. Data Resilience (Q5, Q6)
  const q5 = scoreMap(answers[5]);
  const q6 = scoreMap(answers[6]);
  const resilience = (q5 + q6) / 2;

  // 4. Operational Security (Q7, Q8, Q9)
  const q7 = scoreMap(answers[7]);
  const q8 = scoreMap(answers[8]);
  const q9 = scoreMap(answers[9]);
  const operational = (q7 + q8 + q9) / 3;

  // 5. Governance Maturity (Q10)
  const governance = scoreMap(answers[10]);

  // Weighted score
  const overallCti = 
    (identity * weights.identity) +
    (workforce * weights.workforce) +
    (resilience * weights.resilience) +
    (operational * weights.operational) +
    (governance * weights.governance);

  return {
    overallScore: Math.round(overallCti),
    pillars: {
      identity: Math.round(identity),
      workforce: Math.round(workforce),
      resilience: Math.round(resilience),
      operational: Math.round(operational),
      governance: Math.round(governance)
    },
    weightsUsed: weights
  };
}

// Keep compatibility with simple score calculator and override with dynamic balanced calculation
export function calculateScore(answers: AssessmentAnswers, industry?: string) {
  return calculateCTI(answers, industry).overallScore;
}

export function getRiskLevel(score: number) {
  if (score >= 80) return "Low Risk";
  if (score >= 60) return "Moderate Risk";
  return "High Risk";
}

export function getMaturityLevel(score: number) {
  if (score >= 81) return "Trusted Enterprise";
  if (score >= 61) return "Advanced Governance";
  if (score >= 41) return "Managed Security";
  if (score >= 21) return "Basic Protection";
  return "Vulnerable";
}

// Generate operational Cyber Risk Exposure
export function getOperationalCyberExposure(
  cti: number,
  size?: string,
  industry?: string,
  revenue?: string
) {
  const cleanSize = size || "11–50";
  const cleanIndustry = industry || "Retail";
  const cleanRevenue = revenue || "₹50L–₹5Cr";

  // Map revenue base cost
  let baseMin = 1000000;
  let baseMax = 3000000;

  if (cleanRevenue.includes("Less than ₹50L")) {
    baseMin = 200000;
    baseMax = 500000;
  } else if (cleanRevenue.includes("₹50L–₹5Cr")) {
    baseMin = 800000;
    baseMax = 2500000;
  } else if (cleanRevenue.includes("₹5Cr–₹25Cr")) {
    baseMin = 4000000;
    baseMax = 12000000;
  } else if (cleanRevenue.includes("₹25Cr+")) {
    baseMin = 15000000;
    baseMax = 50000000;
  }

  // Scale based on industry risk premiums
  let industryMultiplier = 1.0;
  if (cleanIndustry === "Finance") industryMultiplier = 1.45;
  else if (cleanIndustry === "Healthcare") industryMultiplier = 1.35;
  else if (cleanIndustry === "SaaS") industryMultiplier = 1.25;
  else if (cleanIndustry === "Retail") industryMultiplier = 1.10;
  else if (cleanIndustry === "Professional Services") industryMultiplier = 1.05;
  else if (cleanIndustry === "Education") industryMultiplier = 0.90;

  // Scale based on size multiplier
  let sizeMultiplier = 1.0;
  if (cleanSize === "1–10 employees") sizeMultiplier = 0.85;
  else if (cleanSize === "51–200") sizeMultiplier = 1.30;
  else if (cleanSize === "201+") sizeMultiplier = 1.80;

  // Calculate final limits under threat mitigation
  // Secure setups (high CTI) mitigate exposure up to 85%
  const mitigationRate = (cti / 100) * 0.85; 
  const currentMultiplier = (1 - mitigationRate) * industryMultiplier * sizeMultiplier;

  const minVal = Math.round(baseMin * currentMultiplier);
  const maxVal = Math.round(baseMax * currentMultiplier);

  // Formatting helper
  const formatValue = (val: number): string => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(1)}Cr`;
    }
    return `₹${Math.round(val / 100000)}L`;
  };

  // Contributing factor selection
  const factors: string[] = [];
  if (cti < 50) {
    factors.push("Critically low overall cybersecurity posture with widespread capability gaps.");
  }
  if (cleanRevenue.includes("₹25Cr+") || cleanRevenue.includes("₹5Cr–₹25Cr")) {
    factors.push("Increased financial targeting risk driven by high company revenue scale.");
  }
  if (cleanSize === "201+" || cleanSize === "51–200") {
    factors.push("Larger organizational attack surface due to substantial workforce footprint.");
  }
  
  if (cleanIndustry === "Finance" || cleanIndustry === "Healthcare" || cleanIndustry === "SaaS") {
    factors.push(`Operates in a highly targeted '${cleanIndustry}' sector with aggressive threat landscapes.`);
  }

  // Fallback default factor
  if (factors.length < 2) {
    factors.push("General remote systems footprint and potential exposure to email identity exploitation.");
  }
  
  // Confidence determination
  let confidence = "Moderate Confidence";
  if (cti > 80) {
    confidence = "High Confidence (Mitigation Active)";
  } else if (cti < 40) {
    confidence = "Low Confidence (High Unmitigated Risk)";
  }

  return {
    range: `${formatValue(minVal)}–${formatValue(maxVal)}`,
    minVal,
    maxVal,
    confidence,
    factors
  };
}

export function getRecommendations(answers: AssessmentAnswers) {
  const recommendations = [];

  const mapping: { [key: number]: string } = {
    1: "Strengthen password policies and encourage stronger credential practices.",
    2: "Enable MFA for critical business accounts.",
    3: "Ensure accounts are promptly deactivated when employees leave.",
    4: "Conduct employee cybersecurity awareness training.",
    5: "Implement automated backup processes.",
    6: "Improve customer and business data protection controls.",
    7: "Deploy stronger endpoint security measures.",
    8: "Improve software update and patch management practices.",
    9: "Secure remote access processes.",
    10: "Establish cybersecurity policies and an incident response framework.",
  };

  const categories: { [key: number]: string } = {
    1: CATEGORIES.IDENTITY, 2: CATEGORIES.IDENTITY, 3: CATEGORIES.IDENTITY,
    4: CATEGORIES.AWARENESS,
    5: CATEGORIES.DATA, 6: CATEGORIES.DATA,
    7: CATEGORIES.DEVICE, 8: CATEGORIES.DEVICE, 9: CATEGORIES.DEVICE,
    10: CATEGORIES.GOVERNANCE,
  };

  for (let i = 1; i <= 10; i++) {
    const answer = answers[i];
    if (answer === "No" || answer === "Partially") {
      recommendations.push({
        id: i,
        text: mapping[i],
        priority: answer === "No" ? "High" : "Medium",
        category: categories[i],
      });
    }
  }

  return recommendations;
}
