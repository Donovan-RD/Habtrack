import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Habit, HabitContextType, HabitType, CategoryType } from '../types/habit';
import { UserStats } from '../types/user'; // <--- Nouveau type
import { getTodayDateKey, calculateStreak } from '../utils/date';

import { db } from '../config/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

// On étend le contexte pour inclure les stats
interface FullHabitContextType extends HabitContextType {
  userStats: UserStats;
}

export const HabitContext = createContext<FullHabitContextType | undefined>(undefined);

export const HabitProvider = ({ children }: { children: ReactNode }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ xp: 0, level: 1 }); // <--- Stats par défaut
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 1. ÉCOUTER LES HABITUDES & LES STATS
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setUserStats({ xp: 0, level: 1 });
      setLoading(false);
      return;
    }

    // A. Écoute des Habitudes
    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const unsubscribeHabits = onSnapshot(query(habitsRef), (snapshot) => {
      const loadedHabits: Habit[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      loadedHabits.sort((a, b) => Number(b.id) - Number(a.id));
      setHabits(loadedHabits);
      setLoading(false);
    });

    // B. Écoute des Stats (XP/Level)
    const statsRef = doc(db, 'users', user.uid, 'stats', 'main');
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserStats(docSnap.data() as UserStats);
      } else {
        // Création initiale si n'existe pas
        setDoc(statsRef, { xp: 0, level: 1 });
      }
    });

    return () => {
      unsubscribeHabits();
      unsubscribeStats();
    };
  }, [user]);

  // --- GESTION DE L'XP ---
  const addXp = async (amount: number) => {
    if (!user) return;
    
    let newXp = userStats.xp + amount;
    let newLevel = userStats.level;

    // Formule simple : Niveau suivant = Niveau actuel * 100 XP
    // Niveau 1 -> 100 XP requis
    // Niveau 2 -> 200 XP requis (Total 300)
    const xpToNextLevel = newLevel * 100;

    if (newXp >= xpToNextLevel) {
      newXp = newXp - xpToNextLevel;
      newLevel++;
      Alert.alert("🎉 NIVEAU SUPÉRIEUR !", `Bravo ! Tu passes niveau ${newLevel} !`);
    } else if (newXp < 0) {
        // Cas rare de rétrogradation si on décoche trop
        if (newLevel > 1) {
            newLevel--;
            newXp = (newLevel * 100) + newXp; 
        } else {
            newXp = 0;
        }
    }

    try {
      await setDoc(doc(db, 'users', user.uid, 'stats', 'main'), {
        xp: newXp,
        level: newLevel
      });
    } catch (e) {
      console.error("Erreur XP:", e);
    }
  };

  // --- ACTIONS ---

  const addHabit = async (title: string, color: string, type: HabitType = 'boolean', goal: number = 1, unit: string = 'x', category: CategoryType = 'Autre') => {
    if (!user) return;
    const newId = Date.now().toString();
    const newHabit: Habit = {
      id: newId, title, color, createdAt: new Date().toISOString(), type, goal, unit, category, completedDates: [], progress: {}, streak: 0,
    };
    await setDoc(doc(db, 'users', user.uid, 'habits', newId), newHabit);
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'habits', id));
  };

  const updateHabitDetails = async (id: string, updates: Partial<Habit>) => {
    if (!user) return;
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    await updateDoc(doc(db, 'users', user.uid, 'habits', id), updates);
  };

  // COCHER/DÉCOCHER (Avec XP)
  const toggleHabit = async (id: string) => {
    if (!user) return;
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const today = getTodayDateKey();
    const wasCompleted = habit.completedDates.includes(today);
    
    const newProgress = { ...habit.progress };
    
    if (wasCompleted) {
      delete newProgress[today];
      addXp(-10); // On retire l'XP si on décoche
    } else {
      newProgress[today] = habit.goal;
      addXp(10); // On donne l'XP
    }

    await updateHabitInCloud(habit, newProgress, today);
  };

  // INCRÉMENTER (Avec XP)
  const incrementHabit = async (id: string, amount: number) => {
    if (!user) return;
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const today = getTodayDateKey();
    const currentVal = habit.progress[today] || 0;
    const wasCompleted = currentVal >= habit.goal;

    const newVal = Math.max(0, currentVal + amount);
    const newProgress = { ...habit.progress, [today]: newVal };
    if (newVal === 0) delete newProgress[today];

    const isNowCompleted = newVal >= habit.goal;

    // Logique XP : On ne donne l'XP que si l'habitude passe de "Pas fini" à "Fini"
    if (!wasCompleted && isNowCompleted) {
        addXp(10);
    } 
    // Si on redescend en dessous de l'objectif (ex: erreur de saisie), on retire l'XP
    else if (wasCompleted && !isNowCompleted) {
        addXp(-10);
    }

    await updateHabitInCloud(habit, newProgress, today);
  };

  const updateHabitInCloud = async (habit: Habit, newProgress: Record<string, number>, today: string) => {
    if (!user) return;
    const currentVal = newProgress[today] || 0;
    const isNowCompleted = currentVal >= habit.goal;
    
    let newCompletedDates = [...habit.completedDates];
    if (isNowCompleted && !newCompletedDates.includes(today)) newCompletedDates.push(today);
    else if (!isNowCompleted && newCompletedDates.includes(today)) newCompletedDates = newCompletedDates.filter(d => d !== today);

    const newStreak = calculateStreak(newCompletedDates);
    await updateDoc(doc(db, 'users', user.uid, 'habits', habit.id), {
      progress: newProgress, completedDates: newCompletedDates, streak: newStreak
    });
  };

  return (
    <HabitContext.Provider value={{ habits, userStats, addHabit, toggleHabit, incrementHabit, deleteHabit, updateHabitDetails, loading }}>
      {children}
    </HabitContext.Provider>
  );
};