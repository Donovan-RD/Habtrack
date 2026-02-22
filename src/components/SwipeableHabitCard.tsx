import React, { useRef } from 'react';
import { Animated, View, StyleSheet, Text } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler'; // Le cœur du système
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { HabitCard } from './HabitCard'; // On importe notre carte existante
import { Habit } from '../types/habit';
import * as Haptics from 'expo-haptics';

// On reprend les mêmes props que HabitCard
interface SwipeableHabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onIncrement: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
  onPress: (id: string) => void;
}

export const SwipeableHabitCard = (props: SwipeableHabitCardProps) => {
  const { colors, isDark } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  // Cette fonction dessine ce qui apparaît quand on glisse vers la gauche (le fond rouge)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Animation : L'icône poubelle grandit au fur et à mesure qu'on tire
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    // Animation : Le fond rouge devient de plus en plus opaque
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View style={[styles.rightActionContainer, { opacity, backgroundColor: '#EF4444' }]}>
        <Animated.View style={[styles.actionIcon, { transform: [{ scale }] }]}>
           {/* @ts-ignore */}
          <Trash2 size={24} color="white" />
          <Text style={styles.actionText}>Supprimer</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  const handleSwipeComplete = () => {
    // Petite vibration de confirmation avant la suppression
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // On déclenche la suppression réelle après un court délai pour laisser l'animation finir
    setTimeout(() => {
        props.onRemove(props.habit.id);
    }, 200);
  };

  return (
    // GestureHandlerRootView est nécessaire pour que les gestes fonctionnent
    <GestureHandlerRootView>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions} // Ce qu'on voit en tirant à gauche
        onSwipeableOpen={handleSwipeComplete} // Action quand le swipe est terminé (lâché)
        friction={2} // Résistance au glissement
        rightThreshold={80} // Distance à parcourir pour déclencher l'action
        containerStyle={styles.swipeContainer}
      >
        {/* On affiche notre carte normale à l'intérieur */}
        <HabitCard {...props} />
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    // Hack pour que l'ombre de la carte ne soit pas coupée pendant le swipe
    overflow: 'visible', 
  },
  rightActionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12, // Pour s'aligner avec la marge de la carte
    borderRadius: 20,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 20,
    // On décale légèrement le fond rouge pour qu'il apparaisse sous la carte
    marginLeft: -20,
    zIndex: -1,
  },
  actionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  }
});