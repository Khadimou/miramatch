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
} from 'react-native';
import { useSwipe } from '../context/SwipeContext';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { COLORS, SIZES } from '../constants/theme';

interface QuoteModalScreenProps {
  navigation: any;
  route: {
    params: {
      project: Project;
    };
  };
}

export const QuoteModalScreen = ({ navigation, route }: QuoteModalScreenProps) => {
  const { project } = route.params;
  const { submitQuote } = useSwipe();
  const { creator } = useAuth();

  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!price || !deliveryTime || !message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!creator) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    submitQuote({
      projectId: project.id,
      creatorId: creator.id,
      price: parseFloat(price),
      deliveryTime,
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
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Proposer un devis</Text>
        </View>

        {/* Project Summary */}
        <View style={styles.projectSummary}>
          <Image
            source={{
              uri: project.images[0] || 'https://via.placeholder.com/100',
            }}
            style={styles.projectImage}
          />
          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectBudget}>
              Budget: {project.budget.min}-{project.budget.max}
              {project.budget.currency}
            </Text>
            <Text style={styles.clientName}>{project.client.name}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Votre proposition</Text>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix proposé (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 500"
              placeholderTextColor={COLORS.textLight}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          {/* Delivery Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Délai de réalisation</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2 semaines, 1 mois..."
              placeholderTextColor={COLORS.textLight}
              value={deliveryTime}
              onChangeText={setDeliveryTime}
            />
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message au client</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Présentez-vous et expliquez comment vous comptez réaliser ce projet..."
              placeholderTextColor={COLORS.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              Conseil: Mentionnez votre expérience similaire et pourquoi vous
              êtes le bon choix pour ce projet.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Envoyer le devis</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  projectSummary: {
    flexDirection: 'row',
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
    marginTop: SIZES.xs,
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
  },
  form: {
    padding: SIZES.lg,
  },
  formTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SIZES.md,
  },
  hint: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md + SIZES.xs,
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
  },
});
