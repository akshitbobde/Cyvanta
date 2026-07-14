export enum UserRole {
  IT_ADMIN = "IT Admin",
}

export type AssessmentAnswer = "Yes" | "Partially" | "No";

export interface AssessmentAnswers {
  [key: number]: AssessmentAnswer;
}

export interface Assessment {
  id: string;
  user_id: string;
  answers: AssessmentAnswers;
  trust_score: number;
  risk_level: "Low Risk" | "Moderate Risk" | "High Risk";
  maturity_level: string;
  created_at: string;
  notes?: { [key: number]: string };
  company_size?: string;
  company_industry?: string;
  company_revenue?: string;
  company_jurisdiction?: string;
}

export interface Question {
  id: number;
  text: string;
  description: string;
  category: string;
}

export const CATEGORIES = {
  IDENTITY: "Identity & Access",
  AWARENESS: "Employee Awareness",
  DATA: "Data Protection & Recovery",
  DEVICE: "Device & System Security",
  GOVERNANCE: "Governance & Readiness",
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Do employees use strong passwords for company accounts?",
    description: "Strong passwords include a mix of uppercase, lowercase, numbers, and symbols.",
    category: CATEGORIES.IDENTITY,
  },
  {
    id: 2,
    text: "Is Multi-Factor Authentication (MFA/OTP) enabled for important accounts?",
    description: "MFA adds an extra layer of security beyond just a password.",
    category: CATEGORIES.IDENTITY,
  },
  {
    id: 3,
    text: "Are employee accounts managed properly and removed when no longer needed?",
    description: "Ensures offboarded employees no longer have access to company data.",
    category: CATEGORIES.IDENTITY,
  },
  {
    id: 4,
    text: "Are employees trained to identify scams, phishing emails, or suspicious activity?",
    description: "Regular training helps prevent human-error related security breaches.",
    category: CATEGORIES.AWARENESS,
  },
  {
    id: 5,
    text: "Is important company data backed up regularly?",
    description: "Regular backups ensure data can be recovered in case of ransomeware or loss.",
    category: CATEGORIES.DATA,
  },
  {
    id: 6,
    text: "Is sensitive customer or business data protected securely?",
    description: "Encryption and access controls for sensitive information.",
    category: CATEGORIES.DATA,
  },
  {
    id: 7,
    text: "Are company devices protected with antivirus or security software?",
    description: "Endpoint protection against malware and viruses.",
    category: CATEGORIES.DEVICE,
  },
  {
    id: 8,
    text: "Are systems and software updated regularly?",
    description: "Patch management to fix vulnerabilities in software.",
    category: CATEGORIES.DEVICE,
  },
  {
    id: 9,
    text: "Is remote work or remote system access secured properly?",
    description: "VPNs or secure gateways for employees working from outside the office.",
    category: CATEGORIES.DEVICE,
  },
  {
    id: 10,
    text: "Does the company have basic cybersecurity policies and a plan for cyber emergencies?",
    description: "Incident response plan and formal security guidelines.",
    category: CATEGORIES.GOVERNANCE,
  },
];
