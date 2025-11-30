import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { generateWorkoutPlan, askFitnessAssistant } from '../services/geminiService';
import { Workout } from '../types';

interface AIWorkoutGeneratorProps {
    onSaveWorkout: (workout: Workout) => void;
}

export const AIWorkoutGenerator: React.FC<AIWorkoutGeneratorProps> = ({ onSaveWorkout }) => {
    const [mode, setMode] = useState<'generator' | 'chat'>('generator');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
    
    // Generator State
    const [goal, setGoal] = useState('Hipertrofia');
    const [level, setLevel] = useState('Intermediário');
    const [frequency, setFrequency] = useState(4);
    const [equipment, setEquipment] = useState('Academia Completa');

    // Chat State
    const [chatQuestion, setChatQuestion] = useState('');
    const [chatAnswer, setChatAnswer] = useState('');

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setGeneratedWorkout(null);
        try {
            const result = await generateWorkoutPlan(goal, level, frequency, equipment);
            setGeneratedWorkout(result);
        } catch (err) {
            setError('Falha ao gerar treino. Verifique sua chave API ou tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (generatedWorkout) {
            onSaveWorkout({
                id: Date.now(),
                title: generatedWorkout.title || `Treino AI - ${goal}`,
                exercises: generatedWorkout.exercises || [],
                aiGenerated: true
            });
            // Reset
            setGeneratedWorkout(null);
        }
    };

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatQuestion.trim()) return;
        setLoading(true);
        setChatAnswer('');
        try {
            const answer = await askFitnessAssistant(chatQuestion);
            setChatAnswer(answer);
        } catch (err) {
            setChatAnswer('Desculpe, não consegui processar sua pergunta.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-white opacity-5 rounded-full w-64 h-64 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-yellow-300" />
                            <h2 className="text-2xl font-bold">Trainer AI Studio</h2>
                        </div>
                        <p className="text-indigo-100 mb-6 max-w-md">Use a inteligência artificial do Gemini para criar fichas personalizadas instantaneamente ou tirar dúvidas técnicas.</p>
                        
                        <div className="flex gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-md inline-flex">
                            <button 
                                onClick={() => setMode('generator')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'generator' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:bg-white/5'}`}
                            >
                                Gerador de Treino
                            </button>
                            <button 
                                onClick={() => setMode('chat')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'chat' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:bg-white/5'}`}
                            >
                                Assistente Técnico
                            </button>
                        </div>
                    </div>
                </div>

                {mode === 'generator' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Configuração do Aluno</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Objetivo</label>
                                <select className="w-full border p-3 rounded-lg bg-slate-50" value={goal} onChange={e => setGoal(e.target.value)}>
                                    <option>Hipertrofia</option>
                                    <option>Emagrecimento</option>
                                    <option>Força Pura</option>
                                    <option>Resistência Muscular</option>
                                    <option>Condicionamento Cardio</option>
                                    <option>Funcional</option>
                                    <option>Mobilidade e Flexibilidade</option>
                                    <option>Powerlifting</option>
                                    <option>Calistenia</option>
                                    <option>CrossFit</option>
                                    <option>Reabilitação</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nível</label>
                                    <select className="w-full border p-3 rounded-lg bg-slate-50" value={level} onChange={e => setLevel(e.target.value)}>
                                        <option>Iniciante</option>
                                        <option>Intermediário</option>
                                        <option>Avançado</option>
                                        <option>Atleta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Freq. Semanal</label>
                                    <select className="w-full border p-3 rounded-lg bg-slate-50" value={frequency} onChange={e => setFrequency(Number(e.target.value))}>
                                        {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} dias</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Equipamento</label>
                                <input 
                                    className="w-full border p-3 rounded-lg bg-slate-50" 
                                    value={equipment} 
                                    onChange={e => setEquipment(e.target.value)}
                                    placeholder="Ex: Halteres, Peso do corpo..."
                                />
                            </div>
                            <button 
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                Gerar Treino com IA
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'chat' && (
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <MessageSquare size={18} className="text-indigo-500"/> 
                            Chat Especialista
                        </h3>
                        <div className="flex-1 overflow-y-auto mb-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                             {!chatAnswer ? (
                                <p className="text-slate-400 text-sm text-center mt-10">Faça uma pergunta sobre biomecânica, nutrição ou fisiologia.</p>
                             ) : (
                                <div className="prose prose-sm text-slate-700">
                                    <p>{chatAnswer}</p>
                                </div>
                             )}
                        </div>
                        <form onSubmit={handleChat} className="flex gap-2">
                            <input 
                                className="flex-1 border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ex: Qual a diferença entre agachamento low bar e high bar?"
                                value={chatQuestion}
                                onChange={e => setChatQuestion(e.target.value)}
                            />
                            <button 
                                type="submit"
                                disabled={loading || !chatQuestion}
                                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <MessageSquare size={20} />}
                            </button>
                        </form>
                     </div>
                )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 min-h-[500px] relative">
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-6 text-center">Preview do Resultado</h3>
                
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-3xl">
                        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                        <p className="text-indigo-900 font-medium animate-pulse">A IA está pensando...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {!generatedWorkout && !loading && !error && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <Sparkles size={64} className="mb-4 opacity-20" />
                        <p className="max-w-xs text-center">Os resultados gerados pela inteligência artificial aparecerão aqui.</p>
                     </div>
                )}

                {generatedWorkout && (
                    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                            <h4 className="font-bold text-lg text-indigo-900">{generatedWorkout.title}</h4>
                            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Sugestão Gemini 2.5</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {generatedWorkout.exercises?.map((ex: any, i: number) => (
                                <div key={i} className="p-4 hover:bg-slate-50">
                                    <div className="flex justify-between font-medium text-slate-800">
                                        <span>{ex.name}</span>
                                        <span className="text-slate-500">{ex.sets} x {ex.reps}</span>
                                    </div>
                                    {ex.obs && <p className="text-xs text-slate-400 mt-1">{ex.obs}</p>}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50">
                            <button 
                                onClick={handleSave}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all"
                            >
                                <CheckCircle size={18} /> Aprovar e Salvar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};