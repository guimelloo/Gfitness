import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { ExerciseDetailModal } from './exercise-detail-modal';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  note?: string;
}

interface DailyWorkoutCardProps {
  dayNumber: number;
  dayName: string;
  muscleGroups: string[];
  exercises: Exercise[];
  isToday?: boolean;
  compact?: boolean;
}

export function DailyWorkoutCard({
  dayNumber,
  dayName,
  muscleGroups,
  exercises,
  isToday = false,
  compact = false,
}: DailyWorkoutCardProps) {
  const [expanded, setExpanded] = useState(isToday && !compact);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedExercise(null), 300);
  };

  return (
    <>
      <View style={[styles.container, isToday && styles.containerToday]}>
        <TouchableOpacity
          style={[styles.header, isToday && styles.headerToday, expanded && !isToday && styles.headerExpanded]}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.dayBadge, isToday && styles.dayBadgeToday]}>
              <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{dayNumber}</Text>
            </View>
            <View style={styles.dayTextGroup}>
              <View style={styles.dayNameRow}>
                <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{dayName}</Text>
                {isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>HOJE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.muscleGroups, isToday && styles.muscleGroupsToday]}>
                {muscleGroups.join(' · ')}
              </Text>
              <Text style={[styles.exerciseCount, isToday && styles.exerciseCountToday]}>
                {exercises.length} exercícios
              </Text>
            </View>
          </View>
          <Text style={[styles.chevron, isToday && styles.chevronToday]}>
            {expanded ? '▾' : '▸'}
          </Text>
        </TouchableOpacity>

        {expanded && (
          <View style={[styles.body, isToday && styles.bodyToday]}>
            {exercises.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exerciseRow,
                  index === exercises.length - 1 && styles.exerciseRowLast,
                ]}
                onPress={() => handleExercisePress(exercise)}
                activeOpacity={0.65}
              >
                <View style={styles.exerciseIndex}>
                  <Text style={[styles.exerciseIndexText, isToday && styles.exerciseIndexTextToday]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseTopRow}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={[styles.setsRepsBadge, isToday && styles.setsRepsBadgeToday]}>
                      <Text style={[styles.setsRepsText, isToday && styles.setsRepsTextToday]}>
                        {exercise.sets}×{exercise.reps}
                      </Text>
                    </View>
                  </View>
                  {exercise.note && (
                    <Text style={styles.exerciseNote}>{exercise.note}</Text>
                  )}
                  <Text style={styles.tapHint}>Toque para ver execução</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedExercise && (
        <ExerciseDetailModal
          visible={modalVisible}
          exerciseName={selectedExercise.name}
          sets={selectedExercise.sets}
          reps={selectedExercise.reps}
          note={selectedExercise.note}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
  },
  containerToday: {
    borderColor: '#000',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: '#fafafa',
  },
  headerToday: {
    backgroundColor: '#000',
  },
  headerExpanded: {
    backgroundColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  dayBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeToday: {
    backgroundColor: '#fff',
  },
  dayNumber: {
    color: '#fff',
    fontSize: FontSizes.lg,
    fontWeight: '800',
  },
  dayNumberToday: {
    color: '#000',
  },
  dayTextGroup: {
    flex: 1,
  },
  dayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  dayName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#111',
  },
  dayNameToday: {
    color: '#fff',
  },
  todayBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  todayBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  muscleGroups: {
    fontSize: FontSizes.sm,
    color: '#888',
    fontWeight: '500',
    marginTop: 1,
  },
  muscleGroupsToday: {
    color: 'rgba(255,255,255,0.65)',
  },
  exerciseCount: {
    fontSize: FontSizes.xs,
    color: '#bbb',
    marginTop: 1,
    fontWeight: '500',
  },
  exerciseCountToday: {
    color: 'rgba(255,255,255,0.45)',
  },
  chevron: {
    fontSize: 20,
    color: '#999',
    fontWeight: '700',
  },
  chevronToday: {
    color: '#fff',
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: '#fff',
  },
  bodyToday: {
    backgroundColor: '#fafafa',
  },
  exerciseRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseRowLast: {
    borderBottomWidth: 0,
  },
  exerciseIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  exerciseIndexText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: '#555',
  },
  exerciseIndexTextToday: {
    color: '#000',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  exerciseName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#111',
    flex: 1,
    lineHeight: 20,
  },
  setsRepsBadge: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  setsRepsBadgeToday: {
    backgroundColor: '#000',
  },
  setsRepsText: {
    color: '#fff',
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  setsRepsTextToday: {
    color: '#fff',
  },
  exerciseNote: {
    fontSize: FontSizes.xs,
    color: '#aaa',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  tapHint: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 5,
    fontWeight: '500',
  },
});
