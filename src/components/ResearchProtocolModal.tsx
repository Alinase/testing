import React from 'react';
import { Shield, FileText, CheckCircle2, Award, User, BookOpen } from 'lucide-react';

interface ResearchProtocolModalProps {
  onClose: () => void;
}

export const ResearchProtocolModal: React.FC<ResearchProtocolModalProps> = ({ onClose }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Institutional Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              ETHICS REFERENCE: NASREC: 2026-JAN: 030
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              The University of Zambia (UNZA)
            </h2>
            <p className="text-xs text-slate-500">
              Humanities and Social Sciences Research Ethics Committee · Master of Arts Programme
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ethics Approved Prototype
            </span>
          </div>
        </div>

        {/* Project Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Principal Investigator (PI)</span>
            <span className="font-bold text-slate-900 text-sm">Alinase Nyirenda</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Research Supervisor</span>
            <span className="font-bold text-slate-900 text-sm">Dr. Simon Tembo</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Study Scope</span>
            <span className="font-bold text-slate-900 text-sm">Local MSMEs (Zambia)</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Program Degree</span>
            <span className="font-bold text-slate-900 text-sm">Master of Arts (MA)</span>
          </div>
        </div>
      </div>

      {/* Study Title & Operational Problem Statement */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Official Research Title
          </h3>
          <p className="text-base font-bold text-slate-900 leading-snug">
            A Comparative Study of Cloud Service Models in Cloud Computing: A Case Study of Zambia
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Statement of Problem Addressed by This Prototype
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            In developing economies like Zambia, commercial micro, small, and medium enterprises (MSMEs) face severe infrastructural constraints, specifically regular load-shedding power blackouts and erratic cellular/broadband internet connectivity. 
            Traditional <strong>Pure SaaS</strong> point-of-sale systems require uninterrupted live server roundtrips, causing immediate transaction abandonment, customer queues, and substantial unrecoverable revenue loss during downtime. 
            This prototype implements and empirically evaluates a <strong>Hybrid Offline-First</strong> architecture using local edge caching, durable browser queues, and asynchronous cloud sync reconciliation.
          </p>
        </div>
      </div>

      {/* Revised Specific Research Objectives (Directly Addressing UNZA Committee Feedback) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Specific Research Objectives (Single-Action Rigor)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Refined to adhere strictly to single-action academic standards as recommended in the NASREC verdict.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-emerald-800 font-mono">OBJECTIVE 1: RELIABILITY DIMENSION</span>
            <p className="text-slate-700 mt-1 font-medium">
              Measure transaction success rates between Hybrid Offline-First and Pure SaaS architectures under simulated network outages and power cuts.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-blue-800 font-mono">OBJECTIVE 2: COST & REVENUE DIMENSION</span>
            <p className="text-slate-700 mt-1 font-medium">
              Quantify financial loss incurred from blocked transactions in Zambian Kwacha (ZMW) versus revenue preserved through local-first persistence.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-bold text-purple-800 font-mono">OBJECTIVE 3: ADOPTION & LATENCY DIMENSION</span>
            <p className="text-slate-700 mt-1 font-medium">
              Determine average synchronization reconciliation time (in milliseconds) required to commit queued transactions once internet connectivity is restored.
            </p>
          </div>
        </div>
      </div>

      {/* Ethical Compliance & Data Anonymity */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-600" />
          Participant Protection & Academic Integrity
        </h3>
        <p>
          In accordance with the UNZA Humanities and Social Sciences Research Ethics Committee guidelines:
          All transactional data collected through simulated or pilot Zambian business field trials is de-identified. Financial figures are recorded strictly for aggregated comparative analysis. No consumer personal identifying information (PII) is stored or transmitted.
        </p>
      </div>
    </div>
  );
};
