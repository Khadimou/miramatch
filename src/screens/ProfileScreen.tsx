import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '../constants/theme';

const { width } = Dimensions.get('window');

export const ProfileScreen = () => {
  const { creator, logout } = useAuth();

  if (!creator) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={GRADIENTS.primary}
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
        <View style={styles.specialtyBadge}>
          <Text style={styles.specialty}>{creator.specialty}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {creator.rating}</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{creator.completedProjects}</Text>
            <Text style={styles.statLabel}>Projets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⚡ {creator.responseTime}</Text>
            <Text style={styles.statLabel}>Réponse</Text>
          </View>
        </View>
      </LinearGradient>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <Text style={styles.bio}>{creator.bio}</Text>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio</Text>
        <View style={styles.portfolioGrid}>
          {creator.portfolio.map((item) => (
            <View key={item.id} style={styles.portfolioItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.portfolioImage}
              />
              <Text style={styles.portfolioTitle}>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: SIZES.xxl + SIZES.xl }} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: SIZES.md,
    paddingBottom: SIZES.xxl,
    alignItems: 'center',
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: SIZES.lg,
    borderWidth: 5,
    borderColor: COLORS.white,
  },
  name: {
    fontSize: SIZES.fontXl + 4,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  specialtyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  specialty: {
    fontSize: SIZES.fontMd,
    color: COLORS.white,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SIZES.lg,
    gap: SIZES.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  statValue: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: SIZES.fontSm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SIZES.xs,
    fontWeight: '500',
  },
  statDivider: {
    width: 2,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SIZES.md,
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  bio: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SIZES.sm,
  },
  infoLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    width: 140,
  },
  infoValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    flex: 1,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.xs,
  },
  portfolioItem: {
    width: (width - SIZES.lg * 2 - SIZES.xs * 2) / 2,
    marginHorizontal: SIZES.xs,
    marginBottom: SIZES.md,
  },
  portfolioImage: {
    width: '100%',
    height: 150,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.xs,
  },
  portfolioTitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
});
