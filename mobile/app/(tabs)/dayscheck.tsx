import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthContext } from '@/context/auth-context';
import { FontSizes, Spacing } from '@/constants/theme';
import { DailyCheckCard } from '@/components/dayscheck/daily-check-card';
import { ProgressionChartModal } from '@/components/dayscheck/progression-chart-modal';
import { DailyLogService } from '@/services/home-service';
import { ExportService } from '@/services/export-service';
import { DailyCheckInService } from '@/services/daily-checkin-service';

interface DailyCheckData {
  id?: string;
  date: string;
  weight?: number;
  workoutCompleted?: boolean;
  workoutType?: string;
  waterIntake?: number;
  waterGoal?: number;
  notes?: string;
  meals?: any[];
}

function calcStreak(data: DailyCheckData[]): number {
  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const day of sorted) {
    if (day.workoutCompleted) streak++;
    else break;
  }
  return streak;
}

function calcAvgWeight(data: DailyCheckData[]): string {
  const withWeight = data.filter(d => d.weight);
  if (!withWeight.length) return '—';
  const avg = withWeight.reduce((s, d) => s + (d.weight ?? 0), 0) / withWeight.length;
  return `${avg.toFixed(1)}`;
}

function calcWorkoutsLast7(data: DailyCheckData[]): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return data.filter(d => new Date(d.date + 'T00:00:00') >= cutoff && d.workoutCompleted).length;
}

function groupByMonth(data: DailyCheckData[]): { label: string; days: DailyCheckData[] }[] {
  const map: Record<string, DailyCheckData[]> = {};
  for (const day of data) {
    const d = new Date(day.date + 'T00:00:00');
    const key = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!map[key]) map[key] = [];
    map[key].push(day);
  }
  return Object.entries(map).map(([label, days]) => ({ label, days }));
}

export default function DaysCheckScreen() {
  useContext(AuthContext);
  const [dailyData, setDailyData] = useState<DailyCheckData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartModalVisible, setChartModalVisible] = useState(false);

  // Body fat placeholder — backend integration coming soon
  const bodyFat: number | null = null;

  useEffect(() => { fetchDailyData(); }, []);

  const fetchDailyData = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await DailyLogService.getRecentLogs(30);
      const transformed: DailyCheckData[] = response
        .map((log: any) => ({
          id: log.id,
          date: log.date.split('T')[0],
          weight: log.weight,
          workoutCompleted: log.workoutCompleted || false,
          workoutType: log.workoutType,
          waterIntake: log.waterIntake || 0,
          waterGoal: 3.0,
          notes: log.notes,
          meals: log.meals || [],
        }))
        .sort((a: DailyCheckData, b: DailyCheckData) => b.date.localeCompare(a.date));
      setDailyData(transformed);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    if (!dailyData.length) { Alert.alert('Aviso', 'Nenhum dado para exportar'); return; }
    try {
      const exportData = dailyData.slice(0, 7).map(d => ({
        date: d.date, weight: d.weight, workoutCompleted: d.workoutCompleted,
        workoutType: d.workoutType, waterIntake: d.waterIntake, waterGoal: 3.0,
        notes: d.notes, mealCount: d.meals?.length || 0,
      }));
      await ExportService.exportToExcel(exportData, `historico-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch {
      Alert.alert('Erro', 'Falha ao exportar. Verifique permissões.');
    }
  };

  const handleCheckIn = async () => {
    try {
      await DailyCheckInService.manualCheckIn();
      setTimeout(() => fetchDailyData(), 1000);
    } catch {
      Alert.alert('Erro', 'Falha ao registrar o dia');
    }
  };

  const handleDeleteToday = () => {
    Alert.alert('Remover hoje?', 'Isso vai apagar todos os dados de hoje.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          try {
            await DailyCheckInService.deleteTodayLog();
            setTimeout(() => fetchDailyData(), 800);
          } catch { Alert.alert('Erro', 'Falha ao remover'); }
        },
      },
    ]);
  };

  const streak = calcStreak(dailyData);
  const workoutsLast7 = calcWorkoutsLast7(dailyData);
  const avgWeight = calcAvgWeight(dailyData);
  const groups = groupByMonth(dailyData);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchDailyData(); }} tintColor="#000" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Histórico</Text>
            <Text style={styles.headerSub}>Últimos 30 dias</Text>
          </View>
          <TouchableOpacity style={styles.chartBtn} onPress={() => setChartModalVisible(true)} activeOpacity={0.8}>
            <MaterialCommunityIcons name="chart-line" size={16} color="#fff" />
            <Text style={styles.chartBtnText}>Gráficos</Text>
          </TouchableOpacity>
        </View>

        {/* ── Weekly Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Semana atual</Text>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="fire" size={12} color="#f97316" />
              <Text style={styles.heroBadgeText}>{streak} dias seguidos</Text>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{workoutsLast7}</Text>
              <Text style={styles.heroStatLabel}>Treinos</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{avgWeight}</Text>
              <Text style={styles.heroStatLabel}>Peso médio (kg)</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{dailyData.length}</Text>
              <Text style={styles.heroStatLabel}>Dias registrados</Text>
            </View>
          </View>
        </View>

        {/* ── Body Fat Card ── */}
        <View style={styles.bodyFatCard}>
          <View style={styles.bodyFatLeft}>
            <View style={styles.bodyFatIconWrap}>
              <MaterialCommunityIcons name="human" size={20} color="#6366f1" />
            </View>
            <View>
              <Text style={styles.bodyFatTitle}>Gordura Corporal</Text>
              <Text style={styles.bodyFatSub}>Percentual de gordura</Text>
            </View>
          </View>

          <View style={styles.bodyFatRight}>
            {bodyFat !== null ? (
              <>
                <Text style={styles.bodyFatValue}>{(bodyFat as number).toFixed(1)}</Text>
                <Text style={styles.bodyFatUnit}>%</Text>
              </>
            ) : (
              <View style={styles.bodyFatEmpty}>
                <Text style={styles.bodyFatDash}>—</Text>
                <Text style={styles.bodyFatComing}>Em breve</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleExport} activeOpacity={0.8}>
            <MaterialCommunityIcons name="download-outline" size={18} color="#0f172a" />
            <Text style={styles.actionBtnText}>Exportar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCheckIn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="check-circle-outline" size={18} color="#0f172a" />
            <Text style={styles.actionBtnText}>Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleDeleteToday} activeOpacity={0.8}>
            <MaterialCommunityIcons name="delete-outline" size={18} color="#ef4444" />
            <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>Remover</Text>
          </TouchableOpacity>
        </View>

        {/* ── Error ── */}
        {error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDailyData}>
              <Text style={styles.errorRetry}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Section Title ── */}
        {dailyData.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dias registrados</Text>
          </View>
        )}

        {/* ── Days List ── */}
        {dailyData.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>Nenhum dado ainda</Text>
            <Text style={styles.emptySub}>Comece registrando seu primeiro dia</Text>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.label} style={styles.monthGroup}>
              <View style={styles.monthHeader}>
                <Text style={styles.monthLabel}>
                  {group.label.charAt(0).toUpperCase() + group.label.slice(1)}
                </Text>
                <View style={styles.monthCountBadge}>
                  <Text style={styles.monthCount}>{group.days.length}</Text>
                </View>
              </View>
              {group.days.map((day, i) => (
                <DailyCheckCard
                  key={`${day.date}-${i}`}
                  date={day.date}
                  weight={day.weight}
                  workoutCompleted={day.workoutCompleted}
                  workoutType={day.workoutType}
                  waterIntake={day.waterIntake}
                  waterGoal={3.0}
                  notes={day.notes}
                  mealCount={day.meals?.length || 0}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <ProgressionChartModal
        visible={chartModalVisible}
        data={dailyData}
        onClose={() => setChartModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSizes.sm, color: '#94a3b8' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: '#f8fafc',
  },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  headerSub: { fontSize: FontSizes.xs, color: '#94a3b8', marginTop: 1 },
  chartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chartBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },

  // Hero Card
  heroCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroLabel: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249,115,22,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: { fontSize: 11, color: '#f97316', fontWeight: '700' },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginTop: 2, textAlign: 'center' },
  heroStatDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.08)' },

  // Body Fat Card
  bodyFatCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bodyFatLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bodyFatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyFatTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#0f172a' },
  bodyFatSub: { fontSize: FontSizes.xs, color: '#94a3b8', marginTop: 1 },
  bodyFatRight: { alignItems: 'flex-end' },
  bodyFatValue: { fontSize: 28, fontWeight: '900', color: '#6366f1', letterSpacing: -1 },
  bodyFatUnit: { fontSize: FontSizes.xs, color: '#94a3b8', fontWeight: '600' },
  bodyFatEmpty: { alignItems: 'center' },
  bodyFatDash: { fontSize: 22, fontWeight: '800', color: '#cbd5e1' },
  bodyFatComing: { fontSize: 9, color: '#94a3b8', fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  actionBtnDanger: { borderColor: '#fee2e2', backgroundColor: '#fff5f5' },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  actionBtnTextDanger: { color: '#ef4444' },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  errorText: { flex: 1, fontSize: FontSizes.xs, color: '#dc2626', fontWeight: '600' },
  errorRetry: { fontSize: FontSizes.xs, color: '#dc2626', fontWeight: '700', textDecorationLine: 'underline' },

  // Section
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: '#0f172a' },

  // Empty
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSizes.md, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  emptySub: { fontSize: FontSizes.sm, color: '#94a3b8', textAlign: 'center' },

  // Month groups
  monthGroup: { marginBottom: 20 },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  monthLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 },
  monthCountBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  monthCount: { fontSize: 11, color: '#64748b', fontWeight: '700' },
});
