import { SchoolConfig } from "@/config/schools";

type DbTheme = Record<string, string | undefined> | null | undefined;

/** Build CSS custom properties: DB theme (non-empty) > static school config > defaults */
export function buildThemeCssVars(
  school: SchoolConfig | null | undefined,
  dbTheme: DbTheme
): Record<string, string> {
  const db = (key: string) => {
    const value = dbTheme?.[key];
    return typeof value === "string" && value.trim() ? value : "";
  };

  if (!db("primaryColor") && !school?.theme.primary) {
    return {};
  }

  return {
    "--school-primary": db("primaryColor") || school?.theme.primary || "#499f42",
    "--school-primary-dark": db("primaryDarkColor") || school?.theme.primaryDark || "#3d8a37",
    "--accent-yellow": db("accentColor") || school?.theme.accentYellow || "#d4e96e",
    "--accent-blue": db("accentBlueColor") || school?.theme.accentBlue || "#9ab5db",
    "--bg-light": db("bgLightColor") || school?.theme.bgLight || "#f6faf5",
    "--text-dark": db("textDarkColor") || school?.theme.textDark || "#22235b",
    "--text-muted-color": db("textMutedColor") || school?.theme.textMuted || "#6B7280",
    "--brand-secondary": db("secondaryColor") || school?.theme.textDark || "#22235b",
    "--brand-lime": db("accentLimeColor") || school?.theme.accentYellow || "#d4e96e",
  };
}
