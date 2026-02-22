import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitContext } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { SwipeableHabitCard } from '../components/SwipeableHabitCard'; 
import { AddHabitModal } from '../components/AddHabitModal';
import { LevelBar } from '../components/LevelBar'; // <--- Import
import { Plus, Bell, BellOff } from 'lucide-react-native';
import { toggleDailyReminder, checkIfReminderIsSet } from '../utils/notifications';
import { CategoryType } from '../types/habit';

const FILTERS: (CategoryType | 'Tout')[] = ['Tout', 'Sport', 'Santé', 'Mindfulness', 'Travail', 'Social', 'Autre'];

export const HomeScreen = ({ navigation }: any) => {
  const context = useContext(HabitContext);
  const { colors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CategoryType | 'Tout'>('Tout');

  useEffect(() => {
    checkIfReminderIsSet().then((isSet) => setHasNotifications(isSet));
  }, []);

  if (!context) return null;
  // On récupère userStats
  const { habits, userStats, toggleHabit, addHabit, deleteHabit, incrementHabit } = context;

  const handleRemoveHabit = (id: string) => {
    Alert.alert(
      "Supprimer l'habitude ?",
      "Cette action est irréversible.",
      [ { text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => deleteHabit(id) } ]
    );
  };

  const handleToggleNotifications = async () => {
    const newState = !hasNotifications;
    const success = await toggleDailyReminder(newState);
    if (success === true) setHasNotifications(newState);
  };

  const filteredHabits = activeFilter === 'Tout' ? habits : habits.filter(h => h.category === activeFilter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Bonjour 👋</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>Tes objectifs du jour</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={handleToggleNotifications} 
              style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
               {/* @ts-ignore */}
              {hasNotifications ? <Bell color={colors.text} fill={colors.text} size={24} /> : <BellOff color={colors.subtext} size={24} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButton}>
               {/* @ts-ignore */}
              <Plus color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* BARRE DE NIVEAU (Gamification) */}
        <LevelBar level={userStats.level} xp={userStats.xp} />

        {/* Filtres */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
            {FILTERS.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveFilter(cat)}
                style={[
                  styles.filterChip, 
                  activeFilter === cat 
                    ? { backgroundColor: colors.text, borderColor: colors.text } 
                    : { backgroundColor: colors.card, borderColor: colors.border }
                ]}
              >
                <Text style={[
                  styles.filterText, 
                  activeFilter === cat ? { color: colors.background } : { color: colors.subtext }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredHabits}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SwipeableHabitCard 
              habit={item} 
              onToggle={toggleHabit} 
              onIncrement={incrementHabit}
              onRemove={handleRemoveHabit}
              onPress={(id) => navigation.navigate('HabitDetails', { habitId: id })} 
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucune habitude.</Text>
              <Text style={[styles.emptySubtext, { color: colors.subtext }]}>Crée-en une nouvelle !</Text>
            </View>
          }
        />

        <AddHabitModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} onAdd={addHabit} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  headerButtons: { flexDirection: 'row', gap: 12 },
  greeting: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 16, marginTop: 4 },
  iconButton: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  addButton: { backgroundColor: '#0F172A', width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  filterContainer: { marginBottom: 20, height: 40 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  filterText: { fontSize: 14, fontWeight: '600' },
  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 14, marginTop: 8 }
});