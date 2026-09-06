import * as SQLite from 'expo-sqlite';
import {
  Transaction,
  PeriodStats,
  CategoryBudget,
  TimePeriod,
  UpcomingPayment,
  ReceiptItem,
} from '../types';

let dbInstance: any = null;

// Données initiales enrichies avec des paiements récurrents et des articles de tickets
let fallbackTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Monoprix Gourmet',
    amount: 54.20,
    type: 'expense',
    category: 'food',
    date: '2026-09-06',
    merchant: 'Monoprix',
    note: '5 article(s) scanné(s)',
    items: [
      { id: 'it-1', name: 'Pain de campagne bio', price: 2.80, selected: true, category: 'food' },
      { id: 'it-2', name: 'Café grains Arabica 250g', price: 5.40, selected: true, category: 'food' },
      { id: 'it-3', name: 'Huile d’olive vierge extra', price: 8.90, selected: true, category: 'food' },
      { id: 'it-4', name: 'Chaussettes coton x3', price: 12.00, selected: true, category: 'shopping' },
      { id: 'it-5', name: 'Jus d’orange frais', price: 3.50, selected: true, category: 'food' },
    ],
  },
  {
    id: '2',
    title: 'Abonnement Spotify',
    amount: 10.99,
    type: 'expense',
    category: 'leisure',
    date: '2026-09-05',
    merchant: 'Spotify',
    isRecurring: true,
    recurringDay: 12,
  },
  {
    id: '3',
    title: 'Virement Salaire',
    amount: 2850.00,
    type: 'income',
    category: 'salary',
    date: '2026-09-01',
    merchant: 'Entreprise SA',
    isRecurring: true,
    recurringDay: 28,
  },
  {
    id: '4',
    title: 'Loyer Appartement',
    amount: 780.00,
    type: 'expense',
    category: 'housing',
    date: '2026-09-01',
    merchant: 'Propriétaire',
    isRecurring: true,
    recurringDay: 5,
  },
  {
    id: '5',
    title: 'Forfait Mobile 5G',
    amount: 19.99,
    type: 'expense',
    category: 'leisure',
    date: '2026-09-02',
    merchant: 'Opérateur',
    isRecurring: true,
    recurringDay: 18,
  },
  {
    id: '6',
    title: 'Pass Navigo Transport',
    amount: 86.40,
    type: 'expense',
    category: 'transport',
    date: '2026-09-02',
    merchant: 'Régie Transports',
    isRecurring: true,
    recurringDay: 2,
  },
  {
    id: '7',
    title: 'Abonnement Box Internet',
    amount: 29.99,
    type: 'expense',
    category: 'housing',
    date: '2026-09-03',
    merchant: 'Fournisseur Internet',
    isRecurring: true,
    recurringDay: 22,
  },
];

export async function initDatabase(): Promise<void> {
  try {
    if (typeof SQLite.openDatabaseSync === 'function') {
      dbInstance = SQLite.openDatabaseSync('money_saver.db');
      dbInstance.execSync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          merchant TEXT,
          note TEXT,
          items TEXT,
          is_recurring INTEGER DEFAULT 0,
          recurring_day INTEGER
        );
      `);

      // Migration non-bloquante au cas où la table existait déjà avec l'ancien schéma
      try {
        dbInstance.execSync(`ALTER TABLE transactions ADD COLUMN items TEXT;`);
      } catch {}
      try {
        dbInstance.execSync(`ALTER TABLE transactions ADD COLUMN is_recurring INTEGER DEFAULT 0;`);
      } catch {}
      try {
        dbInstance.execSync(`ALTER TABLE transactions ADD COLUMN recurring_day INTEGER;`);
      } catch {}

      // Vérifier si la table est vide pour initialiser les données de démonstration
      const countResult: any = dbInstance.getFirstSync(
        'SELECT COUNT(*) as count FROM transactions;'
      );

      if (countResult && countResult.count === 0) {
        for (const item of fallbackTransactions) {
          dbInstance.runSync(
            `INSERT INTO transactions (id, title, amount, type, category, date, merchant, note, items, is_recurring, recurring_day)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              item.id,
              item.title,
              item.amount,
              item.type,
              item.category,
              item.date,
              item.merchant || '',
              item.note || '',
              item.items ? JSON.stringify(item.items) : null,
              item.isRecurring ? 1 : 0,
              item.recurringDay || null,
            ]
          );
        }
      }
    }
  } catch (error) {
    console.warn('SQLite init warning (using memory storage fallback):', error);
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    if (dbInstance) {
      const rows: any[] = dbInstance.getAllSync(
        'SELECT * FROM transactions ORDER BY date DESC, id DESC;'
      );
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        amount: row.amount,
        type: row.type,
        category: row.category,
        date: row.date,
        merchant: row.merchant,
        note: row.note,
        items: row.items ? JSON.parse(row.items) : undefined,
        isRecurring: Boolean(row.is_recurring),
        recurringDay: row.recurring_day || undefined,
      }));
    }
  } catch (e) {
    console.warn('Error reading from SQLite, using memory fallback:', e);
  }
  return [...fallbackTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function addTransaction(
  transaction: Omit<Transaction, 'id'>
): Promise<Transaction> {
  const newTx: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };

  try {
    if (dbInstance) {
      dbInstance.runSync(
        `INSERT INTO transactions (id, title, amount, type, category, date, merchant, note, items, is_recurring, recurring_day)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newTx.id,
          newTx.title,
          newTx.amount,
          newTx.type,
          newTx.category,
          newTx.date,
          newTx.merchant || '',
          newTx.note || '',
          newTx.items ? JSON.stringify(newTx.items) : null,
          newTx.isRecurring ? 1 : 0,
          newTx.recurringDay || null,
        ]
      );
    }
  } catch (e) {
    console.warn('Error inserting to SQLite, saving to fallback:', e);
  }

  fallbackTransactions.unshift(newTx);
  return newTx;
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    if (dbInstance) {
      dbInstance.runSync('DELETE FROM transactions WHERE id = ?;', [id]);
    }
  } catch (e) {
    console.warn('Error deleting from SQLite:', e);
  }
  fallbackTransactions = fallbackTransactions.filter((tx) => tx.id !== id);
}

export function computeStats(transactions: Transaction[], period: TimePeriod): PeriodStats {
  const now = new Date();

  const filtered = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) return true;

    if (period === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return txDate >= oneWeekAgo;
    } else if (period === 'month') {
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    } else {
      return txDate.getFullYear() === now.getFullYear();
    }
  });

  const totalExpense = filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;

  return {
    totalExpense,
    totalIncome,
    savingsRate,
    netBalance,
    transactionsCount: filtered.length,
  };
}

// Calcul des prochaines échéances récurrentes du mois en cours
export function getUpcomingPayments(transactions: Transaction[]): {
  upcoming: UpcomingPayment[];
  totalUpcomingExpenses: number;
} {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const recurringTx = transactions.filter((tx) => tx.isRecurring);

  const upcoming: UpcomingPayment[] = [];
  let totalUpcomingExpenses = 0;

  for (const tx of recurringTx) {
    const day = tx.recurringDay || 1;
    let daysRemaining = day - currentDay;

    // Si le jour de prélèvement est déjà passé ce mois-ci, calcule le prochain prélèvement pour le mois suivant
    if (daysRemaining < 0) {
      daysRemaining = daysInMonth - currentDay + day;
    }

    if (tx.type === 'expense') {
      totalUpcomingExpenses += tx.amount;
    }

    upcoming.push({
      id: tx.id,
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      dayOfMonth: day,
      daysRemaining,
      category: tx.category,
    });
  }

  // Trier par échéance la plus proche (0 jour, 1 jour, 2 jours...)
  upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return {
    upcoming,
    totalUpcomingExpenses,
  };
}

export function getCategoryBudgets(transactions: Transaction[]): CategoryBudget[] {
  const budgets: Record<
    string,
    { name: string; budget: number; icon: string; color: string }
  > = {
    food: { name: 'Alimentation & Sorties', budget: 400, icon: 'coffee', color: '#111111' },
    housing: { name: 'Logement & Factures', budget: 900, icon: 'home', color: '#111111' },
    transport: { name: 'Transports & Mobilité', budget: 150, icon: 'navigation', color: '#111111' },
    shopping: { name: 'Shopping & Équipement', budget: 250, icon: 'shopping-bag', color: '#111111' },
    leisure: { name: 'Loisirs & Abonnements', budget: 120, icon: 'play-circle', color: '#111111' },
  };

  const spentPerCat: Record<string, number> = {};

  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      spentPerCat[tx.category] = (spentPerCat[tx.category] || 0) + tx.amount;
    });

  return Object.keys(budgets).map((catKey) => {
    const info = budgets[catKey];
    const spent = Math.round(spentPerCat[catKey] || 0);
    const percentage = Math.min(100, Math.round((spent / info.budget) * 100));

    return {
      category: catKey as any,
      name: info.name,
      spent,
      budget: info.budget,
      percentage,
      iconName: info.icon,
      color: info.color,
    };
  });
}
