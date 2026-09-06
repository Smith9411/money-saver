import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
          <View style={[styles.avatarContainer, { borderColor: theme.colors.surface, backgroundColor: theme.colors.accent }]}>
            {/* Silhouette / Avatar ultra élégant */}
            <View style={[styles.avatarInner, { backgroundColor: theme.colors.accent }]}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
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
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...THEME.shadows.subtle,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
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
