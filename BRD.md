**Business Requirements Document (BRD)**  
*AI-First Behavioral-Health Electronic Health Record (EHR)*  
Version 1.0 | Date 30 Apr 2025 | Owner Adi Tiwari, VP Operations, Opus  

---

## 1 Executive Summary
Mental-health clinicians lose hours each week to manual charting and clunky EHR UX. Our opportunity: launch the first *chat-native* EHR that drafts SOAP notes, creates treatment plans, and answers any patient question in seconds—all inside a modern, minimal UI. The Minimum Viable Product (MVP) targets solo and small behavioral-health practices (≤ 15 clinicians) and intentionally omits scheduling, billing, and HIPAA hardening until market validation.  

**North-star promise:** “Finish a compliant note in < 90 seconds, without leaving the chart.”  

---

## 2 Business Objectives & Success Metrics

| Objective | KPI / Target | Strategic Impact |
|-----------|--------------|------------------|
| **O1 — Validate market demand** | ≥ 3 signed LOIs or paid pilots within 60 days of demo launch | Confirms product/market fit before full HIPAA investment |
| **O2 — Reduce clinician admin time** | Avg. note-completion ≤ 90 s (measured in beta) | Demonstrable ROI → sales lever |
| **O3 — Deliver ‘wow’ demo** | Net Promoter Score (demo) ≥ 40 | Drives word-of-mouth and conference buzz |
| **O4 — Build extendable foundation** | Modular architecture enabling scheduling add-on by Q4 2025 | Lowers future dev cost & risk |

---

## 3 Background & Business Need
1. **Documentation burden**: Progress notes can consume 25–30 % of a clinician’s week; burnout is rising.  
2. **Fragmented workflows**: AI add-ons bolt onto legacy EMRs, forcing toggles and up-charges.  
3. **Competitive gap**: No leading mental-health EHR **starts** with natural language as the primary interaction model.  

Capturing this gap early secures a first-mover brand advantage and positions Opus as an AI thought-leader in behavioral health.

---

## 4 Stakeholders

| Role | Name / Org | Responsibilities |
|------|------------|------------------|
| **Sponsor** | Adi Tiwari (Opus) | Scope, funding, executive decisions |
| Product Manager | TBD | Roadmap, backlog, sprint cadence |
| Lead Engineer | TBD | Architecture, dev velocity, code quality |
| Design Lead | TBD | UX/UI, accessibility |
| Beta Providers | 5–10 clinicians | Feedback, UAT |
| Compliance Advisor | TBD (Phase 2) | HIPAA alignment plan |

---

## 5 Scope

### 5.1 In-Scope (MVP)
* Patient CRUD (demographics, diagnoses, meds)
* AI-generated SOAP progress notes
* AI-guided treatment-plan wizard
* “Chat with Chart” LLM interface
* Transcript upload + auto-summary
* Single-provider authentication
* Demo seed data + metrics instrumentation

### 5.2 Out-of-Scope / Future Phases
* Appointment scheduling & reminders  
* Revenue-cycle / billing workflows  
* Multi-tenant RBAC & granular permissions  
* HIPAA / HITRUST compliance audits  
* Mobile app / offline mode  
* Outcome-measure libraries & signatures  

---

## 6 High-Level Solution Overview
1. **Modern Front End** (Next.js 14, shadcn/ui) with global nav and per-client workspace.  
2. **Context Composer** pulls latest notes, demographics, meds; sends to OpenAI GPT-4o for chat and note generation.  
3. **Postgres via Prisma** stores core tables (`patients`, `progress_notes`, `treatment_plans`, `transcripts`).  
4. **Supabase Storage** for transcript files; Clerk/Supabase Auth for single-user login.  
5. **Deployment** to Vercel (preview) and Railway (demo prod).  

---

## 7 Detailed Business Requirements

| Req-ID | Requirement | Priority | Acceptance Criteria |
|--------|-------------|----------|---------------------|
| **BR-1** | Clinician can create, view, edit, and search patients. | Must | CRUD functions visible; search returns ≤ 300 ms. |
| **BR-2** | Clinician enters 1-3 sentences → system produces a SOAP note draft. | Must | ≥ 70 % drafts accepted with minor edits. |
| **BR-3** | Clinician launches “Chat with Chart” and receives answers derived *only* from that patient’s context. | Must | Median LLM response ≤ 5 s; hallucination rate (incorrect factual answers) < 5 %. |
| **BR-4** | Treatment-plan wizard suggests SMART goals based on diagnosis. | Should | Wizard completion flow ≤ 5 minutes. |
| **BR-5** | Upload ≤ 50 MB transcript; AI returns summary. | Should | Upload < 10 s; summary ≤ 30 s. |
| **BR-6** | Demo dataset pre-seeded with 10 patients, 30 notes each. | Must | Seeder script completes without errors. |
| **BR-7** | Basic analytics dashboard (note time, acceptance %) | Could | Displays real-time metrics to product team. |

---

## 8 Assumptions

* Providers are comfortable beta-testing with **dummy** or de-identified data.  
* OpenAI GPT-4o latency averages ≤ 5 s in North America.  
* Design partners will provide feedback within 48 h of test cycles.  
* Single timezone (America/New_York) accepted for MVP.  

---

## 9 Constraints

* MVP must be deliverable by **June 30 2025** for conference preview.  
* No PHI stored until HIPAA strategy approved (Phase 2).  
* Engineering headcount capped at 2 FTEs + contractor designer.  

---

## 10 Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LLM note quality unsatisfactory | Med | High | Rapid feedback loop, few-shot prompt tuning |
| Scope bloat (scheduling, billing creep) | High | High | Strict change-control; backlog “parking lot” |
| Compliance delays post-MVP | Med | High | Engage HIPAA consultant parallel to beta |
| OpenAI API cost overruns | Med | Med | Usage caps; fine-tune caching where viable |

---

## 11 Benefits Analysis

| Benefit | Quantitative / Qualitative |
|---------|---------------------------|
| **Time saving** | 8–10 hours per clinician per month (internal testing) |
| **Revenue uplift** | Faster notes → quicker claim submission (phase-later) |
| **Market positioning** | First mover in “chat-native” behavioral-health EHR |
| **Platform extensibility** | Modular codebase accelerates future add-ons |

---

## 12 High-Level Timeline & Milestones

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| PRD & BRD sign-off | 02 May 2025 | Approved docs |
| Sprint 0 (scaffold) | 03–10 May | Repo, CI/CD, DB schema |
| Sprint 1-5 | 11 May – 15 Jun | Features BR-1 → BR-5 |
| Internal alpha | 17 Jun | End-to-end flow complete |
| Beta pilots start | 24 Jun | 5 providers onboarded |
| Conference demo | 15 Jul (Seattle) | Live product + pitch deck |
| Pilot decision point | 31 Aug | ≥ 3 LOIs → green-light full build |

---

## 13 Budget Estimate (MVP)

* Engineering (2 FTE, 10 weeks) $ 60 k  
* Design (contract) $ 8 k  
* OpenAI usage (beta) $ 3 k  
* Hosting / tooling $ 2 k  
* **Total** ≈ $ 73 k  

---

## 14 Approval Matrix

| Name | Role | Approval |
|------|------|----------|
| Adi Tiwari | Executive Sponsor | ✅ |
| CEO, Opus | Budget & strategic fit | ☐ |
| Product Manager | Scope accuracy | ☐ |
| Lead Engineer | Feasibility | ☐ |
| Design Lead | UX alignment | ☐ |

---

## 15 Appendices

* **A. Persona details** – extended bios for Dr. Anna, Carlos, Practice Owner  
* **B. LLM Prompt Library v0.1**  
* **C. Glossary (SOAP, PHQ-9, SMART, etc.)**  

---

### Next Steps

1. Circulate BRD for sign-off (due **48 hours**).  
2. Spin up Jira board with requirements mapped to epics.  
3. Kick off Sprint 0 immediately upon approval.  

*Prepared with input from the PRD v0.9 and aligned to Opus’ 2025 OKRs.*