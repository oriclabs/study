export type ThemeName = 'whiteboard' | 'chalkboard' | 'marker' | 'blackboard' | 'notebook';

export interface Theme {
  name: ThemeName;
  background: string;
  defaultPen: string;
  explainPen: string;
  answerPen: string;
  gridLine: string;
  font: string;
  titleFont: string;
  explainFont: string;
  answerFont: string;
  colorRemap: Record<string, string>;
}

const THEMES: Record<ThemeName, Theme> = {
  whiteboard: {
    name: 'whiteboard',
    background: '#fbfbf7',
    defaultPen: '#1a1a2e',
    explainPen: '#0f3460',
    answerPen: '#d32f2f',
    gridLine: '#e3e3dc',
    font: '28px "Caveat", "Comic Sans MS", cursive',
    titleFont: 'bold 36px "Caveat", cursive',
    explainFont: 'italic 24px "Caveat", cursive',
    answerFont: 'bold 34px "Caveat", cursive',
    colorRemap: {},
  },
  chalkboard: {
    name: 'chalkboard',
    background: '#0f2a1d',
    defaultPen: '#f5f5f0',
    explainPen: '#ffe57f',
    answerPen: '#ff8a65',
    gridLine: '#1d4030',
    font: '28px "Caveat", "Comic Sans MS", cursive',
    titleFont: 'bold 36px "Caveat", cursive',
    explainFont: 'italic 24px "Caveat", cursive',
    answerFont: 'bold 34px "Caveat", cursive',
    colorRemap: {
      '#1a1a2e': '#f5f5f0',
      '#0f3460': '#ffe57f',
      '#d32f2f': '#ff8a65',
      '#888': '#88a090',
    },
  },
  marker: {
    name: 'marker',
    background: '#ffffff',
    defaultPen: '#222',
    explainPen: '#1565c0',
    answerPen: '#e91e63',
    gridLine: '#ececec',
    font: '26px "Marker Felt", "Comic Sans MS", cursive',
    titleFont: 'bold 34px "Marker Felt", cursive',
    explainFont: 'italic 22px "Marker Felt", cursive',
    answerFont: 'bold 32px "Marker Felt", cursive',
    colorRemap: {},
  },
  blackboard: {
    name: 'blackboard',
    background: '#1a1a2e',
    defaultPen: '#e0e0e0',
    explainPen: '#64b5f6',
    answerPen: '#ef5350',
    gridLine: '#2a2a40',
    font: '28px "Caveat", "Comic Sans MS", cursive',
    titleFont: 'bold 36px "Caveat", cursive',
    explainFont: 'italic 24px "Caveat", cursive',
    answerFont: 'bold 34px "Caveat", cursive',
    colorRemap: {
      '#1a1a2e': '#e0e0e0',
      '#0f3460': '#64b5f6',
      '#d32f2f': '#ef5350',
      '#888': '#666680',
    },
  },
  notebook: {
    name: 'notebook',
    background: '#fffdf5',
    defaultPen: '#333',
    explainPen: '#1565c0',
    answerPen: '#c62828',
    gridLine: '#e8e0d0',
    font: '26px "Caveat", Georgia, serif',
    titleFont: 'bold 32px "Caveat", Georgia, serif',
    explainFont: 'italic 22px "Caveat", Georgia, serif',
    answerFont: 'bold 30px "Caveat", Georgia, serif',
    colorRemap: {},
  },
};

export function getTheme(name: ThemeName): Theme {
  return THEMES[name] ?? THEMES.whiteboard;
}

export function remapColor(theme: Theme, color: string | undefined): string {
  if (!color) return theme.defaultPen;
  return theme.colorRemap[color] ?? color;
}
