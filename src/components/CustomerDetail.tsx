import React, { useState, useEffect } from 'react';
import { Customer, Ticket, Insight } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { X, Mail, AlertTriangle, TrendingDown, LayoutPanelLeft, Clock, History } from 'lucide-react';
import { generateEmailSummary } from '../services/aiService';

interface CustomerDetailProps {
  customer: Customer;
  insight?: Insight;
  onClose: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, insight, onClose }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [emailSummary, setEmailSummary] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      const q = query(collection(db, 'tickets'), where('customerId', '==', customer.id), limit(10));
      const snapshot = await getDocs(q);
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket)));
    };
    fetchTickets();
  }, [customer.id]);

  const handleGenerateEmail = async () => {
    if (!insight) return;
    setLoadingEmail(true);
    const summary = await generateEmailSummary(customer, tickets, insight);
    setEmailSummary(summary);
    setLoadingEmail(false);
  };

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] flex justify-end z-50">
      <div className="w-full max-w-2xl bg-white h-full border-l border-border p-10 overflow-y-auto shadow-2xl flex flex-col gap-10">
        <header className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-light uppercase tracking-tight">{customer.name.split(' ')[0]} <span className="font-bold">{customer.name.split(' ').slice(1).join(' ')}</span></h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge-green">{customer.region}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-0.5">{customer.planTier} Tier</span>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 border border-border flex items-center justify-center hover:bg-gray-50 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </header>

        <section className="grid grid-cols-2 gap-6">
          <div className="stat-card space-y-4">
            <p className="col-header border-b border-gray-100 pb-2 mb-0">System Health Score</p>
            <div className="flex items-center justify-between">
               <span className={`text-4xl font-bold tracking-tighter ${insight && insight.healthScore < 50 ? 'text-red-500' : 'text-gray-900'}`}>
                 {insight?.healthScore || '--'}<span className="text-xl">%</span>
               </span>
               <div className="w-10 h-10 bg-gray-50 flex items-center justify-center border border-gray-100">
                 <div className={`w-3 h-3 border-2 border-current rotate-45 ${insight && insight.healthScore < 50 ? 'text-red-400' : 'text-green-500'}`}></div>
               </div>
            </div>
            {insight && insight.churnRisk === 'High' && (
              <div className="flex items-center gap-2 text-red-600 text-[9px] uppercase font-bold border-l-2 border-red-500 pl-3 py-1 mt-2">
                <AlertTriangle className="w-3 h-3" />
                Critical Churn Exception detected
              </div>
            )}
          </div>
          <div className="stat-card space-y-4">
            <p className="col-header border-b border-gray-100 pb-2 mb-0">Node Inventory</p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-light tracking-tighter font-mono">{customer.deviceInventoryCount.toLocaleString()}</p>
              <LayoutPanelLeft className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Active Edge Instances</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center h-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Churn Probability Matrix</h3>
            <div className="h-[1px] flex-1 mx-4 bg-gray-100"></div>
          </div>
          <div className="stat-card space-y-5 bg-gray-50/50">
            {insight ? (
              <>
                <div className="flex items-center gap-6">
                   <div className="flex-1 h-1.5 bg-gray-200 overflow-hidden">
                      <div className="h-full bg-black" style={{ width: `${insight.churnProbability * 100}%` }}></div>
                   </div>
                   <span className="mono text-[11px] font-bold">{(insight.churnProbability * 100).toFixed(1)}% RATIO</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-widest">Risk Factor Mapping</p>
                    <div className="flex flex-col gap-2">
                      {insight.topRiskFactors.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
                          <div className="w-1.5 h-1.5 bg-orange-400 rotate-45"></div>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-4 border border-gray-100 border-l-4 border-l-black">
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-1">State</p>
                    <p className="text-xl font-bold uppercase italic tracking-tighter">{insight.churnRisk}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs font-mono opacity-40 uppercase">Awaiting AI Telemetry...</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center h-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">External Summary Agent</h3>
            <button 
              onClick={handleGenerateEmail}
              disabled={loadingEmail}
              className="btn-primary flex items-center gap-2 px-6"
            >
              {loadingEmail ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              Dispatch Review
            </button>
          </div>
          {emailSummary && (
            <div className="p-8 border border-border bg-gray-900 text-white font-mono text-[11px] leading-relaxed whitespace-pre-wrap shadow-inner border-l-8 border-l-blue-500">
              {emailSummary}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center h-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Incident Logs</h3>
            <div className="h-[1px] flex-1 mx-4 bg-gray-100"></div>
          </div>
          <div className="space-y-3">
            {tickets.length > 0 ? tickets.map(t => (
              <div key={t.id} className="stat-card p-4 flex justify-between items-center hover:border-gray-300 transition-colors">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-1">{t.category}</p>
                  <p className="text-sm text-gray-600 leading-tight">{t.description}</p>
                  <p className="mono text-[9px] mt-2 text-gray-400 uppercase font-bold">{t.severity} SEVERITY // STATUS: {t.status}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rotate-45 border-2 ${
                    t.severity === 'Critical' ? 'border-red-500 bg-red-100' : t.severity === 'High' ? 'border-orange-500 bg-orange-100' : 'border-green-500 bg-green-100'
                  }`}></div>
                </div>
              </div>
            )) : (
              <p className="text-xs font-mono opacity-40 uppercase text-center py-6 border border-dashed border-border">No operational incidents recorded.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
