import React from 'react';
import { LayoutDashboard, Users, MessageSquare, ShieldAlert, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <div className="w-64 h-screen border-r border-line p-6 flex flex-col gap-8 bg-bg sticky top-0">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-8 h-8 text-ink" />
        <h1 className="font-serif italic font-bold text-xl tracking-tight">SmartPort</h1>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              currentView === item.id ? 'bg-ink text-bg' : 'hover:bg-ink/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-line/20">
        <div className="flex items-center gap-3 p-3 text-xs opacity-50 font-mono">
          <Database className="w-4 h-4" />
          <span>CONNECTED TO FIRESTORE</span>
        </div>
      </div>
    </div>
  );
};
