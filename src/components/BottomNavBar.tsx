import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';

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
  const handleTabPress = (tab: NavTab) => {
    triggerHaptic('selection');
    onSelectTab(tab);
  };

  const handleAddPress = () => {
    triggerHaptic('medium');
    onAddPress();
  };

  return (
    <View style={styles.floatingWrapper}>
      <View style={styles.navBar}>
        {/* Onglet 1: Accueil */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress('home')}
        >
          <Ionicons
            name={currentTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={currentTab === 'home' ? THEME.colors.textPrimary : THEME.colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              currentTab === 'home' && styles.navLabelActive,
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
            color={currentTab === 'analytics' ? THEME.colors.textPrimary : THEME.colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              currentTab === 'analytics' && styles.navLabelActive,
            ]}
          >
            Analyses
          </Text>
        </TouchableOpacity>

        {/* Bouton Central Noir Flottant (Exactement comme sur la photo de référence) */}
        <TouchableOpacity
          style={styles.centerButton}
          activeOpacity={0.85}
          onPress={handleAddPress}
        >
          <View style={styles.centerButtonInner}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
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
            color={currentTab === 'scanner' ? THEME.colors.textPrimary : THEME.colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              currentTab === 'scanner' && styles.navLabelActive,
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
            color={currentTab === 'profile' ? THEME.colors.textPrimary : THEME.colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              currentTab === 'profile' && styles.navLabelActive,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ECECEE',
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
    fontWeight: '500',
    color: THEME.colors.textSecondary,
    marginTop: 3,
  },
  navLabelActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111111',
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
