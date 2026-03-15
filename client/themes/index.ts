// Centralized theme configuration
export type ThemeType = 'light' | 'dark' | 'hand-drawn' | 'brand-orange' | 'brand-purple' | 'brand-mint' | 'brand-slate';

export interface ThemeDefinition {
  id: ThemeType;
  name: string;
  description: string;
  preview?: string; // URL or base64 of preview image
  isBuiltIn: boolean; // Whether this theme is available by default or needs to be purchased
  variables: Record<string, string>; // CSS variable overrides
}

// Built-in themes (available to all users)
export const builtInThemes: ThemeDefinition[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean light theme with soft colors',
    isBuiltIn: true,
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
      '--ring': 'oklch(0.705 0.015 286.067)'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme for low-light environments',
    isBuiltIn: true,
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
      '--ring': 'oklch(0.552 0.016 285.938)'
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
      '--ring': '#2d2d2d'
    }
  },
  {
    id: 'brand-orange',
    name: 'Vibrant Orange',
    description: 'Energetic theme based on brand orange color',
    isBuiltIn: false,
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
      '--ring': '#FF7675'
    }
  },
  {
    id: 'brand-purple',
    name: 'Royal Purple',
    description: 'Sophisticated theme based on brand purple color',
    isBuiltIn: false,
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
      '--ring': '#6C5CE7'
    }
  },
  {
    id: 'brand-mint',
    name: 'Fresh Mint',
    description: 'Refreshing theme based on brand mint color',
    isBuiltIn: false,
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
      '--ring': '#55E6C1'
    }
  },
  {
    id: 'brand-slate',
    name: 'Slate Professional',
    description: 'Professional theme based on brand slate color',
    isBuiltIn: false,
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
      '--ring': '#2F3640'
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