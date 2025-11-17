import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Conversation } from '../types';
import { useMessages } from '../context/MessagesContext';
import { theme } from '../constants/theme';

// Conversation Item Component
const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('Chat' as never, { conversationId: conversation.id } as never);
  };

  const lastMessage = conversation.lastMessage;
  const project = conversation.project;
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity onPress={handlePress} style={styles.conversationItem}>
      {/* Client Photo */}
      <View style={styles.photoContainer}>
        {conversation.client.profileImage ? (
          <Image
            source={{ uri: conversation.client.profileImage }}
            style={styles.clientPhoto}
          />
        ) : (
          <View style={[styles.clientPhoto, styles.photoPlaceholder]}>
            <Text style={styles.photoPlaceholderText}>
              {conversation.client.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {hasUnread && <View style={styles.unreadDot} />}
      </View>

      {/* Conversation Info */}
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.clientName} numberOfLines={1}>
            {conversation.client.name}
          </Text>
          {lastMessage && (
            <Text style={styles.timestamp}>
              {formatTimestamp(lastMessage.createdAt)}
            </Text>
          )}
        </View>

        {project && (
          <Text style={styles.projectName} numberOfLines={1}>
            {project.productName || project.title}
          </Text>
        )}

        {lastMessage && (
          <View style={styles.lastMessageContainer}>
            <Text
              style={[
                styles.lastMessage,
                hasUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {lastMessage.type === 'audio'
                ? '🎤 Message vocal'
                : lastMessage.content}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Format timestamp to relative time
const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

// Empty State Component
const EmptyState = () => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Aucune conversation</Text>
      <Text style={styles.emptySubtitle}>
        Vos conversations avec les clients apparaîtront ici
      </Text>
    </View>
  );
};

// Main Messages Screen
export const MessagesScreen = () => {
  const { conversations, isLoading, loadConversations, getTotalUnreadCount } = useMessages();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const totalUnread = getTotalUnreadCount();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Conversations List */}
      {isLoading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConversationItem conversation={item} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
  headerBadge: {
    backgroundColor: theme.colors.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  headerBadgeText: {
    color: theme.colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: theme.spacing.xs,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  photoContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  clientPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  photoPlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: theme.colors.card,
    fontSize: 24,
    fontWeight: 'bold',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  projectName: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  lastMessageUnread: {
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  unreadCount: {
    color: theme.colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.background,
    marginLeft: 88, // Align with text, not photo
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
