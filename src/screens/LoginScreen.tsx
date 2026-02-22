import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export const LoginScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert("Erreur", "Merci de remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Pas besoin de naviguer manuellement : AuthContext va détecter le changement d'état 
      // et App.tsx va automatiquement afficher l'écran d'accueil !
    } catch (error: any) {
      let msg = "Une erreur est survenue.";
      if (error.code === 'auth/invalid-email') msg = "L'adresse email est invalide.";
      if (error.code === 'auth/user-not-found') msg = "Utilisateur introuvable.";
      if (error.code === 'auth/wrong-password') msg = "Mot de passe incorrect.";
      if (error.code === 'auth/invalid-credential') msg = "Email ou mot de passe incorrect.";
      Alert.alert("Erreur de connexion", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Bon retour 👋</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Connecte-toi pour retrouver tes habitudes.</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="exemple@email.com"
                placeholderTextColor={colors.subtext}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Mot de passe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="••••••••"
                placeholderTextColor={colors.subtext}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.background} /> : (
                <Text style={[styles.buttonText, { color: colors.background }]}>Se connecter</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={{ color: colors.subtext }}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1 },
  button: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
});