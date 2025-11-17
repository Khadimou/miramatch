import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Project } from '../types';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.65;

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const formatBudget = () => {
    return `${project.budget.min}-${project.budget.max}${project.budget.currency}`;
  };

  return (
    <View style={styles.card}>
      {/* Image avec overlay gradient */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: project.images[0] || 'https://via.placeholder.com/400x300',
          }}
          style={styles.image}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.imageOverlay}
        />

        {/* Badges en haut */}
        <View style={styles.topBadges}>
          <BlurView intensity={90} tint="light" style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{project.category}</Text>
          </BlurView>
          {project.deadline && (
            <BlurView intensity={90} tint="light" style={styles.deadlineBadge}>
              <Text style={styles.deadlineText}>
                ⏰ {new Date(project.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </Text>
            </BlurView>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Budget */}
        <View style={styles.header}>
          <Text style={styles.title}>{project.title}</Text>
          <LinearGradient
            colors={GRADIENTS.warm}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.budgetBadge}
          >
            <Text style={styles.budgetIcon}>💰</Text>
            <Text style={styles.budget}>{formatBudget()}</Text>
          </LinearGradient>
        </View>

        {/* Client Info */}
        <View style={styles.clientContainer}>
          <Image
            source={{
              uri: project.client.profileImage || 'https://i.pravatar.cc/50',
            }}
            style={styles.clientImage}
          />
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{project.client.name}</Text>
            <Text style={styles.location}>📍 {project.location}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{project.description}</Text>

        {/* Specifications */}
        {project.specifications && project.specifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Spécifications</Text>
            <View style={styles.specsContainer}>
              {project.specifications.map((spec, index) => (
                <View key={index} style={styles.specChip}>
                  <Text style={styles.specText}>✓ {spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Materials */}
        {project.materials && project.materials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 Matériaux</Text>
            <View style={styles.tagsContainer}>
              {project.materials.map((material, index) => (
                <LinearGradient
                  key={index}
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{material}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  imageContainer: {
    position: 'relative',
    height: CARD_HEIGHT * 0.45,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  topBadges: {
    position: 'absolute',
    top: SIZES.md,
    left: SIZES.md,
    right: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    borderRadius: 20,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSm,
    fontWeight: '700',
  },
  deadlineBadge: {
    borderRadius: 20,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  deadlineText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSm,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  header: {
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: SIZES.fontXl + 2,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
    lineHeight: 30,
  },
  budgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
  },
  budgetIcon: {
    fontSize: 18,
    marginRight: SIZES.xs,
  },
  budget: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    padding: SIZES.md,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
  },
  clientImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  location: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontMd + 1,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  specsContainer: {
    gap: SIZES.sm,
  },
  specChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  specText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  tag: {
    paddingHorizontal: SIZES.md + SIZES.xs,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
  },
  tagText: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    fontWeight: '600',
  },
});
