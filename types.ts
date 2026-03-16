
export interface Task {
  id: string;
  title: string;
  xp: number; 
  coins: number;
  completed: boolean;
  type: 'recurring' | 'one-time';
  recurringType?: 'weekly' | 'monthly'; // Novo campo
  recurringDays: number[]; // Para weekly
  monthlyPattern?: { 
    week: number; // 1: primeira, 2: segunda, 3: terceira, 4: quarta, 5: última
    day: number;  // 0-6 (Dom-Sab)
  };
  reminderTime?: string;   
  lastCompletedDate?: string; 
  completionCount: number;
}

export interface Season {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  targetPoints: number;
  currentPoints: number;
  reward: string;
  isActive: boolean;
  seasonNumber: number;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  purchased: boolean;
  description: string;
}

export interface Punishment {
  id: string;
  title: string;
  cost: number;
  lastAppliedDate?: string;
}

export interface HistoryEntry {
  id: string;
  type: 'task' | 'reward' | 'punishment' | 'bonus' | 'season_end';
  title: string;
  value: number;
  date: string; 
  relatedId?: string;
}

export interface UserStats {
  totalCoins: number;
}

export interface AppData {
  tasks: Task[];
  rewards: Reward[];
  punishments: Punishment[];
  history: HistoryEntry[];
  stats: UserStats;
  currentSeason: Season | null;
  dailyReviewTime: string; 
  seasonCount: number;
}

export type View = 'dashboard' | 'tasks' | 'shop' | 'punishments' | 'history' | 'settings';
