import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { DailyLogService } from '@/services/home-service';

interface WeightInputProps {
  currentWeight?: number;
  onWeightSaved?: (weight: number) => void;
}

export function WeightInput({ currentWeight, onWeightSaved }: WeightInputProps) {
  const [weight, setWeight] = useState(currentWeight?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveWeight = async () => {
    if (!weight || parseFloat(weight) <= 0) {
      Alert.alert('Erro', 'Por favor insira um peso válido');
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await DailyLogService.updateDailyLog(today, {
        weight: parseFloat(weight),
      });

      Alert.alert('Sucesso', 'Peso registrado com sucesso!');
      onWeightSaved?.(parseFloat(weight));
    } catch (error) {
      console.error('Error saving weight:', error);
      Alert.alert('Erro', 'Não foi possível registrar o peso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Registrar Peso</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ex: 86.5"
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
          editable={!isLoading}
        />
        <Text style={styles.unit}>kg</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveWeight}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? '...' : '✓'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  unit: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.primary,
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.light.background,
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
});
