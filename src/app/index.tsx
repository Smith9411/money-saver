import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Transaction, TimePeriod, TransactionCategory, TransactionType } from '../types';
import {
  initDatabase,
  getTransactions,
  addTransaction,
  deleteTransaction,
  computeStats,
  getCategoryBudgets,
} from '../services/db';

import { Header } from '../components/Header';
import { MetricsPill } from '../components/MetricsPill';
import { CashflowChart } from '../components/CashflowChart';
import { BudgetCategoryList } from '../components/BudgetCategoryList';
import { TransactionList } from '../components/TransactionList';
import { BottomNavBar, NavTab } from '../components/BottomNavBar';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { ReceiptScannerModal } from '../components/ReceiptScannerModal';
import { AnalyticsView } from '../components/AnalyticsView';

export default function Index() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Initialisation de la base SQLite locale
  useEffect(() => {
    const loadData = async () => {
      await initDatabase();
      const loaded = await getTransactions();
      setTransactions(loaded);
    };
    loadData();
  }, []);

  // Calcul des statistiques selon la période
  const stats = useMemo(() => {
    return computeStats(transactions, period);
  }, [transactions, period]);

  // Calcul des budgets par catégorie
  const budgets = useMemo(() => {
    return getCategoryBudgets(transactions);
  }, [transactions]);

  // Ajouter une transaction manuelle
  const handleAddTransaction = async (data: {
    title: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    date: string;
  }) => {
    const created = await addTransaction(data);
    setTransactions((prev) => [created, ...prev]);
  };

  // Supprimer une transaction
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Traiter un ticket scanné
  const handleReceiptScanned = async (data: {
    title: string;
    amount: number;
    category: TransactionCategory;
    date: string;
  }) => {
    const created = await addTransaction({
      ...data,
      type: 'expense',
    });
    setTransactions((prev) => [created, ...prev]);
    Alert.alert(
      'Ticket scanné avec succès !',
      `${data.title} (${data.amount.toFixed(2)} €) a été ajouté à vos dépenses.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {currentTab === 'analytics' ? (
          <AnalyticsView
            stats={stats}
            period={period}
            onPeriodChange={setPeriod}
            budgets={budgets}
            onBack={() => setCurrentTab('home')}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Header minimaliste (Avatar, Salutation, Actions) */}
            <Header
              onCalendarPress={() => setCurrentTab('analytics')}
              onSearchPress={() => setIsAddModalOpen(true)}
              onOptionsPress={() => setPeriod(period === 'week' ? 'month' : 'week')}
            />

            {/* 2. Métriques clés en pilule (Dépenses, Revenus, Épargne) */}
            <MetricsPill stats={stats} />

            {/* 3. Graphique d'évolution des flux (Inspiré du design de référence) */}
            <CashflowChart
              period={period}
              onPeriodChange={setPeriod}
            />

            {/* 4. Budgets & Catégories avec jauges fines noires */}
            <BudgetCategoryList
              budgets={budgets}
              onViewAll={() => setCurrentTab('analytics')}
            />

            {/* 5. Dernières transactions */}
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onViewAll={() => setCurrentTab('analytics')}
            />
          </ScrollView>
        )}

        {/* Barre de navigation inférieure flottante */}
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'scanner') {
              setIsScannerOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          onAddPress={() => setIsAddModalOpen(true)}
        />

        {/* Modale d'ajout manuel de transaction */}
        <AddTransactionModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTransaction}
        />

        {/* Modale de simulation de scanner de reçu */}
        <ReceiptScannerModal
          visible={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onReceiptScanned={handleReceiptScanned}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
