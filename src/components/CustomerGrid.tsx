import React, { useState } from 'react';
import { Customer, Insight } from '../types';
import { Search, ChevronRight } from 'lucide-react';

interface CustomerGridProps {
  customers: Customer[];
  insights: Insight[];
  onSelect: (customer: Customer) => void;
}

export const CustomerGrid: React.FC<CustomerGridProps> = ({ customers, insights, onSelect }) => {
  const [query, setQuery] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.region.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-light">Inventory <span className="font-bold uppercase tracking-tighter italic">Mapping</span></h2>
          <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mt-1">Management of {customers.length.toLocaleString()} simulation entities</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="FILTER NODES..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-border bg-white text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-black outline-none w-64 transition-all"
          />
        </div>
      </div>

      <div className="border border-border bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-[60px_1.5fr_1fr_1fr_1fr_80px] p-4 bg-gray-50 border-b border-border text-[10px] uppercase font-bold tracking-widest text-gray-400">
          <div>NODE ID</div>
          <div>ENTITY NAME</div>
          <div>SECTOR</div>
          <div>TIER</div>
          <div>HEALTH</div>
          <div className="text-right">OPS</div>
        </div>
        
        <div className="max-h-[580px] overflow-y-auto">
          {filtered.map((c, idx) => {
            const health = insights.find(i => i.customerId === c.id)?.healthScore || 0;
            return (
              <div 
                key={c.id} 
                onClick={() => onSelect(c)}
                className="grid grid-cols-[60px_1.5fr_1fr_1fr_1fr_80px] px-4 py-3 data-row items-center hover:bg-gray-50 transition-colors"
              >
                <div className="mono text-[11px] text-gray-400">#{(idx + 1).toString().padStart(3, '0')}</div>
                <div className="text-sm font-semibold tracking-tight">{c.name}</div>
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-mono">{c.region}</div>
                <div>
                   <span className={`text-[9px] uppercase font-bold px-2 py-0.5 border ${
                     c.planTier === 'Enterprise' ? 'bg-black text-white border-black' : 'text-gray-400 border-gray-200'
                   }`}>
                     {c.planTier}
                   </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden shrink-0">
                    <div className={`h-full ${health < 50 ? 'bg-red-500' : health < 75 ? 'bg-orange-400' : 'bg-green-500'}`} style={{ width: `${health}%` }}></div>
                  </div>
                  <span className={`mono text-[10px] font-bold ${health < 50 ? 'text-red-500' : health < 75 ? 'text-orange-500' : 'text-green-600'}`}>
                    {health}%
                  </span>
                </div>
                <div className="flex justify-end uppercase text-[10px] font-bold tracking-tighter hover:underline cursor-pointer">
                  Details &#8594;
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
