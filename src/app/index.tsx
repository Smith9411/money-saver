import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { Transaction, TimePeriod, TransactionCategory, TransactionType } from '../types';
import { triggerHaptic } from '../services/haptics';
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
import { initApiKey } from '../services/aiReceiptScanner';

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
import { HistoryModal } from '../components/HistoryModal';
import { BudgetManagerModal } from '../components/BudgetManagerModal';
import { AnalyticsView } from '../components/AnalyticsView';
import { ProfileView } from '../components/ProfileView';
import { OnboardingView } from '../components/OnboardingView';
import { useTheme } from '../context/ThemeContext';

export default function Index() {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState<string | null>(null); // null = en chargement, '' = onboarding requis
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
  const [customBudgets, setCustomBudgets] = useState<Record<string, number>>({});
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    await initDatabase();
    await initApiKey();
    const loaded = await getTransactions();
    setTransactions(loaded);
    const savedName = await getSetting('user_name', '');
    setUserName(savedName);
    const savedAvatar = await getSetting('user_avatar', '');
    setUserAvatar(savedAvatar || null);

    // Charger les plafonds personnalisés de budget
    const foodB = await getSetting('budget_food', '400');
    const housingB = await getSetting('budget_housing', '900');
    const transportB = await getSetting('budget_transport', '150');
    const shoppingB = await getSetting('budget_shopping', '250');
    const leisureB = await getSetting('budget_leisure', '120');
    const educationB = await getSetting('budget_education', '100');
    setCustomBudgets({
      food: parseInt(foodB, 10) || 400,
      housing: parseInt(housingB, 10) || 900,
      transport: parseInt(transportB, 10) || 150,
      shopping: parseInt(shoppingB, 10) || 250,
      leisure: parseInt(leisureB, 10) || 120,
      education: parseInt(educationB, 10) || 100,
    });
  };

  // Initialisation de la base SQLite et de la clé d'API
  useEffect(() => {
    loadData();
  }, []);

  // Pull-to-refresh avec retour haptique
  const handleRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('light');
    await loadData();
    setRefreshing(false);
    triggerHaptic('success');
  };

  // Calcul des statistiques selon la période
  const stats = useMemo(() => {
    return computeStats(transactions, period);
  }, [transactions, period]);

  // Calcul des échéances récurrentes à venir du mois
  const upcomingData = useMemo(() => {
    return getUpcomingPayments(transactions);
  }, [transactions]);

  // Calcul des budgets par catégorie avec plafonds configurables
  const budgets = useMemo(() => {
    return getCategoryBudgets(transactions, customBudgets);
  }, [transactions, customBudgets]);

  // Enregistrer le prénom depuis l'onboarding ou le profil
  const handleSaveUserName = async (name: string) => {
    setUserName(name);
    await setSetting('user_name', name);
  };

  // Enregistrer la photo de profil dans SQLite
  const handleSaveUserAvatar = async (uri: string | null) => {
    setUserAvatar(uri);
    await setSetting('user_avatar', uri || '');
  };

  // Mettre à jour le plafond d'un budget dans SQLite
  const handleUpdateBudget = async (category: TransactionCategory, newBudget: number) => {
    setCustomBudgets((prev) => ({ ...prev, [category]: newBudget }));
    await setSetting(`budget_${category}`, newBudget.toString());
  };

  // Remise à zéro complète de l'application (bascule automatiquement sur l'onboarding)
  const handleResetAllData = async () => {
    await resetAllData();
    await setSetting('user_name', '');
    await setSetting('user_avatar', '');
    setUserName('');
    setUserAvatar(null);
    setTransactions([]);
    setSelectedTxForReceipt(null);
    setCurrentTab('home');
  };

  // Ajouter une transaction manuelle
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

  // Traiter et sauvegarder un ticket scanné
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

  // 1. Pendant le chargement initial de la base
  if (userName === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  // 2. Si aucun prénom n'est défini (premier lancement ou après réinitialisation) : Page d'onboarding !
  if (!userName || userName.trim().length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <OnboardingView onComplete={handleSaveUserName} />
      </SafeAreaView>
    );
  }

  // 3. Application principale une fois l'utilisateur accueilli
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {currentTab === 'profile' ? (
          <ProfileView
            onBack={() => setCurrentTab('home')}
            transactionsCount={transactions.length}
            userName={userName}
            userAvatar={userAvatar}
            onSaveUserName={handleSaveUserName}
            onSaveUserAvatar={handleSaveUserAvatar}
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.accent}
                colors={[theme.colors.accent]}
              />
            }
          >
            {/* 1. Header minimaliste */}
            <Header
              onCalendarPress={() => setIsHistoryOpen(true)}
              onProfilePress={() => setCurrentTab('profile')}
              userName={userName}
              userAvatar={userAvatar}
            />

            {/* 2. Métriques clés en pilule (Dépenses, Revenus) */}
            <MetricsPill stats={stats} />

            {/* 3. Graphique d'évolution des flux (100% réel et dynamique) */}
            <CashflowChart
              period={period}
              onPeriodChange={setPeriod}
              transactions={transactions}
            />

            {/* 4. Échéances récurrentes à venir du mois */}
            <UpcomingPaymentsSection
              upcoming={upcomingData.upcoming}
              totalUpcomingExpenses={upcomingData.totalUpcomingExpenses}
              onAddRecurringPress={() => setIsAddModalOpen(true)}
            />

            {/* 5. Budgets & Catégories avec jauges fines et modification de plafond */}
            <BudgetCategoryList
              budgets={budgets}
              onViewAll={() => setIsBudgetManagerOpen(true)}
            />

            {/* 6. Dernières transactions avec clic pour ouvrir le ticket de caisse */}
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onTransactionPress={(tx) => setSelectedTxForReceipt(tx)}
              onViewAll={() => setIsHistoryOpen(true)}
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

        {/* Modale d'historique complet avec recherche temps réel & filtres */}
        <HistoryModal
          visible={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          transactions={transactions}
          onSelectTransaction={(tx) => {
            setIsHistoryOpen(false);
            setSelectedTxForReceipt(tx);
          }}
          onDeleteTransaction={handleDeleteTransaction}
        />

        {/* Modale de gestion des plafonds de budgets */}
        <BudgetManagerModal
          visible={isBudgetManagerOpen}
          onClose={() => setIsBudgetManagerOpen(false)}
          budgets={budgets}
          onUpdateBudget={handleUpdateBudget}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 110,
  },
});
