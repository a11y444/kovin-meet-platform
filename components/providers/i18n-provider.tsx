"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { translations, Language, TranslationKey, getSystemLanguage } from "@/lib/i18n"

interface I18nContextType {
  lang: Language
  t: (key: TranslationKey) => string
  setLang: (lang: Language) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const systemLang = getSystemLanguage()
    const savedLang = localStorage.getItem("kovin-language") as Language | null
    setLang(savedLang || systemLang)
  }, [])

  const handleSetLang = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem("kovin-language", newLang)
  }

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <I18nContext.Provider value={{ lang, t, setLang: handleSetLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
