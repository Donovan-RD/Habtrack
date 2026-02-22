export interface UserStats {
  xp: number;
  level: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Nom de l'icône Lucide
  color: string;
  condition: (streak: number, totalCompleted: number) => boolean;
}