export type ThemeId =
  | 'pure-paper'
  | 'nordic-sage'
  | 'tokyo-clay'
  | 'electric-modern'
  | 'editorial-silk'
  | 'obsidian-gold'
  | 'midnight-titanium'
  | 'emerald-noir'
  | 'nordic-night'
  | 'amethyst-velvet';

export interface AppTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  type: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceSubtle: string;
    surfaceMuted: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    accent: string;
    accentSubtle: string;
    incomeBg: string;
    incomeText: string;
    expenseBg: string;
    expenseText: string;
  };
  cardRadius: number;
}

export const THEMES: Record<ThemeId, AppTheme> = {
  // --- THÈMES CLAIRS ---
  'pure-paper': {
    id: 'pure-paper',
    name: 'Pure Paper',
    tagline: 'Monochrome d’architecte sur papier blanc chaud',
    isDark: false,
    type: 'light',
    colors: {
      background: '#FAF9F6',
      surface: '#FFFFFF',
      surfaceSubtle: '#F4F4F6',
      surfaceMuted: '#ECECED',
      textPrimary: '#111111',
      textSecondary: '#6E6E73',
      textMuted: '#9E9EA7',
      border: '#E8E8EC',
      borderLight: '#F0F0F4',
      accent: '#111111',
      accentSubtle: '#F4F4F6',
      incomeBg: '#F0FDF4',
      incomeText: '#15803D',
      expenseBg: '#FFF1F2',
      expenseText: '#BE123C',
    },
    cardRadius: 20,
  },

  'nordic-sage': {
    id: 'nordic-sage',
    name: 'Nordic Sage',
    tagline: 'Minimalisme scandinave, lin frais & sauge poudré',
    isDark: false,
    type: 'light',
    colors: {
      background: '#F5F7F5',
      surface: '#FFFFFF',
      surfaceSubtle: '#ECF2ED',
      surfaceMuted: '#DEE7DF',
      textPrimary: '#18241B',
      textSecondary: '#5C6D5F',
      textMuted: '#8E9E90',
      border: '#DFE7E0',
      borderLight: '#EAF0EB',
      accent: '#2B4031',
      accentSubtle: '#E2EBE3',
      incomeBg: '#EAF5EC',
      incomeText: '#1F6B34',
      expenseBg: '#FDF2F2',
      expenseText: '#A82828',
    },
    cardRadius: 22,
  },

  'tokyo-clay': {
    id: 'tokyo-clay',
    name: 'Tokyo Clay',
    tagline: 'Grès japonais, thé torréfié & terre cuite délicate',
    isDark: false,
    type: 'light',
    colors: {
      background: '#F9F6F0',
      surface: '#FFFFFF',
      surfaceSubtle: '#F2ECE2',
      surfaceMuted: '#E7DFD2',
      textPrimary: '#26201A',
      textSecondary: '#7A6E63',
      textMuted: '#A4998E',
      border: '#E5DCD1',
      borderLight: '#EFE9E0',
      accent: '#3D3126',
      accentSubtle: '#ECE4D7',
      incomeBg: '#F0F6EE',
      incomeText: '#2D6B3B',
      expenseBg: '#FAF0EB',
      expenseText: '#B04620',
    },
    cardRadius: 20,
  },

  'electric-modern': {
    id: 'electric-modern',
    name: 'Electric Studio',
    tagline: 'Design suisse contemporain, blanc pur & bleu Klein',
    isDark: false,
    type: 'light',
    colors: {
      background: '#FFFFFF',
      surface: '#FBFBFC',
      surfaceSubtle: '#F1F3F9',
      surfaceMuted: '#E2E5F0',
      textPrimary: '#0A0C14',
      textSecondary: '#585E75',
      textMuted: '#949AB1',
      border: '#E2E4EE',
      borderLight: '#EDEFF7',
      accent: '#0553F8',
      accentSubtle: '#EDF3FF',
      incomeBg: '#EDFBF2',
      incomeText: '#087F3B',
      expenseBg: '#FFF0F2',
      expenseText: '#D91B3E',
    },
    cardRadius: 18,
  },

  'editorial-silk': {
    id: 'editorial-silk',
    name: 'Editorial Silk',
    tagline: 'Magazine d’art, ivoire satiné & bordeaux encre',
    isDark: false,
    type: 'light',
    colors: {
      background: '#FDFBF7',
      surface: '#FFFFFF',
      surfaceSubtle: '#F6F1EA',
      surfaceMuted: '#EAE1D6',
      textPrimary: '#1E1719',
      textSecondary: '#78686B',
      textMuted: '#A39497',
      border: '#ECE3D9',
      borderLight: '#F3ECE4',
      accent: '#381E26',
      accentSubtle: '#F3E9EC',
      incomeBg: '#F1F7EE',
      incomeText: '#266935',
      expenseBg: '#FAEEF1',
      expenseText: '#99223D',
    },
    cardRadius: 24,
  },

  // --- THÈMES SOMBRES RAFFINÉS ---
  'obsidian-gold': {
    id: 'obsidian-gold',
    name: 'Obsidian & Gold',
    tagline: 'Noir volcanique profond, reflets d’or champagne & bronze',
    isDark: true,
    type: 'dark',
    colors: {
      background: '#0B0B0E',
      surface: '#15151B',
      surfaceSubtle: '#1F1F27',
      surfaceMuted: '#2A2A36',
      textPrimary: '#F8F6EE',
      textSecondary: '#B5AE9E',
      textMuted: '#787368',
      border: '#2E281C',
      borderLight: '#201C14',
      accent: '#E5B869', // Or champagne chaud impérial
      accentSubtle: '#2A2315',
      incomeBg: '#102A1A',
      incomeText: '#4ADE80',
      expenseBg: '#331318',
      expenseText: '#FB7185',
    },
    cardRadius: 20,
  },

  'midnight-titanium': {
    id: 'midnight-titanium',
    name: 'Midnight OLED',
    tagline: 'Noir absolu OLED, titane brossé & pureté minimaliste',
    isDark: true,
    type: 'dark',
    colors: {
      background: '#000000',
      surface: '#0D0D10',
      surfaceSubtle: '#18181D',
      surfaceMuted: '#24242B',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      border: '#24242B',
      borderLight: '#18181D',
      accent: '#F4F4F5',
      accentSubtle: '#27272A',
      incomeBg: '#052E16',
      incomeText: '#22C55E',
      expenseBg: '#3B0C15',
      expenseText: '#F43F5E',
    },
    cardRadius: 18,
  },

  'emerald-noir': {
    id: 'emerald-noir',
    name: 'Emerald Noir',
    tagline: 'Ardoise sombre, mousse de nuit & menthe émeraude',
    isDark: true,
    type: 'dark',
    colors: {
      background: '#080E0B',
      surface: '#101B15',
      surfaceSubtle: '#16261E',
      surfaceMuted: '#20362B',
      textPrimary: '#EEF8F2',
      textSecondary: '#94B4A1',
      textMuted: '#63846F',
      border: '#1A3325',
      borderLight: '#14271C',
      accent: '#10B981', // Émeraude lumineuse
      accentSubtle: '#133525',
      incomeBg: '#0B2C1C',
      incomeText: '#34D399',
      expenseBg: '#361219',
      expenseText: '#F87171',
    },
    cardRadius: 22,
  },

  'nordic-night': {
    id: 'nordic-night',
    name: 'Nordic Night',
    tagline: 'Fjord nocturne, cobalt sombre & bleu glacier',
    isDark: true,
    type: 'dark',
    colors: {
      background: '#0B1118',
      surface: '#121C26',
      surfaceSubtle: '#1A2735',
      surfaceMuted: '#24374A',
      textPrimary: '#F0F6FC',
      textSecondary: '#90A4B8',
      textMuted: '#5C748B',
      border: '#1E3244',
      borderLight: '#162432',
      accent: '#38BDF8', // Bleu glacier polaire
      accentSubtle: '#143144',
      incomeBg: '#0A291E',
      incomeText: '#2DD4BF',
      expenseBg: '#34151C',
      expenseText: '#FB7185',
    },
    cardRadius: 20,
  },

  'amethyst-velvet': {
    id: 'amethyst-velvet',
    name: 'Amethyst Velvet',
    tagline: 'Noir ébène velouté, améthyste impériale & reflets lilas',
    isDark: true,
    type: 'dark',
    colors: {
      background: '#0D0B14',
      surface: '#171422',
      surfaceSubtle: '#221E32',
      surfaceMuted: '#302A46',
      textPrimary: '#F7F5FC',
      textSecondary: '#ADA5C3',
      textMuted: '#736B88',
      border: '#2E2742',
      borderLight: '#211B32',
      accent: '#A855F7', // Violet améthyste impérial vibrant
      accentSubtle: '#2B1A40',
      incomeBg: '#0C271B',
      incomeText: '#34D399',
      expenseBg: '#381328',
      expenseText: '#F472B6',
    },
    cardRadius: 22,
  },
};
