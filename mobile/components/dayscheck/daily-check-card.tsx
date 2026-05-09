import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FontSizes, Spacing } from '@/constants/theme';

interface DailyCheckCardProps {
  date: string;
  weight?: number;
  workoutCompleted?: boolean;
  workoutType?: string;
  waterIntake?: number;
  waterGoal?: number;
  notes?: string;
  mealCount?: number;
}

export function DailyCheckCard({
  date,
  weight,
  workoutCompleted = false,
  workoutType,
  waterIntake = 0,
  waterGoal = 3.0,
  notes,
  mealCount = 0,
}: DailyCheckCardProps) {
  const [expanded, setExpanded] = useState(false);

  const dateObj = new Date(date + 'T00:00:00');
  const isToday = new Date().toISOString().split('T')[0] === date;
  const waterPct = Math.min((waterIntake / waterGoal) * 100, 100);

  const dayShort = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const dayNum = dateObj.getDate();
  const monthShort = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

  const getAccentColor = () => {
    if (workoutCompleted && waterPct >= 80) return '#22c55e';
    if (workoutCompleted) return '#3b82f6';
    if (waterPct >= 80) return '#6366f1';
    if (waterPct >= 40 || mealCount > 0) return '#f59e0b';
    return '#e2e8f0';
  };

  const accentColor = getAccentColor();
  const hasData = workoutCompleted || waterIntake > 0 || mealCount > 0 || !!weight;

  return (
    <TouchableOpacity
      style={[styles.card, isToday && styles.cardToday]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.75}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* ── Compact Row ── */}
        <View style={styles.compactRow}>
          {/* Date block */}
          <View style={[styles.dateBlock, isToday && styles.dateBlockToday]}>
            <Text style={[styles.dayShort, isToday && styles.dayShortToday]}>{dayShort}</Text>
            <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{dayNum}</Text>
            <Text style={[styles.monthShort, isToday && styles.monthShortToday]}>{monthShort}</Text>
          </View>

          {/* Chips */}
          <View style={styles.chipsRow}>
            {/* Weight */}
            <View style={styles.chip}>
              <MaterialCommunityIcons name="scale-bathroom" size={12} color="#64748b" />
              <Text style={styles.chipVal}>{weight ? `${weight.toFixed(1)}kg` : '—'}</Text>
            </View>

            {/* Workout */}
            <View style={[styles.chip, workoutCompleted && styles.chipDone]}>
              <MaterialCommunityIcons
                name={workoutCompleted ? 'check-circle' : 'circle-outline'}
                size={12}
                color={workoutCompleted ? '#16a34a' : '#94a3b8'}
              />
              <Text style={[styles.chipVal, workoutCompleted && styles.chipValDone]}>
                {workoutCompleted ? 'Feito' : 'Treino'}
              </Text>
            </View>

            {/* Water */}
            <View style={[styles.chip, waterPct >= 100 && styles.chipDone]}>
              <MaterialCommunityIcons
                name="water-outline"
                size={12}
                color={waterPct >= 100 ? '#16a34a' : '#64748b'}
              />
              <Text style={[styles.chipVal, waterPct >= 100 && styles.chipValDone]}>
                {waterPct.toFixed(0)}%
              </Text>
            </View>

            {/* Meals */}
            {mealCount > 0 && (
              <View style={styles.chip}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={12} color="#64748b" />
                <Text style={styles.chipVal}>{mealCount}</Text>
              </View>
            )}
          </View>

          {/* Chevron */}
          <MaterialCommunityIcons
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={20}
            color="#cbd5e1"
          />
        </View>

        {/* No data placeholder */}
        {!hasData && !expanded && (
          <Text style={styles.noData}>Sem registros neste dia</Text>
        )}

        {/* ── Expanded Details ── */}
        {expanded && (
          <View style={styles.details}>
            <View style={styles.divider} />

            {/* Workout */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TREINO</Text>
              <View style={styles.detailRight}>
                <MaterialCommunityIcons
                  name={workoutCompleted ? 'check-circle' : 'close-circle-outline'}
                  size={14}
                  color={workoutCompleted ? '#22c55e' : '#cbd5e1'}
                />
                <Text style={[styles.detailValue, !workoutCompleted && styles.detailValueMuted]}>
                  {workoutCompleted ? (workoutType || 'Concluído') : 'Não realizado'}
                </Text>
              </View>
            </View>

            {/* Meals */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>REFEIÇÕES</Text>
              <Text style={styles.detailValue}>
                {mealCount > 0 ? `${mealCount} registradas` : 'Nenhuma'}
              </Text>
            </View>

            {/* Water progress */}
            <View style={styles.waterBlock}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ÁGUA</Text>
                <Text style={[styles.detailValue, { color: waterPct >= 100 ? '#22c55e' : '#64748b' }]}>
                  {waterIntake.toFixed(1)}L / {waterGoal.toFixed(1)}L
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${waterPct}%` as any,
                      backgroundColor: waterPct >= 100 ? '#22c55e' : waterPct >= 70 ? '#3b82f6' : '#f59e0b',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Notes */}
            {notes && (
              <View style={styles.notesBox}>
                <View style={styles.notesHeader}>
                  <MaterialCommunityIcons name="note-text-outline" size={13} color="#92400e" />
                  <Text style={styles.notesLabel}>Observações</Text>
                </View>
                <Text style={styles.notesText}>{notes}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardToday: {
    borderColor: '#0f172a',
    borderWidth: 1.5,
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateBlock: {
    width: 38,
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  dateBlockToday: { backgroundColor: '#0f172a' },
  dayShort: { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5 },
  dayShortToday: { color: 'rgba(255,255,255,0.55)' },
  dayNum: { fontSize: FontSizes.lg, fontWeight: '800', color: '#0f172a', lineHeight: 22 },
  dayNumToday: { color: '#fff' },
  monthShort: { fontSize: 9, color: '#94a3b8', textTransform: 'capitalize', fontWeight: '500' },
  monthShortToday: { color: 'rgba(255,255,255,0.45)' },

  chipsRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  chipDone: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  chipVal: { fontSize: 11, fontWeight: '700', color: '#475569' },
  chipValDone: { color: '#16a34a' },

  noData: {
    fontSize: FontSizes.xs,
    color: '#cbd5e1',
    fontStyle: 'italic',
    marginTop: 4,
    paddingLeft: 46,
  },

  // Expanded
  details: { marginTop: Spacing.sm },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 10 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8 },
  detailValue: { fontSize: FontSizes.sm, fontWeight: '600', color: '#0f172a' },
  detailValueMuted: { color: '#94a3b8', fontWeight: '400' },
  waterBlock: { marginBottom: 8 },
  progressTrack: { height: 5, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  notesBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
    marginTop: 4,
    gap: 4,
  },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notesLabel: { fontSize: 11, fontWeight: '700', color: '#92400e' },
  notesText: { fontSize: FontSizes.xs, color: '#78350f', lineHeight: 17 },
});
