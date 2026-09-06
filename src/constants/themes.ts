export type ThemeId = 'pure-paper' | 'nordic-sage' | 'tokyo-clay' | 'electric-modern' | 'editorial-silk';

export interface AppTheme {
  id: ThemeId;
  name: string;
  tagline: string;
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
  'pure-paper': {
    id: 'pure-paper',
    name: 'Pure Paper',
    tagline: 'Monochrome d’architecte sur papier blanc chaud',
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
};
