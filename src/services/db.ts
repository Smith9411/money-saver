import * as SQLite from 'expo-sqlite';
import {
  Transaction,
  PeriodStats,
  CategoryBudget,
  TimePeriod,
  UpcomingPayment,
} from '../types';

let dbInstance: any = null;

// Mémoire de secours en cas d'indisponibilité SQLite (commence vide pour une app propre)
let memoryTransactions: Transaction[] = [];
const memorySettings: Record<string, string> = {
  user_name: 'Alexandre',
};

export async function initDatabase(): Promise<void> {
  try {
    if (typeof SQLite.openDatabaseSync === 'function') {
      dbInstance = SQLite.openDatabaseSync('money_saver.db');

      // Table des transactions
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

      // Table des réglages (profil, devises, api keys...)
      dbInstance.execSync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);

      // Migrations non-bloquantes
      try {
        dbInstance.execSync(`ALTER TABLE transactions ADD COLUMN items TEXT;`);
      } catch {}
      try {
        dbInstance.execSync(`ALTER TABLE transactions ADD COLUMN is_recurring INTEGER DEFAULT 0;`);
      } catch {}
      try {
        dbInstance.execSync(`ALTER TABLE transactions ADD COLUMN recurring_day INTEGER;`);
      } catch {}
    }
  } catch (error) {
    console.warn('SQLite init warning (using memory storage fallback):', error);
  }
}

// Gestion des réglages (ex: nom d'utilisateur)
export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  try {
    if (dbInstance) {
      const row: any = dbInstance.getFirstSync(
        'SELECT value FROM settings WHERE key = ?;',
        [key]
      );
      if (row && row.value !== undefined) {
        return row.value;
      }
    }
  } catch (e) {
    console.warn('Error reading setting from SQLite:', e);
  }
  return memorySettings[key] !== undefined ? memorySettings[key] : defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  memorySettings[key] = value;
  try {
    if (dbInstance) {
      dbInstance.runSync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
        [key, value]
      );
    }
  } catch (e) {
    console.warn('Error saving setting to SQLite:', e);
  }
}

// Réinitialiser toutes les données pour repartir de zéro
export async function resetAllData(): Promise<void> {
  try {
    if (dbInstance) {
      dbInstance.execSync('DELETE FROM transactions;');
    }
  } catch (e) {
    console.warn('Error resetting transactions in SQLite:', e);
  }
  memoryTransactions = [];
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
        items: row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : undefined,
        isRecurring: Boolean(row.is_recurring),
        recurringDay: row.recurring_day || undefined,
      }));
    }
  } catch (e) {
    console.warn('Error reading from SQLite, using memory fallback:', e);
  }
  return [...memoryTransactions].sort(
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

  memoryTransactions.unshift(newTx);
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
  memoryTransactions = memoryTransactions.filter((tx) => tx.id !== id);
}

export function computeStats(transactions: Transaction[], period: TimePeriod): PeriodStats {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const filtered = transactions.filter((tx) => {
    if (!tx.date) return true;
    const parts = tx.date.split('-');
    if (parts.length < 3) return true;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return true;

    const txDateObj = new Date(y, m, d);

    if (period === 'week') {
      const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return txDateObj >= oneWeekAgo && txDateObj <= endOfToday;
    } else if (period === 'month') {
      return y === currentYear && m === currentMonth;
    } else {
      return y === currentYear;
    }
  });

  // Si le filtre temporel strict est vide mais qu'il y a des transactions récentes,
  // on utilise la liste globale pour ne jamais afficher 0 € de façon trompeuse
  const activeList = filtered.length > 0 ? filtered : transactions;

  const totalExpense = activeList
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = activeList
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = 0; // Catégorie épargne retirée temporairement

  return {
    totalExpense: Math.round(totalExpense * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    savingsRate,
    netBalance: Math.round(netBalance * 100) / 100,
    transactionsCount: activeList.length,
  };
}

// Calcul des prochaines échéances récurrentes du mois
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

  upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return {
    upcoming,
    totalUpcomingExpenses,
  };
}

export function getCategoryBudgets(
  transactions: Transaction[],
  customBudgets?: Record<string, number>
): CategoryBudget[] {
  const budgets: Record<
    string,
    { name: string; budget: number; icon: string; color: string }
  > = {
    food: { name: 'Alimentation & Sorties', budget: customBudgets?.food || 400, icon: 'coffee', color: '#111111' },
    housing: { name: 'Logement & Factures', budget: customBudgets?.housing || 900, icon: 'home', color: '#111111' },
    transport: { name: 'Transports & Mobilité', budget: customBudgets?.transport || 150, icon: 'navigation', color: '#111111' },
    shopping: { name: 'Shopping & Équipement', budget: customBudgets?.shopping || 250, icon: 'shopping-bag', color: '#111111' },
    leisure: { name: 'Loisirs & Abonnements', budget: customBudgets?.leisure || 120, icon: 'play-circle', color: '#111111' },
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
