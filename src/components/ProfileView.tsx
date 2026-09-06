import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [themeFilter, setThemeFilter] = useState<'all' | 'light' | 'dark'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  const filteredThemes = availableThemes.filter((t) => {
    if (themeFilter === 'light') return !t.isDark;
    if (themeFilter === 'dark') return t.isDark;
    return true;
  });

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission galerie refusée');
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
        setIsPhotoModalOpen(false);
        showToast('Photo de profil mise à jour');
      }
    } catch (e) {
      console.warn('Error picking image:', e);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission caméra refusée');
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
        setIsPhotoModalOpen(false);
        showToast('Photo de profil mise à jour');
      }
    } catch (e) {
      console.warn('Error taking photo:', e);
    }
  };

  const handleAvatarPress = () => {
    triggerHaptic('light');
    setIsPhotoModalOpen(true);
  };

  const handleOpenEditProfile = () => {
    triggerHaptic('light');
    setNameInput(userName);
    setIsEditProfileModalOpen(true);
  };

  const handleSaveName = () => {
    if (nameInput.trim().length === 0) return;
    triggerHaptic('success');
    onSaveUserName(nameInput.trim());
    setIsEditProfileModalOpen(false);
    showToast('Profil mis à jour');
  };

  const handleConfirmReset = () => {
    triggerHaptic('heavy');
    setIsResetModalOpen(true);
  };

  const handleExecuteReset = () => {
    setIsResetModalOpen(false);
    onResetAllData();
    showToast('Application remise à zéro');
  };

  return (
    <View style={styles.screenWrapper}>
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

        {/* Prénom avec bouton d'édition stylé */}
        <TouchableOpacity
          style={styles.nameRow}
          activeOpacity={0.7}
          onPress={handleOpenEditProfile}
        >
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
            {userName && userName.trim().length > 0 ? userName : 'Définir mon prénom'}
          </Text>
          <View style={[styles.editPencilBadge, { backgroundColor: theme.colors.surfaceSubtle }]}>
            <Ionicons name="pencil" size={13} color={theme.colors.accent} />
          </View>
        </TouchableOpacity>

        {/* Bouton pilule d'action "Modifier le profil" */}
        <TouchableOpacity
          style={[
            styles.editProfileBtnPill,
            {
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={handleOpenEditProfile}
        >
          <Ionicons name="create-outline" size={14} color={theme.colors.textPrimary} style={{ marginRight: 5 }} />
          <Text style={[styles.editProfileBtnText, { color: theme.colors.textPrimary }]}>
            Modifier le profil
          </Text>
        </TouchableOpacity>

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

    {/* Toast flottant élégant */}
    {toastMessage && (
      <View
        style={[
          styles.toastContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={18} color={theme.colors.incomeText} />
        <Text style={[styles.toastText, { color: theme.colors.textPrimary }]}>{toastMessage}</Text>
      </View>
    )}

    {/* 1. Modal de Sélection de Photo de Profil (Bottom Sheet) */}
    <Modal
      visible={isPhotoModalOpen}
      animationType="slide"
      transparent
      onRequestClose={() => setIsPhotoModalOpen(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsPhotoModalOpen(false)}
        />
        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderLeftColor: theme.colors.border,
              borderRightColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.colors.border }]} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}>
                Photo de profil
              </Text>
              <Text style={[styles.sheetSubtitle, { color: theme.colors.textSecondary }]}>
                Personnalisez votre avatar d'application
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsPhotoModalOpen(false)}
              style={[styles.sheetCloseBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
            >
              <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Aperçu central de l'avatar */}
          <View style={styles.sheetAvatarPreviewWrap}>
            <View
              style={[
                styles.sheetAvatarPreview,
                {
                  borderColor: theme.colors.accent,
                  backgroundColor: theme.colors.surfaceSubtle,
                },
              ]}
            >
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.sheetAvatarImage} />
              ) : (
                <Ionicons
                  name="person"
                  size={36}
                  color={theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : theme.colors.accent}
                />
              )}
            </View>
          </View>

          {/* Options de sélection */}
          <View style={styles.sheetOptions}>
            <TouchableOpacity
              style={[
                styles.sheetOptionCard,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={takePhotoWithCamera}
            >
              <View
                style={[
                  styles.sheetOptionIconWrap,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Ionicons name="camera" size={20} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetOptionTitle, { color: theme.colors.textPrimary }]}>
                  Prendre une photo
                </Text>
                <Text style={[styles.sheetOptionDesc, { color: theme.colors.textSecondary }]}>
                  Utiliser l'appareil photo
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sheetOptionCard,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={pickImageFromGallery}
            >
              <View
                style={[
                  styles.sheetOptionIconWrap,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Ionicons name="images" size={20} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetOptionTitle, { color: theme.colors.textPrimary }]}>
                  Choisir dans la galerie
                </Text>
                <Text style={[styles.sheetOptionDesc, { color: theme.colors.textSecondary }]}>
                  Importer depuis vos albums
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            {userAvatar ? (
              <TouchableOpacity
                style={[
                  styles.sheetOptionCard,
                  {
                    backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
                    borderColor: theme.isDark ? 'rgba(239, 68, 68, 0.25)' : '#FECDD3',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('medium');
                  onSaveUserAvatar(null);
                  setIsPhotoModalOpen(false);
                  showToast('Photo de profil supprimée');
                }}
              >
                <View
                  style={[
                    styles.sheetOptionIconWrap,
                    { backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', borderColor: 'transparent' },
                  ]}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.expenseText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sheetOptionTitle, { color: theme.colors.expenseText }]}>
                    Supprimer la photo
                  </Text>
                  <Text style={[styles.sheetOptionDesc, { color: theme.colors.expenseText, opacity: 0.8 }]}>
                    Revenir à l'icône initiale
                  </Text>
                </View>
                <Ionicons name="close-circle-outline" size={18} color={theme.colors.expenseText} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.sheetCancelBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
            activeOpacity={0.7}
            onPress={() => setIsPhotoModalOpen(false)}
          >
            <Text style={[styles.sheetCancelText, { color: theme.colors.textPrimary }]}>
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>

    {/* 2. Modal de Modification du Profil (Prénom & Avatar) */}
    <Modal
      visible={isEditProfileModalOpen}
      animationType="slide"
      transparent
      onRequestClose={() => setIsEditProfileModalOpen(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsEditProfileModalOpen(false)}
        />
        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderLeftColor: theme.colors.border,
              borderRightColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.colors.border }]} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}>
                Modifier le profil
              </Text>
              <Text style={[styles.sheetSubtitle, { color: theme.colors.textSecondary }]}>
                Personnalisez vos informations d'accueil
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsEditProfileModalOpen(false)}
              style={[styles.sheetCloseBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
            >
              <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Mini avatar cliquable */}
          <View style={styles.editProfileAvatarRow}>
            <TouchableOpacity
              style={styles.editProfileAvatarTouchable}
              activeOpacity={0.8}
              onPress={() => {
                setIsEditProfileModalOpen(false);
                setTimeout(() => setIsPhotoModalOpen(true), 250);
              }}
            >
              <View
                style={[
                  styles.editProfileAvatarWrap,
                  {
                    borderColor: theme.colors.accent,
                    backgroundColor: theme.colors.surfaceSubtle,
                  },
                ]}
              >
                {userAvatar ? (
                  <Image source={{ uri: userAvatar }} style={styles.editProfileAvatarImage} />
                ) : (
                  <Ionicons
                    name="person"
                    size={26}
                    color={theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : theme.colors.accent}
                  />
                )}
              </View>
              <View style={[styles.editProfileCameraBadge, { backgroundColor: theme.colors.accent }]}>
                <Ionicons
                  name="camera"
                  size={12}
                  color={theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : '#FFFFFF'}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 14 }}
              onPress={() => {
                setIsEditProfileModalOpen(false);
                setTimeout(() => setIsPhotoModalOpen(true), 250);
              }}
            >
              <Text style={[styles.editProfileAvatarLabel, { color: theme.colors.textPrimary }]}>
                Photo de profil
              </Text>
              <Text style={[styles.editProfileAvatarHint, { color: theme.colors.accent }]}>
                Changer la photo...
              </Text>
            </TouchableOpacity>
          </View>

          {/* Champ Prénom */}
          <View style={styles.editInputGroup}>
            <Text style={[styles.editInputLabel, { color: theme.colors.textSecondary }]}>
              VOTRE PRÉNOM OU PSEUDO
            </Text>
            <View
              style={[
                styles.editInputContainer,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: isInputFocused ? theme.colors.accent : theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={isInputFocused ? theme.colors.accent : theme.colors.textMuted}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={[styles.editTextInput, { color: theme.colors.textPrimary }]}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Ex: Alexandre"
                placeholderTextColor={theme.colors.textMuted}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                maxLength={25}
                autoCorrect={false}
              />
              {nameInput.length > 0 && (
                <TouchableOpacity onPress={() => setNameInput('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.sheetActionsRow}>
            <TouchableOpacity
              style={[
                styles.sheetCancelSmallBtn,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setIsEditProfileModalOpen(false)}
            >
              <Text style={[styles.sheetCancelSmallText, { color: theme.colors.textPrimary }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sheetSaveBtn,
                {
                  backgroundColor: theme.colors.accent,
                  opacity: nameInput.trim().length > 0 ? 1 : 0.45,
                },
              ]}
              activeOpacity={0.8}
              disabled={nameInput.trim().length === 0}
              onPress={handleSaveName}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : '#FFFFFF'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.sheetSaveBtnText,
                  {
                    color: theme.isDark && theme.id === 'midnight-titanium'
                      ? '#000000'
                      : '#FFFFFF',
                  },
                ]}
              >
                Enregistrer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>

    {/* 3. Modal de Réinitialisation Complète */}
    <Modal
      visible={isResetModalOpen}
      animationType="slide"
      transparent
      onRequestClose={() => setIsResetModalOpen(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsResetModalOpen(false)}
        />
        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderLeftColor: theme.colors.border,
              borderRightColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.colors.border }]} />

          <View style={styles.resetModalIconWrap}>
            <View style={[styles.resetIconCircle, { backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}>
              <Ionicons name="warning" size={28} color={theme.colors.expenseText} />
            </View>
          </View>

          <Text style={[styles.resetModalTitle, { color: theme.colors.textPrimary }]}>
            Réinitialiser l'application ?
          </Text>
          <Text style={[styles.resetModalDesc, { color: theme.colors.textSecondary }]}>
            Cette action va effacer toutes les transactions et remettre l’application à zéro, comme lors de la première installation.
          </Text>

          <View style={styles.resetActions}>
            <TouchableOpacity
              style={[styles.resetConfirmBtn, { backgroundColor: theme.colors.expenseText }]}
              activeOpacity={0.8}
              onPress={handleExecuteReset}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.resetConfirmBtnText}>Tout effacer et réinitialiser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resetCancelBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
              activeOpacity={0.7}
              onPress={() => setIsResetModalOpen(false)}
            >
              <Text style={[styles.resetCancelBtnText, { color: theme.colors.textPrimary }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
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
  editPencilBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editProfileBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 2,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    ...THEME.shadows.floating,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
    opacity: 0.4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAvatarPreviewWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  sheetAvatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheetAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  sheetOptions: {
    gap: 10,
    marginVertical: 12,
  },
  sheetOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  sheetOptionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sheetOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  sheetOptionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetCancelBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editProfileAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  editProfileAvatarTouchable: {
    position: 'relative',
  },
  editProfileAvatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  editProfileAvatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  editProfileCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  editProfileAvatarLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  editProfileAvatarHint: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  editInputGroup: {
    marginBottom: 18,
  },
  editInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  editTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  sheetCancelSmallBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sheetCancelSmallText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetSaveBtn: {
    flex: 1.6,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resetModalIconWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  resetIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  resetModalDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 18,
  },
  resetActions: {
    gap: 10,
  },
  resetConfirmBtn: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resetCancelBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 32,
    alignSelf: 'center',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    ...THEME.shadows.floating,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
