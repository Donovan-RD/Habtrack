// src/utils/date.ts

export const getTodayDateKey = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const subtractDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() - days);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;

  const today = getTodayDateKey();
  const yesterday = subtractDays(today, 1);
  
  const sortedDates = Array.from(new Set(completedDates)).sort((a, b) => b.localeCompare(a));

  if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let checkDate = sortedDates.includes(today) ? today : yesterday;

  while (sortedDates.includes(checkDate)) {
    streak++;
    checkDate = subtractDays(checkDate, 1);
  }

  return streak;
};

// --- C'est cette fonction qui te manquait ou qui était mal placée ---
export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getCurrentMonthDates = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Maintenant qu'elle est définie juste au-dessus, l'erreur va disparaître
  const daysInMonth = getDaysInMonth(month, year);
  
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dayString = String(i).padStart(2, '0');
    const monthString = String(month + 1).padStart(2, '0');
    days.push(`${year}-${monthString}-${dayString}`);
  }
  return days;
};