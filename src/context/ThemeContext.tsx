import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nos palettes de couleurs
export const themeColors = {
  light: {
    background: '#F8FAFC', // Gris très clair
    card: '#FFFFFF',
    text: '#0F172A',       // Bleu nuit presque noir
    subtext: '#64748B',    // Gris moyen
    border: '#E2E8F0',
    nav: '#FFFFFF',
    primary: '#0F172A',
    icon: '#0F172A',
  },
  dark: {
    background: '#020617', // Bleu nuit très profond
    card: '#1E293B',       // Gris bleuté
    text: '#F8FAFC',       // Blanc cassé
    subtext: '#94A3B8',
    border: '#334155',
    nav: '#0F172A',
    primary: '#F8FAFC',
    icon: '#F8FAFC',
  },
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colors: typeof themeColors.light;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // Détecte le réglage du téléphone
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  // Charger la préférence utilisateur au démarrage
  useEffect(() => {
    AsyncStorage.getItem('userTheme').then(saved => {
      if (saved) setTheme(saved as Theme);
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    AsyncStorage.setItem('userTheme', newTheme);
  };

  const colors = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le thème facilement partout
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};