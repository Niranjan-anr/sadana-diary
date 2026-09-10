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
    color: '#b45309',
    colorDark: '#7c2d12',
    bgImage: '/images/themes/default.jpg',
  },
  {
    id: 'krishna',
    name: 'Sri Krishna (Peacock Blue)',
    color: '#1d4ed8',
    colorDark: '#1e3a8a',
    bgImage: '/images/themes/krishna.jpg',
  },
  {
    id: 'radharani',
    name: 'Srimati Radharani',
    color: '#db2777',
    colorDark: '#9d174d',
    bgImage: '/images/themes/radharani.jpg',
  },
  {
    id: 'balaram',
    name: 'Lord Balarama',
    color: '#15803d',
    colorDark: '#14532d',
    bgImage: '/images/themes/balaram.jpg',
  },
  {
    id: 'gaura',
    name: 'Sri Chaitanya Mahaprabhu',
    color: '#ca8a04',
    colorDark: '#854d0e',
    bgImage: '/images/themes/gaura.jpg',
  },
  {
    id: 'nityananda',
    name: 'Lord Nityananda',
    color: '#0284c7',
    colorDark: '#075985',
    bgImage: '/images/themes/nityananda.jpg',
  },
  {
    id: 'prabhupada',
    name: 'Srila Prabhupada',
    color: '#9a3412',
    colorDark: '#7c2d12',
    bgImage: '/images/themes/prabhupada.jpg',
  },
  {
    id: 'panchatatva',
    name: 'Pancha-tattva',
    color: '#7c3aed',
    colorDark: '#5b21b6',
    bgImage: '/images/themes/panchatatva.jpg',
  },
];

export function getTheme(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}