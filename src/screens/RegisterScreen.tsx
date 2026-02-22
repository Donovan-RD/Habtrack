import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export const RegisterScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert("Erreur", "Remplis tous les champs.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Succès -> App.tsx détectera l'utilisateur et changera d'écran
    } catch (error: any) {
      let msg = "Une erreur est survenue.";
      if (error.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
      if (error.code === 'auth/invalid-email') msg = "Email invalide.";
      Alert.alert("Erreur d'inscription", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Rejoins l'aventure 🚀</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Crée un compte pour sauvegarder tes progrès.</Text>

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
                placeholder="Au moins 6 caractères"
                placeholderTextColor={colors.subtext}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.background} /> : (
                <Text style={[styles.buttonText, { color: colors.background }]}>Créer mon compte</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={{ color: colors.subtext }}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Se connecter</Text>
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