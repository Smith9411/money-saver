import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme, ThemeId, THEMES } from '../constants/themes';
import { getSetting, setSetting } from '../services/db';
import { triggerHaptic } from '../services/haptics';

interface ThemeContextType {
  theme: AppTheme;
  themeId: ThemeId;
  changeTheme: (id: ThemeId) => void;
  availableThemes: AppTheme[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES['pure-paper'],
  themeId: 'pure-paper',
  changeTheme: () => {},
  availableThemes: Object.values(THEMES),
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>('pure-paper');

  useEffect(() => {
    const loadTheme = async () => {
      const savedThemeId = (await getSetting('active_theme', 'pure-paper')) as ThemeId;
      if (THEMES[savedThemeId]) {
        setThemeIdState(savedThemeId);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = (newId: ThemeId) => {
    if (THEMES[newId]) {
      triggerHaptic('medium');
      setThemeIdState(newId);
      setSetting('active_theme', newId);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: THEMES[themeId] || THEMES['pure-paper'],
        themeId,
        changeTheme,
        availableThemes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
