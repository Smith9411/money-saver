import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

interface ParticleBurstProps {
  color?: string;
  onComplete?: () => void;
  count?: number;
}

interface ParticleData {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

const DEFAULT_COLORS = ['#EF4444', '#F59E0B', '#E5B869', '#111111', '#6B7280'];

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  color,
  onComplete,
  count = 14,
}) => {
  const progress = useSharedValue(0);

  const particles: ParticleData[] = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
      const distance = 30 + Math.random() * 45;
      const size = 3 + Math.random() * 4;
      const pColor = color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      return { id: i, angle, distance, size, color: pColor };
    });
  }, [count, color]);

  useEffect(() => {
    progress.value = withTiming(
      1,
      {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }
    );
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.centerAnchor}>
        {particles.map((p) => {
          return <SingleParticle key={p.id} data={p} progress={progress} />;
        })}
      </View>
    </View>
  );
};

const SingleParticle: React.FC<{
  data: ParticleData;
  progress: SharedValue<number>;
}> = ({ data, progress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const x = Math.cos(data.angle) * data.distance * t;
    const y = Math.sin(data.angle) * data.distance * t;
    const scale = (1 - t) * (1 + (1 - t) * 0.5);
    const opacity = 1 - t;

    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: data.size,
          height: data.size,
          borderRadius: data.size / 2,
          backgroundColor: data.color,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  centerAnchor: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});
