// Centralized theme configuration
export type ThemeType = 'light' | 'dark' | 'hand-drawn' | 'brand-orange' | 'brand-purple' | 'brand-mint' | 'brand-slate';

export interface ThemeDefinition {
  id: ThemeType;
  name: string;
  description: string;
  preview?: string; // URL or base64 of preview image
  isBuiltIn: boolean; // Whether this theme is available by default or needs to be purchased
  isDark: boolean; // Whether this theme is dark or light
  variables: Record<string, string>; // CSS variable overrides
}

// Built-in themes (available to all users)
export const builtInThemes: ThemeDefinition[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean light theme with soft colors',
    isBuiltIn: true,
    isDark: false,
    variables: {
      '--background': 'oklch(1 0 0)',
      '--foreground': 'oklch(0.141 0.005 285.823)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.141 0.005 285.823)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.141 0.005 285.823)',
      '--primary': 'oklch(0.488 0.243 264.376)',
      '--primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--secondary': 'oklch(0.967 0.001 286.375)',
      '--secondary-foreground': 'oklch(0.21 0.006 285.885)',
      '--muted': 'oklch(0.967 0.001 286.375)',
      '--muted-foreground': 'oklch(0.552 0.016 285.938)',
      '--accent': 'oklch(0.488 0.243 264.376)',
      '--accent-foreground': 'oklch(0.97 0.014 254.604)',
      '--destructive': 'oklch(0.577 0.245 27.325)',
      '--border': 'oklch(0.92 0.004 286.32)',
      '--input': 'oklch(0.92 0.004 286.32)',
      '--ring': 'oklch(0.705 0.015 286.067)',
      '--chart-1': 'oklch(0.488 0.243 264.376)',
      '--chart-2': 'oklch(0.646 0.222 41.116)',
      '--chart-3': 'oklch(0.603 0.118 184.704)',
      '--chart-4': 'oklch(0.828 0.189 84.429)',
      '--chart-5': 'oklch(0.769 0.188 70.08)',
      '--sidebar': 'oklch(0.985 0 0)',
      '--sidebar-foreground': 'oklch(0.141 0.005 285.823)',
      '--sidebar-primary': 'oklch(0.546 0.245 262.881)',
      '--sidebar-primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--sidebar-accent': 'oklch(0.488 0.243 264.376)',
      '--sidebar-accent-foreground': 'oklch(0.97 0.014 254.604)',
      '--sidebar-border': 'oklch(0.92 0.004 286.32)',
      '--sidebar-ring': 'oklch(0.705 0.015 286.067)'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme for low-light environments',
    isBuiltIn: true,
    isDark: true,
    variables: {
      '--background': 'oklch(0.141 0.005 285.823)',
      '--foreground': 'oklch(0.985 0 0)',
      '--card': 'oklch(0.21 0.006 285.885)',
      '--card-foreground': 'oklch(0.985 0 0)',
      '--popover': 'oklch(0.21 0.006 285.885)',
      '--popover-foreground': 'oklch(0.985 0 0)',
      '--primary': 'oklch(0.42 0.18 266)',
      '--primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--secondary': 'oklch(0.274 0.006 286.033)',
      '--secondary-foreground': 'oklch(0.985 0 0)',
      '--muted': 'oklch(0.274 0.006 286.033)',
      '--muted-foreground': 'oklch(0.705 0.015 286.067)',
      '--accent': 'oklch(0.42 0.18 266)',
      '--accent-foreground': 'oklch(0.97 0.014 254.604)',
      '--destructive': 'oklch(0.704 0.191 22.216)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.552 0.016 285.938)',
      '--chart-1': 'oklch(0.42 0.18 266)',
      '--chart-2': 'oklch(0.536 0.186 38.337)',
      '--chart-3': 'oklch(0.482 0.15 178.653)',
      '--chart-4': 'oklch(0.74 0.16 85)',
      '--chart-5': 'oklch(0.68 0.12 65)',
      '--sidebar': 'oklch(0.21 0.006 285.885)',
      '--sidebar-foreground': 'oklch(0.985 0 0)',
      '--sidebar-primary': 'oklch(0.623 0.214 259.815)',
      '--sidebar-primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--sidebar-accent': 'oklch(0.42 0.18 266)',
      '--sidebar-accent-foreground': 'oklch(0.97 0.014 254.604)',
      '--sidebar-border': 'oklch(1 0 0 / 10%)',
      '--sidebar-ring': 'oklch(0.552 0.016 285.938)'
    }
  }
];

// Purchaseable themes (need to be bought from market)
export const purchasableThemes: ThemeDefinition[] = [
  {
    id: 'hand-drawn',
    name: 'Hand-Drawn',
    description: 'Creative hand-drawn aesthetic with paper texture',
    isBuiltIn: false,
    isDark: false,
    variables: {
      '--background': '#fdfbf7', // hand-paper
      '--foreground': '#2d2d2d', // hand-pencil
      '--card': '#fdfbf7',
      '--card-foreground': '#2d2d2d',
      '--popover': '#fdfbf7',
      '--popover-foreground': '#2d2d2d',
      '--primary': '#55E6C1', // mint from brand
      '--primary-foreground': '#2d2d2d',
      '--secondary': '#e5e0d8', // hand-muted
      '--secondary-foreground': '#2d2d2d',
      '--muted': '#f5f5f0',
      '--muted-foreground': '#636E72',
      '--accent': '#ff4d4d', // hand-red
      '--accent-foreground': '#ffffff',
      '--destructive': '#ff4d4d',
      '--border': '#e5e0d8',
      '--input': '#ffffff',
      '--ring': '#2d2d2d',
      '--chart-1': '#ff4d4d', // red
      '--chart-2': '#2d5da1', // blue
      '--chart-3': '#55E6C1', // mint
      '--chart-4': '#f9ca24', // yellow
      '--chart-5': '#f39c12',  // orange
      '--sidebar': '#fdfbf7',
      '--sidebar-foreground': '#2d2d2d',
      '--sidebar-primary': '#55E6C1',
      '--sidebar-primary-foreground': '#2d2d2d',
      '--sidebar-accent': '#ff4d4d',
      '--sidebar-accent-foreground': '#ffffff',
      '--sidebar-border': '#e5e0d8',
      '--sidebar-ring': '#2d2d2d'
    }
  },
  {
    id: 'brand-orange',
    name: 'Vibrant Orange',
    description: 'Energetic theme based on brand orange color',
    isBuiltIn: false,
    isDark: false,
    variables: {
      '--background': '#FFF5F5', // light orange tint
      '--foreground': '#2F3640',
      '--card': '#FFFFFF',
      '--card-foreground': '#2F3640',
      '--popover': '#FFF5F5',
      '--popover-foreground': '#2F3640',
      '--primary': '#FF7675', // brand orange
      '--primary-foreground': '#FFFFFF',
      '--secondary': '#FED7D7', // lighter orange
      '--secondary-foreground': '#2F3640',
      '--muted': '#FADBD8',
      '--muted-foreground': '#636E72',
      '--accent': '#F39C12',
      '--accent-foreground': '#FFFFFF',
      '--destructive': '#E74C3C',
      '--border': '#E8DAEF',
      '--input': '#FFFFFF',
      '--ring': '#FF7675',
      '--chart-1': '#FF7675', // primary orange
      '--chart-2': '#E74C3C', // darker red/orange
      '--chart-3': '#F39C12', // orange
      '--chart-4': '#FAB1A0', // light orange
      '--chart-5': '#FF9F43',  // soft orange
      '--sidebar': '#FFFFFF',
      '--sidebar-foreground': '#2F3640',
      '--sidebar-primary': '#FF7675',
      '--sidebar-primary-foreground': '#FFFFFF',
      '--sidebar-accent': '#F39C12',
      '--sidebar-accent-foreground': '#FFFFFF',
      '--sidebar-border': '#E8DAEF',
      '--sidebar-ring': '#FF7675'
    }
  },
  {
    id: 'brand-purple',
    name: 'Royal Purple',
    description: 'Sophisticated theme based on brand purple color',
    isBuiltIn: false,
    isDark: false,
    variables: {
      '--background': '#F5F0FF', // light purple tint
      '--foreground': '#2F3640',
      '--card': '#FFFFFF',
      '--card-foreground': '#2F3640',
      '--popover': '#F5F0FF',
      '--popover-foreground': '#2F3640',
      '--primary': '#6C5CE7', // brand purple
      '--primary-foreground': '#FFFFFF',
      '--secondary': '#D6C4E9', // lighter purple
      '--secondary-foreground': '#2F3640',
      '--muted': '#E8DAEF',
      '--muted-foreground': '#636E72',
      '--accent': '#9B59B6',
      '--accent-foreground': '#FFFFFF',
      '--destructive': '#E74C3C',
      '--border': '#D6C4E9',
      '--input': '#FFFFFF',
      '--ring': '#6C5CE7',
      '--chart-1': '#6C5CE7', // primary purple
      '--chart-2': '#9B59B6', // secondary purple
      '--chart-3': '#A29BFE', // light purple
      '--chart-4': '#706FD3', // blue-ish purple
      '--chart-5': '#4834D4',  // dark purple
      '--sidebar': '#FFFFFF',
      '--sidebar-foreground': '#2F3640',
      '--sidebar-primary': '#6C5CE7',
      '--sidebar-primary-foreground': '#FFFFFF',
      '--sidebar-accent': '#9B59B6',
      '--sidebar-accent-foreground': '#FFFFFF',
      '--sidebar-border': '#D6C4E9',
      '--sidebar-ring': '#6C5CE7'
    }
  },
  {
    id: 'brand-mint',
    name: 'Fresh Mint',
    description: 'Refreshing theme based on brand mint color',
    isBuiltIn: false,
    isDark: false,
    variables: {
      '--background': '#F0FFF9', // light mint tint
      '--foreground': '#2F3640',
      '--card': '#FFFFFF',
      '--card-foreground': '#2F3640',
      '--popover': '#F0FFF9',
      '--popover-foreground': '#2F3640',
      '--primary': '#55E6C1', // brand mint
      '--primary-foreground': '#2F3640',
      '--secondary': '#D5F5E3', // lighter mint
      '--secondary-foreground': '#2F3640',
      '--muted': '#D5F5E3',
      '--muted-foreground': '#2F3640',
      '--accent': '#27AE60',
      '--accent-foreground': '#FFFFFF',
      '--destructive': '#E74C3C',
      '--border': '#A9DFBF',
      '--input': '#FFFFFF',
      '--ring': '#55E6C1',
      '--chart-1': '#55E6C1', // primary mint
      '--chart-2': '#27AE60', // dark mint/green
      '--chart-3': '#2ECC71', // bright green
      '--chart-4': '#55EFC4', // light mint
      '--chart-5': '#1ABC9C',  // teal
      '--sidebar': '#FFFFFF',
      '--sidebar-foreground': '#2F3640',
      '--sidebar-primary': '#55E6C1',
      '--sidebar-primary-foreground': '#2F3640',
      '--sidebar-accent': '#27AE60',
      '--sidebar-accent-foreground': '#FFFFFF',
      '--sidebar-border': '#A9DFBF',
      '--sidebar-ring': '#55E6C1'
    }
  },
  {
    id: 'brand-slate',
    name: 'Slate Professional',
    description: 'Professional theme based on brand slate color',
    isBuiltIn: false,
    isDark: true,
    variables: {
      '--background': '#F8F9FA', // very light slate
      '--foreground': '#2F3640',
      '--card': '#FFFFFF',
      '--card-foreground': '#2F3640',
      '--popover': '#F8F9FA',
      '--popover-foreground': '#2F3640',
      '--primary': '#2F3640', // brand slate
      '--primary-foreground': '#FFFFFF',
      '--secondary': '#EDEDED', // lighter slate
      '--secondary-foreground': '#2F3640',
      '--muted': '#BDC3C7',
      '--muted-foreground': '#2F3640',
      '--accent': '#95A5A6',
      '--accent-foreground': '#FFFFFF',
      '--destructive': '#E74C3C',
      '--border': '#BDC3C7',
      '--input': '#FFFFFF',
      '--ring': '#2F3640',
      '--chart-1': '#2F3640', // primary slate
      '--chart-2': '#535C68', // secondary slate
      '--chart-3': '#95A5A6', // grey
      '--chart-4': '#BDC3C7', // light grey
      '--chart-5': '#7F8C8D',  // medium grey
      '--sidebar': '#2F3640',
      '--sidebar-foreground': '#FFFFFF',
      '--sidebar-primary': '#535C68',
      '--sidebar-primary-foreground': '#FFFFFF',
      '--sidebar-accent': '#95A5A6',
      '--sidebar-accent-foreground': '#FFFFFF',
      '--sidebar-border': '#BDC3C7',
      '--sidebar-ring': '#2F3640'
    }
  }
];

// All themes combined
export const allThemes: ThemeDefinition[] = [...builtInThemes, ...purchasableThemes];

// Get theme by ID
export const getThemeById = (id: ThemeType): ThemeDefinition | undefined => {
  return allThemes.find(theme => theme.id === id);
};

// Check if theme is built-in (free)
export const isBuiltInTheme = (id: ThemeType): boolean => {
  return builtInThemes.some(theme => theme.id === id);
};