import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

// Stat Card Component
const StatCard = ({ icon, value, label, color }: { icon: string; value: string | number; label: string; color?: string }) => {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, color && { backgroundColor: color + '20' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  );
};

// Settings Item Component
const SettingsItem = ({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Text style={styles.settingsIcon}>{icon}</Text>
        <Text style={styles.settingsTitle}>{title}</Text>
      </View>
      <Text style={styles.settingsArrow}>›</Text>
    </TouchableOpacity>
  );
};

export const ImprovedProfileScreen = () => {
  const { creator, logout } = useAuth();
  const navigation = useNavigation();

  if (!creator) {
    return null;
  }

  const stats = creator.stats || {
    projectsLiked: 0,
    quotesSent: 0,
    quotesAccepted: 0,
    acceptanceRate: 0,
  };

  const handleEditProfile = () => {
    Alert.alert('Modifier le profil', 'Fonctionnalité à venir');
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications' as never);
  };

  const handleLanguage = () => {
    Alert.alert('Langue', 'Fonctionnalité à venir');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header avec gradient */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Image
            source={{
              uri: creator.profileImage || 'https://i.pravatar.cc/200?img=10',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{creator.name}</Text>

          {/* Brand Name */}
          {creator.brandName && (
            <View style={styles.brandBadge}>
              <Text style={styles.brandName}>{creator.brandName}</Text>
            </View>
          )}

          {/* Seller Type */}
          <View style={styles.specialtyBadge}>
            <Text style={styles.specialty}>{creator.sellerType || creator.specialty}</Text>
          </View>

          {/* Main Stats */}
          <View style={styles.mainStatsContainer}>
            <View style={styles.mainStatItem}>
              <Text style={styles.mainStatValue}>⭐ {creator.rating.toFixed(1)}</Text>
              <Text style={styles.mainStatLabel}>Note</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.mainStatItem}>
              <Text style={styles.mainStatValue}>{creator.completedProjects}</Text>
              <Text style={styles.mainStatLabel}>Projets réalisés</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.mainStatItem}>
              <Text style={styles.mainStatValue}>⚡ {creator.responseTime}</Text>
              <Text style={styles.mainStatLabel}>Temps de réponse</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Statistiques détaillées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="❤️"
              value={stats.projectsLiked}
              label="Projets likés"
              color={theme.colors.primary}
            />
            <StatCard
              icon="📝"
              value={stats.quotesSent}
              label="Devis envoyés"
              color={theme.colors.secondary}
            />
            <StatCard
              icon="✅"
              value={stats.quotesAccepted}
              label="Devis acceptés"
              color={theme.colors.success}
            />
            <StatCard
              icon="📊"
              value={`${stats.acceptanceRate}%`}
              label="Taux d'acceptation"
              color={theme.colors.accent}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bio}>{creator.bio}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Localisation:</Text>
            <Text style={styles.infoValue}>{creator.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✉️ Email:</Text>
            <Text style={styles.infoValue}>{creator.email}</Text>
          </View>
        </View>

        {/* Portfolio */}
        {creator.portfolio.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.portfolioScroll}
            >
              {creator.portfolio.map((item) => (
                <View key={item.id} style={styles.portfolioItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.portfolioImage}
                  />
                  <Text style={styles.portfolioTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon="👤"
              title="Modifier le profil"
              onPress={handleEditProfile}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon="🔔"
              title="Notifications"
              onPress={handleNotifications}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon="🌍"
              title="Langue"
              onPress={handleLanguage}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout}>
          <LinearGradient
            colors={[theme.colors.danger, '#ff4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.card,
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.card,
    marginBottom: theme.spacing.xs,
  },
  brandBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.radiusLg,
    marginBottom: theme.spacing.xs,
  },
  brandName: {
    color: theme.colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  specialtyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.radiusLg,
    marginBottom: theme.spacing.lg,
  },
  specialty: {
    color: theme.colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  mainStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  mainStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  mainStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.card,
    marginBottom: theme.spacing.xs,
  },
  mainStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statCardLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  bioCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  portfolioScroll: {
    paddingRight: theme.spacing.lg,
  },
  portfolioItem: {
    width: 140,
    marginRight: theme.spacing.md,
  },
  portfolioImage: {
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius.radiusMd,
    marginBottom: theme.spacing.sm,
  },
  portfolioTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.radiusMd,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingsIcon: {
    fontSize: 24,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  settingsArrow: {
    fontSize: 24,
    color: theme.colors.textLight,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: theme.colors.background,
    marginLeft: theme.spacing.md + 24 + theme.spacing.md,
  },
  logoutButton: {
    marginHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
