import React from 'react';
import { Users, Activity, Dumbbell, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Client, Workout, Exercise } from '../types';

interface DashboardProps {
  clients: Client[];
  workouts: Workout[];
  exercises: Exercise[];
  setActiveView: (view: any) => void;
}

const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-white shadow-sm`}>
      {React.cloneElement(icon as React.ReactElement, { className: `text-${color.split('-')[1]}-600` })}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const data = [
  { name: 'Seg', treinos: 12 },
  { name: 'Ter', treinos: 19 },
  { name: 'Qua', treinos: 15 },
  { name: 'Qui', treinos: 22 },
  { name: 'Sex', treinos: 18 },
  { name: 'Sab', treinos: 10 },
  { name: 'Dom', treinos: 5 },
];

export const Dashboard: React.FC<DashboardProps> = ({ clients, workouts, exercises, setActiveView }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Painel Principal</h2>
          <p className="text-slate-500">Visão geral do seu desempenho hoje.</p>
        </div>
        <div className="text-sm text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total de Alunos" 
          value={clients.length} 
          icon={<Users size={24} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Treinos Ativos" 
          value={workouts.length} 
          icon={<Activity size={24} />} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Exercícios" 
          value={exercises.length} 
          icon={<Dumbbell size={24} />} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Volume de Treinos da Semana
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="treinos" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 3 ? '#3b82f6' : '#cbd5e1'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-purple-500" />
            Atividade Recente
          </h3>
          <div className="space-y-4">
            {clients.slice(0, 4).map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{client.name}</p>
                    <p className="text-xs text-slate-500">{client.goal}</p>
                  </div>
                </div>
                <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        client.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {client.status}
                    </span>
                </div>
              </div>
            ))}
            <button 
                onClick={() => setActiveView('clients')}
                className="w-full text-center text-sm text-blue-600 font-medium hover:text-blue-700 mt-2 py-2"
            >
                Ver todos os alunos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};