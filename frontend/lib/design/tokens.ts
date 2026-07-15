export const designTokens = {
  colors: {
    void: '#050509',
    voidSoft: '#080812',
    panel: '#101018',
    panelSoft: '#171725',
    panelGlass: 'rgba(255,255,255,0.06)',
    line: 'rgba(255,255,255,0.10)',
    lineStrong: 'rgba(255,255,255,0.16)',
    text: '#ffffff',
    muted: '#9ca3af',
    mutedSoft: 'rgba(255,255,255,0.55)',
    violet: '#8b5cf6',
    purple: '#6d28d9',
    red: '#ef233c',
    redSoft: '#ff4d6d',
    gold: '#ffd166',
    cyan: '#22d3ee',
    green: '#22c55e',
  },
  shadows: {
    glowRed: '0 0 50px rgba(239,35,60,.30)',
    glowViolet: '0 0 50px rgba(139,92,246,.28)',
    glowGold: '0 0 45px rgba(255,209,102,.22)',
    card: '0 24px 80px rgba(0,0,0,.35)',
  },
  radius: {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '2.5rem',
  },
  gradients: {
    page:
      'radial-gradient(circle at 20% 0%, rgba(139,92,246,.20), transparent 30%), radial-gradient(circle at 80% 10%, rgba(239,35,60,.16), transparent 35%), #050509',
    hero:
      'linear-gradient(135deg, rgba(139,92,246,.35), rgba(239,35,60,.22), rgba(255,209,102,.08))',
    text:
      'linear-gradient(90deg, #fff, #ffd166, #ef233c, #a78bfa)',
    card:
      'linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.035))',
  },
  motion: {
    fast: '180ms',
    normal: '280ms',
    slow: '650ms',
    easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const;

export type DesignTokens = typeof designTokens;
