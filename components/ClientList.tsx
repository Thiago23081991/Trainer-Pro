import React, { useState } from 'react';
import { Plus, Trash2, Search, Filter, Dumbbell, ArrowLeft, Calendar, FileText, CheckCircle, List, Activity, TrendingUp, BarChart as BarChartIcon, DollarSign, Ruler, Scale, User, Check, Share2, Edit, Copy, X } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Client, Workout, Exercise, ClientProgressLog } from '../types';

interface ClientListProps {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  workouts: Workout[];
  exercises: Exercise[];
}

export const ClientList: React.FC<ClientListProps> = ({ clients, setClients, workouts, exercises }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsTab, setDetailsTab] = useState<'workouts' | 'exercises' | 'progress'>('workouts');
  const [editingClient, setEditingClient] = useState<any>(null);

  // Clone Workout State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [workoutToClone, setWorkoutToClone] = useState<Workout | null>(null);
  const [cloneTargetClientId, setCloneTargetClientId] = useState<string>('');
  const [cloneNewTitle, setCloneNewTitle] = useState('');
  const [cloneResetLoads, setCloneResetLoads] = useState(false);

  // Workout Assignment State
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  
  // Exercise Assignment State
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState(''); 
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseDetails, setExerciseDetails] = useState({ sets: 3, reps: '10', load: '', obs: '' });
  
  // New Client State extended with measurements
  const [newClient, setNewClient] = useState({ 
    name: '', 
    goal: '', 
    status: 'Ativo',
    planType: 'Consultoria Online',
    monthlyFee: 150,
    paymentStatus: 'Em dia',
    paymentDay: '10', // Dia padrão de vencimento
    nextPaymentDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10) < new Date() 
        ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10).toLocaleDateString('pt-BR')
        : new Date(new Date().getFullYear(), new Date().getMonth(), 10).toLocaleDateString('pt-BR'),
    // Medidas Iniciais
    age: '',
    height: '',
    initialWeight: '',
    initialBodyFat: ''
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;

    // Criar o primeiro log de progresso se houver peso inicial
    const initialProgressLogs: ClientProgressLog[] = [];
    if (newClient.initialWeight) {
        initialProgressLogs.push({
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), // Ex: 25/11
            weight: Number(newClient.initialWeight),
            bodyFat: newClient.initialBodyFat ? Number(newClient.initialBodyFat) : undefined,
            workoutsCompleted: 0,
            volumeLoad: 0
        });
    }

    setClients([...clients, { 
      id: Date.now(), 
      name: newClient.name,
      goal: newClient.goal,
      status: newClient.status as any,
      lastTraining: '-',
      planType: newClient.planType as any,
      monthlyFee: newClient.monthlyFee,
      paymentStatus: newClient.paymentStatus as any,
      nextPaymentDate: newClient.nextPaymentDate,
      // Dados Antropométricos
      age: newClient.age ? Number(newClient.age) : undefined,
      height: newClient.height ? Number(newClient.height) : undefined,
      // Listas
      assignedWorkouts: [],
      assignedExercises: [],
      progressLogs: initialProgressLogs
    } as Client]);

    // Reset Form
    const defaultDay = 10;
    const today = new Date();
    let nextDate = new Date(today.getFullYear(), today.getMonth(), defaultDay);
    if (nextDate < today) nextDate.setMonth(nextDate.getMonth() + 1);

    setNewClient({ 
        name: '', 
        goal: '', 
        status: 'Ativo',
        planType: 'Consultoria Online',
        monthlyFee: 150,
        paymentStatus: 'Em dia',
        paymentDay: '10',
        nextPaymentDate: nextDate.toLocaleDateString('pt-BR'),
        age: '',
        height: '',
        initialWeight: '',
        initialBodyFat: ''
    });
    setShowAddModal(false);
  };

  const handleEditClick = (client: Client) => {
    // Pega o último log para preencher os campos atuais
    const lastLog = client.progressLogs && client.progressLogs.length > 0 
        ? client.progressLogs[client.progressLogs.length - 1] 
        : null;

    setEditingClient({
        id: client.id,
        name: client.name,
        goal: client.goal,
        status: client.status,
        planType: client.planType,
        monthlyFee: client.monthlyFee,
        paymentStatus: client.paymentStatus,
        nextPaymentDate: client.nextPaymentDate,
        paymentDay: client.paymentDay || '10',
        age: client.age || '',
        height: client.height || '',
        currentWeight: lastLog?.weight || '',
        currentBodyFat: lastLog?.bodyFat || ''
    });
  };

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const updatedClients = clients.map(client => {
        if (client.id === editingClient.id) {
            // Lógica para atualizar logs de progresso se peso/gordura mudou
            let updatedLogs = [...(client.progressLogs || [])];
            const lastLog = updatedLogs.length > 0 ? updatedLogs[updatedLogs.length - 1] : null;
            
            const newWeight = Number(editingClient.currentWeight);
            const newBodyFat = editingClient.currentBodyFat ? Number(editingClient.currentBodyFat) : undefined;
            const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            // Se houve mudança significativa ou se não existia log
            if (!lastLog || lastLog.weight !== newWeight || lastLog.bodyFat !== newBodyFat) {
                // Se já existe log de hoje, atualiza. Senão, cria novo.
                if (lastLog && lastLog.date === todayStr) {
                    updatedLogs[updatedLogs.length - 1] = {
                        ...lastLog,
                        weight: newWeight,
                        bodyFat: newBodyFat
                    };
                } else {
                    updatedLogs.push({
                        date: todayStr,
                        weight: newWeight,
                        bodyFat: newBodyFat,
                        workoutsCompleted: 0,
                        volumeLoad: 0
                    });
                }
            }

            return {
                ...client,
                name: editingClient.name,
                goal: editingClient.goal,
                status: editingClient.status,
                planType: editingClient.planType,
                monthlyFee: Number(editingClient.monthlyFee),
                paymentStatus: editingClient.paymentStatus,
                nextPaymentDate: editingClient.nextPaymentDate,
                paymentDay: editingClient.paymentDay,
                age: editingClient.age ? Number(editingClient.age) : undefined,
                height: editingClient.height ? Number(editingClient.height) : undefined,
                progressLogs: updatedLogs
            } as Client;
        }
        return client;
    });

    setClients(updatedClients);
    setEditingClient(null);
  };

  // --- Assign Workout Logic ---
  const handleAssignWorkout = () => {
    if (!selectedClient || !selectedWorkoutId) return;
    
    const workoutToAdd = workouts.find(w => w.id === Number(selectedWorkoutId));
    if (!workoutToAdd) return;

    const alreadyAssigned = selectedClient.assignedWorkouts?.some(w => w.id === workoutToAdd.id);
    if (alreadyAssigned) {
        alert("Este treino já foi atribuído a este aluno.");
        return;
    }

    const updatedClient = {
        ...selectedClient,
        assignedWorkouts: [...(selectedClient.assignedWorkouts || []), workoutToAdd]
    };

    updateClientInList(updatedClient);
    setSelectedWorkoutId('');
  };

  const handleRemoveWorkoutFromClient = (workoutId: number) => {
    if (!selectedClient) return;
    const updatedClient = {
        ...selectedClient,
        assignedWorkouts: selectedClient.assignedWorkouts?.filter(w => w.id !== workoutId) || []
    };
    updateClientInList(updatedClient);
  };

  // --- Clone Workout Logic ---
  const handleOpenCloneModal = (workout: Workout) => {
    setWorkoutToClone(workout);
    setCloneNewTitle(`${workout.title} (Cópia)`);
    setCloneTargetClientId(selectedClient?.id.toString() || '');
    setCloneResetLoads(false);
    setShowCloneModal(true);
  };

  const handleCloneWorkout = () => {
    if (!workoutToClone || !cloneTargetClientId) return;

    // 1. Criar cópia profunda dos exercícios
    const clonedExercises = workoutToClone.exercises.map(ex => ({
        ...ex,
        load: cloneResetLoads ? '' : ex.load // Reseta a carga se solicitado
    }));

    const newWorkout: Workout = {
        ...workoutToClone,
        id: Date.now(), // Novo ID único
        title: cloneNewTitle,
        exercises: clonedExercises
    };

    // 2. Encontrar o cliente alvo e atualizar
    const updatedClients = clients.map(client => {
        if (client.id === parseInt(cloneTargetClientId)) {
            return {
                ...client,
                assignedWorkouts: [...(client.assignedWorkouts || []), newWorkout]
            };
        }
        return client;
    });

    setClients(updatedClients);
    
    // Se estiver clonando para o cliente atual, atualiza a view
    if (selectedClient && selectedClient.id === parseInt(cloneTargetClientId)) {
        const updatedCurrentClient = updatedClients.find(c => c.id === selectedClient.id);
        if (updatedCurrentClient) setSelectedClient(updatedCurrentClient);
    }

    setShowCloneModal(false);
    setWorkoutToClone(null);
  };

  // --- Complete Workout Logic & WhatsApp Share ---
  const handleCompleteWorkout = (workout: Workout) => {
    if (!selectedClient) return;

    const todayDateShort = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const todayDateFull = new Date().toLocaleDateString('pt-BR');

    // 1. Atualizar Logs de Progresso
    const currentLogs = [...(selectedClient.progressLogs || [])];
    const logIndex = currentLogs.findIndex(l => l.date === todayDateShort);
    
    const lastWeight = currentLogs.length > 0 ? currentLogs[currentLogs.length - 1].weight : 70;

    if (logIndex >= 0) {
        currentLogs[logIndex] = {
            ...currentLogs[logIndex],
            workoutsCompleted: (currentLogs[logIndex].workoutsCompleted || 0) + 1
        };
    } else {
        currentLogs.push({
            date: todayDateShort,
            weight: lastWeight,
            workoutsCompleted: 1,
            volumeLoad: 0 
        });
    }

    // 2. Atualizar Cliente
    const updatedClient = {
        ...selectedClient,
        status: 'Ativo', 
        lastTraining: todayDateFull,
        progressLogs: currentLogs
    } as Client;

    updateClientInList(updatedClient);
    
    // 3. Enviar automaticamente para WhatsApp (Link pré-preenchido)
    const message = `Olá ${selectedClient.name}! 🚀\n\n` +
        `Treino de hoje (${todayDateFull}) concluído com sucesso!\n\n` +
        `*Treino Realizado: ${workout.title}*\n` +
        workout.exercises.map(ex => {
            const loadStr = ex.load ? ` [${ex.load}kg]` : '';
            return `✅ ${ex.name}: ${ex.sets}x${ex.reps}${loadStr}`;
        }).join('\n') +
        `\n\nContinue focado! 💪`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // --- Assign Individual Exercise Logic ---
  const handleAssignExercise = () => {
    if (!selectedClient || !selectedExerciseId) return;
    
    const exerciseToAdd = exercises.find(e => e.id === Number(selectedExerciseId));
    if (!exerciseToAdd) return;

    const newAssignedExercise = {
        originalId: exerciseToAdd.id,
        name: exerciseToAdd.name,
        sets: exerciseDetails.sets,
        reps: exerciseDetails.reps,
        load: exerciseDetails.load,
        obs: exerciseDetails.obs
    };

    const updatedClient = {
        ...selectedClient,
        assignedExercises: [...(selectedClient.assignedExercises || []), newAssignedExercise]
    };

    updateClientInList(updatedClient);
    // Reset form
    setSelectedExerciseId('');
    setExerciseDetails({ sets: 3, reps: '10', load: '', obs: '' });
  };

  const handleRemoveExerciseFromClient = (index: number) => {
    if (!selectedClient) return;
    const updatedClient = {
        ...selectedClient,
        assignedExercises: selectedClient.assignedExercises?.filter((_, i) => i !== index) || []
    };
    updateClientInList(updatedClient);
  };

  // --- Manual Payment Confirmation Logic ---
  const handleManualPaymentConfirmation = () => {
    if (!selectedClient) return;
    
    const updatedClient: Client = {
        ...selectedClient,
        paymentStatus: 'Em dia',
        paymentHistory: [
            ...(selectedClient.paymentHistory || []),
            {
                id: Date.now(),
                date: new Date().toLocaleDateString('pt-BR'),
                amount: selectedClient.monthlyFee || 0,
                status: 'Em dia',
                method: 'Manual (Via App)'
            }
        ]
    };
    updateClientInList(updatedClient);
  };

  const updateClientInList = (updatedClient: Client) => {
    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updatedClients);
    setSelectedClient(updatedClient);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExercisesForAssignment = exercises.filter(ex => 
    ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
    ex.muscle.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

  // --- VISÃO DE DETALHES DO ALUNO ---
  if (selectedClient) {
    const logs = selectedClient.progressLogs || [];
    const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
    const startLog = logs.length > 0 ? logs[0] : null;

    const weightChange = latestLog && startLog ? (latestLog.weight - startLog.weight).toFixed(1) : '0';
    const isWeightGain = parseFloat(weightChange) > 0;
    
    const bmi = selectedClient.height && latestLog?.weight 
        ? (latestLog.weight / ((selectedClient.height/100) ** 2)).toFixed(1)
        : null;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSelectedClient(null)} 
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{selectedClient.name}</h2>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <span>{selectedClient.age ? `${selectedClient.age} anos` : 'Idade N/A'}</span>
                            <span>•</span>
                            <span>{selectedClient.goal}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                     <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        selectedClient.planType?.includes('Online') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-purple-50 border-purple-200 text-purple-700'
                    }`}>
                        {selectedClient.planType}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium ${selectedClient.paymentStatus === 'Em dia' ? 'text-green-600' : 'text-red-500'}`}>
                            {selectedClient.paymentStatus}
                        </span>
                        {selectedClient.paymentStatus !== 'Em dia' && (
                            <button 
                                onClick={handleManualPaymentConfirmation}
                                className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 hover:bg-green-200 transition-colors"
                                title="Confirmar recebimento"
                            >
                                <Check size={10} /> Pago
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
                <button 
                    onClick={() => setDetailsTab('workouts')}
                    className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 transition-colors relative whitespace-nowrap ${
                        detailsTab === 'workouts' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Dumbbell size={18} />
                    Fichas de Treino
                    {detailsTab === 'workouts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setDetailsTab('exercises')}
                    className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 transition-colors relative whitespace-nowrap ${
                        detailsTab === 'exercises' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <List size={18} />
                    Exercícios Avulsos
                    {detailsTab === 'exercises' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setDetailsTab('progress')}
                    className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 transition-colors relative whitespace-nowrap ${
                        detailsTab === 'progress' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <TrendingUp size={18} />
                    Progresso e Métricas
                    {detailsTab === 'progress' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                </button>
            </div>

            {/* TAB: PROGRESSO */}
            {detailsTab === 'progress' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Dados Corporais Estáticos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg text-slate-500 shadow-sm">
                                <Ruler size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Altura</p>
                                <p className="font-bold text-slate-800">{selectedClient.height ? `${selectedClient.height} cm` : '--'}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg text-slate-500 shadow-sm">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Idade</p>
                                <p className="font-bold text-slate-800">{selectedClient.age ? `${selectedClient.age} anos` : '--'}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg text-slate-500 shadow-sm">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">IMC Estimado</p>
                                <p className="font-bold text-slate-800">{bmi || '--'}</p>
                            </div>
                        </div>
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg text-slate-500 shadow-sm">
                                <Scale size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">% Gordura</p>
                                <p className="font-bold text-slate-800">{latestLog?.bodyFat ? `${latestLog.bodyFat}%` : '--'}</p>
                            </div>
                        </div>
                    </div>

                    {logs.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <BarChartIcon className="mx-auto text-slate-300 mb-3" size={48} />
                            <h3 className="text-lg font-bold text-slate-700">Sem dados de progresso</h3>
                            <p className="text-slate-500">Registre o peso inicial ou treinos concluídos para visualizar gráficos.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-slate-500 text-sm font-medium">Peso Atual</p>
                                        <div className={`p-1.5 rounded-lg ${isWeightGain ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            <TrendingUp size={16} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800">{latestLog?.weight} kg</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {Math.abs(Number(weightChange))}kg {isWeightGain ? 'ganhos' : 'perdidos'} desde o início
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-slate-500 text-sm font-medium">Consistência</p>
                                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                                            <Activity size={16} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800">{latestLog?.workoutsCompleted || 0} treinos</h3>
                                    <p className="text-xs text-slate-400 mt-1">Na última semana</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-slate-500 text-sm font-medium">Volume Total</p>
                                        <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                                            <Dumbbell size={16} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800">{(latestLog?.volumeLoad || 0).toLocaleString()} kg</h3>
                                    <p className="text-xs text-slate-400 mt-1">Carga total levantada</p>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-6">Evolução de Peso Corporal</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={logs}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fill: '#64748b', fontSize: 12}} 
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    domain={['dataMin - 2', 'dataMax + 2']} 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fill: '#64748b', fontSize: 12}} 
                                                />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="weight" 
                                                    stroke="#3b82f6" 
                                                    strokeWidth={3}
                                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-6">Frequência de Treinos</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={logs}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis 
                                                    dataKey="date" 
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
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{fill: '#f8fafc'}}
                                                />
                                                <Bar dataKey="workoutsCompleted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* TABS ANTIGAS: WORKOUTS E EXERCISES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Esquerda: Conteúdo Principal */}
                {detailsTab !== 'progress' && (
                <div className="lg:col-span-2 space-y-6">
                    {detailsTab === 'workouts' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Dumbbell className="text-blue-500" size={20}/> 
                                Fichas Atribuídas
                            </h3>

                            {(!selectedClient.assignedWorkouts || selectedClient.assignedWorkouts.length === 0) ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-slate-500 font-medium">Nenhum treino atribuído.</p>
                                    <p className="text-slate-400 text-sm">Use o painel ao lado para adicionar uma ficha.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedClient.assignedWorkouts.map((workout, index) => (
                                        <div key={`${workout.id}-${index}`} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                                        <Dumbbell size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-700 block">{workout.title}</span>
                                                        <span className="text-xs text-slate-400 font-normal">{workout.exercises.length} exercícios</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleOpenCloneModal(workout)}
                                                        className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
                                                        title="Clonar treino (Copiar e Colar)"
                                                    >
                                                        <Copy size={14} />
                                                        Clonar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCompleteWorkout(workout)}
                                                        className="text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
                                                        title="Confirmar treino e abrir WhatsApp"
                                                    >
                                                        <Check size={14} />
                                                        Concluir
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRemoveWorkoutFromClient(workout.id)}
                                                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remover treino do aluno"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white">
                                                <div className="text-sm text-slate-600 space-y-2">
                                                    {workout.exercises.map((ex, idx) => (
                                                        <div key={idx} className="flex justify-between items-center border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                                                            <div className="flex items-center gap-2">
                                                                <span>{ex.name}</span>
                                                                {ex.load && <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-bold border border-yellow-100">{ex.load}kg</span>}
                                                            </div>
                                                            <span className="font-medium text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded">{ex.sets}x{ex.reps}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Activity className="text-blue-500" size={20}/> 
                                Exercícios Individuais
                            </h3>

                            {(!selectedClient.assignedExercises || selectedClient.assignedExercises.length === 0) ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <List className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-slate-500 font-medium">Nenhum exercício avulso atribuído.</p>
                                    <p className="text-slate-400 text-sm">Adicione exercícios específicos para complementar o treino.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedClient.assignedExercises.map((ex, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
                                            <div>
                                                <p className="font-bold text-slate-800">{ex.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{ex.sets} séries</span>
                                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{ex.reps} reps</span>
                                                    {ex.load && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded font-bold border border-yellow-100">{ex.load}kg</span>}
                                                    {ex.obs && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{ex.obs}</span>}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveExerciseFromClient(index)}
                                                className="text-slate-300 hover:text-red-500 p-2 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                )}

                {/* Coluna Direita: Ações Contextuais */}
                {detailsTab !== 'progress' && (
                <div className="h-fit space-y-6">
                    {detailsTab === 'workouts' ? (
                        <div className="bg-slate-800 text-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-green-400" />
                                Atribuir Treino
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">Selecione uma ficha da sua biblioteca para adicionar a este aluno.</p>
                            
                            <div className="space-y-3">
                                <select 
                                    value={selectedWorkoutId}
                                    onChange={(e) => setSelectedWorkoutId(e.target.value)}
                                    className="w-full bg-slate-700 border-slate-600 border text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Selecione um treino...</option>
                                    {workouts.map(w => (
                                        <option key={w.id} value={w.id}>{w.title}</option>
                                    ))}
                                </select>
                                
                                <button 
                                    onClick={handleAssignWorkout}
                                    disabled={!selectedWorkoutId}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/50 flex justify-center items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Adicionar Ficha
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-blue-500" />
                                Adicionar Exercício
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Exercício</label>
                                    <div className="relative mb-2">
                                        <input 
                                            type="text"
                                            placeholder="Buscar exercício..."
                                            className="w-full border border-slate-200 pl-8 pr-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={exerciseSearchTerm}
                                            onChange={(e) => setExerciseSearchTerm(e.target.value)}
                                        />
                                        <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                                    </div>
                                    <select 
                                        className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                        value={selectedExerciseId}
                                        onChange={e => setSelectedExerciseId(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {filteredExercisesForAssignment.map(ex => (
                                            <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle})</option>
                                        ))}
                                    </select>
                                    {filteredExercisesForAssignment.length === 0 && (
                                        <p className="text-xs text-red-400 mt-1">Nenhum exercício encontrado.</p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Séries</label>
                                        <input 
                                            type="number" 
                                            className="w-full border p-2 rounded-lg" 
                                            value={exerciseDetails.sets} 
                                            onChange={e => setExerciseDetails({...exerciseDetails, sets: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Reps</label>
                                        <input 
                                            type="text" 
                                            className="w-full border p-2 rounded-lg" 
                                            value={exerciseDetails.reps} 
                                            onChange={e => setExerciseDetails({...exerciseDetails, reps: e.target.value})} 
                                        />
                                    </div>
                                     <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Carga(kg)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: 20"
                                            className="w-full border p-2 rounded-lg" 
                                            value={exerciseDetails.load} 
                                            onChange={e => setExerciseDetails({...exerciseDetails, load: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Observações</label>
                                    <input 
                                        type="text" 
                                        placeholder="Opcional"
                                        className="w-full border p-2 rounded-lg" 
                                        value={exerciseDetails.obs} 
                                        onChange={e => setExerciseDetails({...exerciseDetails, obs: e.target.value})} 
                                    />
                                </div>

                                <button 
                                    onClick={handleAssignExercise}
                                    disabled={!selectedExerciseId}
                                    className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-slate-900/10 flex justify-center items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-4">
                        <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Resumo</h4>
                        <div className="space-y-3">
                             <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Fichas</span>
                                <span className="font-medium text-blue-600">{selectedClient.assignedWorkouts?.length || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Exercícios Avulsos</span>
                                <span className="font-medium text-purple-600">{selectedClient.assignedExercises?.length || 0}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                                <span className="text-xs text-slate-400">Última atualização: Hoje</span>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
  }

  // --- VISÃO DE LISTA (PADRÃO) ---
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Meus Alunos</h2>
            <p className="text-slate-500 text-sm">Gerencie o progresso e cadastro dos seus atletas.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Novo Aluno
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Buscar por nome ou objetivo..." 
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <button className="bg-white p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
            <Filter size={20} />
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-xl mb-4 text-slate-800 border-b pb-2">Novo Aluno</h3>
            <form onSubmit={handleAddClient} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                        <input 
                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Ex: João Silva"
                        required
                        value={newClient.name}
                        onChange={e => setNewClient({...newClient, name: e.target.value})}
                        />
                    </div>
                </div>

                {/* Seção de Dados Físicos */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Activity size={14} /> Dados Físicos Iniciais
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Idade</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="Anos"
                                value={newClient.age}
                                onChange={e => setNewClient({...newClient, age: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Altura (cm)</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="Ex: 175"
                                value={newClient.height}
                                onChange={e => setNewClient({...newClient, height: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Peso Atual (kg)</label>
                            <input 
                                type="number"
                                step="0.1"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="Ex: 80.5"
                                value={newClient.initialWeight}
                                onChange={e => setNewClient({...newClient, initialWeight: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">% Gordura (Opcional)</label>
                            <input 
                                type="number"
                                step="0.1"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="Ex: 15"
                                value={newClient.initialBodyFat}
                                onChange={e => setNewClient({...newClient, initialBodyFat: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Seção de Dados Financeiros e Plano */}
                <div className="space-y-4">
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo Principal</label>
                        <select 
                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newClient.goal}
                        onChange={e => setNewClient({...newClient, goal: e.target.value})}
                        >
                        <option value="">Selecione...</option>
                        <option value="Hipertrofia">Hipertrofia</option>
                        <option value="Emagrecimento">Emagrecimento</option>
                        <option value="Força">Força</option>
                        <option value="Condicionamento">Condicionamento</option>
                        <option value="Funcional">Funcional</option>
                        <option value="Mobilidade">Mobilidade</option>
                        <option value="Calistenia">Calistenia</option>
                        <option value="Powerlifting">Powerlifting</option>
                        <option value="Reabilitação">Reabilitação</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Plano</label>
                            <select 
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newClient.planType}
                                onChange={e => setNewClient({...newClient, planType: e.target.value as any})}
                            >
                                <option value="Consultoria Online">Online</option>
                                <option value="Personal Presencial">Presencial</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mensalidade (R$)</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={newClient.monthlyFee}
                                onChange={e => setNewClient({...newClient, monthlyFee: Number(e.target.value)})}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dia de Vencimento</label>
                            <select 
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newClient.paymentDay}
                                onChange={(e) => {
                                    const day = parseInt(e.target.value);
                                    const today = new Date();
                                    let nextDate = new Date(today.getFullYear(), today.getMonth(), day);
                                    if (nextDate <= today) {
                                        nextDate.setMonth(nextDate.getMonth() + 1);
                                    }
                                    setNewClient({
                                        ...newClient, 
                                        paymentDay: e.target.value,
                                        nextPaymentDate: nextDate.toLocaleDateString('pt-BR')
                                    });
                                }}
                            >
                                {[1, 5, 10, 15, 20, 25, 30].map(d => (
                                    <option key={d} value={d}>Dia {d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Salvar Aluno</button>
                </div>
            </form>
            </div>
        </div>
      )}

      {editingClient && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-xl mb-4 text-slate-800 border-b pb-2">Editar Aluno</h3>
            <form onSubmit={handleUpdateClient} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input 
                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={editingClient.name}
                        onChange={e => setEditingClient({...editingClient, name: e.target.value})}
                        />
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Activity size={14} /> Dados Físicos (Atualizar)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Idade</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={editingClient.age}
                                onChange={e => setEditingClient({...editingClient, age: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Altura (cm)</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={editingClient.height}
                                onChange={e => setEditingClient({...editingClient, height: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Peso Atual (kg)</label>
                            <input 
                                type="number"
                                step="0.1"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={editingClient.currentWeight}
                                onChange={e => setEditingClient({...editingClient, currentWeight: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">% Gordura</label>
                            <input 
                                type="number"
                                step="0.1"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={editingClient.currentBodyFat}
                                onChange={e => setEditingClient({...editingClient, currentBodyFat: e.target.value})}
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">* Alterar o peso ou % gordura atualizará o gráfico de progresso automaticamente.</p>
                </div>

                <div className="space-y-4">
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo Principal</label>
                        <select 
                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editingClient.goal}
                        onChange={e => setEditingClient({...editingClient, goal: e.target.value})}
                        >
                        <option value="Hipertrofia">Hipertrofia</option>
                        <option value="Emagrecimento">Emagrecimento</option>
                        <option value="Força">Força</option>
                        <option value="Condicionamento">Condicionamento</option>
                        <option value="Funcional">Funcional</option>
                        <option value="Mobilidade">Mobilidade</option>
                        <option value="Calistenia">Calistenia</option>
                        <option value="Powerlifting">Powerlifting</option>
                        <option value="Reabilitação">Reabilitação</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Plano</label>
                            <select 
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editingClient.planType}
                                onChange={e => setEditingClient({...editingClient, planType: e.target.value as any})}
                            >
                                <option value="Consultoria Online">Online</option>
                                <option value="Personal Presencial">Presencial</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mensalidade (R$)</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={editingClient.monthlyFee}
                                onChange={e => setEditingClient({...editingClient, monthlyFee: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dia Vencimento</label>
                            <select 
                                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editingClient.paymentDay}
                                onChange={(e) => setEditingClient({...editingClient, paymentDay: e.target.value})}
                            >
                                {[1, 5, 10, 15, 20, 25, 30].map(d => (
                                    <option key={d} value={d}>Dia {d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingClient(null)} className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Salvar Alterações</button>
                </div>
            </form>
            </div>
        </div>
      )}

      {/* CLONE WORKOUT MODAL */}
      {showCloneModal && workoutToClone && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Copy size={18} className="text-blue-500"/>
                        Clonar Treino
                    </h3>
                    <button onClick={() => setShowCloneModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Copiar para o aluno:</label>
                        <select 
                            className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            value={cloneTargetClientId}
                            onChange={(e) => setCloneTargetClientId(e.target.value)}
                        >
                            <option value="">Selecione um aluno...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Novo título da ficha:</label>
                        <input 
                            className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={cloneNewTitle}
                            onChange={(e) => setCloneNewTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <input 
                            type="checkbox" 
                            id="resetLoads" 
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={cloneResetLoads}
                            onChange={(e) => setCloneResetLoads(e.target.checked)}
                        />
                        <label htmlFor="resetLoads" className="text-sm text-slate-600 cursor-pointer select-none">
                            Zerar cargas dos exercícios? (Ideal para novos alunos)
                        </label>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button 
                            onClick={() => setShowCloneModal(false)} 
                            className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleCloneWorkout} 
                            disabled={!cloneTargetClientId}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                            Copiar Treino
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Plano / Objetivo</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Atividades</th>
                <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
                {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {client.name.charAt(0)}
                        </div>
                        {client.name}
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-800">{client.planType}</span>
                            <span className="text-xs text-slate-500">{client.goal}</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col gap-1">
                             <span className={`px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                                client.status === 'Ativo' ? 'bg-green-100 text-green-700' : 
                                client.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {client.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                Pagamento: {client.paymentStatus}
                            </span>
                        </div>
                    </td>
                    <td className="p-4">
                        <button 
                            onClick={() => setSelectedClient(client)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 w-fit"
                        >
                            <Dumbbell size={14} />
                            {(client.assignedWorkouts?.length || 0) + (client.assignedExercises?.length || 0)} Ativos
                        </button>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEditClick(client)}
                                className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Editar Aluno"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => setClients(clients.filter(c => c.id !== client.id))}
                                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Remover Aluno"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
                {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                            <Search size={32} className="opacity-20" />
                            <p>Nenhum aluno encontrado.</p>
                        </div>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};