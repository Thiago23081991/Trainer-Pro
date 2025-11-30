import React from 'react';
import { LayoutDashboard, Users, Activity, Dumbbell, Sparkles, ChevronRight, DollarSign } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: ViewState.Dashboard, label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { id: ViewState.Clients, label: 'Alunos', icon: <Users size={20} /> },
    { id: ViewState.Financial, label: 'Financeiro', icon: <DollarSign size={20} /> },
    { id: ViewState.Workouts, label: 'Treinos', icon: <Activity size={20} /> },
    { id: ViewState.Exercises, label: 'Exercícios', icon: <Dumbbell size={20} /> },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50 transition-all duration-300">
      <div className="p-6 flex items-center justify-center md:justify-start gap-3 border-b border-slate-800">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
          <Dumbbell className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold hidden md:block tracking-tight">Trainer<span className="text-blue-400">PRO</span></h1>
      </div>
      
      <nav className="flex-1 mt-6 px-2 md:px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden
              ${activeView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="relative z-10 flex items-center gap-3 w-full">
                {item.icon}
                <span className="hidden md:block font-medium">{item.label}</span>
                {activeView === item.id && (
                <ChevronRight size={16} className="ml-auto hidden md:block" />
                )}
            </div>
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-800">
            <button
                onClick={() => setActiveView(ViewState.AICoach)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${activeView === ViewState.AICoach 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/40' 
                    : 'text-indigo-300 hover:bg-indigo-900/20 hover:text-indigo-200'}`}
            >
                <Sparkles size={20} />
                <span className="hidden md:block font-medium">AI Coach</span>
                {activeView === ViewState.AICoach && (
                    <span className="ml-auto hidden md:block w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
            </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 hidden md:block bg-slate-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            PT
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">Personal Trainer</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};