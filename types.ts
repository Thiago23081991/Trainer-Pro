import React from 'react';

export interface Exercise {
  id: number;
  name: string;
  muscle: string;
  instructions?: string;
  imageUrl?: string;
}

export interface ExerciseSet {
  name: string;
  sets: number | string;
  reps: string;
  load?: string; // Novo campo para Carga/Peso
  obs: string;
}

export interface Workout {
  id: number;
  title: string;
  exercises: ExerciseSet[];
  aiGenerated?: boolean;
}

export interface ClientProgressLog {
  date: string;
  weight: number;
  bodyFat?: number;
  workoutsCompleted: number; // e.g., per week
  volumeLoad?: number; // Arbitrary unit of volume (sets * reps * weight)
  rpe?: number; // Rate of Perceived Exertion (1-10)
  exerciseLoads?: { name: string; load: string }[]; // Histórico de cargas usadas no dia
}

export type PlanType = 'Consultoria Online' | 'Personal Presencial' | 'Híbrido';
export type PaymentStatus = 'Em dia' | 'Pendente' | 'Atrasado';

export interface PaymentHistory {
    id: number;
    date: string;
    amount: number;
    status: PaymentStatus;
    method: string;
}

export interface Client {
  id: number;
  name: string;
  goal: string;
  status: 'Ativo' | 'Pendente' | 'Inativo';
  lastTraining: string;
  assignedWorkouts?: Workout[];
  assignedExercises?: (ExerciseSet & { originalId: number })[];
  progressLogs?: ClientProgressLog[];
  // Dados Antropométricos
  height?: number; // em cm
  age?: number;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
  // Campos Financeiros
  planType?: PlanType;
  monthlyFee?: number;
  paymentStatus?: PaymentStatus;
  nextPaymentDate?: string;
  paymentMethod?: string; // Ex: 'Cartão Final 4242'
  paymentDay?: string;
  paymentHistory?: PaymentHistory[];
}

export enum ViewState {
  Dashboard = 'dashboard',
  Clients = 'clients',
  Workouts = 'workouts',
  Exercises = 'exercises',
  AICoach = 'ai-coach',
  Financial = 'financial'
}

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}