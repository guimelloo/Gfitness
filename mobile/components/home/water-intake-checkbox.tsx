import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { DailyLogService } from '@/services/home-service';

interface WaterIntakeCheckboxProps {
  waterGoal?: number;
  currentIntake?: number;
  onWaterToggle?: (completed: boolean) => void;
}

export function WaterIntakeCheckbox({
  waterGoal = 3.0,
  currentIntake = 0,
  onWaterToggle,
}: WaterIntakeCheckboxProps) {
  const [intake, setIntake] = useState(currentIntake);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIntake(currentIntake);
  }, [currentIntake]);

  const progressPercentage = Math.min((intake / waterGoal) * 100, 100);
  const isCompleted = intake >= waterGoal;

  const updateWater = async (newIntake: number) => {
    setIsLoading(true);
    const clamped = Math.max(0, Math.round(newIntake * 100) / 100);
    setIntake(clamped);
    try {
      const today = new Date().toISOString().split('T')[0];
      await DailyLogService.updateDailyLog(today, { waterIntake: clamped });
      onWaterToggle?.(clamped >= waterGoal);
    } catch (error) {
      setIntake(intake);
      Alert.alert('Erro', 'Não foi possível atualizar a água');
    } finally {
      setIsLoading(false);
    }
  };

  const drops = Array.from({ length: Math.ceil(waterGoal / 0.5) }, (_, i) => {
    const threshold = (i + 1) * 0.5;
    return threshold <= intake;
  });

  return (
    <View style={[styles.container, isCompleted && styles.containerCompleted]}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>💧</Text>
          <Text style={styles.title}>Hidratação</Text>
        </View>
        {isCompleted ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>META ✓</Text>
          </View>
        ) : null}
        <Text style={styles.amount}>
          {intake.toFixed(2)}L
          <Text style={styles.goal}> / {waterGoal.toFixed(1)}L</Text>
        </Text>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progressPercentage}%` as any }]} />
      </View>
      <Text style={styles.progressLabel}>{Math.round(progressPercentage)}% da meta diária</Text>

      <View style={styles.dropsRow}>
        {drops.map((filled, i) => (
          <View
            key={i}
            style={[styles.drop, filled && styles.dropFilled]}
          />
        ))}
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnMinus, (isLoading || intake <= 0) && styles.btnDisabled]}
          onPress={() => updateWater(intake - 0.25)}
          disabled={isLoading || intake <= 0}
        >
          <Text style={[styles.btnText, styles.btnMinusText]}>−250ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={() => updateWater(intake + 0.25)}
          disabled={isLoading}
        >
          <Text style={styles.btnText}>+250ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnLarge, isLoading && styles.btnDisabled]}
          onPress={() => updateWater(intake + 0.5)}
          disabled={isLoading}
        >
          <Text style={styles.btnText}>+500ml</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  containerCompleted: {
    borderColor: '#000',
    backgroundColor: '#f9f9f9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginRight: Spacing.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#000',
  },
  goal: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: '#999',
  },
  progressBg: {
    height: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: FontSizes.xs,
    color: '#888',
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  dropsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  drop: {
    width: 12,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#e8e8e8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropFilled: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLarge: {
    flex: 1.3,
  },
  btnMinus: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  btnText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnMinusText: {
    color: '#000',
  },
  btnDisabled: {
    opacity: 0.35,
  },
});
