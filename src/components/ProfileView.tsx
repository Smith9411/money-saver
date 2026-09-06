import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';
import { useTheme } from '../context/ThemeContext';

interface ProfileViewProps {
  onBack: () => void;
  transactionsCount: number;
  userName: string;
  userAvatar?: string | null;
  onSaveUserName: (name: string) => void;
  onSaveUserAvatar: (uri: string | null) => void;
  onResetAllData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onBack,
  transactionsCount,
  userName,
  userAvatar,
  onSaveUserName,
  onSaveUserAvatar,
  onResetAllData,
}) => {
  const { theme, themeId, changeTheme, availableThemes } = useTheme();
  const [nameInput, setNameInput] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [themeFilter, setThemeFilter] = useState<'all' | 'light' | 'dark'>('all');

  const filteredThemes = availableThemes.filter((t) => {
    if (themeFilter === 'light') return !t.isDark;
    if (themeFilter === 'dark') return t.isDark;
    return true;
  });

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Veuillez autoriser l’accès à votre galerie pour ajouter une photo de profil.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        triggerHaptic('success');
        onSaveUserAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Error picking image:', e);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Veuillez autoriser l’accès à l’appareil photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        triggerHaptic('success');
        onSaveUserAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Error taking photo:', e);
    }
  };

  const handleAvatarPress = () => {
    triggerHaptic('light');
    Alert.alert(
      'Photo de profil',
      'Personnalisez votre photo de profil :',
      [
        { text: 'Choisir dans la galerie', onPress: pickImageFromGallery },
        { text: 'Prendre une photo', onPress: takePhotoWithCamera },
        ...(userAvatar
          ? [
              {
                text: 'Supprimer la photo',
                style: 'destructive' as const,
                onPress: () => {
                  triggerHaptic('medium');
                  onSaveUserAvatar(null);
                },
              },
            ]
          : []),
        { text: 'Annuler', style: 'cancel' as const },
      ]
    );
  };

  const handleSaveName = () => {
    triggerHaptic('success');
    onSaveUserName(nameInput.trim());
    setIsEditingName(false);
    Alert.alert('Profil mis à jour', `Votre prénom est désormais "${nameInput.trim()}".`);
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Profil & Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Carte utilisateur minimaliste personnalisable */}
      <View
        style={[
          styles.userCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.cardRadius,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.avatarTouchable}
          activeOpacity={0.8}
          onPress={handleAvatarPress}
        >
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatarImageLarge} />
          ) : (
            <View style={[styles.avatarLarge, { backgroundColor: theme.colors.accent }]}>
              <Ionicons
                name="person"
                size={32}
                color={theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : '#FFFFFF'}
              />
            </View>
          )}
          <View
            style={[
              styles.avatarEditBadge,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="camera" size={13} color={theme.colors.textPrimary} />
          </View>
        </TouchableOpacity>

        {isEditingName ? (
          <View style={styles.nameEditBox}>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.accent,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Entrez votre prénom..."
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveNameBtn, { backgroundColor: theme.colors.accent }]}
              onPress={handleSaveName}
            >
              <Text
                style={[
                  styles.saveNameBtnText,
                  {
                    color: theme.isDark && theme.id === 'midnight-titanium'
                      ? '#000000'
                      : '#FFFFFF',
                  },
                ]}
              >
                Valider
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.nameRow}
            activeOpacity={0.7}
            onPress={() => setIsEditingName(true)}
          >
            <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
              {userName && userName.trim().length > 0 ? userName : 'Définir mon prénom'}
            </Text>
            <Ionicons name="pencil-outline" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        )}

        <Text style={[styles.userSub, { color: theme.colors.textSecondary }]}>Données stockées localement sur cet appareil</Text>

        <View style={[styles.badgeLocal, { backgroundColor: theme.colors.surfaceSubtle }]}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#15803D" />
          <Text style={[styles.badgeLocalText, { color: theme.colors.textPrimary }]}>100% Hors-ligne & Privé</Text>
        </View>
      </View>

      {/* Section Ambiance & Thèmes (Menu déroulant personnalisable) */}
      <View style={[styles.sectionCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: theme.colors.surfaceSubtle }]}>
            <Ionicons name="color-palette-outline" size={18} color={theme.colors.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Ambiance & Thèmes</Text>
            <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
              {availableThemes.length} styles • 5 Clairs & 5 Sombres
            </Text>
          </View>
        </View>

        {/* Bouton sélecteur déroulant affichant le thème actuel */}
        <TouchableOpacity
          style={[
            styles.dropdownHeader,
            {
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: isThemeDropdownOpen ? theme.colors.accent : theme.colors.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic('light');
            setIsThemeDropdownOpen(!isThemeDropdownOpen);
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.dropdownTitleRow}>
              <Text style={[styles.dropdownThemeName, { color: theme.colors.textPrimary }]}>
                {theme.name}
              </Text>
              <View
                style={[
                  styles.themeTypeBadge,
                  { backgroundColor: theme.isDark ? '#262633' : '#E8E8EE' },
                ]}
              >
                <Ionicons
                  name={theme.isDark ? 'moon' : 'sunny'}
                  size={10}
                  color={theme.isDark ? '#E5B869' : '#111111'}
                />
                <Text style={[styles.themeTypeBadgeText, { color: theme.colors.textPrimary }]}>
                  {theme.isDark ? 'Sombre' : 'Clair'}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.dropdownThemeTagline, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {theme.tagline}
            </Text>
          </View>

          {/* Nuancier du thème actif + flèche déroulante */}
          <View style={styles.dropdownRight}>
            <View style={styles.themeSwatches}>
              <View style={[styles.swatchDot, { backgroundColor: theme.colors.background }]} />
              <View style={[styles.swatchDot, { backgroundColor: theme.colors.surfaceSubtle }]} />
              <View style={[styles.swatchDot, { backgroundColor: theme.colors.accent }]} />
            </View>
            <Ionicons
              name={isThemeDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.colors.textPrimary}
              style={{ marginLeft: 6 }}
            />
          </View>
        </TouchableOpacity>

        {/* Menu déroulant dépliable */}
        {isThemeDropdownOpen && (
          <View style={styles.dropdownContent}>
            {/* Onglets de filtrage */}
            <View style={styles.filterTabsRow}>
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  themeFilter === 'all' && [styles.filterTabActive, { backgroundColor: theme.colors.accent }],
                ]}
                onPress={() => {
                  triggerHaptic('selection');
                  setThemeFilter('all');
                }}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: themeFilter === 'all' ? '#FFFFFF' : theme.colors.textSecondary },
                  ]}
                >
                  Tous ({availableThemes.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTab,
                  themeFilter === 'light' && [styles.filterTabActive, { backgroundColor: theme.colors.accent }],
                ]}
                onPress={() => {
                  triggerHaptic('selection');
                  setThemeFilter('light');
                }}
              >
                <Ionicons
                  name="sunny-outline"
                  size={12}
                  color={themeFilter === 'light' ? '#FFFFFF' : theme.colors.textSecondary}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={[
                    styles.filterTabText,
                    { color: themeFilter === 'light' ? '#FFFFFF' : theme.colors.textSecondary },
                  ]}
                >
                  Clairs (5)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTab,
                  themeFilter === 'dark' && [styles.filterTabActive, { backgroundColor: theme.colors.accent }],
                ]}
                onPress={() => {
                  triggerHaptic('selection');
                  setThemeFilter('dark');
                }}
              >
                <Ionicons
                  name="moon-outline"
                  size={12}
                  color={themeFilter === 'dark' ? '#FFFFFF' : theme.colors.textSecondary}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={[
                    styles.filterTabText,
                    { color: themeFilter === 'dark' ? '#FFFFFF' : theme.colors.textSecondary },
                  ]}
                >
                  Sombres (5)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Liste déroulante des thèmes filtrés */}
            <View style={styles.themesList}>
              {filteredThemes.map((t) => {
                const isSelected = themeId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.themeItem,
                      isSelected && styles.themeItemActive,
                      {
                        borderColor: isSelected ? t.colors.accent : theme.colors.border,
                        backgroundColor: isSelected ? theme.colors.surface : theme.colors.surfaceSubtle,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => changeTheme(t.id)}
                  >
                    <View style={styles.themeInfo}>
                      <View style={styles.themeNameRow}>
                        <Text
                          style={[
                            styles.themeName,
                            { color: isSelected ? t.colors.accent : theme.colors.textPrimary },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {t.name}
                        </Text>
                        {isSelected && (
                          <View style={[styles.activePill, { backgroundColor: t.colors.accent }]}>
                            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                            <Text style={styles.activePillText}>Actif</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.themeTagline, { color: theme.colors.textSecondary }]}>{t.tagline}</Text>
                    </View>

                    {/* Nuancier 3 pastilles de couleur réelles */}
                    <View style={styles.themeSwatches}>
                      <View style={[styles.swatchDot, { backgroundColor: t.colors.background, borderColor: '#777777' }]} />
                      <View style={[styles.swatchDot, { backgroundColor: t.colors.surfaceSubtle }]} />
                      <View style={[styles.swatchDot, { backgroundColor: t.colors.accent }]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Statistiques de stockage local */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.cardRadius,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Stockage local</Text>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Transactions enregistrées</Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{transactionsCount}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Base de données</Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>SQLite (money_saver.db)</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Devise active</Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>Euro (€)</Text>
        </View>
      </View>

      {/* Bouton de remise à zéro complète de l'application */}
      <View style={styles.dangerSection}>
        <TouchableOpacity
          style={[
            styles.resetAppBtn,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.cardRadius,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleConfirmReset}
        >
          <Ionicons name="refresh-outline" size={18} color={theme.colors.expenseText} />
          <Text style={[styles.resetAppBtnText, { color: theme.colors.expenseText }]}>
            Remettre l’application à zéro (tout effacer)
          </Text>
        </TouchableOpacity>
        <Text style={[styles.resetHint, { color: theme.colors.textMuted }]}>
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
  avatarTouchable: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImageLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...THEME.shadows.subtle,
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
  themesList: {
    gap: 10,
    marginTop: 6,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1.5,
  },
  themeItemActive: {
    ...THEME.shadows.subtle,
  },
  themeInfo: {
    flex: 1,
    paddingRight: 10,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  themeTagline: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  themeSwatches: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1.5,
  },
  dropdownTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownThemeName: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
  },
  themeTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dropdownThemeTagline: {
    fontSize: 12,
    marginTop: 2,
  },
  dropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContent: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterTabActive: {
    borderColor: 'transparent',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
