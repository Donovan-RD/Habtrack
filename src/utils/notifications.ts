// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export const checkIfReminderIsSet = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length > 0;
  } catch (e) {
    console.log("Erreur vérification notifs:", e);
    return false;
  }
};

export const toggleDailyReminder = async (enabled: boolean) => {
  if (!enabled) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert("Rappels désactivés", "Tu ne recevras plus de notifications.");
      return true;
    } catch (e) {
      console.log("Erreur désactivation:", e);
      return false;
    }
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert("Permission refusée", "Active les notifications dans les réglages.");
      return false;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    // Pour Android, on crée un canal (obligatoire pour les sons/priorités)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: 'Rappel Quotidien',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "C'est l'heure du bilan ! 📝",
        body: "N'oublie pas de cocher tes habitudes aujourd'hui.",
        sound: true, // Joue le son par défaut sur iOS
      },
      trigger: {
        // C'est cette ligne qui corrige ton erreur "invalid trigger"
        type: Notifications.SchedulableTriggerInputTypes.DAILY, 
        hour: 20, 
        minute: 0,
        // Sur Android, on lie au canal créé plus haut
        channelId: Platform.OS === 'android' ? 'daily-reminder' : undefined,
      },
    });

    Alert.alert("Rappel activé !", "Tu recevras une notification chaque soir à 20h00.");
    return true;

  } catch (e) {
    console.error("Erreur programmation:", e);
    // On affiche l'erreur réelle pour t'aider à débugger si ça persiste
    Alert.alert("Erreur", "Impossible de programmer : " + (e as any).message);
    return false;
  }
};