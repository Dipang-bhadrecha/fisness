export const theme = {

  colors: {
    // ─── BACKGROUNDS ───────────────────────
    background:     '#1c1408',   // dark brown — main bg
    surface:        '#2a1f0e',   // slightly lighter — cards
    elevated:       '#3a2d1a',   // elevated cards

    // ─── TEXT ──────────────────────────────
    textPrimary:    '#faf6ee',   // cream — main text
    textSecondary:  '#c4b49a',   // muted cream — labels
    textDisabled:   '#6b5a3e',   // very muted

    // ─── BRAND ─────────────────────────────
    primary:        '#0d7a5f',   // dark green — buttons
    primaryLight:   '#0f9b78',   // lighter green — hover
    primaryMuted:   '#0d7a5f26', // transparent green

    // ─── STATUS ────────────────────────────
    pause:          '#e8b800',   // yellow — pause state
    pauseBg:        '#fffaed',   // pale yellow — pause banner bg
    pauseText:      '#7a5a00',   // dark yellow — pause text
    success:        '#22c55e',   // green — success
    danger:         '#ef4444',   // red — error/delete
    warning:        '#f59e0b',   // amber — warning

    // ─── BORDERS ───────────────────────────
    border:         '#3a2d1a',   // subtle border
    divider:        '#2a1f0e',   // list dividers
  },

  fontSize: {
    xs:   10,
    sm:   12,
    md:   14,
    lg:   16,
    xl:   20,
    xxl:  28,
    huge: 48,
  },

  spacing: {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
  },

  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   24,
    full: 999,
  },

  // Minimum touch target — 64px for wet hands at port
  touchTarget: 64,
}