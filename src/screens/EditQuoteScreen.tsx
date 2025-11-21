import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Quote, Project } from '../types';
import { apiService } from '../services/apiService';
import { theme } from '../constants/theme';

type RootStackParamList = {
  EditQuote: { quote: Quote; project: Project };
};

type EditQuoteRouteProp = RouteProp<RootStackParamList, 'EditQuote'>;
type NavigationProp = NativeStackNavigationProp<any>;

export const EditQuoteScreen = () => {
  const route = useRoute<EditQuoteRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { quote, project } = route.params;

  const [price, setPrice] = useState(quote.price.toString());
  const [deliveryTime, setDeliveryTime] = useState(
    quote.deliveryDays?.toString() || quote.deliveryTime.replace(/\D/g, '') || '14'
  );
  const [message, setMessage] = useState(quote.message || '');
  const [detailedProposal, setDetailedProposal] = useState(quote.detailedProposal || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return;
    }

    if (!deliveryTime || parseInt(deliveryTime) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un délai de livraison valide');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter un message');
      return;
    }

    try {
      setIsSubmitting(true);

      const updates = {
        price: parseFloat(price),
        deliveryTime: parseInt(deliveryTime),
        message: message.trim(),
        detailedProposal: detailedProposal.trim(),
        currency: quote.currency,
      };

      await apiService.updateQuote(quote.id, updates);

      Alert.alert(
        'Succès',
        'Votre proposition a été modifiée avec succès',
        [
          {
            text: 'OK',
            onPress: () => {
              // Retour à l'écran des propositions
              navigation.navigate('Main', { screen: 'Proposals' });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Update quote error:', error);
      Alert.alert('Erreur', 'Impossible de modifier la proposition');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.card} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier la proposition</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Project Info */}
        <View style={styles.projectInfoBox}>
          <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
          <View style={styles.projectInfoText}>
            <Text style={styles.projectName}>{project.productName || project.title}</Text>
            <Text style={styles.projectCategory}>{project.category}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Prix <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex: 50000"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Text style={styles.currency}>{quote.currency}</Text>
            </View>
          </View>

          {/* Delivery Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Délai de livraison (jours) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 14"
              value={deliveryTime}
              onChangeText={setDeliveryTime}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {/* Message */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Message <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez brièvement votre proposition..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={styles.characterCount}>{message.length} caractères</Text>
          </View>

          {/* Detailed Proposal */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Proposition détaillée (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ajoutez plus de détails sur votre proposition, les étapes, les matériaux, etc."
              value={detailedProposal}
              onChangeText={setDetailedProposal}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={styles.characterCount}>{detailedProposal.length} caractères</Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              Une fois modifiée, votre proposition sera à nouveau envoyée au client pour validation.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.colors.card} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.card} />
              <Text style={styles.submitButtonText}>Modifier la proposition</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
  content: {
    flex: 1,
  },
  projectInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    gap: theme.spacing.md,
  },
  projectInfoText: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs / 2,
  },
  projectCategory: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  form: {
    paddingHorizontal: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.radiusMd,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currency: {
    position: 'absolute',
    right: theme.spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.radiusMd,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.card,
  },
});
