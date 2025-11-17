import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSwipe } from '../context/SwipeContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
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
      >
        <Image
          source={{
            uri: item.images[0] || 'https://via.placeholder.com/100',
          }}
          style={styles.projectImage}
        />
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectBudget}>
            {item.budget.min}-{item.budget.max}
            {item.budget.currency}
          </Text>
          <Text style={styles.clientName}>{item.client.name}</Text>
          {hasQuote && quote ? (
            <View style={styles.quoteStatus}>
              <Text style={styles.quoteStatusText}>
                ✓ Devis envoyé: {quote.price}€
              </Text>
            </View>
          ) : (
            <View style={styles.pendingStatus}>
              <Text style={styles.pendingStatusText}>
                En attente de devis
              </Text>
            </View>
          )}
        </View>
        {!hasQuote && (
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (matchedProjects.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun match pour le moment</Text>
          <Text style={styles.emptyText}>
            Likez des projets pour les voir apparaître ici et pouvoir proposer
            vos devis !
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matchedProjects.length} projet{matchedProjects.length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={matchedProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  listContent: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl + SIZES.xl,
  },
  projectCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  projectImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusMd,
    marginRight: SIZES.md,
  },
  projectInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  projectTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  projectBudget: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  clientName: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  quoteStatus: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    alignSelf: 'flex-start',
    marginTop: SIZES.xs,
  },
  quoteStatusText: {
    fontSize: SIZES.fontXs,
    color: COLORS.white,
    fontWeight: '600',
  },
  pendingStatus: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    alignSelf: 'flex-start',
    marginTop: SIZES.xs,
  },
  pendingStatusText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  arrow: {
    justifyContent: 'center',
    paddingLeft: SIZES.sm,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    paddingBottom: SIZES.xxl + SIZES.xl,
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
