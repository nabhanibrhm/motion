// Brand tokens shared by every composition. Change values here, not in scenes.
export const colors = {
  bg: "#0b0d17",
  surface: "#161a2e",
  text: "#f5f6fa",
  muted: "#8b90a8",
  accent: "#6c5ce7",
  accent2: "#00cec9",
};

export const fonts = {
  heading: "'Inter', 'Segoe UI', system-ui, sans-serif",
  body: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

export const FPS = 30;

// F1 Explosion palette. "old" = sepia era, "new" = neon era.
export const f1 = {
  carbon: "#0a0a0c",
  panel: "#15151a",
  line: "#2a2a33",
  text: "#ffffff",
  muted: "#9a9aa6",
  red: "#e10600",
  oldSepia: "#c8a97e",
  oldDark: "#3b2f22",
  cyan: "#00e5ff",
  magenta: "#ff2d78",
  font: "'Titillium Web', 'Segoe UI', system-ui, sans-serif",
};

/*
 * F1 video v2 token groups. Which one to use for what:
 *
 *   editorial  text, panels, backgrounds, chapter cards, HUD, stat numbers. The foundation of every layout.
 *   mascot     MOG / WEC / BOG artwork only (green + cream). Never use it for layout or text.
 *   objects    things in the illustrated world: car liveries, skin, hair, clothes, props, 2010 sepia flashbacks.
 *   brand      official logo / service colours (F1, Netflix, YouTube, Instagram, TikTok, Apple ...).
 *   chart      a few restrained, distinct categories for chart series, plus highlight / muted / grid.
 *
 * `toon` below is the legacy flat-kit palette. Every old name still exists so scenes keep compiling,
 * but the values now come from the groups above (no more global green remap).
 */

// Editorial palette (colorhunt 000000-cb2957-dddddd-eeeeee). Text, panels and backgrounds only;
// photos, logos, liveries and mascots keep their own colours.
export const editorial = {
  ink: "#000000", // primary text, outlines, dark scenes
  accent: "#CB2957", // selective emphasis: key stat, chapter rule. 4.5:1 on #EEEEEE, 5.3:1 on white, only 4.0:1 on black
  panel: "#DDDDDD", // secondary panels, dividers, chart scaffolding
  bg: "#EEEEEE", // primary light background
  white: "#FFFFFF",
  // Contrast-checked variants (WCAG AA for body-size text):
  accentOnDark: "#E8517A", // accent as SMALL text on ink: 5.9:1 (plain accent is 4.0:1, large text only)
  accentOnLight: "#A81F47", // accent as SMALL text on bg / panel: 6.1:1 on #EEEEEE
  muted: "#5A5A5A", // secondary text on bg: 5.9:1
  mutedOnDark: "#B5B5B5", // secondary text on ink: 10:1
  rule: "#C4C4C4", // hairlines on bg
} as const;

// Mascot artwork colours: MOG / WEC / BOG keep their established green and cream look.
export const mascot = {
  ink: "#0D530E", // outlines
  deep: "#073D09", // pupils
  cream: "#FBF5DD", // WEC body, eye whites, teeth
  sage: "#E7E1B1", // MOG belly, WEC spots
  sageDeep: "#CFC98F", // BOG body
  green: "#306D29", // BOG legs and tuft
  mog: "#558444", // MOG body, WEC ears
  cheek: "#F4BC90",
  mouth: "#E86FA0",
  tongue: "#D9976B",
} as const;

// Objects of the illustrated world. Natural, varied colour: do not remap these to the editorial palette.
export const objects = {
  liveries: {
    red: "#E5483F",
    amber: "#F4A93B",
    mint: "#4FC3A1",
    sky: "#4DA3E8",
    pink: "#F08BB4",
    lilac: "#8E7BE0",
  },
  skins: ["#FFDDBF", "#F4BC90", "#D9976B", "#A96B40", "#6E4326"], // light -> deep
  hairs: {
    black: "#2A2622",
    brown: "#5A3A2A",
    auburn: "#A04A28",
    blonde: "#EBB95A",
    grey: "#B8B5AC",
    white: "#EFEBE0",
    pink: "#E86FA0",
    blue: "#4B7BE5",
  },
  suit: "#262A33",
  shoe: "#F5F5F5",
  asphalt: "#4A4D55",
  paper: "#FAF6EA", // props: tickets, maps, boards
  wood: "#B9824F",
  velvet: "#7E1530", // velvet rope / door
  brass: "#D4A431",
  // Faded sepia palette for 2010-era flashbacks.
  old: {
    ground: "#DCCDAF",
    groundDeep: "#4A3B2A",
    tan: "#C8B48E",
    cream: "#3A2E20",
    red: "#9A4A3A",
    amber: "#B8893F",
  },
} as const;

// Official brand colours (logos keep their own art; use these for tags / pills tied to a service).
export const brand = {
  f1: "#E10600",
  netflix: "#E50914",
  youtube: "#FF0000",
  instagram: "#E1306C",
  tiktok: "#25F4EE",
  tiktokPink: "#FE2C55",
  apple: "#000000",
  ferrari: "#DC0000",
  mercedes: "#00A19B",
  redBull: "#1E41FF",
} as const;

// Semantic chart colours: few, distinct, colour-blind-safe-ish. `highlight` is the one number you want read first.
export const chart = {
  highlight: editorial.accent,
  series: ["#2F6DB5", "#E0A21B", "#2A9D8F", "#7A5AC8", "#6B6B6B"], // blue, amber, teal, violet, grey
  muted: "#BDBDBD", // non-highlighted bars
  grid: editorial.panel,
  label: editorial.muted,
} as const;

// "Toon" palette: the legacy flat-kit names. LEGACY NAMES KEEP WORKING; values come from the groups above.
//   ground / groundAlt / paper / sage        -> editorial light surfaces
//   ink / cream / groundDeep / forest        -> editorial dark (text, outlines, shadows)
//   green                                    -> the editorial ACCENT (name is historical)
//   red amber mint sky pink lilac            -> natural object colours (liveries, props, highlights)
// For a LIGHT colour on a dark surface use `toon.paper`, never `toon.cream` (which is the TEXT colour).
export const toon = {
  // --- surfaces and text (editorial) ---
  paper: editorial.white, // light text on dark, borders, eye-white-like fills
  sage: editorial.panel, // panels, cards, muted shapes
  sageDeep: editorial.rule, // rules and borders on panels
  green: editorial.accent, // primary accent: highlights, numbers, lines, bars
  ink: editorial.ink, // text, outlines
  forest: "#0A0A0A", // deep shadows only
  accentText: editorial.accentOnLight, // small accent text on light surfaces
  accentOnDark: editorial.accentOnDark, // small accent text on ink
  // --- legacy names ---
  ground: editorial.bg, // main solid ground
  groundAlt: editorial.panel, // cards, panels
  groundDeep: "#1A1A1A", // dark fills, shade() target
  red: objects.liveries.red,
  redText: "#B3261E", // red tuned for text on light (5.6:1 on #EEEEEE)
  amber: objects.liveries.amber,
  mint: objects.liveries.mint,
  sky: objects.liveries.sky,
  pink: objects.liveries.pink,
  lilac: objects.liveries.lilac,
  cream: editorial.ink, // TEXT colour on the light ground
  muted: editorial.muted, // sub lines, labels
  skins: objects.skins,
  hairs: objects.hairs,
  shoe: objects.shoe,
  suit: objects.suit,
  old: objects.old,
  font: {
    display: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
    body: "'Nunito Sans', 'Segoe UI', system-ui, sans-serif",
  },
};
