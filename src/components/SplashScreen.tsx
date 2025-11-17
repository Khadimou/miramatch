import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogoIcon } from './LogoIcon';
import { GRADIENTS, COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Cercles décoratifs animés */}
        <Animated.View
          style={[
            styles.circle,
            styles.circle1,
            {
              opacity: fadeAnim,
              transform: [{ rotate: spin }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.circle,
            styles.circle2,
            {
              opacity: fadeAnim,
              transform: [{ rotate: spin }],
            },
          ]}
        />

        {/* Logo Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LogoIcon size={140} variant="gradient" />
        </Animated.View>

        {/* Particles */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            { opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            { opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            { opacity: fadeAnim },
          ]}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circle1: {
    width: 300,
    height: 300,
  },
  circle2: {
    width: 400,
    height: 400,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  particle1: {
    top: height * 0.2,
    left: width * 0.2,
  },
  particle2: {
    top: height * 0.3,
    right: width * 0.15,
  },
  particle3: {
    bottom: height * 0.25,
    left: width * 0.7,
  },
});
