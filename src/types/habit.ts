export type HabitType = 'boolean' | 'quantitative';

// Liste des catégories disponibles
export type CategoryType = 'Sport' | 'Santé' | 'Mindfulness' | 'Travail' | 'Social' | 'Autre';

export interface Habit {
  id: string;
  title: string;
  color: string;
  createdAt: string;
  
  // Configuration
  type: HabitType;       
  goal: number;          
  unit: string;  
  category: CategoryType;
  
  // Données
  completedDates: string[]; 
  progress: Record<string, number>; 
  streak: number;
}

export interface HabitContextType {
  habits: Habit[];
  
  addHabit: (
    title: string, 
    color: string, 
    type?: HabitType, 
    goal?: number, 
    unit?: string, 
    category?: CategoryType
  ) => void;

  toggleHabit: (id: string) => void;
  incrementHabit: (id: string, amount: number) => void;
  deleteHabit: (id: string) => void;
  
  // C'est cette ligne qui manquait pour corriger ton erreur :
  updateHabitDetails: (id: string, updates: Partial<Habit>) => void;
  
  loading: boolean;
}