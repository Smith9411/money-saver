import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { PeriodStats, TimePeriod, CategoryBudget } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface AnalyticsViewProps {
  stats: PeriodStats;
  period: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;
  budgets: CategoryBudget[];
  onBack: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  period,
  onPeriodChange,
  budgets,
  onBack,
}) => {
  const formatEuro = (n: number) => {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rapports & Flux</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Sélecteur temporel à 3 segments */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as TimePeriod[]).map((p) => {
          const isSelected = period === p;
          const label = p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année';
          return (
            <TouchableOpacity
              key={p}
              style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
              activeOpacity={0.7}
              onPress={() => onPeriodChange(p)}
            >
              <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Carte Résumé du Solde Net */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Épargne nette sur la période</Text>
        <Text
          style={[
            styles.balanceAmount,
            stats.netBalance >= 0 ? styles.balancePositive : styles.balanceNegative,
          ]}
        >
          {stats.netBalance >= 0 ? '+' : ''}
          {formatEuro(stats.netBalance)}
        </Text>
        <View style={styles.rateBadge}>
          <Ionicons name="sparkles" size={13} color="#15803D" />
          <Text style={styles.rateText}>Taux d'épargne : {stats.savingsRate}%</Text>
        </View>
      </View>

      {/* Deux colonnes : Entrées vs Sorties */}
      <View style={styles.flowRow}>
        <View style={styles.flowCard}>
          <View style={styles.flowIconIncome}>
            <Ionicons name="arrow-down" size={16} color={THEME.colors.incomeText} />
          </View>
          <Text style={styles.flowLabel}>Total Entrées</Text>
          <Text style={styles.flowIncomeAmount}>+{formatEuro(stats.totalIncome)}</Text>
        </View>

        <View style={styles.flowCard}>
          <View style={styles.flowIconExpense}>
            <Ionicons name="arrow-up" size={16} color={THEME.colors.textPrimary} />
          </View>
          <Text style={styles.flowLabel}>Total Sorties</Text>
          <Text style={styles.flowExpenseAmount}>-{formatEuro(stats.totalExpense)}</Text>
        </View>
      </View>

      {/* Répartition des dépenses par catégorie */}
      <View style={styles.breakdownSection}>
        <Text style={styles.sectionTitle}>Répartition des dépenses</Text>

        <View style={styles.categoriesList}>
          {budgets.map((b) => (
            <View key={b.category} style={styles.catItem}>
              <View style={styles.catHeader}>
                <Text style={styles.catName}>{b.name}</Text>
                <Text style={styles.catAmount}>{b.spent} €</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (b.spent / Math.max(1, stats.totalExpense)) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 4,
    marginBottom: THEME.spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: THEME.radius.sm,
  },
  segmentBtnActive: {
    backgroundColor: '#111111',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  balanceCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    marginBottom: 14,
    ...THEME.shadows.subtle,
  },
  balanceLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  balancePositive: {
    color: THEME.colors.textPrimary,
  },
  balanceNegative: {
    color: THEME.colors.expenseText,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.incomeBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    marginTop: 12,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.incomeText,
  },
  flowRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  flowCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  flowIconIncome: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.incomeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  flowIconExpense: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  flowLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  flowIncomeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.incomeText,
  },
  flowExpenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  breakdownSection: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  categoriesList: {
    gap: 14,
  },
  catItem: {},
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: THEME.colors.surfaceMuted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111111',
    borderRadius: 2,
  },
});
