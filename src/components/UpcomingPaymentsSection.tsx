import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { UpcomingPayment } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';

interface UpcomingPaymentsSectionProps {
  upcoming: UpcomingPayment[];
  totalUpcomingExpenses: number;
  onAddRecurringPress?: () => void;
}

export const UpcomingPaymentsSection: React.FC<UpcomingPaymentsSectionProps> = ({
  upcoming,
  totalUpcomingExpenses,
  onAddRecurringPress,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'housing':
        return 'home-outline';
      case 'leisure':
        return 'film-outline';
      case 'transport':
        return 'car-outline';
      case 'salary':
        return 'cash-outline';
      default:
        return 'repeat-outline';
    }
  };

  const getDaysBadgeText = (days: number) => {
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Demain';
    return `Dans ${days}j`;
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec montant total engagé */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleWithBadge}>
            <Text style={styles.sectionTitle}>Échéances à venir</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{upcoming.length}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Total prévu d'ici la fin du mois :{' '}
            <Text style={styles.subtitleBold}>{totalUpcomingExpenses.toFixed(2)} €</Text>
          </Text>
        </View>

        {onAddRecurringPress && (
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('light');
              onAddRecurringPress();
            }}
          >
            <Ionicons name="add" size={18} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Défilement horizontal des échéances à venir */}
      {upcoming.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aucun prélèvement récurrent configuré.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {upcoming.map((payment) => {
            const isIncome = payment.type === 'income';
            const isUrgent = payment.daysRemaining <= 3;

            return (
              <View key={payment.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.daysBadge,
                      isUrgent && styles.daysBadgeUrgent,
                      isIncome && styles.daysBadgeIncome,
                    ]}
                  >
                    <Text
                      style={[
                        styles.daysBadgeText,
                        isUrgent && styles.daysBadgeTextUrgent,
                        isIncome && styles.daysBadgeTextIncome,
                      ]}
                    >
                      {getDaysBadgeText(payment.daysRemaining)}
                    </Text>
                  </View>

                  <View style={styles.iconCircle}>
                    <Ionicons
                      name={getCategoryIcon(payment.category) as any}
                      size={15}
                      color={THEME.colors.textPrimary}
                    />
                  </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {payment.title}
                </Text>

                <Text style={styles.cardDate}>Le {payment.dayOfMonth} de chaque mois</Text>

                <Text
                  style={[
                    styles.cardAmount,
                    isIncome ? styles.amountIncome : styles.amountExpense,
                  ]}
                >
                  {isIncome ? '+' : '-'}
                  {payment.amount.toFixed(2)} €
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  subtitleBold: {
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  horizontalScroll: {
    paddingHorizontal: THEME.spacing.lg,
    gap: 12,
  },
  card: {
    width: 160,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  daysBadge: {
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.full,
  },
  daysBadgeUrgent: {
    backgroundColor: THEME.colors.expenseBg,
  },
  daysBadgeIncome: {
    backgroundColor: THEME.colors.incomeBg,
  },
  daysBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  daysBadgeTextUrgent: {
    color: THEME.colors.expenseText,
  },
  daysBadgeTextIncome: {
    color: THEME.colors.incomeText,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  amountIncome: {
    color: THEME.colors.incomeText,
  },
  amountExpense: {
    color: THEME.colors.textPrimary,
  },
  emptyCard: {
    marginHorizontal: THEME.spacing.lg,
    padding: 16,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
});
