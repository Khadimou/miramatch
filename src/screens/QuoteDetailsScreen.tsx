import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Quote, Project } from '../types';
import { apiService } from '../services/apiService';
import { theme } from '../constants/theme';

type RootStackParamList = {
  QuoteDetails: { quoteId: string };
  EditQuote: { quote: Quote; project: Project };
};

type QuoteDetailsRouteProp = RouteProp<RootStackParamList, 'QuoteDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const QuoteDetailsScreen = () => {
  const route = useRoute<QuoteDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { quoteId } = route.params;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuoteDetails();
  }, [quoteId]);

  const loadQuoteDetails = async () => {
    try {
      setIsLoading(true);

      // Charger le devis
      const quoteData = await apiService.getQuoteById(quoteId);
      setQuote(quoteData);

      // Charger le projet associé
      const projectData = await apiService.getProjectById(quoteData.projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Load quote details error:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la proposition');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (quote && project) {
      navigation.navigate('EditQuote', { quote, project });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la proposition',
      'Êtes-vous sûr de vouloir supprimer cette proposition ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteQuote(quoteId);
              Alert.alert('Succès', 'Proposition supprimée avec succès');
              navigation.goBack();
            } catch (error) {
              console.error('Delete quote error:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la proposition');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!quote || !project) {
    return null;
  }

  const canModify = quote.status === 'pending';

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.card} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la proposition</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <StatusBadge status={quote.status} />
        </View>

        {/* Project Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projet</Text>
          <View style={styles.projectCard}>
            <Image
              source={{
                uri: project.customImageUrl || project.images[0] || 'https://via.placeholder.com/100',
              }}
              style={styles.projectImage}
            />
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle} numberOfLines={2}>
                {project.productName || project.title}
              </Text>
              <Text style={styles.projectCategory}>{project.category}</Text>
            </View>
          </View>
        </View>

        {/* Quote Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre proposition</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Prix proposé</Text>
            <Text style={styles.detailValue}>
              {quote.price} {quote.currency}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Délai de livraison</Text>
            <Text style={styles.detailValue}>{quote.deliveryTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date d'envoi</Text>
            <Text style={styles.detailValue}>
              {new Date(quote.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          {quote.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.detailLabel}>Message</Text>
              <Text style={styles.messageText}>{quote.message}</Text>
            </View>
          )}

          {quote.detailedProposal && (
            <View style={styles.messageContainer}>
              <Text style={styles.detailLabel}>Proposition détaillée</Text>
              <Text style={styles.messageText}>{quote.detailedProposal}</Text>
            </View>
          )}

          {quote.attachments && quote.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.detailLabel}>Pièces jointes</Text>
              <Text style={styles.attachmentCount}>
                {quote.attachments.length} fichier(s) joint(s)
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {canModify && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={theme.colors.card} />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.card} />
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}

        {!canModify && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              Vous ne pouvez plus modifier cette proposition car elle a déjà été{' '}
              {quote.status === 'accepted' ? 'acceptée' : 'refusée'} par le client.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const StatusBadge = ({ status }: { status: Quote['status'] }) => {
  const statusConfig = {
    pending: {
      color: theme.colors.warning,
      text: 'En attente',
      icon: 'time-outline',
    },
    accepted: {
      color: theme.colors.success,
      text: 'Acceptée',
      icon: 'checkmark-circle-outline',
    },
    rejected: {
      color: theme.colors.danger,
      text: 'Refusée',
      icon: 'close-circle-outline',
    },
  };

  const config = statusConfig[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
      <Ionicons name={config.icon as any} size={20} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
  content: {
    flex: 1,
  },
  statusContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusLg,
    gap: theme.spacing.sm,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  projectCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.radiusMd,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  projectImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.radiusMd,
    marginRight: theme.spacing.md,
  },
  projectInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  projectCategory: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  messageContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.radiusMd,
  },
  messageText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },
  attachmentsContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.radiusMd,
  },
  attachmentCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.card,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.danger,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.card,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.radiusMd,
    gap: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
});
