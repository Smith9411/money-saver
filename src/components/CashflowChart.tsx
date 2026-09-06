import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { THEME } from '../constants/theme';
import { TimePeriod, Transaction } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';

interface CashflowChartProps {
  period: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;
  transactions: Transaction[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - THEME.spacing.lg * 2;
const CHART_HEIGHT = 160;

export const CashflowChart: React.FC<CashflowChartProps> = ({
  period,
  onPeriodChange,
  transactions,
}) => {
  // Calcul dynamique des vraies dépenses selon la période
  const currentData = useMemo(() => {
    const expenses = transactions.filter((tx) => tx.type === 'expense');

    if (period === 'week') {
      // 7 jours : Lun, Mar, Mer, Jeu, Ven, Sam, Dim
      const daysLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const now = new Date();
      const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Lundi, 6 = Dimanche

      // Initialiser chaque jour de la semaine courante
      const result = daysLabels.map((label, index) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (currentDayOfWeek - index));
        const dateKey = d.toISOString().split('T')[0];

        // Sommer les vraies dépenses ayant cette date exacte
        const dayTotal = expenses
          .filter((tx) => tx.date === dateKey)
          .reduce((sum, tx) => sum + tx.amount, 0);

        return {
          label,
          amount: Math.round(dayTotal * 100) / 100,
          dateKey,
        };
      });

      return result;
    } else {
      // 4 semaines du mois
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const weeks = [
        { label: 'Sem 1', startDay: 1, endDay: 7 },
        { label: 'Sem 2', startDay: 8, endDay: 14 },
        { label: 'Sem 3', startDay: 15, endDay: 21 },
        { label: 'Sem 4', startDay: 22, endDay: 31 },
      ];

      return weeks.map((w) => {
        const weekTotal = expenses
          .filter((tx) => {
            const txD = new Date(tx.date);
            return (
              txD.getFullYear() === currentYear &&
              txD.getMonth() === currentMonth &&
              txD.getDate() >= w.startDay &&
              txD.getDate() <= w.endDay
            );
          })
          .reduce((sum, tx) => sum + tx.amount, 0);

        return {
          label: w.label,
          amount: Math.round(weekTotal * 100) / 100,
        };
      });
    }
  }, [transactions, period]);

  // Index du montant le plus élevé (ou le dernier jour avec dépense)
  const maxIdx = useMemo(() => {
    let best = 0;
    for (let i = 0; i < currentData.length; i++) {
      if (currentData[i].amount > currentData[best].amount) {
        best = i;
      }
    }
    return best;
  }, [currentData]);

  const [selectedIndex, setSelectedIndex] = useState<number>(maxIdx);

  // Mettre à jour la sélection quand les données changent
  React.useEffect(() => {
    setSelectedIndex(maxIdx);
  }, [maxIdx, period]);

  const paddingHorizontal = 18;
  const usableWidth = CHART_WIDTH - paddingHorizontal * 2;
  const rawMax = Math.max(...currentData.map((d) => d.amount), 10);
  const maxAmount = rawMax * 1.2;
  const minAmount = 0;

  // Calcul des coordonnées SVG réelles
  const points = currentData.map((d, index) => {
    const x = paddingHorizontal + (index / (currentData.length - 1)) * usableWidth;
    const y =
      CHART_HEIGHT -
      ((d.amount - minAmount) / (maxAmount - minAmount)) * (CHART_HEIGHT - 50) -
      24;
    return { x, y, label: d.label, amount: d.amount };
  });

  // Construction d'une courbe de Bézier lissée
  const createSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) * 0.45;
      const cp1y = p0.y;
      const cp2x = p1.x - (p1.x - p0.x) * 0.45;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

  const activePoint = points[selectedIndex] || points[0];

  const cyclePeriod = () => {
    triggerHaptic('light');
    if (period === 'week') {
      onPeriodChange('month');
    } else {
      onPeriodChange('week');
    }
  };

  const totalPeriod = currentData.reduce((sum, d) => sum + d.amount, 0);

  return (
    <View style={styles.container}>
      {/* En-tête de section avec sélecteur de période */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Aperçu des dépenses</Text>
          <Text style={styles.sectionSubtitle}>
            Total sur la période :{' '}
            <Text style={styles.totalBold}>{totalPeriod.toFixed(2)} €</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.periodPill}
          activeOpacity={0.7}
          onPress={cyclePeriod}
        >
          <Text style={styles.periodPillText}>
            {period === 'week' ? 'Cette semaine' : 'Ce mois'}
          </Text>
          <Ionicons name="chevron-down" size={13} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Zone Graphique SVG dynamique */}
      <View style={styles.chartContainer}>
        {/* Tooltip badge noir flottant indiquant le vrai montant */}
        {activePoint && (
          <View
            style={[
              styles.floatingBadge,
              {
                left: Math.max(10, Math.min(CHART_WIDTH - 90, activePoint.x - 38)),
                top: Math.max(0, activePoint.y - 36),
              },
            ]}
          >
            <View style={styles.badgeContent}>
              <Ionicons name="arrow-up" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.badgeText}>{activePoint.amount.toFixed(2)} €</Text>
            </View>
            <View style={styles.badgeArrow} />
          </View>
        )}

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#111111" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#111111" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Lignes pointillées verticales d'arrière-plan */}
          {points.map((pt, i) => (
            <Line
              key={`grid-${i}`}
              x1={pt.x}
              y1={15}
              x2={pt.x}
              y2={CHART_HEIGHT - 10}
              stroke={i === selectedIndex ? '#111111' : '#E5E5EA'}
              strokeWidth={i === selectedIndex ? 1.2 : 0.8}
              strokeDasharray={i === selectedIndex ? '4 3' : '3 4'}
              opacity={i === selectedIndex ? 0.8 : 0.5}
            />
          ))}

          {/* Surface sous la courbe */}
          <Path d={areaPath} fill="url(#chartGradient)" />

          {/* Courbe continue noire */}
          <Path
            d={linePath}
            fill="none"
            stroke="#111111"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point actif avec anneau blanc */}
          {activePoint && (
            <>
              <Circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={6}
                fill="#FFFFFF"
                stroke="#111111"
                strokeWidth={2.4}
              />
              <Circle cx={activePoint.x} cy={activePoint.y} r={2.5} fill="#111111" />
            </>
          )}
        </Svg>

        {/* Axe des abscisses interactif */}
        <View style={styles.labelsRow}>
          {points.map((pt, index) => (
            <TouchableOpacity
              key={`label-${index}`}
              activeOpacity={0.6}
              onPress={() => {
                triggerHaptic('selection');
                setSelectedIndex(index);
              }}
              style={[
                styles.labelBtn,
                { width: usableWidth / currentData.length },
              ]}
            >
              <Text
                style={[
                  styles.labelText,
                  index === selectedIndex && styles.labelActiveText,
                ]}
              >
                {pt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: THEME.spacing.lg,
    marginVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  totalBold: {
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  periodPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  chartContainer: {
    position: 'relative',
    marginTop: 10,
    alignItems: 'center',
  },
  floatingBadge: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.sm,
    ...THEME.shadows.subtle,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 0,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#111111',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  labelBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textMuted,
  },
  labelActiveText: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
});
