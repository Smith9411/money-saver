import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onCalendarPress?: () => void;
  onSearchPress?: () => void;
  onOptionsPress?: () => void;
  onProfilePress?: () => void;
  dateText?: string;
  userName?: string;
  userAvatar?: string | null;
}

const getTodayDateString = () => {
  try {
    const d = new Date();
    const formatted = d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return 'Aujourd’hui';
  }
};

export const Header: React.FC<HeaderProps> = ({
  onCalendarPress,
  onSearchPress,
  onOptionsPress,
  onProfilePress,
  dateText,
  userName = '',
  userAvatar,
}) => {
  const { theme } = useTheme();
  const displayDate = dateText || getTodayDateString();

  return (
    <View style={styles.container}>
      {/* Profil avatar & salutation */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.profileSection}
          activeOpacity={0.8}
          onPress={onProfilePress}
        >
          {/* Anneau délicat adapté au thème actif */}
          <View
            style={[
              styles.avatarHaloRing,
              {
                borderColor: theme.colors.accent,
                backgroundColor: theme.colors.background,
                shadowColor: theme.colors.accent,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: theme.colors.accent,
                  borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarInner, { backgroundColor: theme.colors.accent }]}>
                  <Ionicons
                    name="person"
                    size={19}
                    color={theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : '#FFFFFF'}
                  />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Bouton calendrier / analyses épuré */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.calendarActionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            activeOpacity={0.7}
            onPress={onCalendarPress}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Titre & Date */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>{displayDate}</Text>
        <Text style={[styles.greetingTitle, { color: theme.colors.textPrimary }]}>
          {userName && userName.trim().length > 0
            ? `Bonjour, ${userName.trim()}`
            : 'Bonjour,'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarHaloRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  greetingContainer: {
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.6,
  },
});
