import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { Transaction } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction?: (id: string) => void;
  onViewAll?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  onViewAll,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return 'restaurant-outline';
      case 'housing':
        return 'home-outline';
      case 'transport':
        return 'car-outline';
      case 'shopping':
        return 'bag-handle-outline';
      case 'leisure':
        return 'film-outline';
      case 'salary':
      case 'freelance':
        return 'arrow-down-circle-outline';
      default:
        return 'receipt-outline';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Transactions récentes</Text>
        <TouchableOpacity activeOpacity={0.6} onPress={onViewAll}>
          <Text style={styles.viewAllText}>Historique</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune transaction enregistrée</Text>
          </View>
        ) : (
          transactions.slice(0, 5).map((tx) => {
            const isIncome = tx.type === 'income';

            return (
              <View key={tx.id} style={styles.transactionCard}>
                <View style={styles.leftCol}>
                  <View
                    style={[
                      styles.iconCircle,
                      isIncome ? styles.incomeIconCircle : styles.expenseIconCircle,
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(tx.category) as any}
                      size={18}
                      color={
                        isIncome ? THEME.colors.incomeText : THEME.colors.textPrimary
                      }
                    />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                  </View>
                </View>

                <View style={styles.rightCol}>
                  <Text
                    style={[
                      styles.amountText,
                      isIncome ? styles.incomeAmount : styles.expenseAmount,
                    ]}
                  >
                    {isIncome ? '+' : '-'}
                    {tx.amount.toFixed(2)} €
                  </Text>

                  {onDeleteTransaction && (
                    <TouchableOpacity
                      onPress={() => onDeleteTransaction(tx.id)}
                      style={styles.deleteBtn}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="close-circle" size={16} color={THEME.colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    marginBottom: 100, // Espace pour la barre de navigation flottante
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338CA',
  },
  list: {
    gap: 10,
  },
  transactionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseIconCircle: {
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  incomeIconCircle: {
    backgroundColor: THEME.colors.incomeBg,
  },
  textContainer: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.2,
  },
  txDate: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  incomeAmount: {
    color: THEME.colors.incomeText,
  },
  expenseAmount: {
    color: THEME.colors.textPrimary,
  },
  deleteBtn: {
    padding: 2,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
});
