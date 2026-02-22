import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HabitCalendarProps {
  completedDates: string[];
  color: string;
}

// Fonction utilitaire importée ou recréée ici pour simplifier l'import
const getDaysInMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysCount = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  for (let i = 1; i <= daysCount; i++) {
    const dayString = String(i).padStart(2, '0');
    const monthString = String(month + 1).padStart(2, '0');
    days.push(`${year}-${monthString}-${dayString}`);
  }
  return days;
};

export const HabitCalendar = ({ completedDates, color }: HabitCalendarProps) => {
  const days = getDaysInMonth();
  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'long' });

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>
        {currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)} {today.getFullYear()}
      </Text>
      
      <View style={styles.calendarGrid}>
        {/* En-tête des jours (Lun, Mar, etc.) - Optionnel mais sympa */}
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
          <Text key={index} style={styles.dayLabel}>{day}</Text>
        ))}

        {/* Les jours du mois */}
        {days.map((dateString) => {
          const isCompleted = completedDates.includes(dateString);
          const dayNumber = dateString.split('-')[2];
          
          return (
            <View key={dateString} style={styles.dayContainer}>
              <View style={[
                styles.dayCircle,
                isCompleted && { backgroundColor: color },
                !isCompleted && { backgroundColor: '#F1F5F9' } // Gris si pas fait
              ]}>
                <Text style={[
                  styles.dayText,
                  isCompleted ? { color: 'white', fontWeight: 'bold' } : { color: '#64748B' }
                ]}>
                  {dayNumber}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // On utilise gap ou margin négative pour l'espacement
  },
  dayLabel: {
    width: '14.28%', // 100% / 7 jours
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  dayContainer: {
    width: '14.28%', // 100% / 7 jours
    aspectRatio: 1, // Pour faire des carrés parfaits
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 12, // Arrondi
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
  }
});