import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { TransactionCategory } from '../types';

interface ReceiptScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onReceiptScanned: (data: {
    title: string;
    amount: number;
    category: TransactionCategory;
    date: string;
  }) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  visible,
  onClose,
  onReceiptScanned,
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onReceiptScanned({
        title: 'Ticket Supermarché Carrefour',
        amount: 38.45,
        category: 'food',
        date: new Date().toISOString().split('T')[0],
      });
      onClose();
    }, 1800);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Scanner un ticket</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Viseur de cadrage */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            {/* Coins de cadrage */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {isScanning ? (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.scanningText}>Analyse du reçu par l'IA...</Text>
              </View>
            ) : (
              <View style={styles.instructionBox}>
                <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.7)" />
                <Text style={styles.instructionText}>
                  Placez le reçu à l'intérieur du cadre pour extraire automatiquement le montant
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Barre d'action inférieure */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.captureBtn}
            activeOpacity={0.8}
            onPress={simulateScan}
            disabled={isScanning}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <Text style={styles.hintText}>Appuyez pour scanner le reçu</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0F1015',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  viewfinder: {
    width: '100%',
    height: 380,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  instructionBox: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  scanningIndicator: {
    alignItems: 'center',
  },
  scanningText: {
    color: '#FFFFFF',
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
});
