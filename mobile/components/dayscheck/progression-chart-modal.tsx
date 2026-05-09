import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

interface ProgressData {
  date: string;
  weight?: number;
  workoutCompleted?: boolean;
  waterIntake?: number;
  waterGoal?: number;
}

interface ProgressionChartModalProps {
  visible: boolean;
  data: ProgressData[];
  onClose: () => void;
}

export function ProgressionChartModal({
  visible,
  data,
  onClose,
}: ProgressionChartModalProps) {
  const windowWidth = Dimensions.get('window').width;
  const chartWidth = windowWidth - Spacing.lg * 2;

  // Prepare weight data
  const weightData = useMemo(() => {
    const last30Days = data.slice(-30);
    
    return {
      labels: last30Days.map(d => {
        const date = new Date(d.date + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit' });
      }),
      datasets: [
        {
          data: last30Days.map(d => d.weight || 0).filter(w => w > 0),
          color: () => Colors.light.primary,
          strokeWidth: 2,
        },
      ],
    };
  }, [data]);

  // Prepare water data (percentage of goal achieved)
  const waterData = useMemo(() => {
    const last14Days = data.slice(-14);
    
    return {
      labels: last14Days.map(d => {
        const date = new Date(d.date + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [
        {
          data: last14Days.map(d => {
            if (!d.waterIntake || !d.waterGoal) return 0;
            return Math.min((d.waterIntake / d.waterGoal) * 100, 100);
          }),
        },
      ],
    };
  }, [data]);

  // Prepare workout data (yes/no converted to 1/0)
  const workoutData = useMemo(() => {
    const last14Days = data.slice(-14);
    
    return {
      labels: last14Days.map(d => {
        const date = new Date(d.date + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [
        {
          data: last14Days.map(d => (d.workoutCompleted ? 100 : 0)),
        },
      ],
    };
  }, [data]);

  // Calculate stats
  const stats = useMemo(() => {
    const last30Days = data.slice(-30);
    
    const totalWorkouts = last30Days.filter(d => d.workoutCompleted).length;
    const avgWater = last30Days.length > 0
      ? last30Days.reduce((sum, d) => sum + (d.waterIntake || 0), 0) / last30Days.length
      : 0;
    const minWeight = last30Days
      .filter(d => d.weight)
      .map(d => d.weight!)
      .reduce((min, w) => (w < min ? w : min), Infinity);
    const maxWeight = last30Days
      .filter(d => d.weight)
      .map(d => d.weight!)
      .reduce((max, w) => (w > max ? w : max), 0);

    return {
      totalWorkouts,
      avgWater: avgWater.toFixed(2),
      minWeight: minWeight === Infinity ? '—' : minWeight.toFixed(1),
      maxWeight: maxWeight === 0 ? '—' : maxWeight.toFixed(1),
      weightVariation: maxWeight === 0 ? '—' : (maxWeight - minWeight).toFixed(1),
    };
  }, [data]);

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
          <Text style={styles.title}>Gráfico de Progressão</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Treinos (30d)</Text>
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Água Média</Text>
              <Text style={styles.statValue}>{stats.avgWater}L</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Min Peso</Text>
              <Text style={styles.statValue}>{stats.minWeight}kg</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Máx Peso</Text>
              <Text style={styles.statValue}>{stats.maxWeight}kg</Text>
            </View>
          </View>

          {/* Weight Chart */}
          {weightData.datasets[0].data.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Peso (30 dias)</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={weightData}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 1,
                    color: () => Colors.light.primary,
                    labelColor: () => '#999',
                    style: { borderRadius: 12 },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: Colors.light.primary,
                    },
                  }}
                  bezier
                  fromZero={false}
                />
              </View>
            </View>
          )}

          {/* Water Progress Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Meta de Água (14 dias)</Text>
            <Text style={styles.chartSubtitle}>% da meta atingido</Text>
            <View style={styles.chartContainer}>
              <BarChart
                data={waterData}
                width={chartWidth}
                height={200}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: () => '#4CAF50',
                  labelColor: () => '#999',
                  barPercentage: 0.7,
                  style: { borderRadius: 12 },
                }}
              />
            </View>
          </View>

          {/* Workout Consistency Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Consistência de Treino (14 dias)</Text>
            <Text style={styles.chartSubtitle}>Verde = Treinou | Cinza = Não treinou</Text>
            <View style={styles.chartContainer}>
              <BarChart
                data={workoutData}
                width={chartWidth}
                height={200}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  labelColor: () => '#999',
                  barPercentage: 0.7,
                  style: { borderRadius: 12 },
                }}
              />
            </View>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: '#666',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  chartSection: {
    marginBottom: Spacing.xl,
  },
  chartTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  chartSubtitle: {
    fontSize: FontSizes.xs,
    color: '#999',
    marginBottom: Spacing.md,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: Spacing.md,
    alignItems: 'center',
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
