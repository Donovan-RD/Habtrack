import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
}

export const GlassView = ({ children, style, intensity = 50 }: GlassViewProps) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />
      {/* Une couche blanche semi-transparente pour éclaircir le fond */}
      <View style={styles.frost} />
      {/* Le contenu (Texte, boutons...) */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // Important pour que le Blur ne dépasse pas les coins arrondis
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)', // Bordure subtile blanche
    borderWidth: 1,
  },
  frost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Opacité du "verre"
  },
  content: {
    // Le contenu s'affichera par dessus
  }
});