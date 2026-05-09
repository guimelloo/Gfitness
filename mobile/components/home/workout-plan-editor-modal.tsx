import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSizes, Spacing } from '@/constants/theme';
import { WorkoutPlanService, WorkoutPlan, WorkoutPlanDay } from '@/services/workout-plan-service';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface ExerciseForm {
  name: string;
  sets: string;
  reps: string;
  note: string;
}

interface DayForm {
  id?: string;
  dayOfWeek: number;
  dayName: string;
  muscleGroups: string;
  exercises: ExerciseForm[];
}

interface Props {
  visible: boolean;
  plan: WorkoutPlan | null;
  onClose: () => void;
  onSaved: () => void;
}

export function WorkoutPlanEditorModal({ visible, plan, onClose, onSaved }: Props) {
  const [days, setDays] = useState<DayForm[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setDays(plan.days.map(d => ({
        id: d.id,
        dayOfWeek: d.dayOfWeek,
        dayName: d.dayName,
        muscleGroups: d.muscleGroups,
        exercises: d.exercises.map(e => ({ name: e.name, sets: String(e.sets), reps: e.reps, note: e.note ?? '' })),
      })));
    } else {
      setDays([]);
    }
    setSelectedDayIdx(null);
  }, [plan, visible]);

  const addDay = () => {
    const usedDays = days.map(d => d.dayOfWeek);
    const nextDay = [1, 3, 5, 0, 2, 4, 6].find(d => !usedDays.includes(d)) ?? 1;
    const newDay: DayForm = {
      dayOfWeek: nextDay,
      dayName: DAY_FULL[nextDay],
      muscleGroups: '',
      exercises: [{ name: '', sets: '3', reps: '10-12', note: '' }],
    };
    const newDays = [...days, newDay];
    setDays(newDays);
    setSelectedDayIdx(newDays.length - 1);
  };

  const removeDay = (idx: number) => {
    Alert.alert('Remover dia', 'Tem certeza?', [
      { text: 'Cancelar' },
      {
        text: 'Remover', style: 'destructive', onPress: () => {
          const newDays = days.filter((_, i) => i !== idx);
          setDays(newDays);
          setSelectedDayIdx(null);
        },
      },
    ]);
  };

  const updateDay = (idx: number, field: keyof DayForm, value: any) => {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const addExercise = (dayIdx: number) => {
    setDays(prev => prev.map((d, i) => i === dayIdx
      ? { ...d, exercises: [...d.exercises, { name: '', sets: '3', reps: '10-12', note: '' }] }
      : d
    ));
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setDays(prev => prev.map((d, i) => i === dayIdx
      ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) }
      : d
    ));
  };

  const updateExercise = (dayIdx: number, exIdx: number, field: keyof ExerciseForm, value: string) => {
    setDays(prev => prev.map((d, i) => i === dayIdx
      ? { ...d, exercises: d.exercises.map((e, ei) => ei === exIdx ? { ...e, [field]: value } : e) }
      : d
    ));
  };

  const handleSave = async () => {
    for (const d of days) {
      if (!d.dayName.trim()) { Alert.alert('Erro', 'Nome do dia é obrigatório'); return; }
      for (const e of d.exercises) {
        if (!e.name.trim()) { Alert.alert('Erro', 'Nome do exercício é obrigatório'); return; }
      }
    }

    setIsSaving(true);
    try {
      await WorkoutPlanService.upsertPlan(days.map(d => ({
        dayOfWeek: d.dayOfWeek,
        dayName: d.dayName,
        muscleGroups: d.muscleGroups,
        exercises: d.exercises
          .filter(e => e.name.trim())
          .map((e, i) => ({ name: e.name, sets: parseInt(e.sets) || 3, reps: e.reps, note: e.note || undefined, order: i })),
      })));
      onSaved();
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o plano');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedDay = selectedDayIdx !== null ? days[selectedDayIdx] : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Plano</Text>
          <TouchableOpacity onPress={handleSave} style={[styles.headerBtn, styles.saveBtn]} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Salvar</Text>}
          </TouchableOpacity>
        </View>

        {selectedDay !== null && selectedDayIdx !== null ? (
          // ── Exercise editor for selected day ──
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.section}>
              <TouchableOpacity onPress={() => setSelectedDayIdx(null)} style={styles.backBtn}>
                <Text style={styles.backBtnText}>‹ Voltar aos dias</Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <Text style={styles.label}>Dia da semana</Text>
                <View style={styles.dayPicker}>
                  {DAY_LABELS.map((l, dow) => (
                    <TouchableOpacity
                      key={dow}
                      style={[styles.dayChip, selectedDay.dayOfWeek === dow && styles.dayChipActive]}
                      onPress={() => updateDay(selectedDayIdx, 'dayOfWeek', dow)}
                    >
                      <Text style={[styles.dayChipText, selectedDay.dayOfWeek === dow && styles.dayChipTextActive]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Nome do dia</Text>
                <TextInput
                  style={styles.input}
                  value={selectedDay.dayName}
                  onChangeText={v => updateDay(selectedDayIdx, 'dayName', v)}
                  placeholder="Ex: Segunda - Costas"
                  placeholderTextColor="#bbb"
                />
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Grupos musculares</Text>
                <TextInput
                  style={styles.input}
                  value={selectedDay.muscleGroups}
                  onChangeText={v => updateDay(selectedDayIdx, 'muscleGroups', v)}
                  placeholder="Ex: Costas, Bíceps"
                  placeholderTextColor="#bbb"
                />
              </View>

              <View style={styles.exHeader}>
                <Text style={styles.sectionTitle}>Exercícios</Text>
                <TouchableOpacity style={styles.addExBtn} onPress={() => addExercise(selectedDayIdx)}>
                  <Text style={styles.addExBtnText}>+ Adicionar</Text>
                </TouchableOpacity>
              </View>

              {selectedDay.exercises.map((ex, ei) => (
                <View key={ei} style={styles.exCard}>
                  <View style={styles.exCardHeader}>
                    <Text style={styles.exNum}>{ei + 1}</Text>
                    <TouchableOpacity onPress={() => removeExercise(selectedDayIdx, ei)}>
                      <Text style={styles.removeEx}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.input}
                    value={ex.name}
                    onChangeText={v => updateExercise(selectedDayIdx, ei, 'name', v)}
                    placeholder="Nome do exercício"
                    placeholderTextColor="#bbb"
                  />

                  <View style={styles.setsRepsRow}>
                    <View style={styles.setsRepsField}>
                      <Text style={styles.subLabel}>Séries</Text>
                      <TextInput
                        style={[styles.input, styles.inputSmall]}
                        value={ex.sets}
                        onChangeText={v => updateExercise(selectedDayIdx, ei, 'sets', v)}
                        keyboardType="numeric"
                        placeholder="3"
                        placeholderTextColor="#bbb"
                      />
                    </View>
                    <View style={styles.setsRepsField}>
                      <Text style={styles.subLabel}>Repetições</Text>
                      <TextInput
                        style={[styles.input, styles.inputSmall]}
                        value={ex.reps}
                        onChangeText={v => updateExercise(selectedDayIdx, ei, 'reps', v)}
                        placeholder="10-12"
                        placeholderTextColor="#bbb"
                      />
                    </View>
                  </View>

                  <TextInput
                    style={styles.input}
                    value={ex.note}
                    onChangeText={v => updateExercise(selectedDayIdx, ei, 'note', v)}
                    placeholder="Observação (opcional)"
                    placeholderTextColor="#bbb"
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.removeDayBtn} onPress={() => { setSelectedDayIdx(null); removeDay(selectedDayIdx); }}>
                <Text style={styles.removeDayBtnText}>Remover este dia</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          // ── Day list ──
          <ScrollView style={styles.scroll}>
            <View style={styles.section}>
              <Text style={styles.sectionSub}>Toque em um dia para editar seus exercícios</Text>
              {days.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((d, i) => (
                <TouchableOpacity key={i} style={styles.dayRow} onPress={() => setSelectedDayIdx(i)}>
                  <View style={styles.dayRowLeft}>
                    <View style={styles.dowBadge}><Text style={styles.dowBadgeText}>{DAY_LABELS[d.dayOfWeek]}</Text></View>
                    <View>
                      <Text style={styles.dayRowName}>{d.dayName}</Text>
                      <Text style={styles.dayRowMuscle}>{d.muscleGroups || 'Sem grupos definidos'}</Text>
                      <Text style={styles.dayRowExCount}>{d.exercises.filter(e => e.name).length} exercícios</Text>
                    </View>
                  </View>
                  <Text style={styles.dayRowChevron}>›</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.addDayBtn} onPress={addDay}>
                <Text style={styles.addDayBtnText}>+ Adicionar dia de treino</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: FontSizes.md, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
  headerBtn: { paddingHorizontal: Spacing.md, paddingVertical: 6 },
  headerBtnText: { fontSize: FontSizes.sm, color: '#666', fontWeight: '600' },
  saveBtn: { backgroundColor: '#000', borderRadius: 8 },
  saveBtnText: { fontSize: FontSizes.sm, color: '#fff', fontWeight: '700' },
  scroll: { flex: 1 },
  section: { padding: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: '800', color: '#000', marginBottom: Spacing.md },
  sectionSub: { fontSize: FontSizes.sm, color: '#999', marginBottom: Spacing.lg },
  backBtn: { marginBottom: Spacing.lg },
  backBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#555' },
  row: { marginBottom: Spacing.md },
  label: { fontSize: FontSizes.sm, fontWeight: '700', color: '#333', marginBottom: 6 },
  subLabel: { fontSize: FontSizes.xs, fontWeight: '600', color: '#888', marginBottom: 4 },
  input: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: Spacing.md, fontSize: FontSizes.sm, color: '#000', backgroundColor: '#fafafa' },
  inputSmall: { },
  dayPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: 4 },
  dayChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1.5, borderColor: 'transparent' },
  dayChipActive: { backgroundColor: '#000', borderColor: '#000' },
  dayChipText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#888' },
  dayChipTextActive: { color: '#fff' },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  addExBtn: { backgroundColor: '#000', borderRadius: 8, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  addExBtnText: { fontSize: FontSizes.xs, color: '#fff', fontWeight: '700' },
  exCard: { backgroundColor: '#fafafa', borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#e8e8e8', gap: Spacing.sm },
  exCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  exNum: { fontSize: FontSizes.sm, fontWeight: '800', color: '#000' },
  removeEx: { fontSize: FontSizes.md, color: '#ccc', fontWeight: '700' },
  setsRepsRow: { flexDirection: 'row', gap: Spacing.md },
  setsRepsField: { flex: 1 },
  removeDayBtn: { marginTop: Spacing.xl, borderRadius: 12, paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0' },
  removeDayBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#d32f2f' },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafafa', borderRadius: 14, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1.5, borderColor: '#e8e8e8' },
  dayRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  dowBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  dowBadgeText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '800' },
  dayRowName: { fontSize: FontSizes.md, fontWeight: '700', color: '#000' },
  dayRowMuscle: { fontSize: FontSizes.xs, color: '#888', marginTop: 2 },
  dayRowExCount: { fontSize: FontSizes.xs, color: '#bbb', marginTop: 1 },
  dayRowChevron: { fontSize: 22, color: '#bbb' },
  addDayBtn: { borderRadius: 14, paddingVertical: Spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: '#000', borderStyle: 'dashed', marginTop: Spacing.md },
  addDayBtnText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
});
