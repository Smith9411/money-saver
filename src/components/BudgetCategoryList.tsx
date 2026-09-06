import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { CategoryBudget } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface BudgetCategoryListProps {
  budgets: CategoryBudget[];
  onViewAll?: () => void;
}

export const BudgetCategoryList: React.FC<BudgetCategoryListProps> = ({
  budgets,
  onViewAll,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'coffee':
        return 'restaurant-outline';
      case 'home':
        return 'home-outline';
      case 'navigation':
        return 'car-outline';
      case 'shopping-bag':
        return 'bag-handle-outline';
      case 'play-circle':
        return 'film-outline';
      default:
        return 'wallet-outline';
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec 'Tout voir' */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Budgets & Catégories</Text>
        <TouchableOpacity activeOpacity={0.6} onPress={onViewAll}>
          <Text style={styles.viewAllText}>Tout voir</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des items de budget */}
      <View style={styles.listContainer}>
        {budgets.slice(0, 3).map((item, index) => {
          const isWarning = item.percentage > 85;

          return (
            <View key={item.category} style={styles.budgetItem}>
              <View style={styles.topRow}>
                {/* Icône dans un cercle doux */}
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={getCategoryIcon(item.iconName) as any}
                    size={18}
                    color={THEME.colors.textPrimary}
                  />
                </View>

                {/* Titre & sous-titre */}
                <View style={styles.infoCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <View style={styles.rightStats}>
                      <TouchableOpacity activeOpacity={0.6} style={styles.optionsBtn}>
                        <Ionicons
                          name="ellipsis-vertical"
                          size={14}
                          color={THEME.colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <Text
                        style={[
                          styles.percentageText,
                          isWarning && styles.percentageWarning,
                        ]}
                      >
                        {item.percentage}%
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.itemSubtitle}>
                    {item.spent} € dépensés sur {item.budget} €
                  </Text>

                  {/* Barre de progression fine noire (exactement comme le design de référence) */}
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor: isWarning
                            ? THEME.colors.expenseText
                            : THEME.colors.textPrimary,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338CA', // Touche subtile indigo élégante ou violet discret
  },
  listContainer: {
    gap: 12,
  },
  budgetItem: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.2,
    flex: 1,
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionsBtn: {
    padding: 2,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  percentageWarning: {
    color: THEME.colors.expenseText,
  },
  itemSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 4,
    width: '100%',
    backgroundColor: THEME.colors.surfaceMuted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
