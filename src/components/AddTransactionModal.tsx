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
    });

    // Réinitialisation
    setAmountStr('');
    setTitle('');
    setType('expense');
    setCategory('food');
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
});
