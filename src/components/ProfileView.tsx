import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getApiKey, setApiKey } from '../services/aiReceiptScanner';
import { triggerHaptic } from '../services/haptics';

interface ProfileViewProps {
  onBack: () => void;
  transactionsCount: number;
  userName: string;
  onSaveUserName: (name: string) => void;
  onResetAllData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onBack,
  transactionsCount,
  userName,
  onSaveUserName,
  onResetAllData,
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveName = () => {
    triggerHaptic('success');
    onSaveUserName(nameInput.trim());
    setIsEditingName(false);
    Alert.alert('Profil mis à jour', `Votre prénom est désormais "${nameInput.trim()}".`);
  };

  const handleSaveKey = () => {
    triggerHaptic('success');
    setApiKey(apiKeyInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    Alert.alert(
      'Clé enregistrée',
      'Votre clé Gemini est active pour scanner et lire vos vrais tickets de caisse !'
    );
  };

  const handleConfirmReset = () => {
    triggerHaptic('heavy');
    Alert.alert(
      'Réinitialiser toutes les données ?',
      'Cette action va effacer toutes les transactions et remettre l’application à zéro, comme si vous veniez de l’installer.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout effacer',
          style: 'destructive',
          onPress: () => {
            onResetAllData();
            Alert.alert('Remise à zéro effectuée', 'Toutes les dépenses ont été effacées.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil & Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Carte utilisateur minimaliste personnalisable */}
      <View style={styles.userCard}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={32} color="#FFFFFF" />
        </View>

        {isEditingName ? (
          <View style={styles.nameEditBox}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Entrez votre prénom..."
              placeholderTextColor={THEME.colors.textMuted}
              autoFocus
            />
            <TouchableOpacity style={styles.saveNameBtn} onPress={handleSaveName}>
              <Text style={styles.saveNameBtnText}>Valider</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.nameRow}
            activeOpacity={0.7}
            onPress={() => setIsEditingName(true)}
          >
            <Text style={styles.userName}>
              {userName && userName.trim().length > 0 ? userName : 'Définir mon prénom'}
            </Text>
            <Ionicons name="pencil-outline" size={16} color={THEME.colors.textSecondary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        )}

        <Text style={styles.userSub}>Données stockées localement sur cet appareil</Text>

        <View style={styles.badgeLocal}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#15803D" />
          <Text style={styles.badgeLocalText}>100% Hors-ligne & Privé</Text>
        </View>
      </View>

      {/* Section IA Vision pour les tickets */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name="sparkles" size={18} color="#111111" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>IA Scanner de tickets</Text>
            <Text style={styles.sectionDesc}>Google Gemini Vision</Text>
          </View>
        </View>

        <Text style={styles.label}>Clé d'API Google AI Studio</Text>
        <TextInput
          style={styles.keyInput}
          placeholder="Ex: AIzaSyD... (Collez votre clé ici)"
          placeholderTextColor={THEME.colors.textMuted}
          value={apiKeyInput}
          onChangeText={setApiKeyInput}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={apiKeyInput.length > 0}
        />

        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={handleSaveKey}
        >
          <Text style={styles.saveBtnText}>
            {isSaved ? '✓ Clé enregistrée' : 'Enregistrer la clé'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistiques de stockage local */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Stockage local</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Transactions enregistrées</Text>
          <Text style={styles.statValue}>{transactionsCount}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Base de données</Text>
          <Text style={styles.statValue}>SQLite (money_saver.db)</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Devise active</Text>
          <Text style={styles.statValue}>Euro (€)</Text>
        </View>
      </View>

      {/* Bouton de remise à zéro complète de l'application */}
      <View style={styles.dangerSection}>
        <TouchableOpacity
          style={styles.resetAppBtn}
          activeOpacity={0.8}
          onPress={handleConfirmReset}
        >
          <Ionicons name="refresh-outline" size={18} color={THEME.colors.expenseText} />
          <Text style={styles.resetAppBtnText}>
            Remettre l’application à zéro (tout effacer)
          </Text>
        </TouchableOpacity>
        <Text style={styles.resetHint}>
          Efface toutes les transactions pour repartir d'une installation vierge.
        </Text>
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
  userCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    ...THEME.shadows.subtle,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  nameEditBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  nameInput: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: '#111111',
    textAlign: 'center',
  },
  saveNameBtn: {
    backgroundColor: '#111111',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.radius.sm,
  },
  saveNameBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  userSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  badgeLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.incomeBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    marginTop: 12,
  },
  badgeLocalText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.incomeText,
  },
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
    ...THEME.shadows.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  sectionDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  keyInput: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#111111',
    borderRadius: THEME.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  statLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  dangerSection: {
    marginTop: 10,
    alignItems: 'center',
  },
  resetAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.expenseBg,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  resetAppBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.expenseText,
  },
  resetHint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
});
