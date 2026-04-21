import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CustomerGrid } from './components/CustomerGrid';
import { CustomerDetail } from './components/CustomerDetail';
import { AIAssistant } from './components/AIAssistant';
import { Customer, Insight } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { seedDatabase } from './utils/seedData';
import { Database, RefreshCw, Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    // Real-time synchronization
    const customersQuery = query(collection(db, 'customers'), orderBy('name', 'asc'));
    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
      setLoading(false);
    });

    const insightsQuery = collection(db, 'insights');
    const unsubscribeInsights = onSnapshot(insightsQuery, (snapshot) => {
      setInsights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Insight)));
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeInsights();
    };
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      alert('200+ Synthetic records generated successfully!');
    } catch (error) {
      console.error(error);
      alert('Seeding failed. Check console.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-bg font-serif italic text-xl">
        <Loader2 className="w-8 h-8 animate-spin text-ink opacity-40" />
        Initializing SmartPort Network...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-ink font-sans">
      {/* Geometric Balance Header */}
      <header className="border-h bg-white px-8 h-20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">SmartPort Architecture</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Network Status</p>
            <p className="text-sm font-semibold text-green-600 uppercase">Stable Operation</p>
          </div>
          <div className="h-8 w-[1px] bg-gray-200"></div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Customers</p>
            <p className="text-sm font-semibold">{customers.length.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={view} setView={setView} />
        
        <main className="flex-1 p-8 overflow-y-auto bg-bg">
          <div className="max-w-6xl mx-auto">
            {customers.length === 0 ? (
              <div className="h-[70vh] flex flex-col items-center justify-center border-2 border-dashed border-border gap-6 bg-white shadow-sm">
                <Database className="w-16 h-16 opacity-10" />
                <div className="text-center">
                  <h3 className="text-2xl font-light mb-2 uppercase tracking-tight">Network <span className="font-bold">Offline</span></h3>
                  <p className="text-xs opacity-50 mb-6 font-mono">No simulation data packets detected in local storage.</p>
                  <button 
                    onClick={handleSeed}
                    disabled={seeding}
                    className="btn-primary flex items-center gap-3 mx-auto"
                  >
                    {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    Initialize Dataset
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {view === 'dashboard' && <Dashboard customers={customers} insights={insights} />}
                {view === 'customers' && <CustomerGrid customers={customers} insights={insights} onSelect={setSelectedCustomer} />}
                {view === 'ai-assistant' && <AIAssistant customers={customers} />}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Geometric Balance Footer */}
      <footer className="border-t bg-white h-12 px-8 flex items-center justify-between shrink-0">
        <div className="flex gap-8 text-[11px] uppercase tracking-tighter text-gray-500 font-medium">
          <span className="font-mono">System ID: SP-2026-X</span>
          <span>Node: EDGE-A12</span>
          <span>Latency: 12ms</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase text-gray-700 tracking-wide">Core Services Operational</span>
        </div>
      </footer>

      {selectedCustomer && (
        <CustomerDetail 
          customer={selectedCustomer} 
          insight={insights.find(i => i.customerId === selectedCustomer.id)}
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </div>
  );
}
