import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Project } from '../types';
import { theme } from '../constants/theme';
import { formatDeadline } from '../utils/dateFormatter';

const { width, height } = Dimensions.get('window');

interface ProjectDetailsModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  visible,
  project,
  onClose,
  onLike,
  onPass,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!project) return null;

  const allImages = [
    project.customImageUrl || project.images[0],
    ...project.images.filter((img) => img !== project.customImageUrl),
  ].filter(Boolean);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du projet</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Images Gallery */}
          <View style={styles.imageSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setActiveImageIndex(index);
              }}
            >
              {allImages.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.image} />
              ))}
            </ScrollView>

            {/* Image Pagination */}
            {allImages.length > 1 && (
              <View style={styles.pagination}>
                {allImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Title & Category */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{project.productName || project.title}</Text>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.categoryBadge}
              >
                <Text style={styles.categoryText}>{project.category}</Text>
              </LinearGradient>
            </View>

            {/* Design Type */}
            {project.designType && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type de création:</Text>
                <Text style={styles.infoValue}>{project.designType}</Text>
              </View>
            )}

            {/* Budget */}
            <View style={styles.budgetSection}>
              <Text style={styles.sectionTitle}>Budget</Text>
              <LinearGradient
                colors={theme.gradients.warm}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.budgetCard}
              >
                <Text style={styles.budgetAmount}>
                  {project.basePrice
                    ? `${project.basePrice} ${project.budget.currency}`
                    : `${project.budget.min} - ${project.budget.max} ${project.budget.currency}`}
                </Text>
              </LinearGradient>
            </View>

            {/* Deadline */}
            {project.deadline && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Délai souhaité:</Text>
                <Text style={styles.infoValue}>{formatDeadline(project.deadline)}</Text>
              </View>
            )}

            {/* Location */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Localisation:</Text>
              <Text style={styles.infoValue}>
                {project.city || project.location}
              </Text>
            </View>

            {/* Client Info */}
            <View style={styles.clientSection}>
              <Text style={styles.sectionTitle}>Client</Text>
              <View style={styles.clientCard}>
                {project.client.profileImage && (
                  <Image
                    source={{ uri: project.client.profileImage }}
                    style={styles.clientImage}
                  />
                )}
                <Text style={styles.clientName}>{project.client.name}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{project.description}</Text>
            </View>

            {/* Requirements */}
            {project.requirements && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exigences</Text>
                <Text style={styles.description}>{project.requirements}</Text>
              </View>
            )}

            {/* Specifications */}
            {project.specifications && project.specifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Spécifications</Text>
                {project.specifications.map((spec, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{spec}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Materials */}
            {project.materials && project.materials.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Matériaux</Text>
                <View style={styles.materialsContainer}>
                  {project.materials.map((material, index) => (
                    <View key={index} style={styles.materialChip}>
                      <Text style={styles.materialText}>{material}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Measurements */}
            {project.measurements && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mensurations</Text>
                <View style={styles.measurementsGrid}>
                  {project.measurements.bust && (
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Tour de poitrine</Text>
                      <Text style={styles.measurementValue}>{project.measurements.bust} cm</Text>
                    </View>
                  )}
                  {project.measurements.waist && (
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Tour de taille</Text>
                      <Text style={styles.measurementValue}>{project.measurements.waist} cm</Text>
                    </View>
                  )}
                  {project.measurements.hips && (
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Tour de hanches</Text>
                      <Text style={styles.measurementValue}>{project.measurements.hips} cm</Text>
                    </View>
                  )}
                  {project.measurements.height && (
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Hauteur</Text>
                      <Text style={styles.measurementValue}>{project.measurements.height} cm</Text>
                    </View>
                  )}
                  {project.measurements.other && Object.entries(project.measurements.other).map(([key, value]) => (
                    <View key={key} style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>{key}</Text>
                      <Text style={styles.measurementValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={onPass} style={styles.passButton}>
            <Text style={styles.passIcon}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLike}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.likeButton}
            >
              <Text style={styles.likeIcon}>❤️</Text>
              <Text style={styles.likeText}>J'aime et proposer un devis</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    ...theme.shadows.small,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    height: height * 0.4,
    backgroundColor: theme.colors.textPrimary,
  },
  image: {
    width,
    height: height * 0.4,
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.card,
    width: 24,
  },
  content: {
    padding: theme.spacing.md,
  },
  titleSection: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.radiusLg,
  },
  categoryText: {
    color: theme.colors.card,
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  budgetSection: {
    marginBottom: theme.spacing.lg,
  },
  budgetCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    alignItems: 'center',
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
  clientSection: {
    marginBottom: theme.spacing.lg,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    ...theme.shadows.small,
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  bullet: {
    fontSize: 16,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  materialChip: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.radiusLg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  materialText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  measurementsGrid: {
    gap: theme.spacing.md,
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
  },
  measurementLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    ...theme.shadows.medium,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passIcon: {
    fontSize: 32,
    color: theme.colors.danger,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.radiusXl,
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  likeIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  likeText: {
    color: theme.colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
