export interface ThemeConfig {
  id: string;
  name: string;
  color: string;
  colorDark: string;
  bgImage: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Default Saffron',
    color: '#f97316',
    colorDark: '#c2410c',
    bgImage: 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'krishna',
    name: 'Sri Krishna (Peacock Blue)',
    color: '#1d4ed8',
    colorDark: '#1e3a8a',
    bgImage: 'https://images.unsplash.com/photo-1544376664-80b17f09d399?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'radharani',
    name: 'Srimati Radharani',
    color: '#db2777',
    colorDark: '#9d174d',
    bgImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'balaram',
    name: 'Lord Balarama',
    color: '#15803d',
    colorDark: '#14532d',
    bgImage: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'gaura',
    name: 'Sri Chaitanya Mahaprabhu',
    color: '#ca8a04',
    colorDark: '#854d0e',
    bgImage: 'https://images.unsplash.com/photo-1495197359483-d092478c170a?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'nityananda',
    name: 'Lord Nityananda',
    color: '#0284c7',
    colorDark: '#075985',
    bgImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'prabhupada',
    name: 'Srila Prabhupada',
    color: '#9a3412',
    colorDark: '#7c2d12',
    bgImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'panchatatva',
    name: 'Pancha-tattva',
    color: '#7c3aed',
    colorDark: '#5b21b6',
    bgImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=1600&q=80',
  },
];

export function getTheme(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}