import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { Transaction, TransactionCategory } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';
import { useTheme } from '../context/ThemeContext';
import { ParticleBurst } from './ParticleBurst';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORY_FILTERS: { label: string; value: TransactionCategory | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Alimentation', value: 'food' },
  { label: 'Transport', value: 'transport' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Logement', value: 'housing' },
  { label: 'Loisirs', value: 'leisure' },
  { label: 'Études', value: 'education' },
  { label: 'Salaire', value: 'salary' },
];

export const HistoryModal: React.FC<HistoryModalProps> = ({
  visible,
  onClose,
  transactions,
  onSelectTransaction,
  onDeleteTransaction,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<TransactionCategory | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [explodingId, setExplodingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = selectedCat === 'all' || tx.category === selectedCat;
      const matchType = typeFilter === 'all' || tx.type === typeFilter;

      return matchSearch && matchCat && matchType;
    });
  }, [transactions, searchQuery, selectedCat, typeFilter]);

  const totalFiltered = useMemo(() => {
    const expenses = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const incomes = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    return { expenses, incomes };
  }, [filtered]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Historique complet</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Barre de recherche animée */}
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Rechercher une dépense, un magasin..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres par catégorie */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {CATEGORY_FILTERS.map((f) => {
            const isSelected = selectedCat === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setSelectedCat(f.value);
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected
                        ? theme.isDark && theme.id === 'midnight-titanium'
                          ? '#000000'
                          : '#FFFFFF'
                        : theme.colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Résumé des résultats filtrés */}
        <View style={[styles.summaryBar, { borderBottomColor: theme.colors.borderLight }]}>
          <Text style={[styles.summaryCount, { color: theme.colors.textSecondary }]}>
            {filtered.length} transaction{filtered.length > 1 ? 's' : ''}
          </Text>
          <View style={styles.summaryAmounts}>
            <Text style={[styles.summaryExpense, { color: theme.colors.textPrimary }]}>
              -{totalFiltered.expenses.toFixed(2)} €
            </Text>
            {totalFiltered.incomes > 0 && (
              <Text style={[styles.summaryIncome, { color: theme.colors.incomeText }]}>
                +{totalFiltered.incomes.toFixed(2)} €
              </Text>
            )}
          </View>
        </View>

        {/* Liste des transactions avec animations Reanimated */}
        <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={42} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>
                Aucune transaction trouvée
              </Text>
              <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
                Essayez un autre mot-clé ou filtre
              </Text>
            </View>
          ) : (
            filtered.map((tx, idx) => {
              const isIncome = tx.type === 'income';
              const hasReceipt = tx.items && tx.items.length > 0;
              const isExploding = explodingId === tx.id;

              return (
                <Animated.View
                  key={tx.id}
                  entering={FadeInDown.duration(200).springify().damping(22).delay(Math.min(idx * 20, 100))}
                  exiting={FadeOutUp.duration(160)}
                  layout={LinearTransition.springify().damping(18).stiffness(140)}
                  style={{ position: 'relative' }}
                >
                  <TouchableOpacity
                    style={[
                      styles.txCard,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        borderRadius: theme.cardRadius,
                        opacity: isExploding ? 0.25 : 1,
                        transform: [{ scale: isExploding ? 0.94 : 1 }],
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      triggerHaptic('light');
                      onSelectTransaction(tx);
                    }}
                  >
                    <View style={styles.txLeft}>
                      <View
                        style={[
                          styles.iconBox,
                          isIncome
                            ? { backgroundColor: theme.colors.incomeBg }
                            : { backgroundColor: theme.colors.surfaceSubtle },
                        ]}
                      >
                        <Ionicons
                          name={
                            isIncome
                              ? 'arrow-down-circle-outline'
                              : hasReceipt
                              ? 'receipt-outline'
                              : 'card-outline'
                          }
                          size={18}
                          color={isIncome ? theme.colors.incomeText : theme.colors.textPrimary}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={styles.titleLine}>
                          <Text style={[styles.txTitle, { color: theme.colors.textPrimary }]}>{tx.title}</Text>
                          {hasReceipt && (
                            <View style={[styles.receiptTag, { backgroundColor: theme.colors.surfaceSubtle }]}>
                              <Ionicons name="receipt" size={9} color={theme.colors.textPrimary} />
                              <Text style={[styles.receiptTagText, { color: theme.colors.textPrimary }]}>Reçu</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.txMeta, { color: theme.colors.textSecondary }]}>
                          {formatDate(tx.date)} {tx.merchant ? `• ${tx.merchant}` : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.txRight}>
                      <Text
                        style={[
                          styles.txAmount,
                          isIncome ? { color: theme.colors.incomeText } : { color: theme.colors.textPrimary },
                        ]}
                      >
                        {isIncome ? '+' : '-'}
                        {tx.amount.toFixed(2)} €
                      </Text>

                      <TouchableOpacity
                        style={styles.trashBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          triggerHaptic('heavy');
                          setExplodingId(tx.id);
                          setTimeout(() => {
                            onDeleteTransaction(tx.id);
                          }, 50);
                        }}
                      >
                        <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                      </TouchableOpacity>
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
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 14,
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    marginHorizontal: THEME.spacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  filtersScroll: {
    paddingHorizontal: THEME.spacing.lg,
    gap: 8,
    paddingBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterPillActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    marginBottom: 6,
  },
  summaryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  summaryAmounts: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryExpense: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  summaryIncome: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.incomeText,
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxExpense: {
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  iconBoxIncome: {
    backgroundColor: THEME.colors.incomeBg,
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
  txMeta: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txAmountExpense: {
    color: THEME.colors.textPrimary,
  },
  txAmountIncome: {
    color: THEME.colors.incomeText,
  },
  trashBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 14,
  },
  emptySubText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
});
