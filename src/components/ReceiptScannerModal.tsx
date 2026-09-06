import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ReceiptItem, ParsedReceipt, TransactionCategory } from '../types';
import { parseReceiptImage } from '../services/receiptParser';
import { parseReceiptWithAI, getApiKey, setApiKey } from '../services/aiReceiptScanner';
import { triggerHaptic } from '../services/haptics';
import * as ImagePicker from 'expo-image-picker';

interface ReceiptScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveReceipt: (data: {
    merchant: string;
    totalAmount: number;
    items: ReceiptItem[];
    date: string;
    category: TransactionCategory;
  }) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  visible,
  onClose,
  onSaveReceipt,
}) => {
  const [step, setStep] = useState<'capture' | 'preview'>('capture');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [pendingBase64, setPendingBase64] = useState<string | null>(null);

  // État d'édition discrète d'une ligne d'article
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Demande automatique de la permission caméra à l'ouverture
  useEffect(() => {
    if (visible && step === 'capture' && (!permission || !permission.granted)) {
      requestPermission();
    }
  }, [visible, step, permission]);

  // Animation continue d'alignement du ticket (bords qui s'écartent et virent au vert)
  const alignProgress = useSharedValue(0);

  useEffect(() => {
    if (visible && step === 'capture') {
      alignProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      alignProgress.value = 0;
    }
  }, [visible, step]);

  const tlCornerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -alignProgress.value * 6 },
      { translateY: -alignProgress.value * 6 },
    ],
    borderColor: interpolateColor(
      alignProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.85)', '#10B981']
    ),
  }));

  const trCornerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: alignProgress.value * 6 },
      { translateY: -alignProgress.value * 6 },
    ],
    borderColor: interpolateColor(
      alignProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.85)', '#10B981']
    ),
  }));

  const blCornerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -alignProgress.value * 6 },
      { translateY: alignProgress.value * 6 },
    ],
    borderColor: interpolateColor(
      alignProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.85)', '#10B981']
    ),
  }));

  const brCornerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: alignProgress.value * 6 },
      { translateY: alignProgress.value * 6 },
    ],
    borderColor: interpolateColor(
      alignProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.85)', '#10B981']
    ),
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: alignProgress.value * 340 }],
    opacity: 0.3 + alignProgress.value * 0.45,
  }));

  // Déclencher la prise de photo instantanée avec la caméra intégrée
  const handleCaptureWithCamera = async () => {
    if (isAnalyzing) return;
    await triggerHaptic('medium');

    if (cameraRef.current && permission?.granted) {
      try {
        setIsAnalyzing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        if (photo && photo.base64) {
          processImage(photo.base64, photo.uri);
          return;
        }
      } catch (e) {
        console.warn('Integrated camera capture error:', e);
      }
    }

    // Secours si besoin via le sélecteur standard
    handleTakePhoto();
  };
  const handleTakePhoto = async () => {
    await triggerHaptic('light');
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L’accès à la caméra est requis pour scanner vos tickets de caisse.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        processImage(result.assets[0].base64, result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Camera launch error:', e);
      processImage();
    }
  };

  // Choisir une image dans la galerie
  const handlePickFromGallery = async () => {
    await triggerHaptic('light');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'L’accès aux photos est requis.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        processImage(result.assets[0].base64, result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image picker error:', e);
      processImage();
    }
  };

  // Lancer l'analyse du reçu par la vraie IA
  const processImage = async (base64?: string | null, imageUri?: string) => {
    setIsAnalyzing(true);
    try {
      if (base64 && getApiKey()) {
        const aiReceipt = await parseReceiptWithAI(base64, imageUri);
        setParsedData(aiReceipt);
        setStep('preview');
        await triggerHaptic('success');
      } else if (base64 && !getApiKey()) {
        // Demander la clé à l'utilisateur
        setPendingBase64(base64);
        setShowApiKeyModal(true);
      } else {
        // Fallback local
        const fallback = await parseReceiptImage(imageUri);
        setParsedData(fallback);
        setStep('preview');
        await triggerHaptic('success');
      }
    } catch (error: any) {
      console.warn('AI Parsing failed, falling back:', error);
      if (error?.message === 'MISSING_API_KEY') {
        setPendingBase64(base64 || null);
        setShowApiKeyModal(true);
      } else {
        Alert.alert(
          'Analyse IA indisponible',
          'Une erreur est survenue lors de l’analyse. Passage en mode secours.'
        );
        const fallback = await parseReceiptImage(imageUri);
        setParsedData(fallback);
        setStep('preview');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('Clé requise', 'Veuillez coller votre clé Google AI Studio.');
      return;
    }
    setApiKey(apiKeyInput.trim());
    setShowApiKeyModal(false);
    if (pendingBase64) {
      processImage(pendingBase64);
      setPendingBase64(null);
    }
  };

  // Cocher / Décocher un article avec mise à jour du total
  const toggleItemCheck = (id: string) => {
    triggerHaptic('selection');
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      items: parsedData.items.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ),
    });
  };

  // Ouvrir l'édition discrète au crayon
  const startEditItem = (item: ReceiptItem) => {
    triggerHaptic('light');
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toFixed(2));
  };

  // Valider la modification du crayon
  const saveEditItem = (id: string) => {
    triggerHaptic('medium');
    if (!parsedData) return;
    const newPrice = parseFloat(editPrice.replace(',', '.')) || 0;
    setParsedData({
      ...parsedData,
      items: parsedData.items.map((item) =>
        item.id === id
          ? {
              ...item,
              name: editName.trim() || item.name,
              price: newPrice,
            }
          : item
      ),
    });
    setEditingItemId(null);
  };

  // Supprimer une ligne
  const deleteItem = (id: string) => {
    triggerHaptic('light');
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      items: parsedData.items.filter((item) => item.id !== id),
    });
  };

  // Ajouter manuellement une ligne oubliée
  const addNewItem = () => {
    triggerHaptic('light');
    if (!parsedData) return;
    const newItem: ReceiptItem = {
      id: `manual-${Date.now()}`,
      name: 'Article complémentaire',
      price: 0,
      selected: true,
      category: 'food',
    };
    setParsedData({
      ...parsedData,
      items: [...parsedData.items, newItem],
    });
    startEditItem(newItem);
  };

  // Calcul du total des articles cochés
  const selectedTotal =
    parsedData?.items
      .filter((it) => it.selected)
      .reduce((sum, it) => sum + it.price, 0) || 0;

  // Validation finale du reçu
  const handleConfirmSave = () => {
    if (!parsedData || selectedTotal <= 0) {
      Alert.alert(
        'Aucun article sélectionné',
        'Veuillez cocher au moins un article à inclure dans vos dépenses.'
      );
      return;
    }

    triggerHaptic('success');
    onSaveReceipt({
      merchant: parsedData.merchant,
      totalAmount: selectedTotal,
      items: parsedData.items.filter((it) => it.selected),
      date: parsedData.date,
      category: 'food',
    });

    handleClose();
  };

  const handleClose = () => {
    setStep('capture');
    setParsedData(null);
    setEditingItemId(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      {step === 'capture' ? (
        /* ÉCRAN 1 : CADRAGE & CAPTURE DU TICKET (CAMÉRA INTÉGRÉE AVEC COINS ANIMÉS) */
        <View style={styles.captureContainer}>
          {/* Flux direct de la caméra intégrée à l'application */}
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
            />
          ) : (
            <View style={styles.permissionFallback}>
              <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.7)" />
              <Text style={styles.permissionText}>
                L’accès à l’appareil photo est nécessaire pour scanner vos tickets en direct
              </Text>
              <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                <Text style={styles.grantBtnText}>Autoriser la caméra</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Calque de visée au-dessus du flux caméra */}
          <View style={styles.cameraOverlay} pointerEvents="box-none">
            {/* Header supérieur */}
            <View style={styles.captureHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.headerCircleBtn}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.captureTitle}>Scanner un ticket</Text>
              <TouchableOpacity onPress={handlePickFromGallery} style={styles.headerCircleBtn}>
                <Ionicons name="images-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Viseur minimaliste avec caméra visible au centre */}
            <View style={styles.viewfinderWrapper}>
              <View style={styles.viewfinder}>
                {/* 4 coins animés qui s'écartent et changent de couleur quand on est bien placé */}
                <Animated.View style={[styles.corner, styles.tl, tlCornerStyle]} />
                <Animated.View style={[styles.corner, styles.tr, trCornerStyle]} />
                <Animated.View style={[styles.corner, styles.bl, blCornerStyle]} />
                <Animated.View style={[styles.corner, styles.br, brCornerStyle]} />

                {/* Rayon laser d'analyse fluide */}
                <Animated.View style={[styles.scanLaser, scanLineStyle]} />

                {isAnalyzing ? (
                  <View style={styles.analyzingBox}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.analyzingText}>Lecture IA des articles en cours...</Text>
                  </View>
                ) : (
                  <View style={styles.viewfinderContent}>
                    <View style={styles.alignmentBadge}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.alignmentBadgeText}>Alignement automatique</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Déclencheur instantané */}
            <View style={styles.captureFooter}>
              <TouchableOpacity
                style={styles.triggerBtn}
                activeOpacity={0.8}
                onPress={handleCaptureWithCamera}
                disabled={isAnalyzing}
              >
                <View style={styles.triggerInner} />
              </TouchableOpacity>
              <Text style={styles.triggerCaption}>
                {isAnalyzing ? 'Analyse...' : 'Prendre la photo'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        /* ÉCRAN 2 : PRÉVISUALISATION INTERACTIVE AVEC CASES À COCHER & CRAYON */
        <View style={styles.previewContainer}>
          {/* Header de la prévisualisation */}
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={() => setStep('capture')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.previewTitle}>{parsedData?.merchant || 'Ticket de caisse'}</Text>
              <Text style={styles.previewDate}>{parsedData?.date}</Text>
            </View>
            <TouchableOpacity onPress={addNewItem} style={styles.addItemBtn}>
              <Ionicons name="add" size={22} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Bannière explicative discrète */}
          <View style={styles.helpBanner}>
            <Text style={styles.helpText}>
              Cochez ou décochez les articles à comptabiliser. Modifiez avec le crayon.
            </Text>
          </View>

          {/* Liste détaillée des articles détectés */}
          <ScrollView style={styles.itemsScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.itemsCard}>
              {parsedData?.items.map((item, index) => {
                const isEditing = editingItemId === item.id;

                return (
                  <View key={item.id} style={styles.itemRowWrapper}>
                    {isEditing ? (
                      /* Mode édition discrète au crayon */
                      <View style={styles.editRow}>
                        <TextInput
                          style={styles.editNameInput}
                          value={editName}
                          onChangeText={setEditName}
                          placeholder="Nom de l’article"
                          placeholderTextColor={THEME.colors.textMuted}
                        />
                        <TextInput
                          style={styles.editPriceInput}
                          value={editPrice}
                          onChangeText={setEditPrice}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={THEME.colors.textMuted}
                        />
                        <TouchableOpacity
                          style={styles.saveEditBtn}
                          onPress={() => saveEditItem(item.id)}
                        >
                          <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Affichage normal de la ligne avec case à cocher & petit crayon */
                      <View
                        style={[
                          styles.itemRow,
                          !item.selected && styles.itemRowDeselected,
                        ]}
                      >
                        {/* Case à cocher circulaire / carrée minimale */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => toggleItemCheck(item.id)}
                          style={styles.checkboxTouch}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              item.selected && styles.checkboxChecked,
                            ]}
                          >
                            {item.selected && (
                              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Nom de l'article */}
                        <Text
                          style={[
                            styles.itemName,
                            !item.selected && styles.itemNameDeselected,
                          ]}
                          numberOfLines={2}
                        >
                          {item.name}
                        </Text>

                        {/* Prix de l'article */}
                        <Text
                          style={[
                            styles.itemPrice,
                            !item.selected && styles.itemPriceDeselected,
                          ]}
                        >
                          {item.price.toFixed(2)} €
                        </Text>

                        {/* Crayon discret de modification */}
                        <TouchableOpacity
                          activeOpacity={0.6}
                          onPress={() => startEditItem(item)}
                          style={styles.pencilBtn}
                        >
                          <Ionicons
                            name="pencil-outline"
                            size={15}
                            color={THEME.colors.textSecondary}
                          />
                        </TouchableOpacity>

                        {/* Bouton poubelle discret */}
                        <TouchableOpacity
                          activeOpacity={0.6}
                          onPress={() => deleteItem(item.id)}
                          style={styles.trashBtn}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={15}
                            color={THEME.colors.textMuted}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {index < parsedData.items.length - 1 && <View style={styles.itemDivider} />}
                  </View>
                );
              })}
            </View>
            <View style={{ height: 140 }} />
          </ScrollView>

          {/* Panneau de validation en bas */}
          <View style={styles.previewFooter}>
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total des articles retenus</Text>
                <Text style={styles.totalCount}>
                  {parsedData?.items.filter((i) => i.selected).length} sur {parsedData?.items.length} articles
                </Text>
              </View>
              <Text style={styles.totalAmount}>{selectedTotal.toFixed(2)} €</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.85}
              onPress={handleConfirmSave}
            >
              <Text style={styles.confirmButtonText}>
                Enregistrer dans mes dépenses ({selectedTotal.toFixed(2)} €)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MODALE DE SAISIE DE CLÉ D'API IA */}
      <Modal visible={showApiKeyModal} transparent animationType="fade">
        <View style={styles.apiModalOverlay}>
          <View style={styles.apiModalCard}>
            <View style={styles.apiModalIcon}>
              <Ionicons name="sparkles" size={24} color="#111111" />
            </View>
            <Text style={styles.apiModalTitle}>Activer l'IA de lecture</Text>
            <Text style={styles.apiModalDesc}>
              Pour lire vos vrais tickets de caisse, l'application utilise l'IA Google Gemini (100% gratuite). Collez votre clé ici :
            </Text>

            <TextInput
              style={styles.apiModalInput}
              placeholder="Collez votre clé API Gemini..."
              placeholderTextColor={THEME.colors.textMuted}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.apiModalActions}>
              <TouchableOpacity
                style={styles.apiModalCancelBtn}
                onPress={() => {
                  setShowApiKeyModal(false);
                  setIsAnalyzing(false);
                }}
              >
                <Text style={styles.apiModalCancelText}>Plus tard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.apiModalSaveBtn}
                onPress={handleSaveApiKey}
              >
                <Text style={styles.apiModalSaveText}>Activer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  /* STYLES CAPTURE */
  captureContainer: {
    flex: 1,
    backgroundColor: '#0B0B0E',
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  permissionFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B0B0E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  grantBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scanLaser: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 30,
    height: 2.5,
    backgroundColor: '#10B981',
    borderRadius: 1.5,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  alignmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 160,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  alignmentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  captureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewfinderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  viewfinder: {
    width: '100%',
    height: 420,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: '#FFFFFF',
  },
  tl: {
    top: -1,
    left: -1,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 16,
  },
  tr: {
    top: -1,
    right: -1,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 16,
  },
  bl: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 16,
  },
  br: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 16,
  },
  viewfinderContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  viewfinderGuide: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  viewfinderSubGuide: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  analyzingBox: {
    alignItems: 'center',
  },
  analyzingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  captureFooter: {
    alignItems: 'center',
  },
  triggerBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  triggerInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
  triggerCaption: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },

  /* STYLES PRÉVISUALISATION */
  previewContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: 50,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  headerTitles: {
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  previewDate: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  addItemBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  helpBanner: {
    backgroundColor: '#F5F5F7',
    paddingVertical: 8,
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  itemsScrollView: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 8,
  },
  itemsCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  itemRowWrapper: {},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemRowDeselected: {
    opacity: 0.4,
  },
  checkboxTouch: {
    paddingRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginRight: 8,
  },
  itemNameDeselected: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textMuted,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginRight: 10,
  },
  itemPriceDeselected: {
    color: THEME.colors.textMuted,
  },
  pencilBtn: {
    padding: 6,
  },
  trashBtn: {
    padding: 6,
  },
  itemDivider: {
    height: 1,
    backgroundColor: THEME.colors.borderLight,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  editNameInput: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: '#111111',
  },
  editPriceInput: {
    width: 70,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: '#111111',
    textAlign: 'right',
  },
  saveEditBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 16,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    ...THEME.shadows.floating,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  totalCount: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  confirmButton: {
    backgroundColor: '#111111',
    borderRadius: THEME.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  /* STYLES MODALE CLÉ API */
  apiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  apiModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...THEME.shadows.floating,
  },
  apiModalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  apiModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  apiModalDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  apiModalInput: {
    width: '100%',
    backgroundColor: '#F4F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 16,
  },
  apiModalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  apiModalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
  },
  apiModalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  apiModalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
  },
  apiModalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
