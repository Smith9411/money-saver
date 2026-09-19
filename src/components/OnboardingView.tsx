import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../services/haptics';
import { useTheme } from '../context/ThemeContext';

interface OnboardingViewProps {
  onComplete: (name: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      triggerHaptic('medium');
      setError('Veuillez entrer votre prénom pour continuer.');
      return;
    }

    setError(null);
    triggerHaptic('success');
    onComplete(cleanName);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        {/* Logo / Emblème minimaliste */}
        <View style={styles.logoWrapper}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="sparkles" size={26} color={theme.colors.accent} />
          </View>
        </View>

        {/* Textes d'accueil */}
        <View style={styles.textSection}>
          <Text style={[styles.greetingKicker, { color: theme.colors.accent }]}>BUDGET</Text>
          <Text style={[styles.mainTitle, { color: theme.colors.textPrimary }]}>Bienvenue.</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Votre gestion financière haute précision, 100% privée et sécurisée en local.
          </Text>
        </View>

        {/* Formulaire Prénom */}
        <View style={styles.formSection}>
          <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
            Comment vous appelez-vous ?
          </Text>
          
          {/* Champ de saisie sans carré noir, avec icône d'écriture */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surfaceSubtle || theme.colors.surface,
                borderBottomWidth: 1.5,
                borderBottomColor: error
                  ? theme.colors.expenseText
                  : theme.colors.accent,
              },
            ]}
          >
            {/* Petite icône d'écriture */}
            <Ionicons
              name="pencil-outline"
              size={18}
              color={theme.colors.accent}
              style={{ marginRight: 12 }}
            />
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.colors.textPrimary,
                  // @ts-ignore
                  outlineStyle: 'none',
                  outlineWidth: 0,
                  outlineColor: 'transparent',
                },
              ]}
              placeholder="Votre prénom (ex: Thomas, Sarah...)"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError(null);
              }}
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
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: theme.colors.expenseText }]}>
              {error}
            </Text>
          ) : (
            <Text style={[styles.hintText, { color: theme.colors.textMuted }]}>
              Ce prénom créera votre profil local et sera affiché sur votre accueil.
            </Text>
          )}
        </View>

        {/* Bouton de démarrage */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={[
              styles.startBtn,
              {
                backgroundColor: theme.colors.accent,
                opacity: name.trim().length === 0 ? 0.5 : 1,
              },
            ]}
            activeOpacity={0.85}
            disabled={name.trim().length === 0}
            onPress={handleStart}
          >
            <Text
              style={[
                styles.startBtnText,
                {
                  color: theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : '#FFFFFF',
                },
              ]}
            >
              Commencer
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={theme.isDark && theme.id === 'midnight-titanium' ? '#000000' : '#FFFFFF'}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  logoWrapper: {
    marginBottom: 28,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    ...THEME.shadows.subtle,
  },
  textSection: {
    marginBottom: 36,
  },
  greetingKicker: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  formSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THEME.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 4,
    width: '100%',
    borderWidth: 0,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 17,
    fontWeight: '600',
    borderWidth: 0,
  },
  clearBtn: {
    padding: 4,
  },
  hintText: {
    fontSize: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  footerSection: {
    marginTop: 10,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.radius.lg,
    paddingVertical: 18,
    ...THEME.shadows.subtle,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
