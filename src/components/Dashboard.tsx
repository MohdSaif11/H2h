import React from 'react';
import { Customer, Insight } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  customers: Customer[];
  insights: Insight[];
}

export const Dashboard: React.FC<DashboardProps> = ({ customers, insights }) => {
  const avgHealth = insights.length ? Math.round(insights.reduce((acc, curr) => acc + curr.healthScore, 0) / insights.length) : 0;
  const highRiskCount = insights.filter(i => i.churnRisk === 'High').length;
  
  const regionData = customers.reduce((acc: any[], curr) => {
    const existing = acc.find(r => r.name === curr.region);
    if (existing) existing.value++;
    else acc.push({ name: curr.region, value: 1 });
    return acc;
  }, []);

  const healthDistribution = [
    { name: 'Critical (<50)', value: insights.filter(i => i.healthScore < 50).length },
    { name: 'Moderate (50-75)', value: insights.filter(i => i.healthScore >= 50 && i.healthScore < 75).length },
    { name: 'Healthy (>75)', value: insights.filter(i => i.healthScore >= 75).length },
  ];

  const COLORS = ['#141414', '#444444', '#888888', '#CCCCCC'];

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-light">Network <span className="font-bold uppercase italic tracking-tighter">Overview</span></h2>
          <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mt-1">Real-time health telemetry and AI projections</p>
        </div>
        <span className="badge-green">Analytics Satisfied</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <p className="col-header">Aggregate Health</p>
          <div className="flex items-center justify-between">
            <p className="text-4xl font-light tracking-tighter">{avgHealth}<span className="text-xl font-bold">%</span></p>
            <div className={`w-8 h-8 rounded-sm ${avgHealth > 75 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} flex items-center justify-center`}>
               <div className="w-3 h-3 border-2 border-current rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <p className="col-header">High Churn Risk</p>
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold tracking-tighter text-red-600">{highRiskCount}</p>
            <p className="text-[10px] text-gray-400 font-mono uppercase">Nodes Detected</p>
          </div>
        </div>
        <div className="stat-card">
          <p className="col-header">Active Inventory</p>
          <div className="flex items-center justify-between">
            <p className="text-4xl font-light tracking-tighter font-mono">{customers.reduce((acc, c) => acc + c.deviceInventoryCount, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <div className="stat-card h-full">
          <p className="col-header">Regional Distribution Mapping</p>
          <div className="h-[calc(100%-40px)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={{ stroke: '#D1D5DB' }} tick={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase' }} />
                <YAxis axisLine={{ stroke: '#D1D5DB' }} tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '2px' }}
                  itemStyle={{ color: '#F3F4F6', fontSize: '11px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" fill="#1F2937" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card h-full">
          <p className="col-header">System Health Segmentation</p>
          <div className="h-[calc(100%-40px)]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
