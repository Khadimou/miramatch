import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSwipe } from '../context/SwipeContext';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '../constants/theme';
import { Project } from '../types';

interface MatchesScreenProps {
  navigation: any;
}

export const MatchesScreen = ({ navigation }: MatchesScreenProps) => {
  const { getMatchedProjects, matches, quotes } = useSwipe();
  const matchedProjects = getMatchedProjects();

  const hasQuoteForProject = (projectId: string) => {
    return quotes.some((quote) => quote.projectId === projectId);
  };

  const renderProject = ({ item }: { item: Project }) => {
    const hasQuote = hasQuoteForProject(item.id);
    const quote = quotes.find((q) => q.projectId === item.id);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => {
          if (!hasQuote) {
            navigation.navigate('QuoteModal', { project: item });
          }
        }}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{
              uri: item.images[0] || 'https://via.placeholder.com/100',
            }}
            style={styles.projectImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
        </View>

        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle} numberOfLines={2}>{item.title}</Text>

          <View style={styles.budgetContainer}>
            <LinearGradient
              colors={GRADIENTS.warm}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.budgetBadge}
            >
              <Text style={styles.budgetIcon}>💰</Text>
              <Text style={styles.projectBudget}>
                {item.budget.min}-{item.budget.max} {item.budget.currency}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.clientRow}>
            <Text style={styles.clientIcon}>👤</Text>
            <Text style={styles.clientName}>{item.client.name}</Text>
          </View>

          {hasQuote && quote ? (
            <LinearGradient
              colors={GRADIENTS.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quoteStatus}
            >
              <Text style={styles.quoteStatusIcon}>✓</Text>
              <Text style={styles.quoteStatusText}>
                Devis envoyé: {quote.price} {quote.currency || '€'}
              </Text>
            </LinearGradient>
          ) : (
            <BlurView intensity={80} tint="light" style={styles.pendingStatus}>
              <LinearGradient
                colors={[COLORS.warning, COLORS.warning]}
                style={styles.pendingStatusInner}
              >
                <Text style={styles.pendingStatusIcon}>⏳</Text>
                <Text style={styles.pendingStatusText}>
                  Cliquez pour envoyer un devis
                </Text>
              </LinearGradient>
            </BlurView>
          )}
        </View>

        {!hasQuote && (
          <View style={styles.arrowContainer}>
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.arrowCircle}
            >
              <Text style={styles.arrowText}>→</Text>
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (matchedProjects.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={['#FFFFFF', '#FAFBFF', '#F5F7FF']}
          style={styles.emptyContainer}
        >
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.emptyIconCircle}
              >
                <Text style={styles.emptyIcon}>💫</Text>
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>Aucun match pour le moment</Text>
            <Text style={styles.emptyText}>
              Likez des projets dans l'onglet "Découvrir" pour les voir apparaître ici et proposer vos devis !
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Discover')}
              style={styles.emptyButton}
            >
              <LinearGradient
                colors={GRADIENTS.warm}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>🔥 Découvrir des projets</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Calculer les statistiques
  const quotedCount = quotes.length;
  const pendingCount = matchedProjects.length - quotedCount;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>💬 Mes Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matchedProjects.length} projet{matchedProjects.length > 1 ? 's' : ''} liké{matchedProjects.length > 1 ? 's' : ''}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{quotedCount}</Text>
            <Text style={styles.statLabel}>Devis envoyés</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={matchedProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    paddingTop: SIZES.md,
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.lg,
  },
  headerTitle: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.fontMd,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SIZES.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: SIZES.fontSm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SIZES.md,
  },
  listContent: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl + SIZES.xl,
  },
  projectCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardImageContainer: {
    position: 'relative',
    height: 150,
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  projectInfo: {
    padding: SIZES.lg,
  },
  projectTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  budgetContainer: {
    marginBottom: SIZES.md,
  },
  budgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignSelf: 'flex-start',
  },
  budgetIcon: {
    fontSize: 16,
    marginRight: SIZES.xs,
  },
  projectBudget: {
    fontSize: SIZES.fontMd,
    color: COLORS.white,
    fontWeight: '700',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  clientIcon: {
    fontSize: 14,
    marginRight: SIZES.xs,
  },
  clientName: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  quoteStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
  },
  quoteStatusIcon: {
    fontSize: 16,
    marginRight: SIZES.xs,
  },
  quoteStatusText: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    fontWeight: '600',
  },
  pendingStatus: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  pendingStatusInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  pendingStatusIcon: {
    fontSize: 16,
    marginRight: SIZES.xs,
  },
  pendingStatusText: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    fontWeight: '600',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: SIZES.lg,
    right: SIZES.lg,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    padding: SIZES.xxl,
    paddingBottom: SIZES.xxl + SIZES.xl,
  },
  emptyIconContainer: {
    marginBottom: SIZES.xl,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: SIZES.fontXxl,
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
    marginBottom: SIZES.xl,
  },
  emptyButton: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
  },
  emptyButtonText: {
    fontSize: SIZES.fontLg,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
