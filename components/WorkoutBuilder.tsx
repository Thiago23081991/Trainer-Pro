import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, Dumbbell, ArrowLeft, GripVertical, Copy, X, Check, User } from 'lucide-react';
import { Workout, Exercise, Client } from '../types';

interface WorkoutBuilderProps {
  workouts: Workout[];
  setWorkouts: (workouts: Workout[]) => void;
  exercises: Exercise[];
  clients: Client[];
  setClients: (clients: Client[]) => void;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ workouts, setWorkouts, exercises, clients, setClients }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Omit<Workout, 'id'>>({ title: '', exercises: [] });
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseDetails, setExerciseDetails] = useState({ sets: 3, reps: '10', load: '', obs: '' });

  // Clone Modal State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [workoutToClone, setWorkoutToClone] = useState<Workout | null>(null);
  const [cloneTitle, setCloneTitle] = useState('');
  const [targetClientId, setTargetClientId] = useState('');
  const [addToLibrary, setAddToLibrary] = useState(true);

  // Refs para Drag and Drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleAddExerciseToWorkout = () => {
    if (!selectedExerciseId) return;
    const exercise = exercises.find(e => e.id === parseInt(selectedExerciseId));
    if (!exercise) return;

    setNewWorkout({
      ...newWorkout,
      exercises: [...newWorkout.exercises, { name: exercise.name, ...exerciseDetails }]
    });
    // Reset selection
    setSelectedExerciseId('');
    setExerciseDetails({ sets: 3, reps: '10', load: '', obs: '' });
  };

  const handleSaveWorkout = () => {
    if (!newWorkout.title || newWorkout.exercises.length === 0) return;
    setWorkouts([...workouts, { ...newWorkout, id: Date.now() }]);
    setNewWorkout({ title: '', exercises: [] });
    setIsCreating(false);
  };

  // --- Clone Logic ---
  const handleOpenCloneModal = (workout: Workout) => {
    setWorkoutToClone(workout);
    setCloneTitle(`${workout.title} (Cópia)`);
    setTargetClientId('');
    setAddToLibrary(true);
    setShowCloneModal(true);
  };

  const handleCloneConfirm = () => {
    if (!workoutToClone) return;

    const baseWorkout = {
        ...workoutToClone,
        title: cloneTitle,
    };

    // 1. Salvar na biblioteca (Global)
    if (addToLibrary) {
        const libraryWorkout = { ...baseWorkout, id: Date.now() };
        setWorkouts([...workouts, libraryWorkout]);
    }

    // 2. Atribuir ao aluno (se selecionado)
    if (targetClientId) {
        // Garantir um ID diferente para o aluno caso também tenha salvo na biblioteca
        const clientWorkout = { ...baseWorkout, id: Date.now() + (addToLibrary ? 1 : 0) };
        
        const updatedClients = clients.map(c => {
            if (c.id === Number(targetClientId)) {
                return {
                    ...c,
                    assignedWorkouts: [...(c.assignedWorkouts || []), clientWorkout]
                };
            }
            return c;
        });
        setClients(updatedClients);
    }

    setShowCloneModal(false);
    setWorkoutToClone(null);
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
    const element = e.target as HTMLDivElement;
    setTimeout(() => {
        element.classList.add('opacity-50', 'bg-slate-100');
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    e.preventDefault();

    if (dragItem.current !== null && dragItem.current !== position) {
        const listCopy = [...newWorkout.exercises];
        const draggedItemContent = listCopy[dragItem.current];
        
        listCopy.splice(dragItem.current, 1);
        listCopy.splice(position, 0, draggedItemContent);
        
        dragItem.current = position;
        setNewWorkout({ ...newWorkout, exercises: listCopy });
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    dragItem.current = null;
    dragOverItem.current = null;
    const element = e.target as HTMLDivElement;
    element.classList.remove('opacity-50', 'bg-slate-100');
  };

  if (isCreating) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setIsCreating(false)} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Novo Treino Manual</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Ficha</label>
              <input 
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium placeholder:font-normal"
                placeholder="Ex: Treino A - Hipertrofia Pernas"
                value={newWorkout.title}
                onChange={e => setNewWorkout({...newWorkout, title: e.target.value})}
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-500" />
                Adicionar Exercício
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <select 
                    className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                    value={selectedExerciseId}
                    onChange={e => setSelectedExerciseId(e.target.value)}
                  >
                    <option value="">Selecione um exercício...</option>
                    {exercises.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Séries</label>
                        <input type="number" className="w-full border p-2 rounded-lg" value={exerciseDetails.sets} onChange={e => setExerciseDetails({...exerciseDetails, sets: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Repetições</label>
                        <input type="text" className="w-full border p-2 rounded-lg" value={exerciseDetails.reps} onChange={e => setExerciseDetails({...exerciseDetails, reps: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Carga (kg)</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded-lg" 
                            placeholder="Ex: 20"
                            value={exerciseDetails.load} 
                            onChange={e => setExerciseDetails({...exerciseDetails, load: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Observações (opcional)</label>
                  <input type="text" className="w-full border p-2 rounded-lg" placeholder="Ex: Cadência, Drop-set..." value={exerciseDetails.obs} onChange={e => setExerciseDetails({...exerciseDetails, obs: e.target.value})} />
                </div>
              </div>
              
              <button 
                onClick={handleAddExerciseToWorkout}
                disabled={!selectedExerciseId}
                className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg shadow-slate-900/10"
              >
                Inserir na Ficha
              </button>
            </div>
          </div>

          {/* Preview Column */}
          <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 p-6 rounded-2xl h-fit shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest border-b pb-2">Resumo do Treino</h3>
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                <GripVertical size={12} /> Arraste para reordenar
            </p>
            <div className="space-y-3 mb-6 min-h-[200px]">
              {newWorkout.exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    <Dumbbell className="mb-2 opacity-50" />
                    <p className="text-sm">Lista vazia</p>
                </div>
              ) : (
                newWorkout.exercises.map((ex, idx) => (
                  <div 
                    key={idx} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnter={(e) => handleDragEnter(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 relative group hover:border-blue-200 transition-all cursor-move flex items-center gap-3 active:cursor-grabbing"
                  >
                    <div className="text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
                        <GripVertical size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{ex.sets}x{ex.reps}</span>
                                {ex.load && <span className="text-xs text-slate-700 bg-yellow-50 px-1.5 py-0.5 rounded font-semibold">{ex.load}kg</span>}
                            </div>
                            {ex.obs && <p className="text-[10px] text-blue-600 mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded font-medium">{ex.obs}</p>}
                        </div>
                        <button 
                            onClick={() => setNewWorkout({...newWorkout, exercises: newWorkout.exercises.filter((_, i) => i !== idx)})}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={handleSaveWorkout}
              disabled={newWorkout.exercises.length === 0 || !newWorkout.title}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center items-center gap-2"
            >
              <Save size={18} /> Salvar Ficha
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Fichas de Treino</h2>
            <p className="text-slate-500 text-sm">Biblioteca de treinos preescritos.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Criar Nova Ficha
        </button>
      </div>

      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Copy className="text-blue-500" size={20} /> Clonar Treino
                    </h3>
                    <button onClick={() => setShowCloneModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Novo Título da Ficha</label>
                        <input 
                            className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={cloneTitle}
                            onChange={(e) => setCloneTitle(e.target.value)}
                        />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                         <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                id="addToLibrary"
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                checked={addToLibrary}
                                onChange={(e) => setAddToLibrary(e.target.checked)}
                            />
                            <label htmlFor="addToLibrary" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                Manter cópia na biblioteca (Global)
                            </label>
                        </div>
                        
                        <div>
                             <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Atribuir também para:</label>
                             <div className="relative">
                                <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <select 
                                    className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                                    value={targetClientId}
                                    onChange={(e) => setTargetClientId(e.target.value)}
                                >
                                    <option value="">-- Nenhum aluno (apenas criar cópia) --</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleCloneConfirm}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        <Check size={18} /> Confirmar Clonagem
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map(workout => (
          <div key={workout.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
            {workout.aiGenerated && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                    AI GENERATED
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-colors ${workout.aiGenerated ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                <Dumbbell size={24} />
              </div>
              <div className="flex gap-1 z-20 relative">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCloneModal(workout);
                    }}
                    className="text-slate-300 hover:text-blue-500 transition-colors p-1.5 hover:bg-blue-50 rounded-lg"
                    title="Clonar Treino"
                >
                    <Copy size={18} />
                </button>
                <button 
                    onClick={(e) => {
                    e.stopPropagation();
                    setWorkouts(workouts.filter(w => w.id !== workout.id));
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                    title="Excluir Treino"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2 truncate pr-6">{workout.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{workout.exercises.length} exercícios</p>
            <div className="space-y-2 border-t pt-3 border-slate-50">
              {workout.exercises.slice(0, 3).map((ex, i) => (
                <div key={i} className="text-xs text-slate-600 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-1.5 h-1.5 min-w-[6px] rounded-full ${workout.aiGenerated ? 'bg-indigo-300' : 'bg-slate-300'}`}></div>
                    <span className="truncate">{ex.name}</span>
                  </div>
                  {ex.load && <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500 font-medium whitespace-nowrap">{ex.load}kg</span>}
                </div>
              ))}
              {workout.exercises.length > 3 && (
                <p className="text-xs text-blue-500 font-medium pt-1">Ver mais {workout.exercises.length - 3}...</p>
              )}
            </div>
          </div>
        ))}
        
        {workouts.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Dumbbell className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-400 mb-4">Nenhum treino criado ainda.</p>
            <button onClick={() => setIsCreating(true)} className="text-blue-600 font-medium hover:underline">
              Criar meu primeiro treino agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};