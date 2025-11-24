import React, { useState, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoIcon } from '../components/LogoIcon';
import { COLORS, SIZES, GRADIENTS } from '../constants/theme';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export const VerifyCodeScreen = ({ navigation, route }: any) => {
  const { email, userId } = route.params;
  const { login } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (value: string, index: number) => {
    // Si on colle plusieurs caractères (code complet)
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];

      // Remplir les inputs à partir de l'index actuel
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });

      setCode(newCode);

      // Focus sur le dernier input rempli ou le suivant
      const lastFilledIndex = Math.min(index + digits.length, 5);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyCode(email, verificationCode);

      if (result.success) {
        Alert.alert(
          'Compte vérifié !',
          'Votre compte a été vérifié avec succès',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Auto-login après vérification
                if (result.token) {
                  await login(email, '');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Code invalide ou expiré');
      }
    } catch (error: any) {
      console.error('Verify code error:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const result = await authService.resendCode(email);

      if (result.success) {
        Alert.alert('Code envoyé', 'Un nouveau code de vérification a été envoyé à votre email');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de renvoyer le code');
      }
    } catch (error: any) {
      console.error('Resend code error:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#FAFBFF', '#F5F7FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />

        <LinearGradient
          colors={['transparent', 'rgba(255, 107, 157, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomGradient}
        />

        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            {/* Logo et titre */}
            <View style={styles.logoContainer}>
              <LogoIcon size={100} variant="default" />
              <Text style={styles.appName}>MIRA MATCH</Text>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>Vérification</Text>
              </View>
            </View>

            {/* Titre et description */}
            <Text style={styles.title}>Vérifiez votre email</Text>
            <Text style={styles.description}>
              Nous avons envoyé un code à 6 chiffres à {'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>

            {/* Formulaire */}
            <BlurView intensity={80} tint="light" style={styles.formContainer}>
              <View style={styles.form}>
                {/* Code inputs */}
                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={[
                        styles.codeInput,
                        digit && styles.codeInputFilled,
                      ]}
                      value={digit}
                      onChangeText={(value) => handleCodeChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {/* Bouton de vérification */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleVerify}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={GRADIENTS.warm}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.buttonText}>✓ Vérifier</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Renvoyer le code */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Vous n'avez pas reçu le code ?</Text>
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={resendLoading}
                  >
                    <Text style={styles.resendLink}>
                      {resendLoading ? 'Envoi...' : 'Renvoyer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.footerLink}>← Retour à la connexion</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginTop: SIZES.sm,
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
  title: {
    fontSize: SIZES.fontXxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  description: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    lineHeight: 24,
  },
  email: {
    fontWeight: '700',
    color: COLORS.primary,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
  },
  codeInput: {
    width: 50,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 107, 157, 0.05)',
  },
  button: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginBottom: SIZES.lg,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginRight: SIZES.xs,
  },
  resendLink: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.xl,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: SIZES.fontMd,
    fontWeight: '700',
  },
});
