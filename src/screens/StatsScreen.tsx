import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { HabitContext } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { getTodayDateKey } from '../utils/date';
import { Trophy, Calendar, CheckCircle2, Flame, Medal } from 'lucide-react-native'; // <--- Medal en plus

const screenWidth = Dimensions.get('window').width;

// Définition des Badges
const BADGES = [
  { id: '1', name: 'Débutant', desc: 'Complète ta 1ère habitude', icon: CheckCircle2, color: '#10B981', condition: (streak: number, total: number) => total >= 1 },
  { id: '2', name: 'En feu', desc: 'Atteins 3 jours de suite', icon: Flame, color: '#F59E0B', condition: (streak: number, total: number) => streak >= 3 },
  { id: '3', name: 'Expert', desc: 'Atteins 7 jours de suite', icon: Trophy, color: '#8B5CF6', condition: (streak: number, total: number) => streak >= 7 },
];

export const StatsScreen = () => {
  const { habits, userStats } = useContext(HabitContext)!;
  const { colors, isDark } = useTheme();

  // 1. CALCULS EXISTANTS
  const barData = [];
  const todayDate = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayDate);
    date.setDate(date.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const dayLabel = date.toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0).toUpperCase();
    const count = habits.filter(h => h.completedDates.includes(dateKey)).length;

    barData.push({
      value: count,
      label: dayLabel,
      frontColor: count > 0 ? '#3B82F6' : (isDark ? '#334155' : '#E2E8F0'),
      topLabelComponent: () => count > 0 ? <Text style={{color: colors.subtext, fontSize: 10, marginBottom: 4}}>{count}</Text> : null,
    });
  }

  const todayKey = getTodayDateKey();
  const completedToday = habits.filter(h => h.completedDates.includes(todayKey)).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  
  const pieData = [
    { value: completedToday, color: '#10B981', focused: true },
    { value: totalHabits - completedToday, color: isDark ? '#334155' : '#E2E8F0' }
  ];

  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  // Calcul du total d'habitudes complétées (somme des completedDates de toutes les habitudes)
  const totalCompletedAllTime = habits.reduce((acc, h) => acc + h.completedDates.length, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Statistiques 📊</Text>

        {/* CARTE 1 */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
             {/* @ts-ignore */}
            <Calendar size={20} color={colors.subtext} />
            <Text style={[styles.cardTitle, { color: colors.subtext }]}>CETTE SEMAINE</Text>
          </View>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <BarChart
              data={barData}
              barWidth={22}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="#3B82F6"
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              isAnimated
              height={150}
              width={screenWidth - 80}
              xAxisLabelTextStyle={{ color: colors.subtext, fontSize: 12 }}
            />
          </View>
        </View>

        <View style={styles.row}>
            {/* CARTE 2 */}
            <View style={[styles.card, styles.halfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                    {/* @ts-ignore */}
                    <CheckCircle2 size={18} color={colors.subtext} />
                    <Text style={[styles.cardTitle, { color: colors.subtext, fontSize: 11 }]}>AUJOURD'HUI</Text>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={45}
                        innerRadius={35}
                        centerLabelComponent={() => <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{completionRate}%</Text>}
                    />
                </View>
            </View>

            {/* CARTE 3 */}
            <View style={[styles.card, styles.halfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                     {/* @ts-ignore */}
                    <Trophy size={18} color="#F59E0B" />
                    <Text style={[styles.cardTitle, { color: colors.subtext, fontSize: 11 }]}>RECORD</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 36, fontWeight: '800', color: colors.text }}>{bestStreak}</Text>
                    <Text style={{ fontSize: 12, color: colors.subtext }}>jours de suite 🔥</Text>
                </View>
            </View>
        </View>

        {/* --- NOUVELLE SECTION : BADGES --- */}
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>SUCCÈS DÉBLOQUÉS</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => {
            const isUnlocked = badge.condition(bestStreak, totalCompletedAllTime);
            
            return (
              <View 
                key={badge.id} 
                style={[
                  styles.badgeCard, 
                  { backgroundColor: colors.card, borderColor: isUnlocked ? badge.color : colors.border, opacity: isUnlocked ? 1 : 0.5 }
                ]}
              >
                <View style={[styles.badgeIcon, { backgroundColor: isUnlocked ? badge.color + '20' : '#F1F5F9' }]}>
                   {/* @ts-ignore */}
                  <badge.icon size={24} color={isUnlocked ? badge.color : '#94A3B8'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
                  <Text style={[styles.badgeDesc, { color: colors.subtext }]}>{badge.desc}</Text>
                </View>
                {isUnlocked && (
                   // @ts-ignore
                   <CheckCircle2 size={16} color={badge.color} />
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  headerTitle: { fontSize: 32, fontWeight: '800', marginBottom: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: { fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 12 },
  halfCard: { flex: 1, height: 160 },
  
  // Styles Badges
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 16, marginTop: 10, opacity: 0.8 },
  badgesGrid: { gap: 12 },
  badgeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 12 },
  badgeIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeName: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  badgeDesc: { fontSize: 12 }
});