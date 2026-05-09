import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

interface MealItem {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealDetailsModalProps {
  visible: boolean;
  mealName: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  onClose: () => void;
}

export function MealDetailsModal({
  visible,
  mealName,
  items,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  onClose,
}: MealDetailsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{mealName}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Total Macros Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{Math.round(totalCalories)}</Text>
                <Text style={styles.summaryLabel}>kcal</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{Math.round(totalProtein)}g</Text>
                <Text style={styles.summaryLabel}>Proteína</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{Math.round(totalCarbs)}g</Text>
                <Text style={styles.summaryLabel}>Carbs</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{Math.round(totalFat)}g</Text>
                <Text style={styles.summaryLabel}>Gordura</Text>
              </View>
            </View>
          </View>

          {/* Food Items */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Alimentos</Text>
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <View key={item.id || index} style={styles.foodItem}>
                  <View style={styles.foodHeader}>
                    <Text style={styles.foodName}>{item.foodName}</Text>
                    <Text style={styles.quantity}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>

                  <View style={styles.macroRow}>
                    <View style={styles.macroCell}>
                      <Text style={styles.macroNumber}>{Math.round(item.calories)}</Text>
                      <Text style={styles.macroSmall}>kcal</Text>
                    </View>
                    <View style={styles.macroCell}>
                      <Text style={styles.macroNumber}>{Math.round(item.protein)}g</Text>
                      <Text style={styles.macroSmall}>Prot</Text>
                    </View>
                    <View style={styles.macroCell}>
                      <Text style={styles.macroNumber}>{Math.round(item.carbs)}g</Text>
                      <Text style={styles.macroSmall}>Carb</Text>
                    </View>
                    <View style={styles.macroCell}>
                      <Text style={styles.macroNumber}>{Math.round(item.fat)}g</Text>
                      <Text style={styles.macroSmall}>Gord</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum alimento adicionado</Text>
            )}
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Close Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onClose}>
          <Text style={styles.actionButtonText}>Fechar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    fontSize: 24,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    color: '#666',
    marginTop: Spacing.xs,
  },
  itemsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: Spacing.md,
  },
  foodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  foodName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  quantity: {
    fontSize: FontSizes.sm,
    color: '#999',
    fontWeight: '600',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
  },
  macroCell: {
    alignItems: 'center',
    flex: 1,
  },
  macroNumber: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  macroSmall: {
    fontSize: FontSizes.xs,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: '#999',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  spacer: {
    height: Spacing.xl,
  },
  actionButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
