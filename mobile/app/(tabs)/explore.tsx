import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { UserProfileService } from '@/services/user-profile-service';
import { DailyLogService } from '@/services/home-service';

function calcBMI(weight?: number, height?: number): number | null {
  if (!weight || !height) return null;
  return weight / Math.pow(height / 100, 2);
}

function calcBodyFat(weight?: number, height?: number, age?: number, gender?: string): number | null {
  if (!weight || !height || !age) return null;
  const bmi = calcBMI(weight, height);
  if (!bmi) return null;
  const sexFactor = gender === 'female' ? 0 : 1;
  return Math.max(2, Math.round(((1.2 * bmi) + (0.23 * age) - (10.8 * sexFactor) - 5.4) * 10) / 10);
}

function bfCategory(bf: number, gender?: string): { label: string; color: string; pct: number } {
  const isMale = gender !== 'female';
  const max = isMale ? 35 : 42;
  const pct = Math.min(bf / max * 100, 100);
  if (isMale) {
    if (bf < 6)  return { label: 'Essencial', color: '#f59e0b', pct };
    if (bf < 14) return { label: 'Atleta',    color: '#22c55e', pct };
    if (bf < 18) return { label: 'Fitness',   color: '#3b82f6', pct };
    if (bf < 25) return { label: 'Aceitável', color: '#f97316', pct };
    return { label: 'Acima do ideal', color: '#ef4444', pct };
  }
  if (bf < 14) return { label: 'Essencial', color: '#f59e0b', pct };
  if (bf < 21) return { label: 'Atleta',    color: '#22c55e', pct };
  if (bf < 25) return { label: 'Fitness',   color: '#3b82f6', pct };
  if (bf < 32) return { label: 'Aceitável', color: '#f97316', pct };
  return { label: 'Acima do ideal', color: '#ef4444', pct };
}

function bmiCategory(bmi: number): { label: string; color: string; pct: number } {
  const pct = Math.min((bmi / 40) * 100, 100);
  if (bmi < 18.5) return { label: 'Abaixo do peso', color: '#f59e0b', pct };
  if (bmi < 25)   return { label: 'Peso normal',    color: '#22c55e', pct };
  if (bmi < 30)   return { label: 'Sobrepeso',      color: '#f97316', pct };
  return { label: 'Obesidade', color: '#ef4444', pct };
}

function calcStreak(logs: any[]): number {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let s = 0;
  for (const l of sorted) { if (l.workoutCompleted) s++; else break; }
  return s;
}

export default function AnaliseScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [p, l] = await Promise.all([
        UserProfileService.getUserProfile(),
        DailyLogService.getRecentLogs(30),
      ]);
      setProfile(p);
      setLogs(l ?? []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return <View style={S.loadScreen}><ActivityIndicator color="#fff" size="large" /></View>;
  }

  const bmi = calcBMI(profile?.currentWeight, profile?.height);
  const bodyFat = calcBodyFat(profile?.currentWeight, profile?.height, profile?.age, profile?.gender);
  const bmiCat = bmi ? bmiCategory(bmi) : null;
  const bfCat = bodyFat !== null ? bfCategory(bodyFat!, profile?.gender) : null;

  const streak = calcStreak(logs);
  const workoutsLast30 = logs.filter(l => l.workoutCompleted).length;
  const workoutsLast7 = logs.filter(l => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return new Date(l.date) >= cutoff && l.workoutCompleted;
  }).length;
  const weightsWithData = logs.filter(l => l.weight);
  const avgWeight = weightsWithData.length
    ? weightsWithData.reduce((s, l) => s + l.weight, 0) / weightsWithData.length
    : null;
  const totalMeals = logs.reduce((s, l) => s + (l.meals?.length || 0), 0);
  const avgWater = logs.length
    ? logs.reduce((s, l) => s + (l.waterIntake || 0), 0) / logs.length
    : 0;

  const hasBodyData = profile?.height && profile?.age && profile?.currentWeight;

  return (
    <View style={S.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#fff" />}
      >
        {/* ── HERO ── */}
        <SafeAreaView style={S.hero} edges={['top']}>
          <View style={S.heroTopBar}>
            <View>
              <Text style={S.heroTitle}>Análise</Text>
              <Text style={S.heroSub}>Últimos 30 dias</Text>
            </View>
            <View style={S.heroBadge}>
              <MaterialCommunityIcons name="fire" size={13} color="#f97316" />
              <Text style={S.heroBadgeText}>{streak} dias</Text>
            </View>
          </View>
          <View style={S.heroGrid}>
            {[
              { val: `${workoutsLast7}`, lbl: 'treinos\nesta semana' },
              { val: `${workoutsLast30}`, lbl: 'treinos\neste mês' },
              { val: avgWeight ? avgWeight.toFixed(1) : '—', lbl: 'peso\nmédio (kg)' },
              { val: avgWater.toFixed(1), lbl: 'água\nmédia (L)' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={S.heroStatDiv} />}
                <View style={S.heroStat}>
                  <Text style={S.heroStatNum}>{s.val}</Text>
                  <Text style={S.heroStatLbl}>{s.lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </SafeAreaView>

        <View style={S.content}>

          {/* ── COMPOSIÇÃO CORPORAL ── */}
          <Text style={S.sectionTitle}>Composição Corporal</Text>

          {!hasBodyData ? (
            <View style={S.missingCard}>
              <MaterialCommunityIcons name="account-edit-outline" size={32} color="#6366f1" />
              <Text style={S.missingTitle}>Dados incompletos</Text>
              <Text style={S.missingText}>Adicione peso, altura e idade no seu Perfil para ver a análise de composição corporal.</Text>
            </View>
          ) : (
            <>
              {/* Body fat */}
              <View style={S.bfCard}>
                <View style={S.bfCardLeft}>
                  <MaterialCommunityIcons name="human" size={36} color="#f97316" />
                  <View>
                    <Text style={S.bfLabel}>Gordura Corporal</Text>
                    <Text style={S.bfMethod}>Fórmula de Deurenberg</Text>
                  </View>
                </View>
                <View style={S.bfCardRight}>
                  <Text style={S.bfValue}>{bodyFat !== null ? `${bodyFat}` : '—'}</Text>
                  <Text style={S.bfUnit}>%</Text>
                </View>
              </View>
              {bfCat && (
                <>
                  <View style={S.barTrack}><View style={[S.barFill, { width: `${bfCat.pct}%` as any, backgroundColor: bfCat.color }]} /></View>
                  <View style={S.barLabels}>
                    <Text style={[S.catChip, { color: bfCat.color }]}>{bfCat.label}</Text>
                    <Text style={S.barHint}>{profile?.gender === 'female' ? 'Ref. feminina' : 'Ref. masculina'}</Text>
                  </View>
                </>
              )}

              {/* Tabela referência */}
              <View style={S.refCard}>
                <Text style={S.refTitle}>Tabela de Referência ({profile?.gender === 'female' ? 'Feminino' : 'Masculino'})</Text>
                {(profile?.gender === 'female'
                  ? [['Essencial','10–13%','#f59e0b'],['Atleta','14–20%','#22c55e'],['Fitness','21–24%','#3b82f6'],['Aceitável','25–31%','#f97316'],['Acima','32%+','#ef4444']]
                  : [['Essencial','2–5%','#f59e0b'],['Atleta','6–13%','#22c55e'],['Fitness','14–17%','#3b82f6'],['Aceitável','18–24%','#f97316'],['Acima','25%+','#ef4444']]
                ).map(([lbl, range, color]) => (
                  <View key={lbl} style={S.refRow}>
                    <View style={[S.refDot, { backgroundColor: color as string }]} />
                    <Text style={S.refLabel}>{lbl}</Text>
                    <Text style={S.refRange}>{range}</Text>
                  </View>
                ))}
              </View>

              {/* IMC */}
              <View style={S.bfCard}>
                <View style={S.bfCardLeft}>
                  <MaterialCommunityIcons name="calculator-variant-outline" size={36} color="#3b82f6" />
                  <View>
                    <Text style={S.bfLabel}>IMC</Text>
                    <Text style={S.bfMethod}>Índice de Massa Corporal</Text>
                  </View>
                </View>
                <View style={S.bfCardRight}>
                  <Text style={[S.bfValue, { color: bmiCat?.color ?? '#0f172a' }]}>{bmi?.toFixed(1) ?? '—'}</Text>
                </View>
              </View>
              {bmiCat && (
                <>
                  <View style={S.barTrack}><View style={[S.barFill, { width: `${bmiCat.pct}%` as any, backgroundColor: bmiCat.color }]} /></View>
                  <View style={S.barLabels}>
                    <Text style={[S.catChip, { color: bmiCat.color }]}>{bmiCat.label}</Text>
                    <Text style={S.barHint}>Normal: 18.5–24.9</Text>
                  </View>
                </>
              )}
            </>
          )}

          {/* ── PROGRESSO ── */}
          <Text style={S.sectionTitle}>Progresso de Treinos</Text>
          <View style={S.statsGrid}>
            {[
              { icon: 'fire', color: '#f97316', val: `${streak}`, lbl: 'Sequência atual' },
              { icon: 'dumbbell', color: '#6366f1', val: `${workoutsLast7}/7`, lbl: 'Treinos esta semana' },
              { icon: 'calendar-month-outline', color: '#3b82f6', val: `${workoutsLast30}`, lbl: 'Treinos este mês' },
              { icon: 'silverware-fork-knife', color: '#22c55e', val: `${totalMeals}`, lbl: 'Refeições registradas' },
            ].map(s => (
              <View key={s.lbl} style={S.statCard}>
                <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
                <Text style={S.statVal}>{s.val}</Text>
                <Text style={S.statLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>

          {/* ── SPARKLINE (últimos 14 dias) ── */}
          <Text style={S.sectionTitle}>Últimos 14 dias</Text>
          <View style={S.sparkCard}>
            {logs.slice(0, 14).reverse().map((l, i) => {
              const d = new Date(l.date + 'T00:00:00');
              const dayLbl = d.toLocaleDateString('pt-BR', { weekday: 'short' }).charAt(0).toUpperCase();
              return (
                <View key={i} style={S.sparkCol}>
                  <View style={[S.sparkBar, { backgroundColor: l.workoutCompleted ? '#22c55e' : '#f1f5f9', height: l.workoutCompleted ? 36 : 10 }]} />
                  <Text style={S.sparkLbl}>{dayLbl}</Text>
                </View>
              );
            })}
          </View>
          <View style={S.sparkLegend}>
            <View style={[S.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={S.legendText}>Treino realizado</Text>
            <View style={[S.legendDot, { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' }]} />
            <Text style={S.legendText}>Sem treino</Text>
          </View>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },
  loadScreen: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  hero: { backgroundColor: '#111827', paddingHorizontal: 20, paddingBottom: 28, paddingTop: 8 },
  heroTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(249,115,22,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  heroBadgeText: { fontSize: 13, fontWeight: '700', color: '#f97316' },
  heroGrid: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, paddingVertical: 16 },
  heroStat: { flex: 1, alignItems: 'center', gap: 4 },
  heroStatNum: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroStatLbl: { fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: '600', textAlign: 'center', lineHeight: 13 },
  heroStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', marginVertical: 4 },
  content: { backgroundColor: '#f1f5f9', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -8, paddingTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12, paddingHorizontal: 4 },
  missingCard: { backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', gap: 10, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  missingTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  missingText: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 19 },
  bfCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  bfCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bfLabel: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  bfMethod: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  bfCardRight: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  bfValue: { fontSize: 36, fontWeight: '900', color: '#f97316', letterSpacing: -1 },
  bfUnit: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  barTrack: { height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', borderRadius: 5 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  catChip: { fontSize: 13, fontWeight: '800' },
  barHint: { fontSize: 11, color: '#94a3b8' },
  refCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, gap: 10 },
  refTitle: { fontSize: 13, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  refDot: { width: 10, height: 10, borderRadius: 5 },
  refLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#334155' },
  refRange: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { width: '47.5%', backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statVal: { fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  statLbl: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  sparkCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sparkCol: { alignItems: 'center', gap: 6, flex: 1 },
  sparkBar: { width: 10, borderRadius: 5 },
  sparkLbl: { fontSize: 9, color: '#94a3b8', fontWeight: '700' },
  sparkLegend: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, marginBottom: 24 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#94a3b8', fontWeight: '500', marginRight: 8 },
});
