// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing } from 'react-native';
import { Check, Flame, Plus } from 'lucide-react-native';
import { Habit } from '../types/habit';
import { getTodayDateKey } from '../utils/date';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onIncrement: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
  onPress: (id: string) => void;
}

export const HabitCard = ({ habit, onToggle, onIncrement, onRemove, onPress }: HabitCardProps) => {
  const { colors, isDark } = useTheme();
  const today = getTodayDateKey();
  
  const currentVal = habit.progress[today] || 0;
  const isCompleted = habit.completedDates.includes(today);
  
  // Calculs pour la progression
  const progressRatio = habit.type === 'quantitative' ? Math.min(1, currentVal / habit.goal) : (isCompleted ? 1 : 0);
  const step = habit.goal > 10 ? Math.ceil(habit.goal / 10) : 1;

  // --- ANIMATIONS ---
  // 1. Valeur pour le rebond du bouton (échelle)
  const scaleValue = useRef(new Animated.Value(1)).current;
  // 2. Valeur pour la largeur de la barre (progression)
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Effet pour animer la barre quand progressRatio change
  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progressRatio,
      duration: 500, // 0.5 seconde de fluidité
      easing: Easing.out(Easing.exp), // Ralentissement à la fin
      useNativeDriver: false, // Obligatoire pour animer 'width'
    }).start();
  }, [progressRatio]);

  const handleAction = () => {
    // 1. Vibration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 2. Animation Rebond (Rétrécit puis Grossit)
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.8, // Rétrécit à 80%
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1, // Revient à la normale avec un effet ressort
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // 3. Action réelle
    if (habit.type === 'quantitative') onIncrement(habit.id, step);
    else onToggle(habit.id);
  };

  // Interpolation pour transformer la valeur 0-1 en pourcentage 0%-100%
  const widthInterpolated = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={() => onRemove(habit.id)}
      onPress={() => onPress(habit.id)}
      style={styles.container}
    >
      <View style={[
        styles.card, 
        { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          shadowColor: isDark ? "#000" : "#64748B"
        }
      ]}>
        
        {/* Barre de progression ANIMÉE */}
        {habit.type === 'quantitative' && (
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                width: widthInterpolated, // On utilise la valeur animée
                backgroundColor: habit.color + (isDark ? '40' : '15') 
              }
            ]} 
          />
        )}

        <View style={styles.content}>
          <View style={styles.infoContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{habit.title}</Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.streakContainer}>
                <Flame size={14} color={habit.streak > 0 ? "#F59E0B" : colors.subtext} />
                <Text style={[styles.streakText, { color: habit.streak > 0 ? "#F59E0B" : colors.subtext, fontWeight: habit.streak > 0 ? "bold" : "normal" }]}>
                  {habit.streak}
                </Text>
              </View>

              {habit.type === 'quantitative' && (
                <Text style={[styles.progressText, { color: colors.subtext }]}>
                  {currentVal} / {habit.goal} {habit.unit}
                </Text>
              )}
            </View>
          </View>

          {/* Bouton d'action ANIMÉ */}
          <TouchableOpacity onPress={handleAction} activeOpacity={1}>
            <Animated.View 
              style={[
                styles.actionButton,
                { transform: [{ scale: scaleValue }] }, // On applique le rebond ici
                isCompleted 
                  ? { backgroundColor: habit.color, borderColor: habit.color } 
                  : { borderColor: habit.color, backgroundColor: 'transparent' }
              ]}
            >
              {habit.type === 'boolean' ? (
                isCompleted && <Check size={20} color="white" strokeWidth={3} />
              ) : (
                isCompleted ? <Check size={20} color="white" strokeWidth={3} /> : <Plus size={20} color={habit.color} strokeWidth={3} />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Ligne de progression fine du bas (optionnelle, animée aussi) */}
        {habit.type === 'quantitative' && (
           <View style={[styles.progressLineBackground, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
              <Animated.View 
                style={[
                  styles.progressLineFill, 
                  { 
                    width: widthInterpolated, 
                    backgroundColor: habit.color 
                  }
                ]} 
              />
           </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  card: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressBar: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  content: { padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoContainer: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { fontSize: 13 },
  progressText: { fontSize: 13, fontWeight: '500' },
  actionButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  progressLineBackground: { height: 4, width: '100%' },
  progressLineFill: { height: '100%' }
});