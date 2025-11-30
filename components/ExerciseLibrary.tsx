import React, { useState } from 'react';
import { Activity, Plus, Search, Filter, X, Info, ImageIcon } from 'lucide-react';
import { Exercise } from '../types';

interface ExerciseLibraryProps {
  exercises: Exercise[];
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ exercises }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Extrair grupos musculares únicos
  const muscles = ['Todos', ...Array.from(new Set(exercises.map(ex => ex.muscle)))];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Todos' || ex.muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  // Helper para determinar a fonte da imagem
  const getDisplayImage = (exercise: Exercise) => {
    if (exercise.imageUrl) return exercise.imageUrl;
    // Fallback para placeholder dinâmico usando o nome do exercício
    return `https://placehold.co/800x600/e2e8f0/1e293b?text=${encodeURIComponent(exercise.name)}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Biblioteca de Exercícios</h2>
            <p className="text-slate-500 text-sm">Catálogo completo de movimentos com instruções.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
            <Plus size={18} /> Adicionar
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Buscar exercício..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {muscles.map(muscle => (
                <button
                    key={muscle}
                    onClick={() => setSelectedMuscle(muscle)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedMuscle === muscle 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {muscle}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredExercises.map(ex => (
          <button 
            key={ex.id} 
            onClick={() => setSelectedExercise(ex)}
            className="bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-300 transition-all hover:shadow-md group text-left relative overflow-hidden h-full flex flex-col"
          >
             <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Info size={16} className="text-blue-500" />
             </div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                {ex.muscle}
              </span>
            </div>
            <h4 className="font-bold text-slate-700 mb-1">{ex.name}</h4>
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-slate-400">
                <ImageIcon size={14} /> Ver detalhes
            </div>
          </button>
        ))}
        
        {filteredExercises.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400">
                <p>Nenhum exercício encontrado para os filtros selecionados.</p>
             </div>
        )}
      </div>

      {/* Exercise Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh] md:max-h-[800px]">
                <button 
                    onClick={() => setSelectedExercise(null)}
                    className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors z-20 backdrop-blur-sm"
                >
                    <X size={20} />
                </button>
                
                {/* Image Area */}
                <div className="h-64 sm:h-80 bg-slate-100 relative group shrink-0 w-full">
                    <img 
                        src={getDisplayImage(selectedExercise)} 
                        alt={selectedExercise.name}
                        className="w-full h-full object-cover"
                    />
                    
                    {/* Badge se for Placeholder (Sem imagem oficial) */}
                    {!selectedExercise.imageUrl && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 z-10 border border-white/10 shadow-lg">
                            <ImageIcon size={14} className="text-slate-300" />
                            <span className="text-xs font-medium tracking-wide">Imagem Ilustrativa</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6 sm:p-8">
                        <div>
                            <span className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-1 block shadow-black drop-shadow-md">{selectedExercise.muscle}</span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{selectedExercise.name}</h2>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto bg-white flex-1">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Instruções de Execução</h3>
                            <p className="text-slate-500 mt-2 leading-relaxed text-sm sm:text-base">
                                {selectedExercise.instructions || "Realize o movimento com controle, mantendo a postura correta e focando na contração do músculo alvo. Mantenha a respiração constante durante a execução e evite compensações com outros grupos musculares."}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                            <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Tipo</span>
                            <span className="font-semibold text-slate-700">Força / Hipertrofia</span>
                        </div>
                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                            <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Equipamento</span>
                            <span className="font-semibold text-slate-700">Variável</span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => setSelectedExercise(null)}
                            className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-200 font-medium transition-colors w-full sm:w-auto"
                        >
                            Fechar Detalhes
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};