import { Strings, translations } from '../constants/i18n'
import { useLanguageStore } from '../store/languageStore'

// ─── Usage in any screen ──────────────────────────────
//
//   const { t, language, setLanguage } = useLanguage()
//
//   t.phone.cardTitle         → "Enter Your Number" or "નંબર દાખલ કરો"
//   t.otp.cardSubtitle(phone) → calls the function with arg
//   language                  → 'en' | 'gu'
//   setLanguage('gu')         → switches + persists
//
// ─────────────────────────────────────────────────────

export function useLanguage() {
  const { language, setLanguage, isLoaded } = useLanguageStore()
  const t: Strings = translations[language]

  return { t, language, setLanguage, isLoaded }
}