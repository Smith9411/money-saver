import * as SQLite from 'expo-sqlite';
import { Transaction, PeriodStats, ChartDataPoint, CategoryBudget, TimePeriod } from '../types';

let dbInstance: any = null;

// Mémoire de secours en cas d'environnement web ou initialisation différée
let fallbackTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Monoprix Gourmet',
    amount: 54.20,
    type: 'expense',
    category: 'food',
    date: '2026-09-06',
    merchant: 'Monoprix',
  },
  {
    id: '2',
    title: 'Abonnement Spotify',
    amount: 10.99,
    type: 'expense',
    category: 'leisure',
    date: '2026-09-05',
    merchant: 'Spotify',
  },
  {
    id: '3',
    title: 'Virement Salaire',
    amount: 2850.00,
    type: 'income',
    category: 'salary',
    date: '2026-09-01',
    merchant: 'Entreprise SA',
  },
  {
    id: '4',
    title: 'Restaurant Le Comptoir',
    amount: 46.50,
    type: 'expense',
    category: 'food',
    date: '2026-09-04',
    merchant: 'Le Comptoir',
  },
  {
    id: '5',
    title: 'Pass Transport Mensuel',
    amount: 86.40,
    type: 'expense',
    category: 'transport',
    date: '2026-09-02',
    merchant: 'Régie Transports',
  },
  {
    id: '6',
    title: 'Maison & Décoration',
    amount: 124.00,
    type: 'expense',
    category: 'shopping',
    date: '2026-09-03',
    merchant: 'Galeries',
  },
  {
    id: '7',
    title: 'Mission Freelance UI',
    amount: 600.00,
    type: 'income',
    category: 'freelance',
    date: '2026-09-04',
    merchant: 'Studio Tech',
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
          note TEXT
        );
      `);

      // Vérifier si la table est vide pour initialiser les données d'exemple
      const countResult: any = dbInstance.getFirstSync(
        'SELECT COUNT(*) as count FROM transactions;'
      );

      if (countResult && countResult.count === 0) {
        for (const item of fallbackTransactions) {
          dbInstance.runSync(
            `INSERT INTO transactions (id, title, amount, type, category, date, merchant, note)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              item.id,
              item.title,
              item.amount,
              item.type,
              item.category,
              item.date,
              item.merchant || '',
              item.note || '',
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
      const rows = dbInstance.getAllSync(
        'SELECT * FROM transactions ORDER BY date DESC, id DESC;'
      );
      return rows as Transaction[];
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
        `INSERT INTO transactions (id, title, amount, type, category, date, merchant, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newTx.id,
          newTx.title,
          newTx.amount,
          newTx.type,
          newTx.category,
          newTx.date,
          newTx.merchant || '',
          newTx.note || '',
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
  
  // Filtrer par période
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
