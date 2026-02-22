import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Zap } from 'lucide-react-native';

interface LevelBarProps {
  level: number;
  xp: number;
}

export const LevelBar = ({ level, xp }: LevelBarProps) => {
  const { colors, isDark } = useTheme();
  
  // Objectif pour le niveau suivant = Level * 100
  const xpNeeded = level * 100;
  const progress = Math.min(1, Math.max(0, xp / xpNeeded)); // Entre 0 et 1

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <View style={styles.levelBadge}>
          {/* @ts-ignore */}
          <Zap size={14} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.levelText}>NIV {level}</Text>
        </View>
        <Text style={[styles.xpText, { color: colors.subtext }]}>
          {xp} / {xpNeeded} XP
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${progress * 100}%`,
              backgroundColor: '#F59E0B' // Couleur Or
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  levelText: { color: '#B45309', fontWeight: '800', fontSize: 12 },
  xpText: { fontSize: 12, fontWeight: '600' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 }
});