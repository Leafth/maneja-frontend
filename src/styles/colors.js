module.exports = {
  transparent: 'transparent',
  current: 'currentColor',
  white: '#fff',

  lime: {
    400: '#e8fb86',
    500: '#bef264',
    600: '#a2e635',
    700: '#64a30d',
    800: '#1a2e05',
    900: '#022c22',
  },

  forestGreen: {
    50: '#F2F7F4', // Superfícies muito claras, badges sutis
    100: '#E1EFE7', // Fundo de tags ativas suaves
    200: '#C3DFD0', // Bordas delicadas / divisores
    300: '#94C4AB', // Elementos secundários
    400: '#529E77', // Destaques intermediários
    500: '#2D6A4F', // Verde primário vibrante equilibrado
    600: '#1B4332', // Tom primário corporativo (marca / botões / cabeçalhos)
    700: '#143628', // Estado hover / cabeçalhos escuros
    800: '#0E271D', // Verde escuro quase preto
    900: '#081711', // Detalhes profundos
  },

  gray: {
    100: '#fafafa',
    200: '#f4f4f5',
    300: '#f3f4f6',
    400: '#e4e4e7',
    500: '#d9d9d9',
    600: '#a1a1aa',
    700: '#71717a',
  },

  black: {
    600: '#1e293b',
    700: '#18181b',
    800: '#09090b',
    900: '#000000',
  },

  neutral: {
    surface: '#F8FAF8', // Fundo geral do app (off-white descansado)
    card: '#FFFFFF', // Cards e superfícies elevadas
    border: '#E5EAE6', // Bordas de cards e separadores
    borderSub: '#F0F3F1',
    textMuted: '#6B7A72', // Subtítulos ("Cadastre e visualize...", "Sem grupo...")
    textBody: '#2C3531', // Textos principais de leitura
    textHead: '#111A15', // Títulos principais ("TERRENOS", "Curral Sul")
  },

  support: {
    // Cores de apoio anteriores
    ambar: '#ffff00',
    green: '#10b981',
    orange: '#f4a462',
    red: '#ef4444',
    teal: '#2a9d90',
    tomato: '#e76e50',
    yellow: '#e8c468',

    // "Disponível" - Verde equilibrado, sem efeito neon
    success: {
      bg: '#E8F5E9',
      border: '#C8E6C9',
      text: '#1E6838',
      solid: '#2E7D32',
    },
    // "Ocupado" - Vermelho terracota/vinho suave, menos artificial
    danger: {
      bg: '#FEECEC',
      border: '#FCD5D5',
      text: '#9E1C1C',
      solid: '#C53030',
    },
    // "Em Descanso" - Âmbar terroso/mostarda suave
    warning: {
      bg: '#FEF6E7',
      border: '#FDE4B8',
      text: '#8A5D00',
      solid: '#D97706',
    },
  },
};
