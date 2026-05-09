import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

interface MealCardProps {
  mealName: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items?: MealItem[];
  onPress?: () => void;
}

export function MealCard({
  mealName,
  time,
  calories,
  protein,
  carbs,
  fat,
  items,
  onPress,
}: MealCardProps) {
  const hasItems = items && items.length > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.mealName}>{mealName}</Text>
          {time && <Text style={styles.time}>{time}</Text>}
        </View>
        {hasItems && (
          <Text style={styles.itemsIndicator}>{items?.length} itens</Text>
        )}
      </View>

      <View style={styles.macroGrid}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{calories}</Text>
          <Text style={styles.macroLabel}>kcal</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{protein}g</Text>
          <Text style={styles.macroLabel}>Proteína</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{fat}g</Text>
          <Text style={styles.macroLabel}>Gordura</Text>
        </View>
      </View>

      {hasItems && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Toque para ver alimentos →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderTopWidth: 3,
    borderTopColor: Colors.light.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mealName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  time: {
    fontSize: FontSizes.sm,
    color: '#999',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  macroLabel: {
    fontSize: FontSizes.xs,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  itemsIndicator: {
    fontSize: FontSizes.xs,
    color: Colors.light.primary,
    fontWeight: '600',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
