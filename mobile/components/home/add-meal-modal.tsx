import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  onMealAdded: () => void;
  isLoading?: boolean;
}

export function AddMealModal({
  visible,
  onClose,
  onMealAdded,
  isLoading = false,
}: AddMealModalProps) {
  const [mealName, setMealName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleSubmit = async () => {
    if (!mealName || !kcal || !protein || !carbs || !fat) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      const { DailyLogService } = await import('@/services/home-service');
      await DailyLogService.addMeal({
        mealName,
        totalKcal: parseFloat(kcal),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
      });

      // Limpar campos
      setMealName('');
      setKcal('');
      setProtein('');
      setCarbs('');
      setFat('');

      onMealAdded();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar refeição:', error);
      alert('Erro ao adicionar refeição');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar Refeição</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nome da Refeição</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Frango com Arroz"
                value={mealName}
                onChangeText={setMealName}
                editable={!isLoading}
                placeholderTextColor={Colors.light.text + '80'}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Calorias (kcal)</Text>
              <TextInput
                style={styles.input}
                placeholder="500"
                value={kcal}
                onChangeText={setKcal}
                keyboardType="decimal-pad"
                editable={!isLoading}
                placeholderTextColor={Colors.light.text + '80'}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Proteína (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                  placeholderTextColor={Colors.light.text + '80'}
                />
              </View>

              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Carboidrato (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="50"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                  placeholderTextColor={Colors.light.text + '80'}
                />
              </View>

              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Gordura (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="15"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                  placeholderTextColor={Colors.light.text + '80'}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Adicionar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Spacing.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    fontSize: FontSizes.lg,
    color: Colors.light.text,
  },
  form: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: FontSizes.md,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: FontSizes.md,
  },
});
