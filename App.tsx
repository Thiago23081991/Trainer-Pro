import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { WorkoutBuilder } from './components/WorkoutBuilder';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { AIWorkoutGenerator } from './components/AIWorkoutGenerator';
import { FinancialDashboard } from './components/FinancialDashboard';
import { ViewState, Client, Workout, Exercise } from './types';

// Initial Data
const initialExercises: Exercise[] = [
  // Peito
  { id: 1, name: 'Supino Reto Barra', muscle: 'Peito', instructions: 'Deite-se no banco, segure a barra na largura dos ombros e desça até o peito.' },
  { id: 2, name: 'Supino Inclinado Halteres', muscle: 'Peito', instructions: 'Banco a 45 graus, empurre os halteres para cima mantendo o controle.' },
  { id: 3, name: 'Crucifixo Máquina', muscle: 'Peito', instructions: 'Mantenha os cotovelos levemente flexionados e una as mãos à frente.' },
  { id: 4, name: 'Crossover Polia Alta', muscle: 'Peito', instructions: 'Puxe os cabos para baixo e para o centro, focando na contração inferior.' },
  { id: 5, name: 'Flexão de Braços', muscle: 'Peito', instructions: 'Mantenha o corpo reto e desça até o peito quase tocar o chão.' },
  
  // Costas
  { id: 6, name: 'Puxada Alta Aberta', muscle: 'Costas', instructions: 'Puxe a barra em direção ao peito superior, cotovelos para baixo.' },
  { id: 7, name: 'Remada Curvada', muscle: 'Costas', instructions: 'Tronco inclinado, puxe a barra em direção ao umbigo.' },
  { id: 8, name: 'Levantamento Terra', muscle: 'Costas', instructions: 'Mantenha a coluna neutra, levante a barra do chão estendendo o quadril.' },
  { id: 9, name: 'Remada Unilateral (Serrote)', muscle: 'Costas', instructions: 'Apoie-se no banco e puxe o halter lateralmente.' },
  { id: 10, name: 'Barra Fixa', muscle: 'Costas', instructions: 'Pendure-se na barra e puxe o corpo até o queixo passar da barra.' },
  
  // Pernas
  { id: 11, name: 'Agachamento Livre', muscle: 'Pernas', instructions: 'Pés na largura dos ombros, desça como se fosse sentar em uma cadeira.' },
  { id: 12, name: 'Leg Press 45', muscle: 'Pernas', instructions: 'Empurre a plataforma evitando travar os joelhos no topo.' },
  { id: 13, name: 'Cadeira Extensora', muscle: 'Pernas', instructions: 'Estenda os joelhos completamente e segure por 1 segundo.' },
  { id: 14, name: 'Mesa Flexora', muscle: 'Pernas', instructions: 'Flexione os joelhos trazendo o calcanhar em direção ao glúteo.' },
  { id: 15, name: 'Stiff', muscle: 'Pernas', instructions: 'Desça a barra rente às pernas mantendo os joelhos semi-flexionados.' },
  { id: 16, name: 'Afundo com Halteres', muscle: 'Pernas', instructions: 'Dê um passo à frente e desça o joelho de trás em direção ao chão.' },
  { id: 17, name: 'Elevação de Panturrilha', muscle: 'Pernas', instructions: 'Fique na ponta dos pés e desça controladamente.' },

  // Ombros
  { id: 18, name: 'Desenvolvimento Militar', muscle: 'Ombros', instructions: 'Empurre a barra acima da cabeça estendendo os braços.' },
  { id: 19, name: 'Elevação Lateral', muscle: 'Ombros', instructions: 'Levante os halteres lateralmente até a altura dos ombros.' },
  { id: 20, name: 'Elevação Frontal', muscle: 'Ombros', instructions: 'Levante o peso à frente do corpo até a linha dos olhos.' },
  { id: 21, name: 'Face Pull', muscle: 'Ombros', instructions: 'Puxe a corda em direção ao rosto, focando no deltoide posterior.' },

  // Braços
  { id: 22, name: 'Rosca Direta Barra', muscle: 'Bíceps', instructions: 'Flexione os cotovelos trazendo a barra até o peito.' },
  { id: 23, name: 'Rosca Martelo', muscle: 'Bíceps', instructions: 'Segure os halteres com pegada neutra e flexione os braços.' },
  { id: 24, name: 'Tríceps Testa', muscle: 'Tríceps', instructions: 'Deitado, desça a barra em direção à testa flexionando os cotovelos.' },
  { id: 25, name: 'Tríceps Corda', muscle: 'Tríceps', instructions: 'Puxe a corda para baixo e abra as mãos no final do movimento.' },
  { id: 26, name: 'Mergulho no Banco', muscle: 'Tríceps', instructions: 'Apoie as mãos no banco e desça o quadril flexionando os braços.' },

  // Core
  { id: 27, name: 'Prancha Abdominal', muscle: 'Core', instructions: 'Mantenha o corpo reto apoiado nos antebraços e ponta dos pés.' },
  { id: 28, name: 'Abdominal Supra', muscle: 'Core', instructions: 'Flexione o tronco tirando as escápulas do chão.' },
  { id: 29, name: 'Russian Twist', muscle: 'Core', instructions: 'Sentado, gire o tronco para os lados segurando um peso.' },
  
  // Cardio/Funcional
  { id: 30, name: 'Burpee', muscle: 'Cardio', instructions: 'Agache, faça uma flexão e salte verticalmente.' },
  { id: 31, name: 'Polichinelo', muscle: 'Cardio', instructions: 'Salte abrindo pernas e braços simultaneamente.' },
  { id: 32, name: 'Kettlebell Swing', muscle: 'Funcional', instructions: 'Balance o peso usando a força do quadril, não dos braços.' },
];

const initialWorkouts: Workout[] = [
  // --- PROGRAMA DE HIPERTROFIA (ABCD) ---
  { 
    id: 101, 
    title: 'HIPERTROFIA - TREINO A (Peito e Tríceps)', 
    exercises: [
      { name: 'Supino Reto Barra', sets: 4, reps: '8-10', load: '60', obs: 'Carga progressiva' },
      { name: 'Supino Inclinado Halteres', sets: 3, reps: '10-12', load: '22', obs: 'Controle na descida (3s)' },
      { name: 'Crossover Polia Alta', sets: 3, reps: '12-15', load: '20', obs: 'Pico de contração' },
      { name: 'Tríceps Testa', sets: 4, reps: '10-12', load: '25', obs: 'Sem abrir os cotovelos' },
      { name: 'Tríceps Corda', sets: 3, reps: '12-15', load: '35', obs: 'Drop-set na última' },
      { name: 'Abdominal Supra', sets: 3, reps: '20', obs: 'Com peso' }
    ] 
  },
  { 
    id: 102, 
    title: 'HIPERTROFIA - TREINO B (Costas e Bíceps)', 
    exercises: [
      { name: 'Barra Fixa', sets: 3, reps: 'Falha', obs: 'Ou Graviton' },
      { name: 'Puxada Alta Aberta', sets: 4, reps: '10-12', load: '45', obs: 'Estenda tudo na subida' },
      { name: 'Remada Curvada', sets: 4, reps: '8-10', load: '50', obs: 'Tronco firme' },
      { name: 'Rosca Direta Barra', sets: 4, reps: '10-12', load: '20', obs: 'Sem balançar o corpo' },
      { name: 'Rosca Martelo', sets: 3, reps: '12', load: '14', obs: 'Alternado' },
      { name: 'Prancha Abdominal', sets: 3, reps: '45s', obs: '-' }
    ] 
  },
  { 
    id: 103, 
    title: 'HIPERTROFIA - TREINO C (Pernas Completo)', 
    exercises: [
      { name: 'Agachamento Livre', sets: 4, reps: '8-10', load: '80', obs: 'Amplitude máxima segura' },
      { name: 'Leg Press 45', sets: 4, reps: '12', load: '200', obs: 'Não estenda totalmente o joelho' },
      { name: 'Cadeira Extensora', sets: 3, reps: '15', load: '50', obs: 'Isometria 2s no topo' },
      { name: 'Mesa Flexora', sets: 4, reps: '12-15', load: '40', obs: '-' },
      { name: 'Stiff', sets: 3, reps: '10-12', load: '60', obs: 'Foco no posterior' },
      { name: 'Elevação de Panturrilha', sets: 5, reps: '15-20', load: '70', obs: 'Pés no step' }
    ] 
  },
  { 
    id: 104, 
    title: 'HIPERTROFIA - TREINO D (Ombros e Trapézio)', 
    exercises: [
      { name: 'Desenvolvimento Militar', sets: 4, reps: '8-10', load: '30', obs: 'Sentado ou em pé' },
      { name: 'Elevação Lateral', sets: 4, reps: '12-15', load: '10', obs: 'Controle total' },
      { name: 'Elevação Frontal', sets: 3, reps: '12', load: '8', obs: 'Halteres ou corda' },
      { name: 'Face Pull', sets: 4, reps: '15', load: '25', obs: 'Foco no posterior de ombro' },
      { name: 'Encolhimento de Ombros', sets: 4, reps: '12-15', load: '26', obs: 'Com halteres pesados' },
      { name: 'Russian Twist', sets: 3, reps: '20', load: '10', obs: '10 cada lado' }
    ] 
  },

  // --- PROGRAMA DE EMAGRECIMENTO (ABCD) ---
  { 
    id: 201, 
    title: 'EMAGRECIMENTO - TREINO A (Metabólico Superior)', 
    exercises: [
      { name: 'Supino Reto + Flexão', sets: 3, reps: '12+10', load: '40', obs: 'Bi-set' },
      { name: 'Puxada Alta', sets: 3, reps: '15', load: '35', obs: 'Intervalo curto (30s)' },
      { name: 'Desenvolvimento Militar', sets: 3, reps: '15', load: '20', obs: '-' },
      { name: 'Polichinelo', sets: 3, reps: '1min', obs: 'Descanso ativo' },
      { name: 'Tríceps Corda + Rosca Direta', sets: 3, reps: '15+15', load: '25/10', obs: 'Super-série braços' },
      { name: 'Burpee', sets: 3, reps: '10', obs: 'Finalizador' }
    ] 
  },
  { 
    id: 202, 
    title: 'EMAGRECIMENTO - TREINO B (Metabólico Inferior)', 
    exercises: [
      { name: 'Agachamento Livre', sets: 4, reps: '15', load: '50', obs: 'Sem parar em cima' },
      { name: 'Afundo com Halteres', sets: 3, reps: '12', load: '14', obs: 'Cada perna' },
      { name: 'Cadeira Extensora', sets: 3, reps: '20', load: '35', obs: 'Queimação' },
      { name: 'Kettlebell Swing', sets: 4, reps: '20', load: '16', obs: 'Explosão de quadril' },
      { name: 'Elevação de Panturrilha', sets: 4, reps: '25', load: '40', obs: 'Rápido e controlado' },
      { name: 'Prancha Abdominal', sets: 4, reps: '30s', obs: 'Intervalo 15s' }
    ] 
  },
  { 
    id: 203, 
    title: 'EMAGRECIMENTO - TREINO C (Cardio e Core)', 
    exercises: [
      { name: 'Esteira/Bike (HIIT)', sets: 1, reps: '20min', obs: '1min forte / 1min leve' },
      { name: 'Abdominal Supra', sets: 4, reps: '20', obs: '-' },
      { name: 'Russian Twist', sets: 4, reps: '30', load: '5', obs: 'Total' },
      { name: 'Prancha Abdominal', sets: 3, reps: '1min', obs: 'Desafio' },
      { name: 'Elevação de Pernas', sets: 3, reps: '15', obs: 'Infra abdominal' },
      { name: 'Polichinelo', sets: 5, reps: '50', obs: 'Entre as séries de abs' }
    ] 
  },
  { 
    id: 204, 
    title: 'EMAGRECIMENTO - TREINO D (Full Body Circuito)', 
    exercises: [
      { name: 'Agachamento', sets: 3, reps: '15', load: '40', obs: 'Sem descanso, vá para o próximo' },
      { name: 'Flexão de Braços', sets: 3, reps: '12', obs: 'Sem descanso' },
      { name: 'Remada Curvada', sets: 3, reps: '15', load: '30', obs: 'Sem descanso' },
      { name: 'Desenvolvimento', sets: 3, reps: '12', load: '12', obs: 'Sem descanso' },
      { name: 'Burpee', sets: 3, reps: '10', obs: 'Descansar 2 min após o Burpee' }
    ] 
  },

  // --- PROGRAMA DE FORÇA PURA (AB - Upper/Lower) ---
  { 
    id: 301, 
    title: 'FORÇA - TREINO A (Superior)', 
    exercises: [
      { name: 'Supino Reto Barra', sets: 5, reps: '5', load: '90', obs: 'Carga: 85% de 1RM' },
      { name: 'Remada Curvada', sets: 5, reps: '5', load: '80', obs: 'Explosão na concêntrica' },
      { name: 'Desenvolvimento Militar', sets: 5, reps: '5', load: '50', obs: 'Estrito, sem impulso' },
      { name: 'Barra Fixa', sets: 4, reps: '6-8', obs: 'Adicione peso se conseguir' },
      { name: 'Tríceps Testa', sets: 3, reps: '8', load: '35', obs: 'Acessório' }
    ] 
  },
  { 
    id: 302, 
    title: 'FORÇA - TREINO B (Inferior)', 
    exercises: [
      { name: 'Agachamento Livre', sets: 5, reps: '5', load: '120', obs: 'Amplitude paralela ou profunda' },
      { name: 'Levantamento Terra', sets: 3, reps: '5', load: '140', obs: 'Reset a barra no chão a cada rep' },
      { name: 'Leg Press 45', sets: 4, reps: '6-8', load: '300', obs: 'Pesado, foco em quadríceps' },
      { name: 'Stiff', sets: 4, reps: '8', load: '100', obs: 'Foco na cadeia posterior' },
      { name: 'Prancha Abdominal', sets: 3, reps: '1min', obs: 'Core rígido' }
    ] 
  },

  // --- PROGRAMA DE ADAPTAÇÃO / INICIANTE (Full Body AB) ---
  { 
    id: 401, 
    title: 'INICIANTE - TREINO A (Full Body)', 
    exercises: [
      { name: 'Agachamento Livre', sets: 3, reps: '12-15', load: '20', obs: 'Foco na técnica' },
      { name: 'Supino Reto Barra', sets: 3, reps: '12-15', load: '20', obs: 'Carga leve' },
      { name: 'Puxada Alta Aberta', sets: 3, reps: '15', load: '30', obs: 'Controle o retorno' },
      { name: 'Desenvolvimento Militar', sets: 3, reps: '15', load: '5', obs: 'Halteres leves' },
      { name: 'Abdominal Supra', sets: 3, reps: '15', obs: 'No colchonete' }
    ] 
  },
  { 
    id: 402, 
    title: 'INICIANTE - TREINO B (Full Body)', 
    exercises: [
      { name: 'Leg Press 45', sets: 3, reps: '15', load: '80', obs: 'Pés na largura do quadril' },
      { name: 'Remada Curvada', sets: 3, reps: '12', load: '10', obs: 'Use halteres se preferir' },
      { name: 'Flexão de Braços', sets: 3, reps: 'Máx', obs: 'Joelho no chão se precisar' },
      { name: 'Rosca Direta Barra', sets: 3, reps: '15', load: '10', obs: '-' },
      { name: 'Prancha Abdominal', sets: 3, reps: '30s', obs: '-' }
    ] 
  },

  // --- PROGRAMA FUNCIONAL / CONDICIONAMENTO ---
  { 
    id: 501, 
    title: 'FUNCIONAL - ALTA INTENSIDADE', 
    exercises: [
      { name: 'Burpee', sets: 4, reps: '15', obs: 'Ritmo constante' },
      { name: 'Kettlebell Swing', sets: 4, reps: '20', load: '16', obs: 'Potência de quadril' },
      { name: 'Agachamento Livre', sets: 4, reps: '30', obs: 'Peso do corpo (Air Squat)' },
      { name: 'Flexão de Braços', sets: 4, reps: '15', obs: 'Explosiva' },
      { name: 'Polichinelo', sets: 3, reps: '2min', obs: 'Cardio final' },
      { name: 'Prancha Abdominal', sets: 3, reps: '1min', obs: 'Descanso curto entre séries' }
    ] 
  }
];

const initialClients: Client[] = [
  { 
    id: 1, 
    name: 'João Silva', 
    goal: 'Hipertrofia', 
    status: 'Ativo', 
    lastTraining: '28/11/2025', 
    assignedWorkouts: [], 
    assignedExercises: [],
    planType: 'Consultoria Online',
    monthlyFee: 150.00,
    paymentStatus: 'Em dia',
    nextPaymentDate: '15/12/2025',
    paymentMethod: 'Mastercard •••• 4242',
    progressLogs: [
      { date: '01/10', weight: 80.5, workoutsCompleted: 3, volumeLoad: 12000 },
      { date: '15/10', weight: 81.0, workoutsCompleted: 4, volumeLoad: 12500 },
      { date: '01/11', weight: 81.8, workoutsCompleted: 4, volumeLoad: 13200 },
      { date: '15/11', weight: 82.3, workoutsCompleted: 5, volumeLoad: 14000 },
      { date: '28/11', weight: 83.0, workoutsCompleted: 5, volumeLoad: 14500 },
    ]
  },
  { 
    id: 2, 
    name: 'Maria Souza', 
    goal: 'Emagrecimento', 
    status: 'Ativo', 
    lastTraining: '27/11/2025', 
    assignedWorkouts: [], 
    assignedExercises: [],
    planType: 'Personal Presencial',
    monthlyFee: 600.00,
    paymentStatus: 'Atrasado',
    nextPaymentDate: '25/11/2025',
    paymentMethod: 'Pix / Dinheiro',
    progressLogs: [
      { date: '01/10', weight: 68.0, workoutsCompleted: 2, volumeLoad: 5000 },
      { date: '15/10', weight: 67.2, workoutsCompleted: 3, volumeLoad: 6000 },
      { date: '01/11', weight: 66.5, workoutsCompleted: 4, volumeLoad: 7500 },
      { date: '15/11', weight: 65.8, workoutsCompleted: 4, volumeLoad: 8000 },
      { date: '27/11', weight: 65.0, workoutsCompleted: 5, volumeLoad: 8500 },
    ]
  },
  { 
    id: 3, 
    name: 'Pedro Santos', 
    goal: 'Condicionamento', 
    status: 'Pendente', 
    lastTraining: '-', 
    assignedWorkouts: [], 
    assignedExercises: [],
    planType: 'Consultoria Online',
    monthlyFee: 150.00,
    paymentStatus: 'Pendente',
    nextPaymentDate: '01/12/2025',
    paymentMethod: 'Visa •••• 1234'
  },
  { 
    id: 4, 
    name: 'Ana Oliveira', 
    goal: 'Força', 
    status: 'Inativo', 
    lastTraining: '15/10/2025', 
    assignedWorkouts: [], 
    assignedExercises: [],
    planType: 'Híbrido',
    monthlyFee: 350.00,
    paymentStatus: 'Atrasado',
    nextPaymentDate: '10/11/2025',
    paymentMethod: 'Mastercard •••• 9876'
  },
  { 
    id: 5, 
    name: 'Carlos Mendes', 
    goal: 'Hipertrofia', 
    status: 'Ativo', 
    lastTraining: '29/11/2025', 
    assignedWorkouts: [], 
    assignedExercises: [],
    planType: 'Personal Presencial',
    monthlyFee: 600.00,
    paymentStatus: 'Em dia',
    nextPaymentDate: '05/12/2025',
    paymentMethod: 'Pix'
  },
];


export default function App() {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.Dashboard);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [exercises] = useState<Exercise[]>(initialExercises);

  const handleSaveAIWorkout = (workout: Workout) => {
    setWorkouts(prev => [workout, ...prev]);
    setActiveView(ViewState.Workouts);
  };

  const handleConfirmPayment = (clientId: number) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        return { ...client, paymentStatus: 'Em dia' as const };
      }
      return client;
    });
    setClients(updatedClients);
  };

  const handleProcessRecurringCharges = () => {
    // Simula a cobrança automática nos cartões e atualização de data
    const updatedClients = clients.map(client => {
      const isOnlineOrHybrid = client.planType === 'Consultoria Online' || client.planType === 'Híbrido';
      // Verifica se o método de pagamento indica um cartão (Mastercard, Visa, etc.)
      const hasCard = client.paymentMethod && (client.paymentMethod.includes('Mastercard') || client.paymentMethod.includes('Visa') || client.paymentMethod.includes('Elo') || client.paymentMethod.includes('Amex'));
      const isActive = client.status === 'Ativo';

      if (isActive && isOnlineOrHybrid && hasCard) {
        // Calcular próxima data (+1 mês)
        const [day, month, year] = (client.nextPaymentDate || '').split('/').map(Number);
        let nextDateStr = client.nextPaymentDate;
        
        if (day && month && year) {
            const currentDate = new Date(year, month - 1, day);
            currentDate.setMonth(currentDate.getMonth() + 1);
            nextDateStr = currentDate.toLocaleDateString('pt-BR');
        }

        return { 
          ...client, 
          paymentStatus: 'Em dia' as const,
          nextPaymentDate: nextDateStr 
        };
      }
      return client;
    });
    setClients(updatedClients);
  };

  const renderView = () => {
    switch(activeView) {
      case ViewState.Dashboard:
        return <Dashboard clients={clients} workouts={workouts} exercises={exercises} setActiveView={setActiveView} />;
      case ViewState.Clients:
        // Passando exercises para que seja possível atribuir exercícios individuais aos alunos
        return <ClientList clients={clients} setClients={setClients} workouts={workouts} exercises={exercises} />;
      case ViewState.Financial:
        return <FinancialDashboard clients={clients} onConfirmPayment={handleConfirmPayment} onProcessRecurring={handleProcessRecurringCharges} />;
      case ViewState.Workouts:
        // Atualizado para passar clients e setClients
        return <WorkoutBuilder workouts={workouts} setWorkouts={setWorkouts} exercises={exercises} clients={clients} setClients={setClients} />;
      case ViewState.Exercises:
        return <ExerciseLibrary exercises={exercises} />;
      case ViewState.AICoach:
        return <AIWorkoutGenerator onSaveWorkout={handleSaveAIWorkout} />;
      default:
        return <Dashboard clients={clients} workouts={workouts} exercises={exercises} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}