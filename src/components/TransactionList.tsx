import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { Transaction } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../services/haptics';
import { ParticleBurst } from './ParticleBurst';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction?: (id: string) => void;
  onTransactionPress?: (tx: Transaction) => void;
  onViewAll?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  onTransactionPress,
  onViewAll,
}) => {
  const [explodingId, setExplodingId] = useState<string | null>(null);
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

  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Transactions récentes</Text>
        <TouchableOpacity activeOpacity={0.6} onPress={onViewAll}>
          <Text style={[styles.viewAllText, { color: theme.colors.accent }]}>Historique</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Aucune transaction enregistrée</Text>
          </View>
        ) : (
          transactions.slice(0, 7).map((tx, idx) => {
            const isIncome = tx.type === 'income';
            const hasReceiptItems = tx.items && tx.items.length > 0;
            const isExploding = explodingId === tx.id;

            return (
              <Animated.View
                key={tx.id}
                entering={FadeInDown.duration(200).springify().damping(22)}
                exiting={FadeOutUp.duration(160)}
                layout={LinearTransition.springify().damping(18).stiffness(140)}
                style={{ position: 'relative' }}
              >
                <TouchableOpacity
                  style={[
                    styles.transactionCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderRadius: theme.cardRadius,
                      opacity: isExploding ? 0.25 : 1,
                      transform: [{ scale: isExploding ? 0.94 : 1 }],
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => onTransactionPress && onTransactionPress(tx)}
                >
                  <View style={styles.leftCol}>
                    <View
                      style={[
                        styles.iconCircle,
                        isIncome
                          ? { backgroundColor: theme.colors.incomeBg }
                          : { backgroundColor: theme.colors.surfaceSubtle },
                      ]}
                    >
                      <Ionicons
                        name={getCategoryIcon(tx.category) as any}
                        size={18}
                        color={
                          isIncome ? theme.colors.incomeText : theme.colors.textPrimary
                        }
                      />
                    </View>

                    <View style={styles.textContainer}>
                      <View style={styles.titleLine}>
                        <Text style={[styles.txTitle, { color: theme.colors.textPrimary }]}>{tx.title}</Text>
                        {hasReceiptItems && (
                          <View style={[styles.receiptTag, { backgroundColor: theme.colors.surfaceSubtle }]}>
                            <Ionicons name="receipt" size={10} color={theme.colors.textPrimary} />
                            <Text style={[styles.receiptTagText, { color: theme.colors.textPrimary }]}>Reçu</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.txDate, { color: theme.colors.textSecondary }]}>{formatDate(tx.date)}</Text>
                    </View>
                  </View>

                  <View style={styles.rightCol}>
                    <Text
                      style={[
                        styles.amountText,
                        isIncome
                          ? { color: theme.colors.incomeText }
                          : { color: theme.colors.textPrimary },
                      ]}
                    >
                      {isIncome ? '+' : '-'}
                      {tx.amount.toFixed(2)} €
                    </Text>

                    {onDeleteTransaction && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation?.();
                          triggerHaptic('heavy');
                          setExplodingId(tx.id);
                          setTimeout(() => {
                            onDeleteTransaction?.(tx.id);
                          }, 50);
                        }}
                        style={styles.deleteBtn}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>

                {isExploding && (
                  <ParticleBurst
                    color={isIncome ? theme.colors.incomeText : theme.colors.expenseText}
                    onComplete={() => {
                      setExplodingId(null);
                    }}
                  />
                )}
              </Animated.View>
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
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.2,
  },
  receiptTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  receiptTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    textTransform: 'uppercase',
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
