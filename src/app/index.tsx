import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { Transaction, TimePeriod, TransactionCategory, TransactionType } from '../types';
import {
  initDatabase,
  getTransactions,
  addTransaction,
  deleteTransaction,
  computeStats,
  getCategoryBudgets,
  getUpcomingPayments,
  getSetting,
  setSetting,
  resetAllData,
} from '../services/db';

import { Header } from '../components/Header';
import { MetricsPill } from '../components/MetricsPill';
import { CashflowChart } from '../components/CashflowChart';
import { UpcomingPaymentsSection } from '../components/UpcomingPaymentsSection';
import { BudgetCategoryList } from '../components/BudgetCategoryList';
import { TransactionList } from '../components/TransactionList';
import { BottomNavBar, NavTab } from '../components/BottomNavBar';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { ReceiptScannerModal } from '../components/ReceiptScannerModal';
import { ReceiptDetailModal } from '../components/ReceiptDetailModal';
import { AnalyticsView } from '../components/AnalyticsView';
import { ProfileView } from '../components/ProfileView';

export default function Index() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  // Initialisation de la base SQLite locale
  useEffect(() => {
    const loadData = async () => {
      await initDatabase();
      const loaded = await getTransactions();
      setTransactions(loaded);
      const savedName = await getSetting('user_name', '');
      setUserName(savedName);
    };
    loadData();
  }, []);

  // Calcul des statistiques selon la période
  const stats = useMemo(() => {
    return computeStats(transactions, period);
  }, [transactions, period]);

  // Calcul des échéances récurrentes à venir du mois
  const upcomingData = useMemo(() => {
    return getUpcomingPayments(transactions);
  }, [transactions]);

  // Calcul des budgets par catégorie
  const budgets = useMemo(() => {
    return getCategoryBudgets(transactions);
  }, [transactions]);

  // Enregistrer le prénom de l'utilisateur
  const handleSaveUserName = async (name: string) => {
    setUserName(name);
    await setSetting('user_name', name);
  };

  // Remise à zéro complète de l'application
  const handleResetAllData = async () => {
    await resetAllData();
    setTransactions([]);
    setSelectedTxForReceipt(null);
    setCurrentTab('home');
  };

  // Ajouter une transaction manuelle (avec support récurrent)
  const handleAddTransaction = async (data: {
    title: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    isRecurring?: boolean;
    recurringDay?: number;
  }) => {
    const created = await addTransaction(data);
    setTransactions((prev) => [created, ...prev]);
  };

  // Supprimer une transaction
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Traiter et sauvegarder un ticket scanné avec ses articles détaillés retenus
  const handleSaveReceipt = async (data: {
    merchant: string;
    totalAmount: number;
    items: any[];
    date: string;
    category: TransactionCategory;
  }) => {
    const created = await addTransaction({
      title: data.merchant || 'Ticket de caisse',
      amount: data.totalAmount,
      type: 'expense',
      category: data.category || 'food',
      date: data.date,
      merchant: data.merchant,
      note: `${data.items.length} article(s) scanné(s)`,
      items: data.items,
    });
    setTransactions((prev) => [created, ...prev]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {currentTab === 'profile' ? (
          <ProfileView
            onBack={() => setCurrentTab('home')}
            transactionsCount={transactions.length}
            userName={userName}
            onSaveUserName={handleSaveUserName}
            onResetAllData={handleResetAllData}
          />
        ) : currentTab === 'analytics' ? (
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
              onProfilePress={() => setCurrentTab('profile')}
              userName={userName}
            />

            {/* 2. Métriques clés en pilule (Dépenses, Revenus, Épargne) */}
            <MetricsPill stats={stats} />

            {/* 3. Graphique d'évolution des flux (Inspiré du design de référence) */}
            <CashflowChart
              period={period}
              onPeriodChange={setPeriod}
            />

            {/* 4. Échéances récurrentes à venir du mois */}
            <UpcomingPaymentsSection
              upcoming={upcomingData.upcoming}
              totalUpcomingExpenses={upcomingData.totalUpcomingExpenses}
              onAddRecurringPress={() => setIsAddModalOpen(true)}
            />

            {/* 5. Budgets & Catégories avec jauges fines noires */}
            <BudgetCategoryList
              budgets={budgets}
              onViewAll={() => setCurrentTab('analytics')}
            />

            {/* 6. Dernières transactions avec clic pour ouvrir le ticket de caisse */}
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onTransactionPress={(tx) => setSelectedTxForReceipt(tx)}
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

        {/* Modale d'analyse et scan de ticket de caisse par IA */}
        <ReceiptScannerModal
          visible={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onSaveReceipt={handleSaveReceipt}
        />

        {/* Modale détaillée d'un ticket scanné au clic sur la dépense */}
        <ReceiptDetailModal
          transaction={selectedTxForReceipt}
          visible={selectedTxForReceipt !== null}
          onClose={() => setSelectedTxForReceipt(null)}
          onDelete={handleDeleteTransaction}
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
