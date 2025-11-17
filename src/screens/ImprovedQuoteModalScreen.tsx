import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSwipe } from '../context/SwipeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Project } from '../types';
import { theme } from '../constants/theme';

interface QuoteModalScreenProps {
  navigation: any;
  route: {
    params: {
      project: Project;
    };
  };
}

const CURRENCIES = ['XOF', 'EUR', 'USD'];

export const ImprovedQuoteModalScreen = ({ navigation, route }: QuoteModalScreenProps) => {
  const { project } = route.params;
  const { submitQuote } = useSwipe();
  const { creator } = useAuth();

  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(project.budget.currency || 'EUR');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [message, setMessage] = useState('');
  const [detailedProposal, setDetailedProposal] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    if (attachments.length >= 5) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter maximum 5 images');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin de votre permission pour accéder à vos photos'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        try {
          const imageUrl = await apiService.uploadImage(result.assets[0].uri, 'quote');
          setAttachments([...attachments, imageUrl]);
        } catch (error) {
          Alert.alert('Erreur', 'Impossible d\'uploader l\'image');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleRemoveImage = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!price || !deliveryDays || !message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const priceNum = parseFloat(price);
    const daysNum = parseInt(deliveryDays, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Erreur', 'Le prix doit être un nombre positif');
      return;
    }

    if (isNaN(daysNum) || daysNum <= 0) {
      Alert.alert('Erreur', 'Le délai doit être un nombre de jours positif');
      return;
    }

    if (!creator) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    try {
      setIsSubmitting(true);

      // Soumettre le devis via l'API
      await apiService.submitQuote({
        projectId: project.id,
        creatorId: creator.id,
        price: priceNum,
        currency,
        deliveryTime: `${daysNum} jours`,
        deliveryDays: daysNum,
        message,
        detailedProposal: detailedProposal || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      // Aussi soumettre via le context pour la synchro locale
      submitQuote({
        projectId: project.id,
        creatorId: creator.id,
        price: priceNum,
        deliveryTime: `${daysNum} jours`,
        message,
      });

      Alert.alert(
        'Devis envoyé !',
        'Votre proposition a été envoyée au client. Vous serez notifié de sa réponse.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Submit quote error:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le devis. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Proposer un devis</Text>
        </View>

        {/* Project Summary */}
        <View style={styles.projectSummary}>
          <Image
            source={{
              uri: project.customImageUrl || project.images[0] || 'https://via.placeholder.com/100',
            }}
            style={styles.projectImage}
          />
          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle}>{project.productName || project.title}</Text>
            <Text style={styles.projectBudget}>
              Budget: {project.basePrice || `${project.budget.min}-${project.budget.max}`}{' '}
              {project.budget.currency}
            </Text>
            <Text style={styles.clientName}>{project.client.name}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Votre proposition</Text>

          {/* Price & Currency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Prix proposé <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.priceRow}>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="Ex: 500"
                placeholderTextColor={theme.colors.textLight}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              <View style={styles.currencySelector}>
                {CURRENCIES.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    onPress={() => setCurrency(curr)}
                    style={[
                      styles.currencyButton,
                      currency === curr && styles.currencyButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        currency === curr && styles.currencyTextActive,
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Delivery Days */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Délai de livraison (en jours) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 14"
              placeholderTextColor={theme.colors.textLight}
              value={deliveryDays}
              onChangeText={setDeliveryDays}
              keyboardType="numeric"
            />
            {deliveryDays && parseInt(deliveryDays, 10) > 0 && (
              <Text style={styles.hint}>
                ≈ {Math.ceil(parseInt(deliveryDays, 10) / 7)} semaine(s)
              </Text>
            )}
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Description de votre proposition <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Présentez-vous brièvement et expliquez votre approche..."
              placeholderTextColor={theme.colors.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Detailed Proposal */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Proposition détaillée (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea, styles.textAreaLarge]}
              placeholder="Détaillez les étapes de réalisation, les matériaux que vous utiliserez, vos références similaires..."
              placeholderTextColor={theme.colors.textLight}
              value={detailedProposal}
              onChangeText={setDetailedProposal}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              Conseil: Plus votre proposition est détaillée, plus vous avez de chances d'être choisi.
            </Text>
          </View>

          {/* Image Attachments */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Photos/Fichiers joints (optionnel, max 5)
            </Text>

            {attachments.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesPreview}
              >
                {attachments.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      onPress={() => handleRemoveImage(index)}
                      style={styles.removeImageButton}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {attachments.length < 5 && (
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.addImageButton}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <>
                    <Text style={styles.addImageIcon}>📷</Text>
                    <Text style={styles.addImageText}>
                      Ajouter des photos ({attachments.length}/5)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            <Text style={styles.hint}>
              Ajoutez des photos de réalisations similaires pour augmenter vos chances
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || isUploading}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.submitButton,
                (isSubmitting || isUploading) && styles.buttonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.card} />
              ) : (
                <Text style={styles.submitButtonText}>Envoyer la proposition</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  projectSummary: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    marginTop: theme.spacing.xs,
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
  projectBudget: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  clientName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  form: {
    padding: theme.spacing.lg,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.danger,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.radiusMd,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.background,
  },
  priceRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priceInput: {
    flex: 1,
  },
  currencySelector: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  currencyButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.radiusMd,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  currencyTextActive: {
    color: theme.colors.card,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  textAreaLarge: {
    minHeight: 150,
  },
  hint: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  imagesPreview: {
    marginBottom: theme.spacing.md,
  },
  imagePreviewContainer: {
    marginRight: theme.spacing.sm,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.radiusMd,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: theme.colors.card,
    fontSize: 14,
    fontWeight: 'bold',
  },
  addImageButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.radiusMd,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    marginBottom: theme.spacing.sm,
  },
  addImageIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  addImageText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: theme.borderRadius.radiusMd,
    paddingVertical: theme.spacing.md + theme.spacing.xs,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    borderRadius: theme.borderRadius.radiusMd,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
});
