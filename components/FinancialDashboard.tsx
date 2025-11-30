import React, { useState } from 'react';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, TrendingUp, Wallet, Bell, Send, Check, RefreshCw, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Client } from '../types';

interface FinancialDashboardProps {
  clients: Client[];
  onConfirmPayment: (clientId: number) => void;
  onProcessRecurring: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ clients, onConfirmPayment, onProcessRecurring }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Cálculos Financeiros
  const activeClients = clients.filter(c => c.status === 'Ativo');
  const totalMRR = activeClients.reduce((acc, curr) => acc + (curr.monthlyFee || 0), 0);
  
  const overdueClients = clients.filter(c => c.paymentStatus === 'Atrasado');
  const pendingClients = clients.filter(c => c.paymentStatus === 'Pendente');

  // Dados para Gráficos
  const revenueByPlan = [
    { name: 'Online', value: activeClients.filter(c => c.planType === 'Consultoria Online').reduce((acc, c) => acc + (c.monthlyFee || 0), 0) },
    { name: 'Presencial', value: activeClients.filter(c => c.planType === 'Personal Presencial').reduce((acc, c) => acc + (c.monthlyFee || 0), 0) },
    { name: 'Híbrido', value: activeClients.filter(c => c.planType === 'Híbrido').reduce((acc, c) => acc + (c.monthlyFee || 0), 0) },
  ].filter(i => i.value > 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

  const handleSendReminder = (client: Client) => {
    const message = `Olá ${client.name}, tudo bem? 👋\n\n` +
      `Passando para lembrar sobre a mensalidade do seu plano *${client.planType}*.\n` +
      `💲 Valor: *R$ ${client.monthlyFee?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n` +
      `📅 Vencimento: ${client.nextPaymentDate}\n\n` +
      `Fico no aguardo do comprovante. Qualquer dúvida, estou à disposição! 🚀`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleProcessClick = () => {
    if (confirm('Deseja processar a cobrança automática nos cartões cadastrados?')) {
        setIsProcessing(true);
        setTimeout(() => {
            onProcessRecurring();
            setIsProcessing(false);
            alert('Cobranças processadas com sucesso! As datas de vencimento foram atualizadas para o próximo mês.');
        }, 1500); // Simula delay da API de pagamento
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão Financeira</h2>
          <p className="text-slate-500">Controle de receitas, assinaturas e cobranças automáticas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={handleProcessClick}
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Processar Recorrência
            </button>
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2">
                <Bell size={18} /> Alertas
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-green-100 text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Receita Mensal Recorrente (MRR)</p>
            <h3 className="text-2xl font-bold text-slate-800">R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-100 text-blue-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Assinaturas Ativas</p>
            <h3 className="text-2xl font-bold text-slate-800">{activeClients.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className={`p-4 rounded-xl ${overdueClients.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Pagamentos Pendentes</p>
            <h3 className="text-2xl font-bold text-slate-800">
                {overdueClients.length + pendingClients.length} <span className="text-xs font-normal text-slate-400">alunos</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Lista de Cobranças */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="text-indigo-500" size={20}/> 
                    Controle de Cobranças (Recorrência)
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="p-4 font-semibold">Aluno / Plano</th>
                            <th className="p-4 font-semibold">Método</th>
                            <th className="p-4 font-semibold">Valor</th>
                            <th className="p-4 font-semibold">Vencimento</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {clients.map(client => (
                            <tr key={client.id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <p className="font-medium text-slate-800">{client.name}</p>
                                    <p className="text-xs text-slate-500">{client.planType}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        {client.paymentMethod?.includes('•') ? <CreditCard size={14} /> : <Wallet size={14} />}
                                        <span className="text-xs">{client.paymentMethod || 'Não cadastrado'}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-medium">
                                    R$ {client.monthlyFee?.toLocaleString('pt-BR')}
                                </td>
                                <td className="p-4 text-slate-600">
                                    {client.nextPaymentDate}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                                        client.paymentStatus === 'Em dia' ? 'bg-green-100 text-green-700' :
                                        client.paymentStatus === 'Atrasado' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {client.paymentStatus === 'Em dia' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                                        {client.paymentStatus}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {client.paymentStatus !== 'Em dia' && (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleSendReminder(client)}
                                                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-transparent hover:border-indigo-100"
                                                title="Enviar lembrete no WhatsApp"
                                            >
                                                <Send size={12} /> Cobrar
                                            </button>
                                            <button 
                                                onClick={() => onConfirmPayment(client.id)}
                                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                                title="Marcar como Pago"
                                            >
                                                <Check size={12} /> Confirmar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Breakdown de Receita */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 text-sm">Receita por Tipo de Plano</h3>
                <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={revenueByPlan}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {revenueByPlan.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-xs text-slate-400">Total</span>
                            <span className="block font-bold text-slate-800">R$ {totalMRR.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {revenueByPlan.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                <span className="text-slate-600">{item.name}</span>
                            </div>
                            <span className="font-medium text-slate-800">R$ {item.value.toLocaleString('pt-BR')}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <TrendingUp className="text-green-400" size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Projeção Mensal</h3>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                    Com base nas assinaturas ativas, sua receita estimada para o próximo mês é:
                </p>
                <div className="text-3xl font-bold mb-2">R$ {totalMRR.toLocaleString('pt-BR')}</div>
                <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-3/4 rounded-full"></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">75% da meta batida</p>
            </div>
        </div>
      </div>
    </div>
  );
};