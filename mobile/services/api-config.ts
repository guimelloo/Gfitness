import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = '3000';
const FALLBACK_LAN_URL = 'http://192.168.178.218:3000';

const extractHost = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/^\w+:\/\//, '');
  const host = normalized.split('/')[0]?.split(':')[0];

  return host || null;
};

const getExpoHost = (): string | null => {
  const manifest = (Constants as any).manifest;
  const manifest2 = (Constants as any).manifest2;
  const expoGoConfig = (Constants as any).expoGoConfig;

  return (
    extractHost(Constants.expoConfig?.hostUri) ||
    extractHost(expoGoConfig?.debuggerHost) ||
    extractHost(manifest?.debuggerHost) ||
    extractHost(manifest2?.extra?.expoClient?.hostUri) ||
    extractHost(Constants.linkingUri)
  );
};

const getBaseURL = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (envUrl) {
    return envUrl;
  }

  const expoHost = getExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_PORT}`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  return FALLBACK_LAN_URL;
};

export const API_BASE_URL = getBaseURL();

console.log('[API Config] Using API base URL:', API_BASE_URL, 'on platform:', Platform.OS);

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',

  // Users
  GET_USER: (id: string) => `/users/${id}`,
  UPDATE_USER: (id: string) => `/users/${id}`,
  USER_PROFILE: '/users/profile',

  // Workouts
  GET_WORKOUTS: '/workouts',
  GET_USER_WORKOUTS: (userId: string) => `/workouts/user/${userId}`,
  GET_WORKOUT: (id: string) => `/workouts/${id}`,
  CREATE_WORKOUT: '/workouts',
  UPDATE_WORKOUT: (id: string) => `/workouts/${id}`,
  DELETE_WORKOUT: (id: string) => `/workouts/${id}`,

  // Meals
  GET_MEALS: '/meals',
  GET_USER_MEALS: (userId: string) => `/meals/user/${userId}`,
  GET_MEAL: (id: string) => `/meals/${id}`,
  CREATE_MEAL: '/meals',
  UPDATE_MEAL: (id: string) => `/meals/${id}`,
  DELETE_MEAL: (id: string) => `/meals/${id}`,

  // Checkins
  GET_CHECKINS: '/checkins',
  GET_USER_CHECKINS: (userId: string) => `/checkins/user/${userId}`,
  GET_CHECKIN: (id: string) => `/checkins/${id}`,
  CREATE_CHECKIN: '/checkins',
  UPDATE_CHECKIN: (id: string) => `/checkins/${id}`,
  DELETE_CHECKIN: (id: string) => `/checkins/${id}`,

  // Weekly Progress
  GET_WEEKLY_PROGRESS: '/weekly-progress',
  GET_USER_WEEKLY_PROGRESS: (userId: string) => `/weekly-progress/user/${userId}`,
  GET_PROGRESS: (id: string) => `/weekly-progress/${id}`,
  CREATE_PROGRESS: '/weekly-progress',
  UPDATE_PROGRESS: (id: string) => `/weekly-progress/${id}`,
  DELETE_PROGRESS: (id: string) => `/weekly-progress/${id}`,

  // Alerts
  GET_ALERTS: '/alerts',
  GET_USER_ALERTS: (userId: string) => `/alerts/user/${userId}`,

  // Coach Notes
  GET_COACH_NOTES: '/coach-notes',
  GET_USER_NOTES: (userId: string) => `/coach-notes/user/${userId}`,

  // Notifications
  GET_NOTIFICATIONS: '/notifications',
  GET_USER_NOTIFICATIONS: (userId: string) => `/notifications/user/${userId}`,

  // Exercises
  GET_EXERCISES: '/exercises',
  GET_EXERCISE_BY_MUSCLE: (muscleGroup: string) => `/exercises/muscle-group/${muscleGroup}`,

  // Home
  HOME: '/home',

  // Daily Logs
  DAILY_LOG_CREATE: '/daily-logs',
  DAILY_LOG_TODAY: '/daily-logs/today',
  DAILY_LOG_RECENT: '/daily-logs/recent',
  DAILY_LOG_UPDATE: '/daily-logs/date/',
  DAILY_LOG_ADD_MEAL: '/daily-logs/meals/add',
  DAILY_LOG_REMOVE_MEAL: (mealLogId: string) => `/daily-logs/meals/${mealLogId}`,

  // Workout Plans
  WORKOUT_PLAN: '/workout-plans',
  WORKOUT_PLAN_DAY: (dayId: string) => `/workout-plans/days/${dayId}`,
  WORKOUT_PLAN_IMPORT: '/workout-plans/import',
  WORKOUT_PLAN_TEMPLATE: '/workout-plans/template',

  // Avatar
  USER_AVATAR: '/users/avatar',
  USER_PROFILE_UPDATE: '/users/profile',
};
