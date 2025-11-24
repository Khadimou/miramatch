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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoIcon } from '../components/LogoIcon';
import { COLORS, SIZES, GRADIENTS } from '../constants/theme';
import { authService } from '../services/authService';

const { width, height } = Dimensions.get('window');

type FormData = {
  // Étape 1: Informations personnelles
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;

  // Étape 2: Informations de l'entreprise
  brandName: string;
  country: string;
  employees: string;

  // Étape 3: Production et conditions
  selfProduction: boolean;
  productionCountry: string;
  monthlyProduction: string;
  additionalInfo: string;
};

export const RegisterScreen = ({ navigation }: any) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    brandName: '',
    country: '',
    employees: '',
    selfProduction: true,
    productionCountry: '',
    monthlyProduction: '',
    additionalInfo: '',
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erreur', 'Email invalide');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.brandName || !formData.country || !formData.employees) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.productionCountry || !formData.monthlyProduction) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3) {
      handleRegister();
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const result = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        brandName: formData.brandName,
        country: formData.country,
        employees: formData.employees,
        selfProduction: formData.selfProduction,
        productionCountry: formData.productionCountry,
        monthlyProduction: parseInt(formData.monthlyProduction),
        additionalInfo: formData.additionalInfo || undefined,
      });

      if (result.success) {
        Alert.alert(
          'Inscription réussie',
          'Un code de vérification a été envoyé à votre email',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('VerifyCode', {
                email: formData.email,
                userId: result.userId
              }),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Une erreur est survenue');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>👤 Nom complet</Text>
        <TextInput
          style={styles.input}
          placeholder="Jean Dupont"
          placeholderTextColor={COLORS.textLight}
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>📧 Email</Text>
        <TextInput
          style={styles.input}
          placeholder="votre@email.com"
          placeholderTextColor={COLORS.textLight}
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>📱 Téléphone</Text>
        <TextInput
          style={styles.input}
          placeholder="+221 77 123 45 67"
          placeholderTextColor={COLORS.textLight}
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>🔒 Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={COLORS.textLight}
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>🔒 Confirmer le mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={COLORS.textLight}
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>🏢 Nom de la marque</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de votre entreprise"
          placeholderTextColor={COLORS.textLight}
          value={formData.brandName}
          onChangeText={(value) => updateField('brandName', value)}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>🌍 Pays</Text>
        <TextInput
          style={styles.input}
          placeholder="Sénégal"
          placeholderTextColor={COLORS.textLight}
          value={formData.country}
          onChangeText={(value) => updateField('country', value)}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>👥 Nombre d'employés</Text>
        <View style={styles.buttonGroup}>
          {['1-5', '6-10', '11-20', '20+'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                formData.employees === option && styles.optionButtonActive,
              ]}
              onPress={() => updateField('employees', option)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  formData.employees === option && styles.optionButtonTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>🏭 Production propre ?</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              formData.selfProduction && styles.optionButtonActive,
            ]}
            onPress={() => updateField('selfProduction', true)}
          >
            <Text
              style={[
                styles.optionButtonText,
                formData.selfProduction && styles.optionButtonTextActive,
              ]}
            >
              Oui
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              !formData.selfProduction && styles.optionButtonActive,
            ]}
            onPress={() => updateField('selfProduction', false)}
          >
            <Text
              style={[
                styles.optionButtonText,
                !formData.selfProduction && styles.optionButtonTextActive,
              ]}
            >
              Non
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>📍 Pays de production</Text>
        <TextInput
          style={styles.input}
          placeholder="Sénégal"
          placeholderTextColor={COLORS.textLight}
          value={formData.productionCountry}
          onChangeText={(value) => updateField('productionCountry', value)}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>📊 Production mensuelle (pièces)</Text>
        <TextInput
          style={styles.input}
          placeholder="100"
          placeholderTextColor={COLORS.textLight}
          value={formData.monthlyProduction}
          onChangeText={(value) => updateField('monthlyProduction', value)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>📝 Informations complémentaires (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Spécialités, délais de production, etc."
          placeholderTextColor={COLORS.textLight}
          value={formData.additionalInfo}
          onChangeText={(value) => updateField('additionalInfo', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </>
  );

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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Logo et titre */}
              <View style={styles.logoContainer}>
                <LogoIcon size={100} variant="default" />
                <Text style={styles.appName}>MIRA MATCH</Text>
                <View style={styles.logoBadge}>
                  <Text style={styles.logoBadgeText}>Inscription Créateur</Text>
                </View>
              </View>

              {/* Indicateur de progression */}
              <View style={styles.progressContainer}>
                {[1, 2, 3].map((step) => (
                  <View key={step} style={styles.progressStepContainer}>
                    <View
                      style={[
                        styles.progressStep,
                        currentStep >= step && styles.progressStepActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.progressStepText,
                          currentStep >= step && styles.progressStepTextActive,
                        ]}
                      >
                        {step}
                      </Text>
                    </View>
                    {step < 3 && (
                      <View
                        style={[
                          styles.progressLine,
                          currentStep > step && styles.progressLineActive,
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>

              {/* Titre de l'étape */}
              <Text style={styles.stepTitle}>
                {currentStep === 1 && 'Informations personnelles'}
                {currentStep === 2 && 'Informations de l\'entreprise'}
                {currentStep === 3 && 'Production et conditions'}
              </Text>

              {/* Formulaire */}
              <BlurView intensity={80} tint="light" style={styles.formContainer}>
                <View style={styles.form}>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}

                  {/* Boutons de navigation */}
                  <View style={styles.buttonRow}>
                    {currentStep > 1 && (
                      <TouchableOpacity
                        style={[styles.button, styles.backButton]}
                        onPress={handleBack}
                      >
                        <Text style={styles.backButtonText}>← Retour</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.nextButton,
                        currentStep === 1 && styles.fullWidthButton,
                        loading && styles.buttonDisabled,
                      ]}
                      onPress={handleNext}
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
                          <Text style={styles.buttonText}>
                            {currentStep === 3 ? '✨ S\'inscrire' : 'Suivant →'}
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Déjà un compte ?</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.footerLink}>Se connecter</Text>
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
    marginBottom: SIZES.lg,
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  progressStepText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  progressStepTextActive: {
    color: COLORS.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.xs,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
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
  textArea: {
    minHeight: 100,
    paddingTop: SIZES.md,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
  optionButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionButtonTextActive: {
    color: COLORS.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.lg,
  },
  button: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingVertical: SIZES.md + SIZES.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontLg,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
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
