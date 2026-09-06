import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { THEME } from '../constants/theme';
import { CategoryBudget, TransactionCategory } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';

interface BudgetManagerModalProps {
  visible: boolean;
  onClose: () => void;
  budgets: CategoryBudget[];
  onUpdateBudget: (category: TransactionCategory, newBudget: number) => void;
}

export const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
  visible,
  onClose,
  budgets,
  onUpdateBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [budgetInput, setBudgetInput] = useState('');

  const handleStartEdit = (b: CategoryBudget) => {
    triggerHaptic('light');
    setEditingCategory(b.category);
    setBudgetInput(b.budget.toString());
  };

  const handleSaveBudget = (cat: TransactionCategory) => {
    const val = parseFloat(budgetInput.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      Alert.alert('Montant invalide', 'Veuillez entrer un plafond de budget supérieur à 0 €.');
      return;
    }
    triggerHaptic('success');
    onUpdateBudget(cat, Math.round(val));
    setEditingCategory(null);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestion des budgets</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.leadText}>
          Personnalisez les plafonds de dépenses pour chaque catégorie. Touchez un budget pour le modifier.
        </Text>

        <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.cardsWrapper}>
            {budgets.map((b) => {
              const isEditing = editingCategory === b.category;
              const isWarning = b.percentage > 85;

              return (
                <View key={b.category} style={styles.budgetCard}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catName}>{b.name}</Text>
                      <Text style={styles.catSpent}>
                        {b.spent.toFixed(2)} € dépensés
                      </Text>
                    </View>

                    {isEditing ? (
                      <View style={styles.editRow}>
                        <TextInput
                          style={styles.editInput}
                          value={budgetInput}
                          onChangeText={setBudgetInput}
                          keyboardType="numeric"
                          autoFocus
                        />
                        <Text style={styles.editCurrency}>€</Text>
                        <TouchableOpacity
                          style={styles.saveBtn}
                          onPress={() => handleSaveBudget(b.category)}
                        >
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.budgetPill}
                        activeOpacity={0.7}
                        onPress={() => handleStartEdit(b)}
                      >
                        <Text style={styles.budgetPillText}>Plafond : {b.budget} €</Text>
                        <Ionicons name="pencil" size={11} color={THEME.colors.textSecondary} style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Jauge fine */}
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(b.percentage, 100)}%`,
                          backgroundColor: isWarning
                            ? THEME.colors.expenseText
                            : THEME.colors.textPrimary,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.cardBottom}>
                    <Text style={[styles.percentageText, isWarning && styles.warningText]}>
                      {b.percentage}% du plafond utilisé
                    </Text>
                    <Text style={styles.remainingText}>
                      Reste : {Math.max(0, b.budget - b.spent).toFixed(2)} €
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
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
  leadText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: 16,
    lineHeight: 18,
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
  },
  cardsWrapper: {
    gap: 14,
  },
  budgetCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  catSpent: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  budgetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  budgetPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editInput: {
    width: 64,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: '#111111',
    textAlign: 'right',
  },
  editCurrency: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  saveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  progressBackground: {
    height: 5,
    backgroundColor: THEME.colors.surfaceMuted,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  warningText: {
    color: THEME.colors.expenseText,
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
});
