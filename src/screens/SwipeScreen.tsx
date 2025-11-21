import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSwipe } from '../context/SwipeContext';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { COLORS, SIZES, GRADIENTS } from '../constants/theme';
import { Project } from '../types';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface SwipeScreenProps {
  navigation: any;
}

export const SwipeScreen = ({ navigation }: SwipeScreenProps) => {
  const { projects, likeProject, passProject, refreshProjects } = useSwipe();

  // Recharger les projets quand l'écran est affiché
  useFocusEffect(
    React.useCallback(() => {
      refreshProjects();
    }, [])
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const [likeOpacity] = useState(new Animated.Value(0));
  const [nopeOpacity] = useState(new Animated.Value(0));
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });

        // Update like/nope opacity based on swipe direction
        if (gesture.dx > 0) {
          likeOpacity.setValue(gesture.dx / SWIPE_THRESHOLD);
          nopeOpacity.setValue(0);
        } else {
          nopeOpacity.setValue(Math.abs(gesture.dx) / SWIPE_THRESHOLD);
          likeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe right - Like
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left - Pass
          swipeLeft();
        } else {
          // Reset position
          resetPosition();
        }
      },
    })
  ).current;

  const swipeRight = () => {
    const currentProject = projects[currentIndex];
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      likeProject(currentProject.id);
      // Navigate to quote screen
      navigation.navigate('QuoteModal', { project: currentProject });
      nextCard();
    });
  };

  const swipeLeft = () => {
    const currentProject = projects[currentIndex];
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      passProject(currentProject.id);
      nextCard();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    likeOpacity.setValue(0);
    nopeOpacity.setValue(0);
  };

  const nextCard = () => {
    position.setValue({ x: 0, y: 0 });
    likeOpacity.setValue(0);
    nopeOpacity.setValue(0);
    setCurrentIndex(currentIndex + 1);
  };

  const handleLikePress = () => {
    swipeRight();
  };

  const handlePassPress = () => {
    swipeLeft();
  };

  const handleDetailsPress = () => {
    setShowDetailsModal(true);
  };

  const handleDetailsLike = () => {
    setShowDetailsModal(false);
    swipeRight();
  };

  const handleDetailsPass = () => {
    setShowDetailsModal(false);
    swipeLeft();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-width / 2, 0, width / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  if (currentIndex >= projects.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>🎉 C'est tout pour le moment !</Text>
        <Text style={styles.emptyText}>
          Vous avez vu tous les projets disponibles. Revenez plus tard pour de
          nouvelles opportunités !
        </Text>
      </View>
    );
  }

  const currentProject = projects[currentIndex];
  const nextProject = projects[currentIndex + 1];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Découvrir</Text>
        <Text style={styles.headerSubtitle}>
          {projects.length - currentIndex} projet{projects.length - currentIndex > 1 ? 's' : ''} disponible
          {projects.length - currentIndex > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {/* Next card (background) */}
        {nextProject && (
          <View style={[styles.cardWrapper, styles.nextCard]}>
            <ProjectCard project={nextProject} />
          </View>
        )}

        {/* Current card (animated) */}
        <Animated.View
          style={[styles.cardWrapper, getCardStyle()]}
          {...panResponder.panHandlers}
        >
          <ProjectCard project={currentProject} />

          {/* Like overlay */}
          <Animated.View
            style={[
              styles.overlay,
              styles.likeOverlay,
              { opacity: likeOpacity },
            ]}
          >
            <Text style={styles.overlayText}>LIKE</Text>
          </Animated.View>

          {/* Nope overlay */}
          <Animated.View
            style={[
              styles.overlay,
              styles.nopeOverlay,
              { opacity: nopeOpacity },
            ]}
          >
            <Text style={styles.overlayText}>PASS</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePassPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>✕</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={handleDetailsPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6C5CE7', '#A29BFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.buttonGradient, styles.detailsGradient]}
          >
            <Text style={[styles.buttonIcon, styles.detailsIcon]}>👁</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLikePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>♥</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        visible={showDetailsModal}
        project={currentProject}
        onClose={() => setShowDetailsModal(false)}
        onLike={handleDetailsLike}
        onPass={handleDetailsPass}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  headerTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
  nextCard: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: SIZES.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeOverlay: {
    backgroundColor: 'rgba(149, 225, 211, 0.8)',
  },
  nopeOverlay: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
  },
  overlayText: {
    fontSize: SIZES.fontXxl * 1.5,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SIZES.md,
    paddingBottom: SIZES.xxl + SIZES.md,
    gap: SIZES.lg,
  },
  actionButton: {
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  superLikeButton: {
    transform: [{ scale: 0.8 }],
  },
  superLikeGradient: {
    width: 56,
    height: 56,
  },
  buttonIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  superLikeIcon: {
    fontSize: 28,
  },
  detailsButton: {
    transform: [{ scale: 0.8 }],
  },
  detailsGradient: {
    width: 56,
    height: 56,
  },
  detailsIcon: {
    fontSize: 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: COLORS.background,
  },
  emptyTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  emptyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
