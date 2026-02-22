import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { HabitContext } from '../context/HabitContext';
import { HabitCalendar } from '../components/HabitCalendar';
import { AddHabitModal } from '../components/AddHabitModal'; // <--- Import du Modal
import { ArrowLeft, Calendar, Trophy, Pencil } from 'lucide-react-native'; // <--- Icone Pencil

export const HabitDetailsScreen = ({ route, navigation }: any) => {
  const { habitId } = route.params;
  const context = useContext(HabitContext);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // <--- État pour le modal

  const habit = context?.habits.find((h) => h.id === habitId);

  if (!habit) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           {/* @ts-ignore */}
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Détails</Text>
        
        {/* BOUTON EDITER */}
        <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.backButton}>
           {/* @ts-ignore */}
          <Pencil color="#1E293B" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleCard}>
           <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
           <Text style={styles.habitTitle}>{habit.title}</Text>
        </View>

        <View style={styles.statsGrid}>
           <View style={styles.statCard}>
            {/* @ts-ignore */}
            <Trophy color={habit.color} size={24} style={{ marginBottom: 8 }} />
            <Text style={styles.statValue}>{habit.streak}</Text>
            <Text style={styles.statLabel}>Série actuelle</Text>
          </View>

          <View style={styles.statCard}>
            {/* @ts-ignore */}
            <Calendar color={habit.color} size={24} style={{ marginBottom: 8 }} />
            <Text style={styles.statValue}>{habit.completedDates.length}</Text>
            <Text style={styles.statLabel}>Jours total</Text>
          </View>
        </View>
        
        <View style={styles.placeholderCard}>
          <HabitCalendar completedDates={habit.completedDates} color={habit.color} />
        </View>

      </ScrollView>

      {/* MODAL EN MODE ÉDITION */}
      <AddHabitModal 
        visible={isEditModalVisible} 
        onClose={() => setIsEditModalVisible(false)} 
        onAdd={() => {}} // On ne l'utilise pas en mode édition
        habitToEdit={habit} // On passe l'habitude actuelle
        onUpdate={context?.updateHabitDetails} // On passe la fonction de mise à jour
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white' },
  backButton: { padding: 8, borderRadius: 8, backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#0F172A' },
  content: { padding: 20 },
  titleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 24, borderRadius: 20, marginBottom: 20 },
  colorDot: { width: 20, height: 20, borderRadius: 10, marginRight: 16 },
  habitTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 20, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 13, color: '#64748B', marginTop: 4 },
  placeholderCard: { backgroundColor: '#E2E8F0', padding: 40, borderRadius: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1' }
});