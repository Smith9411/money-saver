import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { PeriodStats } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MetricsPillProps {
  stats: PeriodStats;
}

export const MetricsPill: React.FC<MetricsPillProps> = ({ stats }) => {
  const { theme } = useTheme();

  const formatEuro = (amount: number) => {
    return amount.toLocaleString('fr-FR', {
      maximumFractionDigits: 0,
    }) + ' €';
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.cardRadius,
        },
      ]}
    >
      {/* 1. Dépenses (Sorties) */}
      <View style={styles.metricItem}>
        <View style={styles.valueRow}>
          <Text style={[styles.valueText, { color: theme.colors.textPrimary }]}>
            {formatEuro(stats.totalExpense)}
          </Text>
        </View>
        <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>Dépenses</Text>
      </View>

      <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

      {/* 2. Revenus (Entrées) */}
      <View style={styles.metricItem}>
        <View style={styles.valueRow}>
          <Text style={[styles.valueText, { color: theme.colors.textPrimary }]}>
            {formatEuro(stats.totalIncome)}
          </Text>
        </View>
        <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>Revenus</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: THEME.spacing.lg,
    marginVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.border,
  },
});

