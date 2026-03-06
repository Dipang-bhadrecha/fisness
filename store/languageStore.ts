import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { Language } from '../constants/i18n'

const LANGUAGE_KEY = 'fishness_language'

type LanguageStore = {
  language: Language
  isLoaded: boolean
  setLanguage: (lang: Language) => Promise<void>
  loadLanguage: () => Promise<void>
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'en',   // default until loaded from storage
  isLoaded: false,

  setLanguage: async (lang: Language) => {
    set({ language: lang })
    await AsyncStorage.setItem(LANGUAGE_KEY, lang)
  },

  loadLanguage: async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY)
      if (saved === 'en' || saved === 'gu') {
        set({ language: saved, isLoaded: true })
      } else {
        set({ isLoaded: true }) // use default 'en'
      }
    } catch {
      set({ isLoaded: true }) // use default on error
    }
  },
}))