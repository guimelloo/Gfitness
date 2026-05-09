import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { DailyLogService } from '@/services/home-service';

interface WorkoutCheckboxProps {
  workoutCompleted?: boolean;
  workoutType?: string;
  dayDescription?: string;
  onWorkoutToggle?: (completed: boolean, type?: string) => void;
}

export function WorkoutCheckbox({
  workoutCompleted = false,
  workoutType,
  dayDescription,
  onWorkoutToggle,
}: WorkoutCheckboxProps) {
  const [isChecked, setIsChecked] = useState(workoutCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleWorkout = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newState = !isChecked;

      await DailyLogService.updateDailyLog(today, {
        workoutCompleted: newState,
        workoutType: workoutType,
      });

      setIsChecked(newState);
      onWorkoutToggle?.(newState, workoutType);
    } catch (error) {
      console.error('Error updating workout status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o treino');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isChecked && styles.containerCompleted]}
      onPress={handleToggleWorkout}
      disabled={isLoading}
      activeOpacity={0.85}
    >
      <View style={styles.leftSection}>
        <View style={[styles.checkCircle, isChecked && styles.checkCircleCompleted]}>
          {isChecked && <Text style={styles.checkIcon}>✓</Text>}
        </View>
        <View style={styles.textGroup}>
          <Text style={[styles.title, isChecked && styles.titleCompleted]}>
            {isLoading ? 'Atualizando...' : isChecked ? 'Treino Concluído!' : 'Marcar Treino Feito'}
          </Text>
          {dayDescription && !isChecked && (
            <Text style={styles.description}>{dayDescription}</Text>
          )}
          {workoutType && (
            <Text style={[styles.workoutType, isChecked && styles.workoutTypeCompleted]}>
              {workoutType}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.statusPill, isChecked && styles.statusPillCompleted]}>
        <Text style={[styles.statusText, isChecked && styles.statusTextCompleted]}>
          {isChecked ? 'FEITO' : 'PENDENTE'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: Spacing.md,
  },
  containerCompleted: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  checkCircleCompleted: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  checkIcon: {
    color: '#000',
    fontSize: FontSizes.lg,
    fontWeight: '900',
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  titleCompleted: {
    color: '#fff',
  },
  description: {
    fontSize: FontSizes.sm,
    color: '#888',
    marginTop: 2,
  },
  workoutType: {
    fontSize: FontSizes.sm,
    color: '#555',
    fontWeight: '600',
    marginTop: 2,
  },
  workoutTypeCompleted: {
    color: 'rgba(255,255,255,0.7)',
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  statusPillCompleted: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1,
  },
  statusTextCompleted: {
    color: '#fff',
  },
});
