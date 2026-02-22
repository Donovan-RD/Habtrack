import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Moon, Trash2, Sun, LogOut } from 'lucide-react-native'; // <--- Nouvelle icône
import { signOut } from 'firebase/auth'; // <--- Fonction de déconnexion
import { auth } from '../config/firebase'; // <--- Notre instance auth
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsScreen = () => {
  const { toggleTheme, colors, isDark } = useTheme();

  // Fonction de déconnexion
  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Es-tu sûr de vouloir te déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Se déconnecter", 
          style: "destructive", 
          onPress: async () => {
            try {
              await signOut(auth);
              // L'AuthContext détectera automatiquement la déconnexion 
              // et renverra l'utilisateur vers l'écran de Login.
            } catch (error) {
              Alert.alert("Erreur", "Impossible de se déconnecter.");
            }
          } 
        }
      ]
    );
  };

  // Fonction pour nettoyer le cache local (Optionnel, utile pour le dev)
  const handleResetLocalCache = () => {
    Alert.alert(
      "Vider le cache ?",
      "Cela effacera les données locales (pas celles du Cloud).",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Vider", style: "destructive", onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert("Terminé", "Cache local vidé.");
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Réglages</Text>
      </View>

      <ScrollView contentContainerStyle={styles.section}>
        
        {/* Section Apparence */}
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>APPARENCE</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#334155' : '#E0F2FE' }]}>
                {/* @ts-ignore */}
                {isDark ? <Moon size={20} color="#F8FAFC" /> : <Sun size={20} color="#0284C7" />}
              </View>
              <Text style={[styles.label, { color: colors.text }]}>Mode Sombre</Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: '#0F172A' }}
              thumbColor={'white'}
            />
          </View>
        </View>

        {/* Section Compte */}
        <Text style={[styles.sectionTitle, { color: colors.subtext, marginTop: 30 }]}>COMPTE</Text>
        
        {/* Bouton Déconnexion */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                {/* @ts-ignore */}
                <LogOut size={20} color="#EF4444" />
              </View>
              <Text style={[styles.label, { color: '#EF4444' }]}>Se déconnecter</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Section Zone de Danger (Optionnelle) */}
        <Text style={[styles.sectionTitle, { color: colors.subtext, marginTop: 30 }]}>ZONE DE DANGER</Text>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleResetLocalCache}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                 {/* @ts-ignore */}
                <Trash2 size={20} color={colors.subtext} />
              </View>
              <Text style={[styles.label, { color: colors.subtext }]}>Vider le cache local</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.subtext }]}>HabTrack v1.1 (Cloud)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  title: { fontSize: 32, fontWeight: '800' },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10, opacity: 0.8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 40, alignItems: 'center' },
  version: { fontSize: 12 }
});