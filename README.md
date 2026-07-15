# Cyvanta: Cyber Risk Decision Intelligence Platform

> **A Strategic B2B SaaS Solution Quantifying Cybersecurity Maturity, Regulatory Compliance, and Financial Exposure for SMBs and Enterprises.**

---

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Website Link : https://cyvanta-1.vercel.app/

## 📌 Executive Summary & Product Vision

In the modern enterprise landscape, cybersecurity is often treated as a reactive IT cost center rather than a proactive risk-management function. This disconnect occurs because **CISOs speak in vulnerabilities (CVEs, patches), while CXOs/CFOs speak in financial liability (ROI, dollars, rupees).**

**Cyvanta** bridges this critical gap. Built from a **Product Manager & Business Strategy** perspective, Cyvanta is an interactive, double-sided decision support system. It maps technical security controls directly to **compliance scores (Cyber Trust Index)** and **quantifiably projects active financial liabilities (Operational Cyber Exposure)** under various firmographic parameters (industry, revenue, jurisdiction). 

By displaying clear cost-benefit metrics (e.g., *"Implementing MFA decreases your projected cyber liability by ₹2.4 Crores"*), Cyvanta empowers Executives, Risk Consultants, and Chief Information Security Officers to build compelling business cases for cybersecurity investments.

---

## 🛠️ Key Product Capabilities

### 1. Dynamic Cyber Trust Index (CTI) Framework
Rather than relying on vague yes/no lists, Cyvanta calculates a proprietary, weighted **Cyber Trust Index (CTI)** scored from 0–100. This score is aggregated across five foundational security pillars:
*   🔑 **Identity & Access Security** (MFA, password hygiene, credential limits)
*   💻 **Endpoint & Threat Guard** (Enterprise patch management, device configurations)
*   🛡️ **Data & Privacy Controls** (At-rest/in-transit encryption, secure storage standards)
*   🌐 **Perimeter & Infrastructure** (Network isolation, firewall monitoring, edge protocols)
*   📋 **Governance & Response** (Staff training programs, Incident Response (IR) protocols)

### 2. Operational & Statutory Financial Exposure Simulation
The platform features an advanced **Financial Risk Simulator** that translates qualitative posture answers into hard quantitative currency values (`INR ₹`, `USD $`, and `EUR €` native support):
*   **Asset-at-Risk Base Cost**: Calculated proportionally using corporate revenue tiers.
*   **Industry Posture Multiplier**: Factoring in higher risk factors in hyper-targeted industries (e.g., *Healthcare / Finance* carry up to **1.6x multiplier** due to extortion allure, whereas *Retail* runs lower).
*   **Statutory Liability Projections**: Dynamic calculations matching legal frameworks (e.g., DPDP penalties up to ₹250 Crores, EU GDPR fines up to 4% of worldwide revenue, US NIST litigation exposure models).

### 3. "What-If" Cyber Budget Optimization Module
An interactive canvas allowing C-suite users to toggle unimplemented security controls (e.g., setting up MFA, enacting automated backup systems, establishing active Incident Response Plans). It visually models the immediate **Financial Delta Risk Reduction**, serving as an instantaneous ROI calculator for security budgets.

### 4. Dynamic Peer Benchmarking Engine
Cyvanta evaluates the firm's compliance indicators and automatically plots them against peer groups compiled from firmographic metrics. It establishes real-time peer average trends to help management answers, *"How do we stack up against other mid-market financial/tech firms in our jurisdiction?"*

### 5. Multi-Page Enterprise Audit Report Generator
Built an in-browser PDF generation engine utilizing `jsPDF` that prints a beautifully formatted, multi-page executive security dossier. Reports feature custom metadata header grids, vector-rendered certificates with cryptographic mock seal stamps, tabular prioritizations, and precise statutory compliance clauses matching the legal jurisdiction of choice.

---

## 📊 Product Design & PM Methodology

As a product designed to captivate recruitments in the **Product Management** or **Management Consulting** space, the platform is structured around industry-standard consulting frameworks:

### A. The Prioritization Framework: Impact vs. Effort Matrix
To turn raw data into decisions, the platform's recommendation engine evaluates recommended controls through a dual-variable matrix:
1.  **Immediacy of Risk Reduction (Impact)**: Derived from the vulnerability factor blocked (e.g., MFA blocks over 99.9% of automated credential reuse attacks).
2.  **Corporate Friction (Effort)**: Rated by implementation time and team coordination (e.g., updating a policy is Low Effort; deploying zero-trust network micro-segmentation is High Effort).

This maps critical actions into digestible, prioritized actions:
*   **Quick Wins**: Critical impact with low effort (Ideal short-term priorities).
*   **Strategic Investments**: High impact requiring high effort (Quarterly roadmaps).

```
          HIGH  |-----------------------|-----------------------|
                |      QUICK WINS       | STATUTORY INITIATIVES |
                |  (e.g., Enforce MFA)  |  (e.g., Zero-Trust)  |
   Postural     |                       |                       |
   Risk         |-----------------------|-----------------------|
   Reduction    |    TACTICAL TASKS     |  LONG-TERM ROADMAP    |
                | (e.g., Policy Update) | (e.g., Legacy Audit)  |
           LOW  |-----------------------|-----------------------|
                LOW                                         HIGH
                               Implementation Effort
```

### B. Regulatory Compliance Adaptability & Localization
The compliance module is built to dynamically pivot based on the target jurisdiction:
*   **India (DPDP)**: Targets Digital Personal Data Protection Act 2023, IT Act Sec 43A, and CERT-In rules.
*   **EU (GDPR)**: Targets Articles 32 & 33 (Technical and Organizational Measures / Breach Notifications).
*   **US / Global (NIST)**: Targets NIST CSF 2.0 and SOC 2 Type II CC 6.0 indices.

---

## 🧬 System Architecture & Tech Stack

Cyvanta is built as a complete, full-stack, enterprise-grade preview application:

*   **Client Interface**: **React 19** styled with a sleek, minimalist Dark Cyber theme. Built with **Tailwind CSS v4** for clean responsive utilities, **Lucide React** for unified icons, and **Recharts** for interactive real-time data visualizers.
*   **Micro-Animations**: Clean physics layout fade-ins and dynamic state counters using the **Motion** library.
*   **Backend Server**: A lightweight, secure **Express (Node.js)** server configured to serve the production-compiled frontend assets with secure routing.
*   **Type Safety**: Core configurations, questions, responses, and compliance models are standardized on strict **TypeScript 5.x** schemas to prevent runtime edge cases.
*   **Report Engine**: Client-side **jsPDF** and **jspdf-autotable** integration formatting rich raw matrices into structured vector documents layouted for print.

---

## 🚀 Getting Started & Local Installation

### Prerequisites
*   Node.js (v18.x or above)
*   npm (v9.x or above)

### 1. Clone the Repository & Environment Preparation
```bash
git clone https://github.com/yourusername/cyvanta.git
cd cyvanta
```

### 2. Install Project Dependencies
Run `npm install` to set up all frontend modules, developer libraries, and server-side components:
```bash
npm install
```

### 3. Run in Development Mode
Launches the micro-server in standard development reload mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser of choice.

### 4. Build & Start in Production Environment
To assemble high-performance production assets bundled via Vite and compiled using esbuild:
```bash
npm run build
npm start
```

*Cyvanta is licensed under the MIT License. Designed and built with extreme precision.*
