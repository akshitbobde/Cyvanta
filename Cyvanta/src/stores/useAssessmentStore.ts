import { create } from "zustand";
import { AssessmentAnswers, AssessmentAnswer } from "@/types";

interface AssessmentState {
  currentStep: number;
  answers: AssessmentAnswers;
  notes: { [key: number]: string };
  companySize: string;
  companyIndustry: string;
  companyRevenue: string;
  companyJurisdiction: string;
  setAnswer: (questionId: number, answer: AssessmentAnswer) => void;
  setNote: (questionId: number, note: string) => void;
  setCompanySize: (size: string) => void;
  setCompanyIndustry: (industry: string) => void;
  setCompanyRevenue: (revenue: string) => void;
  setCompanyJurisdiction: (jurisdiction: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  setStep: (step: number) => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  currentStep: 0,
  answers: {},
  notes: {},
  companySize: "11–50",
  companyIndustry: "Retail",
  companyRevenue: "₹50L–₹5Cr",
  companyJurisdiction: "India (DPDP)",
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  setNote: (questionId, note) =>
    set((state) => ({
      notes: { ...state.notes, [questionId]: note },
    })),
  setCompanySize: (size) => set({ companySize: size }),
  setCompanyIndustry: (industry) => set({ companyIndustry: industry }),
  setCompanyRevenue: (revenue) => set({ companyRevenue: revenue }),
  setCompanyJurisdiction: (jurisdiction) => set({ companyJurisdiction: jurisdiction }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  reset: () => set({ 
    currentStep: 0, 
    answers: {}, 
    notes: {}, 
    companySize: "11–50", 
    companyIndustry: "Retail", 
    companyRevenue: "₹50L–₹5Cr",
    companyJurisdiction: "India (DPDP)"
  }),
  setStep: (step) => set({ currentStep: step }),
}));
