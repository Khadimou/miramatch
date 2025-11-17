import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from '../components/LogoIcon';
import { COLORS, SIZES, GRADIENTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.backgroundContainer}>
        {/* Background blanc pour que le logo ressorte */}
        <LinearGradient
          colors={['#FFFFFF', '#FAFBFF', '#F5F7FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />

        {/* Accent gradient en bas */}
        <LinearGradient
          colors={['transparent', 'rgba(255, 107, 157, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomGradient}
        />

        {/* Decorative circles avec couleurs du logo */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
          {/* Logo Icon */}
          <View style={styles.logoContainer}>
            <LogoIcon size={120} variant="default" />
            <Text style={styles.appName}>MIRA MATCH</Text>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>Pour Créateurs</Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Découvrez des projets qui vous inspirent 💫
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Form avec glassmorphism */}
          <BlurView intensity={80} tint="light" style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>📧 Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>🔒 Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={GRADIENTS.warm}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {loading ? '⏳ Connexion...' : '🚀 Se connecter'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>S'inscrire maintenant ✨</Text>
            </TouchableOpacity>
          </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.4,
  },
  container: {
    flex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(195, 113, 245, 0.08)',
  },
  circle3: {
    width: 150,
    height: 150,
    top: height / 2,
    right: -30,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: SIZES.sm,
  },
  logoBadge: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    marginTop: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
  logoBadgeText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: SIZES.fontLg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
    fontWeight: '500',
  },
  divider: {
    height: 2,
    width: 60,
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
    marginBottom: SIZES.xxl,
    borderRadius: 2,
  },
  formContainer: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  form: {
    padding: SIZES.xl,
  },
  inputWrapper: {
    marginBottom: SIZES.lg,
  },
  inputLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md + SIZES.xs,
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.lg,
  },
  forgotText: {
    color: COLORS.secondary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  button: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginTop: SIZES.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: SIZES.md + SIZES.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.xl,
    marginBottom: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
    marginRight: SIZES.xs,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: SIZES.fontMd,
    fontWeight: '700',
  },
});
