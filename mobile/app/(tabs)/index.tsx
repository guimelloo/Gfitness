import React, { useContext, useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthContext } from '@/context/auth-context';
import { HomeService, DailyLogService } from '@/services/home-service';
import { MealCard } from '@/components/home/meal-card';
import { MealDetailsModal } from '@/components/home/meal-details-modal';
import { AddMealModal } from '@/components/home/add-meal-modal';
import { AddMealByIngredientsModal } from '@/components/home/add-meal-by-ingredients-modal';
import { WeightInput } from '@/components/home/weight-input';
import { WorkoutCheckbox } from '@/components/home/workout-checkbox';
import { DailyWorkoutCard } from '@/components/home/daily-workout-card';
import { WaterIntakeCheckbox } from '@/components/home/water-intake-checkbox';
import { DailyNotesInput } from '@/components/home/daily-notes-input';
import { WorkoutPlanEditorModal } from '@/components/home/workout-plan-editor-modal';
import { WorkoutPlanService, WorkoutPlan } from '@/services/workout-plan-service';
import { API_BASE_URL } from '@/services/api-config';


const DEFAULT_WORKOUTS = [
  { dayNumber: 1, dayName: 'Segunda — Costas', muscleGroups: ['Costas', 'Bíceps'], dayOfWeek: 1, exercises: [
    { name: 'Barra fixa assistida / livre', sets: 4, reps: '6-8', note: 'Peito aberto e escápulas controladas' },
    { name: 'Remada curvada com barra', sets: 4, reps: '6-8', note: 'Sem roubar na lombar' },
    { name: 'Remada unilateral com halter', sets: 3, reps: '8-10', note: 'Controlar a fase de volta' },
    { name: 'Face pull', sets: 3, reps: '12-15', note: 'Cotovelos altos' },
    { name: 'Rosca direta com barra', sets: 3, reps: '8-10', note: 'Punho firme' },
  ]},
  { dayNumber: 2, dayName: 'Quarta — Peito', muscleGroups: ['Peito', 'Tríceps'], dayOfWeek: 3, exercises: [
    { name: 'Supino reto com barra', sets: 4, reps: '6-8', note: 'Base do treino de peito' },
    { name: 'Supino inclinado com halter', sets: 3, reps: '8-10', note: 'Controlar descida' },
    { name: 'Paralelas assistidas', sets: 3, reps: '8-10', note: 'Inclinação leve à frente' },
    { name: 'Tríceps testa com barra W', sets: 3, reps: '10-12', note: 'Cotovelo estável' },
  ]},
  { dayNumber: 3, dayName: 'Sexta — Perna', muscleGroups: ['Perna', 'Core'], dayOfWeek: 5, exercises: [
    { name: 'Agachamento livre', sets: 4, reps: '6-8', note: 'Aprender padrão de agachar' },
    { name: 'Levantamento terra romeno', sets: 4, reps: '8-10', note: 'Posterior e glúteo' },
    { name: 'Afundo com halter', sets: 3, reps: '10-12', note: 'Estabilidade' },
    { name: 'Panturrilha em pé', sets: 4, reps: '12-15', note: 'Pausa embaixo e em cima' },
    { name: 'Prancha', sets: 3, reps: '30-45s', note: 'Core para postura' },
  ]},
  { dayNumber: 4, dayName: 'Domingo — Full Body', muscleGroups: ['Full Body'], dayOfWeek: 0, exercises: [
    { name: 'Levantamento terra técnico', sets: 3, reps: '5', note: 'Leve para aprender padrão' },
    { name: 'Barra fixa assistida', sets: 3, reps: '8-10', note: 'Costas primeiro' },
    { name: 'Supino reto com barra', sets: 3, reps: '6-8', note: 'Repetir padrão básico' },
    { name: 'Agachamento goblet', sets: 3, reps: '8-10', note: 'Tronco alto' },
    { name: 'Farmer walk', sets: 2, reps: '30-40m', note: 'Core e postura' },
  ]},
];

const WEEK_DAYS = [
  { label: 'SEG', dow: 1 }, { label: 'TER', dow: 2 }, { label: 'QUA', dow: 3 },
  { label: 'QUI', dow: 4 }, { label: 'SEX', dow: 5 }, { label: 'SÁB', dow: 6 }, { label: 'DOM', dow: 0 },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function planDayToWorkout(d: any, idx: number) {
  return {
    dayNumber: idx + 1,
    dayName: d.dayName,
    muscleGroups: d.muscleGroups?.split(',').map((s: string) => s.trim()) ?? [],
    dayOfWeek: d.dayOfWeek,
    exercises: (d.exercises ?? []).map((e: any) => ({
      name: e.name, sets: e.sets, reps: e.reps, note: e.note,
    })),
  };
}

function calcStreak(logs: any[]): number {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let s = 0;
  for (const l of sorted) { if (l.workoutCompleted) s++; else break; }
  return s;
}

function calcWorkoutsLast7(logs: any[]): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return logs.filter(l => new Date(l.date) >= cutoff && l.workoutCompleted).length;
}

// Circular progress ring (border-based)
function RingProgress({ pct, size, color, strokeWidth, children }: {
  pct: number; size: number; color: string; strokeWidth: number; children?: React.ReactNode;
}) {
  const r = size / 2;
  const inner = size - strokeWidth * 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: r,
        borderWidth: strokeWidth, borderColor: 'rgba(255,255,255,0.08)',
      }} />
      {/* Fill — left half */}
      {pct > 0 && (
        <View style={{
          position: 'absolute', width: size, height: size,
          borderRadius: r, borderWidth: strokeWidth,
          borderColor: color,
          borderRightColor: pct < 50 ? 'transparent' : color,
          borderBottomColor: pct < 25 ? 'transparent' : color,
          transform: [{ rotate: `${-90 + (pct / 100) * 360}deg` }],
          opacity: 0,
        }} />
      )}
      {/* Simpler: thick arc using overflow clip */}
      <View style={{
        position: 'absolute', width: size, height: size,
        borderRadius: r,
        borderWidth: strokeWidth,
        borderTopColor: color,
        borderRightColor: pct >= 25 ? color : 'transparent',
        borderBottomColor: pct >= 50 ? color : 'transparent',
        borderLeftColor: pct >= 75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      {/* Inner circle cutout */}
      <View style={{
        width: inner, height: inner, borderRadius: inner / 2,
        backgroundColor: '#111827',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [homeData, setHomeData] = useState<any>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addMealModalVisible, setAddMealModalVisible] = useState(false);
  const [addMealByIngredientsModalVisible, setAddMealByIngredientsModalVisible] = useState(false);
  const [weeklyExpanded, setWeeklyExpanded] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);

  const todayDow = new Date().getDay();

  const fetchAll = async () => {
    try {
      setError(null);
      const [data, plan, logs] = await Promise.all([
        HomeService.getHomeData(),
        WorkoutPlanService.getMyPlan(),
        DailyLogService.getRecentLogs(14),
      ]);
      setHomeData(data);
      setWorkoutPlan(plan);
      setRecentLogs(logs ?? []);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const workouts = workoutPlan?.days?.length
    ? workoutPlan.days.slice().sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(planDayToWorkout)
    : DEFAULT_WORKOUTS;

  const todayWorkout = workouts.find(w => w.dayOfWeek === todayDow) ?? null;
  const isRestDay = !todayWorkout;

  if (isLoading) {
    return (
      <View style={S.loadScreen}>
        <View style={S.loadLogo}><Text style={S.loadLogoLetter}>G</Text></View>
        <Text style={S.loadWordmark}>FITNESS</Text>
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (error || !homeData) {
    return (
      <View style={S.loadScreen}>
        <MaterialCommunityIcons name="alert-circle-outline" size={52} color="#ef4444" />
        <Text style={{ color: '#fff', fontSize: 16, marginTop: 12 }}>{error ?? 'Sem dados'}</Text>
        <TouchableOpacity style={S.retryBtn} onPress={fetchAll}>
          <Text style={S.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const water = homeData.stats.waterIntake ?? 0;
  const waterGoal = homeData.userProfile?.waterGoal ?? 3.0;
  const waterPct = Math.min((water / waterGoal) * 100, 100);

  const meals = homeData.dailyLog?.meals ?? [];
  const todayKcal = homeData.stats.todayCalories ?? 0;
  const todayProtein = meals.reduce((s: number, m: any) => s + (m.protein ?? 0), 0);
  const todayCarbs = meals.reduce((s: number, m: any) => s + (m.carbs ?? 0), 0);
  const todayFat = meals.reduce((s: number, m: any) => s + (m.fat ?? 0), 0);

  const profile = homeData.userProfile;
  const kcalGoal = isRestDay ? (profile?.caloriesRestDay ?? 2100) : (profile?.caloriesTrainingDay ?? 2300);
  const kcalPct = Math.min((todayKcal / Math.max(kcalGoal, 1)) * 100, 100);
  const proteinGoal = profile?.proteinDaily ?? 180;
  const carbsGoal = isRestDay ? (profile?.carbsRestDay ?? 195) : (profile?.carbsTrainingDay ?? 245);
  const fatGoal = isRestDay ? (profile?.fatRestDay ?? 70) : (profile?.fatTrainingDay ?? 66);
  const weekBlock = profile?.WeekBlockNumber ?? 1;

  const workoutDone = homeData.stats.workoutCompleted ?? false;
  const currentWeight = homeData.stats.currentWeight;
  const streak = calcStreak(recentLogs);
  const workoutsLast7 = calcWorkoutsLast7(recentLogs);
  const firstName = authContext?.user?.name?.split(' ')[0] ?? '';

  const bodyFat: number | null = (() => {
    if (!profile?.currentWeight && !currentWeight) return null;
    const w = currentWeight ?? profile?.currentWeight;
    const h = profile?.height;
    const age = profile?.age;
    if (!w || !h || !age) return null;
    const bmi = w / Math.pow(h / 100, 2);
    const sex = profile?.gender === 'female' ? 0 : 1;
    return Math.max(2, Math.round(((1.2 * bmi) + (0.23 * age) - (10.8 * sex) - 5.4) * 10) / 10);
  })();

  return (
    <View style={S.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchAll(); }} tintColor="#fff" />
        }
      >
        {/* ══════════════════════════════════════════
            HERO — dark, full width, tall
        ══════════════════════════════════════════ */}
        <SafeAreaView style={S.hero} edges={['top']}>
          {/* Top bar */}
          <View style={S.topBar}>
            <View style={S.topLogo}>
              <View style={S.logoBox}><Text style={S.logoLetter}>G</Text></View>
              <Text style={S.logoWord}>FITNESS</Text>
            </View>
            <TouchableOpacity style={S.avatar} onPress={() => router.push('/(tabs)/profile')}>
              {homeData?.userProfile?.avatarUrl
                ? <Image source={{ uri: `${API_BASE_URL}${homeData.userProfile.avatarUrl}` }} style={S.avatarImg} />
                : <Text style={S.avatarLetter}>{authContext?.user?.name?.charAt(0).toUpperCase()}</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <View style={S.greetWrap}>
            <Text style={S.greetLabel}>{getGreeting()}</Text>
            <Text style={S.greetName}>{firstName} 👋</Text>
          </View>

          {/* GIANT stats */}
          <View style={S.heroStats}>
            <View style={S.heroStatBlock}>
              <View style={S.heroStatTop}>
                <MaterialCommunityIcons name="fire" size={18} color="#f97316" />
                <Text style={S.heroStatNum}>{streak}</Text>
              </View>
              <Text style={S.heroStatLbl}>dias seguidos</Text>
            </View>

            <View style={S.heroStatSep} />

            <View style={S.heroStatBlock}>
              <Text style={S.heroStatNum}>{workoutsLast7}</Text>
              <Text style={S.heroStatLbl}>treinos/sem</Text>
            </View>

            <View style={S.heroStatSep} />

            <View style={S.heroStatBlock}>
              <Text style={S.heroStatNum}>{currentWeight ?? '—'}</Text>
              <Text style={S.heroStatLbl}>kg atual</Text>
            </View>

            <View style={S.heroStatSep} />

            <View style={S.heroStatBlock}>
              <Text style={S.heroStatNum}>S{weekBlock}</Text>
              <Text style={S.heroStatLbl}>semana</Text>
            </View>
          </View>

          {/* Week day strip */}
          <View style={S.weekStrip}>
            {WEEK_DAYS.map(({ label, dow }) => {
              const hasW = workouts.some(w => w.dayOfWeek === dow);
              const isToday = dow === todayDow;
              return (
                <View key={dow} style={S.weekDay}>
                  <Text style={[S.weekDayLbl, isToday && S.weekDayLblActive]}>{label}</Text>
                  <View style={[
                    S.weekDayBar,
                    hasW && S.weekDayBarWorkout,
                    isToday && S.weekDayBarToday,
                  ]} />
                </View>
              );
            })}
          </View>
        </SafeAreaView>

        {/* ══════════════════════════════════════════
            WHITE CONTENT AREA
        ══════════════════════════════════════════ */}
        <View style={S.content}>

          {/* ── RINGS: Água + Kcal ── */}
          <View style={S.ringsRow}>
            {/* Água ring */}
            <View style={S.ringCard}>
              <RingProgress pct={waterPct} size={120} color="#38bdf8" strokeWidth={10}>
                <Text style={S.ringVal}>{water.toFixed(1)}</Text>
                <Text style={S.ringUnit}>L</Text>
              </RingProgress>
              <View style={S.ringMeta}>
                <View style={[S.ringDot, { backgroundColor: '#38bdf8' }]} />
                <Text style={S.ringLabel}>Água</Text>
                <Text style={S.ringGoal}>/ {waterGoal.toFixed(1)}L</Text>
              </View>
            </View>

            {/* Kcal ring */}
            <View style={S.ringCard}>
              <RingProgress pct={kcalPct} size={120} color="#f97316" strokeWidth={10}>
                <Text style={S.ringVal}>{Math.round(todayKcal)}</Text>
                <Text style={S.ringUnit}>kcal</Text>
              </RingProgress>
              <View style={S.ringMeta}>
                <View style={[S.ringDot, { backgroundColor: '#f97316' }]} />
                <Text style={S.ringLabel}>Calorias</Text>
                <Text style={S.ringGoal}>/ {kcalGoal}</Text>
              </View>
            </View>

            {/* Treino status */}
            <View style={S.ringCard}>
              <View style={[S.workoutRing, workoutDone && S.workoutRingDone]}>
                <MaterialCommunityIcons
                  name={workoutDone ? 'check-bold' : 'dumbbell'}
                  size={32}
                  color={workoutDone ? '#fff' : '#334155'}
                />
              </View>
              <View style={S.ringMeta}>
                <View style={[S.ringDot, { backgroundColor: workoutDone ? '#22c55e' : '#cbd5e1' }]} />
                <Text style={S.ringLabel}>Treino</Text>
                <Text style={S.ringGoal}>{workoutDone ? 'Feito' : 'Pendente'}</Text>
              </View>
            </View>
          </View>

          {/* ── CORPO: Peso + Gordura ── */}
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Composição Corporal</Text>
          </View>
          <View style={S.corpoRow}>
            <View style={S.corpoCard}>
              <MaterialCommunityIcons name="scale-bathroom" size={20} color="#6366f1" />
              <Text style={S.corpoNum}>{currentWeight ?? '—'}</Text>
              <Text style={S.corpoUnit}>kg</Text>
            </View>
            <View style={[S.corpoCard, S.corpoCardAccent]}>
              <MaterialCommunityIcons name="human" size={20} color="#f97316" />
              <Text style={[S.corpoNum, { color: '#fff' }]}>
                {bodyFat !== null ? `${(bodyFat as number).toFixed(1)}` : '—'}
              </Text>
              <Text style={[S.corpoUnit, { color: 'rgba(255,255,255,0.5)' }]}>% gordura</Text>
              <View style={S.comingSoon}><Text style={S.comingSoonText}>EM BREVE</Text></View>
            </View>
            <View style={S.corpoCard}>
              <MaterialCommunityIcons name="arm-flex-outline" size={20} color="#3b82f6" />
              <Text style={S.corpoNum}>{Math.round(todayProtein)}</Text>
              <Text style={S.corpoUnit}>g proteína</Text>
            </View>
          </View>

          {/* ── MACROS ── */}
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Nutrição</Text>
            <View style={[S.pill, isRestDay ? S.pillRest : S.pillTrain]}>
              <Text style={S.pillText}>{isRestDay ? 'DESCANSO' : 'TREINO'}</Text>
            </View>
          </View>
          <View style={S.macroCard}>
            {[
              { label: 'Calorias', current: todayKcal, goal: kcalGoal, unit: 'kcal', color: '#f97316' },
              { label: 'Proteína', current: todayProtein, goal: proteinGoal, unit: 'g', color: '#3b82f6' },
              { label: 'Carboidratos', current: todayCarbs, goal: carbsGoal, unit: 'g', color: '#8b5cf6' },
              { label: 'Gordura', current: todayFat, goal: fatGoal, unit: 'g', color: '#f59e0b' },
            ].map((m, i) => {
              const p = Math.min((m.current / Math.max(m.goal, 1)) * 100, 100);
              return (
                <View key={i} style={i > 0 ? S.macroRowBorder : S.macroRow}>
                  <View style={S.macroLeft}>
                    <Text style={S.macroLabel}>{m.label}</Text>
                    <View style={S.macroTrack}>
                      <View style={[S.macroFill, { width: `${p}%` as any, backgroundColor: m.color }]} />
                    </View>
                  </View>
                  <View style={S.macroRight}>
                    <Text style={[S.macroCurrent, { color: m.color }]}>{Math.round(m.current)}</Text>
                    <Text style={S.macroGoal}>/{Math.round(m.goal)}{m.unit}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── TREINO DE HOJE ── */}
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Treino de Hoje</Text>
          </View>
          {isRestDay ? (
            <View style={S.restCard}>
              <MaterialCommunityIcons name="sleep" size={36} color="#cbd5e1" />
              <Text style={S.restTitle}>Dia de Descanso</Text>
              <Text style={S.restSub}>Recuperação faz parte do processo</Text>
            </View>
          ) : todayWorkout && (
            <View style={{ marginBottom: 8 }}>
              <DailyWorkoutCard
                dayNumber={todayWorkout.dayNumber}
                dayName={todayWorkout.dayName}
                muscleGroups={todayWorkout.muscleGroups}
                exercises={todayWorkout.exercises}
                isToday
              />
            </View>
          )}

          {/* ── REGISTRO DO DIA ── */}
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Registro do Dia</Text>
          </View>
          <View style={S.registroCard}>
            <WorkoutCheckbox
              workoutCompleted={homeData.stats.workoutCompleted}
              workoutType={homeData.dailyLog?.workoutType}
              dayDescription={isRestDay ? 'Dia de descanso' : todayWorkout?.dayName}
              onWorkoutToggle={fetchAll}
            />
            <View style={S.registroDivider} />
            <WaterIntakeCheckbox waterGoal={waterGoal} currentIntake={water} onWaterToggle={fetchAll} />
            <View style={S.registroDivider} />
            <WeightInput currentWeight={homeData.stats.currentWeight} onWeightSaved={fetchAll} />
            <View style={S.registroDivider} />
            <DailyNotesInput initialNotes={homeData.stats.dailyNotes} onSaved={fetchAll} />
          </View>

          {/* ── REFEIÇÕES ── */}
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Refeições</Text>
            <View style={S.mealBtns}>
              <TouchableOpacity style={S.mealBtn} onPress={() => setAddMealModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={14} color="#fff" />
                <Text style={S.mealBtnTxt}>Manual</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.mealBtnOut} onPress={() => setAddMealByIngredientsModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={14} color="#0f172a" />
                <Text style={S.mealBtnOutTxt}>Ingredientes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {meals.length > 0
            ? meals.map((m: any, i: number) => (
                <MealCard
                  key={m.id || i}
                  mealName={m.mealName} calories={m.totalKcal}
                  protein={m.protein} carbs={m.carbs} fat={m.fat} items={m.items}
                  onPress={m.items?.length > 0 ? () => { setSelectedMeal(m); setModalVisible(true); } : undefined}
                />
              ))
            : (
              <View style={S.emptyMeals}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={32} color="#e2e8f0" />
                <Text style={S.emptyMealsText}>Nenhuma refeição registrada</Text>
              </View>
            )
          }

          {/* ── PLANO DA SEMANA ── */}
          <View style={S.sectionHeader}>
            <TouchableOpacity onPress={() => setWeeklyExpanded(v => !v)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={S.sectionTitle}>Plano da Semana</Text>
              <MaterialCommunityIcons name={weeklyExpanded ? 'chevron-down' : 'chevron-right'} size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={S.editBtn} onPress={() => setEditorVisible(true)}>
              <Text style={S.editBtnTxt}>Editar</Text>
            </TouchableOpacity>
          </View>

          {weeklyExpanded
            ? workouts.map(w => (
                <DailyWorkoutCard
                  key={w.dayNumber}
                  dayNumber={w.dayNumber} dayName={w.dayName}
                  muscleGroups={w.muscleGroups} exercises={w.exercises}
                  isToday={w.dayOfWeek === todayDow}
                />
              ))
            : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {workouts.map(w => (
                  <TouchableOpacity
                    key={w.dayNumber}
                    style={[S.planChip, w.dayOfWeek === todayDow && S.planChipToday]}
                    onPress={() => setWeeklyExpanded(true)}
                  >
                    <Text style={[S.planChipD, w.dayOfWeek === todayDow && S.planChipDToday]}>D{w.dayNumber}</Text>
                    <Text style={[S.planChipMuscle, w.dayOfWeek === todayDow && S.planChipMuscleToday]} numberOfLines={1}>
                      {w.muscleGroups[0]}
                    </Text>
                    <Text style={[S.planChipEx, w.dayOfWeek === todayDow && S.planChipExToday]}>{w.exercises.length} ex</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )
          }

          {/* ── METAS ── */}
          {profile && (
            <>
              <View style={S.sectionHeader}>
                <Text style={S.sectionTitle}>Metas</Text>
              </View>
              <View style={S.goalsGrid}>
                {[
                  { icon: 'fire', color: '#f97316', label: 'Treino', val: profile?.caloriesTrainingDay ?? '—', unit: 'kcal' },
                  { icon: 'sleep', color: '#6366f1', label: 'Descanso', val: profile?.caloriesRestDay ?? '—', unit: 'kcal' },
                  { icon: 'arm-flex-outline', color: '#3b82f6', label: 'Proteína', val: profile?.proteinDaily ?? '—', unit: 'g' },
                  { icon: 'water-outline', color: '#06b6d4', label: 'Água', val: profile?.waterGoal ?? '—', unit: 'L' },
                ].map(g => (
                  <View key={g.label} style={S.goalCard}>
                    <MaterialCommunityIcons name={g.icon as any} size={18} color={g.color} />
                    <Text style={S.goalVal}>{g.val}</Text>
                    <Text style={S.goalUnit}>{g.unit}</Text>
                    <Text style={S.goalLabel}>{g.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      {/* ── Modals ── */}
      {selectedMeal && (
        <MealDetailsModal
          visible={modalVisible} mealName={selectedMeal.mealName}
          items={selectedMeal.items ?? []} totalCalories={selectedMeal.totalKcal}
          totalProtein={selectedMeal.protein} totalCarbs={selectedMeal.carbs} totalFat={selectedMeal.fat}
          onClose={() => { setModalVisible(false); setTimeout(() => setSelectedMeal(null), 300); }}
        />
      )}
      <AddMealModal visible={addMealModalVisible} onClose={() => setAddMealModalVisible(false)} onMealAdded={fetchAll} isLoading={false} />
      <AddMealByIngredientsModal visible={addMealByIngredientsModalVisible} onClose={() => setAddMealByIngredientsModalVisible(false)} onMealAdded={fetchAll} />
      <WorkoutPlanEditorModal visible={editorVisible} plan={workoutPlan} onClose={() => setEditorVisible(false)} onSaved={() => { setEditorVisible(false); fetchAll(); }} />
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },

  // Loading
  loadScreen: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadLogo: { width: 64, height: 64, backgroundColor: '#fff', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  loadLogoLetter: { fontSize: 36, fontWeight: '900', color: '#111827' },
  loadWordmark: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 6 },
  retryBtn: { marginTop: 16, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 },
  retryText: { fontWeight: '800', color: '#111827', fontSize: 15 },

  // ── HERO ──
  hero: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginBottom: 28 },
  topLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 34, height: 34, backgroundColor: '#fff', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontSize: 20, fontWeight: '900', color: '#111827' },
  logoWord: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  avatarImg: { width: 40, height: 40 },
  avatarLetter: { color: '#fff', fontSize: 17, fontWeight: '700' },

  greetWrap: { marginBottom: 32 },
  greetLabel: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginBottom: 4 },
  greetName: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1 },

  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 24,
  },
  heroStatBlock: { flex: 1, alignItems: 'center', gap: 4 },
  heroStatTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroStatNum: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  heroStatLbl: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600', letterSpacing: 0.3 },
  heroStatSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', marginVertical: 4 },

  weekStrip: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { flex: 1, alignItems: 'center', gap: 6 },
  weekDayLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.2)', letterSpacing: 0.5 },
  weekDayLblActive: { color: '#fff' },
  weekDayBar: { height: 3, width: '70%', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  weekDayBarWorkout: { backgroundColor: 'rgba(255,255,255,0.25)' },
  weekDayBarToday: { backgroundColor: '#fff', height: 4 },

  // ── WHITE CONTENT ──
  content: {
    backgroundColor: '#f1f5f9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -8,
    paddingTop: 24,
    paddingHorizontal: 16,
  },

  // Rings
  ringsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  ringCard: {
    flex: 1, alignItems: 'center', gap: 10,
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingVertical: 20,
    marginHorizontal: 4,
  },
  ringVal: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  ringUnit: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  ringMeta: { alignItems: 'center', gap: 2 },
  ringDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
  ringLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  ringGoal: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  workoutRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 10, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  workoutRingDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3 },

  // Corpo
  corpoRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  corpoCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 18,
    paddingVertical: 20, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  corpoCardAccent: { backgroundColor: '#111827' },
  corpoNum: { fontSize: 30, fontWeight: '900', color: '#0f172a', letterSpacing: -1, marginTop: 6 },
  corpoUnit: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  comingSoon: { marginTop: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  comingSoonText: { fontSize: 8, color: 'rgba(255,255,255,0.5)', fontWeight: '800', letterSpacing: 1 },

  // Pills
  pill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  pillTrain: { backgroundColor: '#dcfce7' },
  pillRest: { backgroundColor: '#f1f5f9' },
  pillText: { fontSize: 9, fontWeight: '800', color: '#374151', letterSpacing: 0.8 },

  // Macros
  macroCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  macroRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  macroRowBorder: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderTopWidth: 1, borderTopColor: '#f8fafc' },
  macroLeft: { flex: 1, gap: 6 },
  macroLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase' },
  macroTrack: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: 4 },
  macroRight: { alignItems: 'flex-end', gap: 1 },
  macroCurrent: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  macroGoal: { fontSize: 11, color: '#94a3b8' },

  // Rest
  restCard: {
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 36,
    alignItems: 'center', gap: 8, marginBottom: 24,
    borderWidth: 2, borderColor: '#f1f5f9', borderStyle: 'dashed',
  },
  restTitle: { fontSize: 16, fontWeight: '700', color: '#475569', marginTop: 4 },
  restSub: { fontSize: 13, color: '#94a3b8' },

  // Registro
  registroCard: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  registroDivider: { height: 1, backgroundColor: '#f8fafc', marginHorizontal: 16 },

  // Refeições
  mealBtns: { flexDirection: 'row', gap: 6 },
  mealBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#111827', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  mealBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  mealBtnOut: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#111827', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  mealBtnOutTxt: { color: '#111827', fontSize: 12, fontWeight: '700' },
  emptyMeals: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 32, alignItems: 'center', gap: 10, marginBottom: 24 },
  emptyMealsText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },

  // Plano
  planChip: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14,
    marginRight: 8, alignItems: 'center', minWidth: 80, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  planChipToday: { backgroundColor: '#111827' },
  planChipD: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginBottom: 4 },
  planChipDToday: { color: 'rgba(255,255,255,0.4)' },
  planChipMuscle: { fontSize: 12, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  planChipMuscleToday: { color: '#fff' },
  planChipEx: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  planChipExToday: { color: 'rgba(255,255,255,0.35)' },
  editBtn: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnTxt: { fontSize: 12, color: '#475569', fontWeight: '700' },

  // Metas
  goalsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  goalCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', gap: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  goalVal: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 4 },
  goalUnit: { fontSize: 10, color: '#94a3b8' },
  goalLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
