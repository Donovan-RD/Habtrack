// @ts-nocheck

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// On utilise MaterialTopTabNavigator pour avoir le SWIPE, mais stylisé en Bottom Bar
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Notifications from 'expo-notifications'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import des icônes
import { Home, BarChart2, Settings } from 'lucide-react-native';

// Import des Contextes
import { HabitProvider } from './src/context/HabitContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext'; // <--- Auth

// Import des Écrans de l'App
import { HomeScreen } from './src/screens/HomeScreen';
import { HabitDetailsScreen } from './src/screens/HabitDetailsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Import des Écrans d'Authentification (Nouveaux)
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';

// Configuration Globale des Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

// --- 1. Composant des Onglets (Swipe + Bottom Bar) ---
// Accessible UNIQUEMENT si connecté
function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarIndicatorStyle: { display: 'none' },
        tabBarStyle: {
          backgroundColor: colors.nav,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 90 : 70, 
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarPressColor: 'transparent',
      }}
    >
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ top: 12 }}>
               <BarChart2 color={color} size={26} strokeWidth={2.5} />
            </View>
          ),
        }}
      />

      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ top: 12 }}>
               <Home color={color} size={26} strokeWidth={2.5} />
            </View>
          ),
        }}
      />

      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ top: 12 }}>
               <Settings color={color} size={26} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
// --- 2. Le Navigateur Principal (Le Vigile) ---
function MainNavigator() {
  const { isDark, colors } = useTheme();
  const { user, loading } = useAuth(); // <--- On vérifie l'état de l'utilisateur

  // Écran de chargement pendant que Firebase vérifie la connexion
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {user ? (
          // --- ZONE PRIVÉE (Connecté) ---
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="HabitDetails" component={HabitDetailsScreen} />
          </>
        ) : (
          // --- ZONE PUBLIQUE (Pas connecté) ---
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- 3. Point d'entrée de l'application ---
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider> {/* <--- Auth doit être tout en haut */}
        <ThemeProvider>
          <HabitProvider>
             <MainNavigator />
          </HabitProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}