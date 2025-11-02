// Design system for SmartFlash - Minimal, Professional, AI-First
export const colors = {
  // Primary colors - subtle and professional
  primary: "#1a1a1a",
  primaryLight: "#404040",
  primaryDark: "#0a0a0a",
  
  // Accent - AI purple (subtle)
  ai: "#6366f1",
  aiLight: "#818cf8",
  aiDark: "#4f46e5",
  
  // Neutral grays
  background: "#fafafa",
  surface: "#ffffff",
  surfaceHover: "#f5f5f5",
  
  // Text
  text: "#1a1a1a",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",
  
  // Borders
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  
  // Status colors (muted)
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  
  // Subtle background colors
  successBg: "#f0fdf4",
  warningBg: "#fffbeb",
  errorBg: "#fef2f2",
  infoBg: "#eff6ff",
  aiBg: "#f5f3ff",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Modern shadows for depth
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Clean borders with subtle styling
export const borders = {
  subtle: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    backgroundColor: colors.surface,
  },
  cardElevated: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    backgroundColor: colors.surface,
  },
};

