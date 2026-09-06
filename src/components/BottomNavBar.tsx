import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';
import { useTheme } from '../context/ThemeContext';

export type NavTab = 'home' | 'analytics' | 'scanner' | 'profile';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onAddPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onAddPress,
}) => {
  const { theme } = useTheme();
  const handleTabPress = (tab: NavTab) => {
    triggerHaptic('selection');
    onSelectTab(tab);
  };

  const handleAddPress = () => {
    triggerHaptic('medium');
    onAddPress();
  };

  const activeColor = theme.colors.accent;
  const inactiveColor = theme.colors.textSecondary;

  return (
    <View style={styles.floatingWrapper}>
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Onglet 1: Accueil */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress('home')}
        >
          <Ionicons
            name={currentTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={currentTab === 'home' ? activeColor : inactiveColor}
          />
          <Text
            style={[
              styles.navLabel,
              {
                color: currentTab === 'home' ? activeColor : inactiveColor,
                fontWeight: currentTab === 'home' ? '700' : '500',
              },
            ]}
          >
            Accueil
          </Text>
        </TouchableOpacity>

        {/* Onglet 2: Statistiques / Analyses */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress('analytics')}
        >
          <Ionicons
            name={currentTab === 'analytics' ? 'bar-chart' : 'bar-chart-outline'}
            size={22}
            color={currentTab === 'analytics' ? activeColor : inactiveColor}
          />
          <Text
            style={[
              styles.navLabel,
              {
                color: currentTab === 'analytics' ? activeColor : inactiveColor,
                fontWeight: currentTab === 'analytics' ? '700' : '500',
              },
            ]}
          >
            Analyses
          </Text>
        </TouchableOpacity>

        {/* Bouton Central Flottant avec couleur d'accent du thème */}
        <TouchableOpacity
          style={[styles.centerButton, { backgroundColor: activeColor }]}
          activeOpacity={0.85}
          onPress={handleAddPress}
        >
          <View style={styles.centerButtonInner}>
            <Ionicons
              name="sparkles"
              size={20}
              color={theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : '#FFFFFF'}
            />
          </View>
        </TouchableOpacity>

        {/* Onglet 3: Scanner Reçus */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress('scanner')}
        >
          <Ionicons
            name={currentTab === 'scanner' ? 'scan' : 'scan-outline'}
            size={22}
            color={currentTab === 'scanner' ? activeColor : inactiveColor}
          />
          <Text
            style={[
              styles.navLabel,
              {
                color: currentTab === 'scanner' ? activeColor : inactiveColor,
                fontWeight: currentTab === 'scanner' ? '700' : '500',
              },
            ]}
          >
            Scanner
          </Text>
        </TouchableOpacity>

        {/* Onglet 4: Profil */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress('profile')}
        >
          <Ionicons
            name={currentTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={currentTab === 'profile' ? activeColor : inactiveColor}
          />
          <Text
            style={[
              styles.navLabel,
              {
                color: currentTab === 'profile' ? activeColor : inactiveColor,
                fontWeight: currentTab === 'profile' ? '700' : '500',
              },
            ]}
          >
            Profil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navBar: {
    width: '100%',
    maxWidth: 420,
    height: 70,
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    borderWidth: 1,
    ...THEME.shadows.floating,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 3,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
    marginHorizontal: 4,
  },
  centerButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

