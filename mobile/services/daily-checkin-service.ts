import { Platform, Alert } from 'react-native';
import { DailyLogService } from './home-service';

// expo-notifications is not available on web — import lazily via Platform guard
let Notifications: typeof import('expo-notifications') | null = null;
let SchedulableTriggerInputTypes: typeof import('expo-notifications').SchedulableTriggerInputTypes | null = null;

if (Platform.OS !== 'web') {
  const mod = require('expo-notifications') as typeof import('expo-notifications');
  Notifications = mod;
  SchedulableTriggerInputTypes = mod.SchedulableTriggerInputTypes;

  mod.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false,
    }),
  });
}

export class DailyCheckInService {
  static async scheduleAutomaticDailyCheckIn() {
    if (Platform.OS === 'web' || !Notifications || !SchedulableTriggerInputTypes) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Check-in',
          body: 'Registrando dados do dia...',
          data: { type: 'daily-checkin' },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
          hour: 0,
          minute: 0,
        },
      });
      console.log('[DailyCheckIn] Scheduled for midnight (daily trigger)');
    } catch (error) {
      console.error('[DailyCheckIn] Failed to schedule:', error);
    }
  }

  static initializeDailyCheckInListener() {
    if (Platform.OS === 'web' || !Notifications) return undefined;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data.type === 'daily-checkin') {
        this.performDailyCheckIn();
      }
    });
    return subscription;
  }

  static async performDailyCheckIn() {
    try {
      console.log('[DailyCheckIn] Starting automatic daily check-in at:', new Date().toISOString());
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const recentLogs = await DailyLogService.getRecentLogs(1);
      const todayLog = recentLogs.find((log: any) => log.date.split('T')[0] === dateString);

      if (todayLog) {
        console.log('[DailyCheckIn] Log already exists for today');
        return;
      }

      await DailyLogService.createDailyLog({
        date: dateString,
        weight: undefined,
        workoutCompleted: false,
        waterIntake: 0,
        workoutType: undefined,
        notes: 'Registro automático às 00:00',
      });
      console.log('[DailyCheckIn] Daily log created for:', dateString);
      Alert.alert('✅ Sucesso', 'Novo dia registrado automaticamente!');
    } catch (error) {
      console.error('[DailyCheckIn] Failed to perform check-in:', error);
      Alert.alert('⚠️ Erro', 'Falha ao registrar o novo dia');
    }
  }

  static async manualCheckIn() {
    console.log('[DailyCheckIn] Manual check-in triggered');
    await this.performDailyCheckIn();
  }

  static async deleteTodayLog() {
    try {
      console.log('[DailyCheckIn] Deleting today log...');
      await DailyLogService.deleteTodayLog();
      console.log('[DailyCheckIn] Today log deleted');
      Alert.alert('✅ Removido', 'Registro de hoje foi removido com sucesso!');
    } catch (error) {
      console.error('[DailyCheckIn] Failed to delete today log:', error);
      Alert.alert('⚠️ Erro', 'Falha ao remover o registro de hoje');
      throw error;
    }
  }
}
