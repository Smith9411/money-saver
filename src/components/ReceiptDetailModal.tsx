import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Transaction } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';

interface ReceiptDetailModalProps {
  transaction: Transaction | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  transaction,
  visible,
  onClose,
  onDelete,
}) => {
  if (!transaction) return null;

  const items = transaction.items || [];
  const hasItems = items.length > 0;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetCard}>
          {/* Poignée de drag */}
          <View style={styles.dragHandle} />

          {/* En-tête */}
          <View style={styles.headerRow}>
            <View style={styles.badgeScan}>
              <Ionicons name="receipt-outline" size={14} color="#111111" />
              <Text style={styles.badgeScanText}>
                {hasItems ? 'Ticket de caisse scanné' : 'Détail de la dépense'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Commerce et date */}
          <View style={styles.merchantSection}>
            <Text style={styles.merchantName}>{transaction.title}</Text>
            <Text style={styles.receiptDate}>{formatDate(transaction.date)}</Text>
            <Text style={styles.totalBig}>-{transaction.amount.toFixed(2)} €</Text>
          </View>

          {/* Ligne pointillée décorative style reçu */}
          <View style={styles.dashedDivider} />

          <ScrollView style={styles.itemsScroll} showsVerticalScrollIndicator={false}>
            {hasItems ? (
              <View style={styles.itemsList}>
                <Text style={styles.itemsSectionTitle}>
                  Articles détaillés ({items.length})
                </Text>

                {items.map((item, index) => (
                  <View key={item.id || `it-${index}`}>
                    <View style={styles.itemRow}>
                      <View style={styles.itemBullet} />
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
                    </View>
                    {index < items.length - 1 && <View style={styles.itemBorder} />}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noItemsBox}>
                <Text style={styles.noItemsText}>
                  Cette dépense a été ajoutée manuellement sans détail d'articles.
                </Text>
              </View>
            )}

            {/* Note éventuelle */}
            {transaction.note && (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>Note :</Text>
                <Text style={styles.noteText}>{transaction.note}</Text>
              </View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Boutons d'action en bas */}
          <View style={styles.footer}>
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('medium');
                  onDelete(transaction.id);
                  onClose();
                }}
              >
                <Ionicons name="trash-outline" size={16} color={THEME.colors.expenseText} />
                <Text style={styles.deleteButtonText}>Supprimer cette dépense</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '82%',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeScan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
  },
  badgeScanText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  merchantName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
  },
  receiptDate: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  totalBig: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.6,
    marginTop: 8,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  itemsScroll: {
    maxHeight: 280,
  },
  itemsList: {
    backgroundColor: '#FAF9F6',
    borderRadius: THEME.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  itemsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#111111',
    marginRight: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  itemBorder: {
    height: 1,
    backgroundColor: '#ECECEF',
  },
  noItemsBox: {
    padding: 20,
    alignItems: 'center',
  },
  noItemsText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  noteBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#F4F4F6',
    borderRadius: THEME.radius.sm,
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  noteText: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.expenseBg,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.expenseText,
  },
});
