import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { THEME } from '../constants/theme';
import { TimePeriod } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface CashflowChartProps {
  period: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;
  dataPoints?: { label: string; amount: number }[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - THEME.spacing.lg * 2;
const CHART_HEIGHT = 160;

export const CashflowChart: React.FC<CashflowChartProps> = ({
  period,
  onPeriodChange,
}) => {
  // Données représentatives selon la période
  const weekData = [
    { label: 'Lun', amount: 45 },
    { label: 'Mar', amount: 28 },
    { label: 'Mer', amount: 52 },
    { label: 'Jeu', amount: 89 }, // Pic
    { label: 'Ven', amount: 40 },
    { label: 'Sam', amount: 35 },
    { label: 'Dim', amount: 62 },
  ];

  const monthData = [
    { label: 'Sem 1', amount: 320 },
    { label: 'Sem 2', amount: 450 },
    { label: 'Sem 3', amount: 610 },
    { label: 'Sem 4', amount: 280 },
  ];

  const currentData = period === 'month' ? monthData : weekData;

  // Index sélectionné (par défaut le point le plus haut comme sur l'image de référence)
  const maxIdx = currentData.reduce(
    (maxI, el, i, arr) => (el.amount > arr[maxI].amount ? i : maxI),
    0
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(maxIdx);

  const paddingHorizontal = 18;
  const usableWidth = CHART_WIDTH - paddingHorizontal * 2;
  const maxAmount = Math.max(...currentData.map((d) => d.amount)) * 1.25;
  const minAmount = 0;

  // Calcul des coordonnées
  const points = currentData.map((d, index) => {
    const x = paddingHorizontal + (index / (currentData.length - 1)) * usableWidth;
    const y = CHART_HEIGHT - ((d.amount - minAmount) / (maxAmount - minAmount)) * (CHART_HEIGHT - 45) - 20;
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

  // Surface dégradée sous la courbe
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

  const activePoint = points[selectedIndex] || points[maxIdx];

  const cyclePeriod = () => {
    if (period === 'week') {
      onPeriodChange('month');
      setSelectedIndex(2);
    } else {
      onPeriodChange('week');
      setSelectedIndex(3);
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête de section avec sélecteur de période */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Aperçu des dépenses</Text>
          <Text style={styles.sectionSubtitle}>
            {period === 'week' ? 'Vos dépenses de la semaine' : 'Vos dépenses mensuelles'}
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

      {/* Zone Graphique */}
      <View style={styles.chartContainer}>
        {/* Tooltip badge noir flottant (fidèle au design de référence) */}
        {activePoint && (
          <View
            style={[
              styles.floatingBadge,
              {
                left: Math.max(10, Math.min(CHART_WIDTH - 85, activePoint.x - 38)),
                top: Math.max(0, activePoint.y - 36),
              },
            ]}
          >
            <View style={styles.badgeContent}>
              <Ionicons name="arrow-up" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.badgeText}>{activePoint.amount} €</Text>
            </View>
            <View style={styles.badgeArrow} />
          </View>
        )}

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#111111" stopOpacity="0.04" />
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

          {/* Remplissage gradient sous la courbe */}
          <Path d={areaPath} fill="url(#chartGradient)" />

          {/* Ligne principale de la courbe */}
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
                r={6.5}
                fill="#FFFFFF"
                stroke="#111111"
                strokeWidth={2.5}
              />
              <Circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={2.5}
                fill="#111111"
              />
            </>
          )}
        </Svg>

        {/* Axe des abscisses (étiquettes interactives au toucher) */}
        <View style={styles.labelsRow}>
          {points.map((pt, index) => (
            <TouchableOpacity
              key={`label-${index}`}
              activeOpacity={0.6}
              onPress={() => setSelectedIndex(index)}
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
