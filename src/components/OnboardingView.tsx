import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';

interface OnboardingViewProps {
  onComplete: (name: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleStart = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      triggerHaptic('medium');
      Alert.alert('Prénom requis', 'Veuillez entrer votre prénom pour continuer.');
      return;
    }

    triggerHaptic('success');
    onComplete(cleanName);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo / Emblème minimaliste */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* Textes d'accueil */}
        <View style={styles.textSection}>
          <Text style={styles.greetingKicker}>Money Saver</Text>
          <Text style={styles.mainTitle}>Bienvenue.</Text>
          <Text style={styles.subtitle}>
            Votre espace financier minimaliste, 100% privé et local.
          </Text>
        </View>

        {/* Formulaire Prénom */}
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Comment vous appelez-vous ?</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Votre prénom (ex: Thomas, Sarah...)"
              placeholderTextColor={THEME.colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleStart}
            />
            {name.length > 0 && (
              <TouchableOpacity
                onPress={() => setName('')}
                style={styles.clearBtn}
                activeOpacity={0.6}
              >
                <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.hintText}>
            Ce prénom sera affiché sur votre écran d'accueil.
          </Text>
        </View>

        {/* Bouton de démarrage */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={[styles.startBtn, name.trim().length === 0 && styles.startBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleStart}
          >
            <Text style={styles.startBtnText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: 28,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  textSection: {
    marginBottom: 36,
  },
  greetingKicker: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.md,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E4E4E7',
    ...THEME.shadows.subtle,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 17,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  clearBtn: {
    padding: 4,
  },
  hintText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 8,
  },
  footerSection: {
    marginTop: 10,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: THEME.radius.lg,
    paddingVertical: 18,
    ...THEME.shadows.subtle,
  },
  startBtnDisabled: {
    opacity: 0.5,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
