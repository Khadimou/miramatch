import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Quote, Project } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';

const Tab = createMaterialTopTabNavigator();

interface QuoteWithProject extends Quote {
  project?: Project;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: Quote['status'] }) => {
  const statusConfig = {
    pending: {
      color: theme.colors.warning,
      text: 'En attente',
      icon: '⏳',
    },
    accepted: {
      color: theme.colors.success,
      text: 'Accepté',
      icon: '✅',
    },
    rejected: {
      color: theme.colors.danger,
      text: 'Refusé',
      icon: '❌',
    },
  };

  const config = statusConfig[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
      <Text style={styles.statusIcon}>{config.icon}</Text>
      <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Quote Card Component
const QuoteCard = ({ quote }: { quote: QuoteWithProject }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('QuoteDetails' as never, { quoteId: quote.id } as never);
  };

  const project = quote.project;
  if (!project) return null;

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri: project.customImageUrl || project.images[0] || 'https://via.placeholder.com/80',
          }}
          style={styles.cardImage}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {project.productName || project.title}
          </Text>
          <Text style={styles.cardCategory}>{project.category}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Prix proposé:</Text>
          <Text style={styles.cardValue}>
            {quote.price} {quote.currency}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Délai:</Text>
          <Text style={styles.cardValue}>{quote.deliveryTime}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Date d'envoi:</Text>
          <Text style={styles.cardValue}>
            {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <StatusBadge status={quote.status} />
      </View>
    </TouchableOpacity>
  );
};

// Empty State Component
const EmptyState = ({ status }: { status: Quote['status'] }) => {
  const messages = {
    pending: {
      icon: '📬',
      title: 'Aucune proposition en attente',
      subtitle: 'Vos propositions en attente apparaîtront ici',
    },
    accepted: {
      icon: '🎉',
      title: 'Aucune proposition acceptée',
      subtitle: 'Continuez à envoyer des propositions de qualité !',
    },
    rejected: {
      icon: '💪',
      title: 'Aucune proposition refusée',
      subtitle: 'Excellent ! Continuez comme ça',
    },
  };

  const message = messages[status];

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{message.icon}</Text>
      <Text style={styles.emptyTitle}>{message.title}</Text>
      <Text style={styles.emptySubtitle}>{message.subtitle}</Text>
    </View>
  );
};

// Quote List Component
const QuoteList = ({ status }: { status: Quote['status'] }) => {
  const [quotes, setQuotes] = useState<QuoteWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, [status]);

  const loadQuotes = async () => {
    try {
      setIsLoading(true);
      const allQuotes = await apiService.getMyQuotes();

      // Filtrer par statut et charger les projets associés
      const filteredQuotes = allQuotes.filter((q) => q.status === status);

      // Charger les détails des projets pour chaque quote
      const quotesWithProjects = await Promise.all(
        filteredQuotes.map(async (quote) => {
          try {
            const project = await apiService.getProjectById(quote.projectId);
            return { ...quote, project };
          } catch (error) {
            console.error('Error loading project:', error);
            return quote;
          }
        })
      );

      setQuotes(quotesWithProjects);
    } catch (error) {
      console.error('Load quotes error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadQuotes();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (quotes.length === 0) {
    return <EmptyState status={status} />;
  }

  return (
    <FlatList
      data={quotes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <QuoteCard quote={item} />}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
        />
      }
    />
  );
};

// Écrans pour chaque tab
const PendingQuotesScreen = () => <QuoteList status="pending" />;
const AcceptedQuotesScreen = () => <QuoteList status="accepted" />;
const RejectedQuotesScreen = () => <QuoteList status="rejected" />;

// Écran principal avec tabs
export const ProposalsScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mes propositions</Text>
      </LinearGradient>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.primary,
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tab.Screen
          name="Pending"
          component={PendingQuotesScreen}
          options={{ tabBarLabel: 'En attente' }}
        />
        <Tab.Screen
          name="Accepted"
          component={AcceptedQuotesScreen}
          options={{ tabBarLabel: 'Acceptés' }}
        />
        <Tab.Screen
          name="Rejected"
          component={RejectedQuotesScreen}
          options={{ tabBarLabel: 'Refusés' }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.radiusMd,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.radiusMd,
    marginRight: theme.spacing.md,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  cardCategory: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  cardBody: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  cardFooter: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.radiusLg,
    gap: theme.spacing.xs,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
