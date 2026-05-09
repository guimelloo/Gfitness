import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useContext, useEffect } from 'react';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthContext, AuthProvider } from '@/context/auth-context';
import { DailyCheckInService } from '@/services/daily-checkin-service';

export const unstable_settings = {
  initialRouteName: 'auth',
};

function registerServiceWorker() {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) =>
        console.warn('[SW] Registration failed:', err)
      );
    });
  }
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (Platform.OS === 'web') {
      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    if (!isLoading && navigationState?.key) {
      if (!user) {
        router.replace('/auth/login');
      } else {
        router.replace('/(tabs)');

        if (Platform.OS !== 'web') {
          DailyCheckInService.scheduleAutomaticDailyCheckIn();
          DailyCheckInService.initializeDailyCheckInListener();
        }
      }
    }
  }, [user, isLoading, navigationState?.key]);

  if (isLoading || !navigationState?.key) {
    return (
      <Stack>
        <Stack.Screen name="loading" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="dark" barStyle="dark-content" backgroundColor="transparent" translucent />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
