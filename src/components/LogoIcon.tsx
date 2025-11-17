import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/theme';

interface LogoIconProps {
  size?: number;
  variant?: 'default' | 'gradient' | 'outlined' | 'minimal';
  style?: ViewStyle;
}

export const LogoIcon = ({
  size = 60,
  variant = 'default',
  style
}: LogoIconProps) => {
  const renderIcon = () => {
    switch (variant) {
      case 'gradient':
        return (
          <View style={[styles.container, { width: size, height: size }, style]}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientCircle, { borderRadius: size / 2 }]}
            >
              <View style={styles.innerShape}>
                {/* M stylisé avec des formes */}
                <View style={[styles.letterM, { width: size * 0.5, height: size * 0.6 }]}>
                  <View style={[styles.mBar, styles.mBarLeft]} />
                  <View style={[styles.mBar, styles.mBarMiddle]} />
                  <View style={[styles.mBar, styles.mBarRight]} />
                </View>
              </View>
            </LinearGradient>
          </View>
        );

      case 'outlined':
        return (
          <View style={[styles.container, { width: size, height: size }, style]}>
            <View style={[
              styles.outlinedCircle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: size * 0.05,
              }
            ]}>
              <View style={styles.innerShape}>
                <View style={[styles.letterM, { width: size * 0.5, height: size * 0.6 }]}>
                  <View style={[styles.mBar, styles.mBarLeft, { backgroundColor: COLORS.primary }]} />
                  <View style={[styles.mBar, styles.mBarMiddle, { backgroundColor: COLORS.primary }]} />
                  <View style={[styles.mBar, styles.mBarRight, { backgroundColor: COLORS.primary }]} />
                </View>
              </View>
            </View>
          </View>
        );

      case 'minimal':
        return (
          <View style={[styles.container, { width: size, height: size }, style]}>
            <View style={styles.innerShape}>
              <View style={[styles.letterM, { width: size * 0.7, height: size * 0.8 }]}>
                <View style={[styles.mBar, styles.mBarLeft, { backgroundColor: COLORS.primary }]} />
                <View style={[styles.mBar, styles.mBarMiddle, { backgroundColor: COLORS.secondary }]} />
                <View style={[styles.mBar, styles.mBarRight, { backgroundColor: COLORS.primary }]} />
              </View>
            </View>
          </View>
        );

      default: // 'default'
        return (
          <View style={[styles.container, { width: size, height: size }, style]}>
            <View style={[
              styles.defaultCircle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              }
            ]}>
              <View style={styles.innerShape}>
                {/* Icône stylisée M avec spark */}
                <View style={[styles.letterM, { width: size * 0.5, height: size * 0.6 }]}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.mBar, styles.mBarLeft]}
                  />
                  <View style={[styles.spark, { top: -size * 0.15, right: -size * 0.1 }]}>
                    <LinearGradient
                      colors={['#FFD700', '#FFA500']}
                      style={styles.sparkInner}
                    />
                  </View>
                  <LinearGradient
                    colors={[COLORS.secondary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.mBar, styles.mBarMiddle]}
                  />
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.mBar, styles.mBarRight]}
                  />
                </View>
              </View>
            </View>
          </View>
        );
    }
  };

  return renderIcon();
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultCircle: {
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientCircle: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlinedCircle: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerShape: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  letterM: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    position: 'relative',
  },
  mBar: {
    width: '28%',
    borderRadius: 100,
  },
  mBarLeft: {
    height: '100%',
  },
  mBarMiddle: {
    height: '60%',
  },
  mBarRight: {
    height: '100%',
  },
  spark: {
    position: 'absolute',
    width: 12,
    height: 12,
  },
  sparkInner: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
  },
});
