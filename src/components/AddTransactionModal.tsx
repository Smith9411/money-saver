import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { THEME } from '../constants/theme';
import { TransactionCategory, TransactionType } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: {
    title: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    isRecurring?: boolean;
    recurringDay?: number;
  }) => void;
}

const CATEGORIES: { label: string; value: TransactionCategory; icon: string }[] = [
  { label: 'Alimentation', value: 'food', icon: 'restaurant-outline' },
  { label: 'Transport', value: 'transport', icon: 'car-outline' },
  { label: 'Shopping', value: 'shopping', icon: 'bag-handle-outline' },
  { label: 'Logement', value: 'housing', icon: 'home-outline' },
  { label: 'Loisirs', value: 'leisure', icon: 'film-outline' },
  { label: 'Salaire', value: 'salary', icon: 'cash-outline' },
  { label: 'Freelance', value: 'freelance', icon: 'laptop-outline' },
  { label: 'Autre', value: 'other', icon: 'ellipsis-horizontal-outline' },
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(new Date().getDate());

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    const safeTitle = title.trim() || (type === 'expense' ? 'Dépense' : 'Entrée');

    onAdd({
      title: safeTitle,
      amount: parsedAmount,
      type,
      category,
      date: new Date().toISOString().split('T')[0],
      isRecurring,
      recurringDay: isRecurring ? recurringDay : undefined,
    });

    // Réinitialisation
    setAmountStr('');
    setTitle('');
    setType('expense');
    setCategory('food');
    setIsRecurring(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Petite barre de poignée en haut */}
          <View style={styles.dragHandle} />

          {/* En-tête */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle transaction</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Toggle Type: Dépense / Revenu */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'expense' && styles.typeBtnActiveExpense,
                ]}
                activeOpacity={0.7}
                onPress={() => setType('expense')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'expense' && styles.typeBtnTextActive,
                  ]}
                >
                  Dépense (Sortie)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'income' && styles.typeBtnActiveIncome,
                ]}
                activeOpacity={0.7}
                onPress={() => setType('income')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'income' && styles.typeBtnTextActive,
                  ]}
                >
                  Revenu (Entrée)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Saisie géante du montant */}
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencyPrefix}>€</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="decimal-pad"
                value={amountStr}
                onChangeText={setAmountStr}
                autoFocus
              />
            </View>

            {/* Champ Titre */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Titre ou Commerce</Text>
              <TextInput
                style={styles.textInput}
                placeholder="ex: Monoprix, Salaire, Café..."
                placeholderTextColor={THEME.colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Sélecteur de Catégorie */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Catégorie</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.catPill,
                        isSelected && styles.catPillSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setCategory(cat.value)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={15}
                        color={
                          isSelected ? '#FFFFFF' : THEME.colors.textPrimary
                        }
                      />
                      <Text
                        style={[
                          styles.catPillText,
                          isSelected && styles.catPillTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Option Récurrence mensuelle */}
            <View style={styles.recurringBox}>
              <TouchableOpacity
                style={styles.recurringRow}
                activeOpacity={0.7}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <View style={styles.recurringInfo}>
                  <Text style={styles.recurringTitle}>Paiement récurrent mensuel</Text>
                  <Text style={styles.recurringSub}>
                    Loyer, abonnements, salaire prélevé chaque mois
                  </Text>
                </View>
                <View
                  style={[
                    styles.recurringSwitch,
                    isRecurring && styles.recurringSwitchActive,
                  ]}
                >
                  <View
                    style={[
                      styles.recurringThumb,
                      isRecurring && styles.recurringThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {isRecurring && (
                <View style={styles.daySelectorRow}>
                  <Text style={styles.dayLabel}>Jour du prélèvement dans le mois :</Text>
                  <View style={styles.dayControl}>
                    <TouchableOpacity
                      style={styles.dayBtn}
                      onPress={() => setRecurringDay(Math.max(1, recurringDay - 1))}
                    >
                      <Ionicons name="remove" size={16} color={THEME.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.dayValueText}>Le {recurringDay}</Text>
                    <TouchableOpacity
                      style={styles.dayBtn}
                      onPress={() => setRecurringDay(Math.min(31, recurringDay + 1))}
                    >
                      <Ionicons name="add" size={16} color={THEME.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Bouton de confirmation */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.85}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Ajouter la transaction</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '85%',
    ...THEME.shadows.floating,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E4E4E7',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: THEME.radius.sm,
  },
  typeBtnActiveExpense: {
    backgroundColor: '#111111',
  },
  typeBtnActiveIncome: {
    backgroundColor: '#15803D',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  currencyPrefix: {
    fontSize: 34,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -1,
    minWidth: 140,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  catPillSelected: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  catPillTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#111111',
    borderRadius: THEME.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...THEME.shadows.subtle,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  /* STYLES RÉCURRENCE */
  recurringBox: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recurringInfo: {
    flex: 1,
    paddingRight: 10,
  },
  recurringTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  recurringSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  recurringSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D4D4D8',
    padding: 2,
    justifyContent: 'center',
  },
  recurringSwitchActive: {
    backgroundColor: '#111111',
  },
  recurringThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  recurringThumbActive: {
    transform: [{ translateX: 18 }],
  },
  daySelectorRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  dayControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.full,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  dayBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    minWidth: 46,
    textAlign: 'center',
  },
});
