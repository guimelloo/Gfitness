import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

interface WorkoutExerciseData {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight?: number;
  instructions?: string;
}

interface ExerciseCardProps {
  exercise: WorkoutExerciseData;
  onPressVideo?: (exerciseId: string) => void;
}

export function ExerciseCard({ exercise, onPressVideo }: ExerciseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.muscleGroup}>{exercise.muscleGroup}</Text>
        </View>
        <View style={styles.instructionsBadge}>
          <Text style={styles.badgeText}>Ⓘ</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Séries</Text>
          <Text style={styles.detailValue}>{exercise.sets}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Reps</Text>
          <Text style={styles.detailValue}>{exercise.reps}</Text>
        </View>
        {exercise.weight && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Peso</Text>
            <Text style={styles.detailValue}>{exercise.weight}kg</Text>
          </View>
        )}
      </View>

      {exercise.instructions && (
        <Text style={styles.instructions}>{exercise.instructions}</Text>
      )}

      {onPressVideo && (
        <TouchableOpacity
          style={styles.videoButton}
          onPress={() => onPressVideo(exercise.exerciseId)}
        >
          <Text style={styles.videoButtonText}>▶ Ver Execução</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  exerciseName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  muscleGroup: {
    fontSize: FontSizes.sm,
    color: '#666',
  },
  instructionsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.light.background,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
  details: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flex: 1,
    marginRight: Spacing.md,
  },
  detailLabel: {
    fontSize: FontSizes.xs,
    color: '#999',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.light.primary,
    marginTop: 4,
  },
  instructions: {
    fontSize: FontSizes.sm,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  videoButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  videoButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
});
