import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "ru";

const dict = {
  brand: { en: "LUISA SPAGNOLI", ru: "LUISA SPAGNOLI" },
  title: {
    en: "Training Material Fall Winter 2026/2027",
    ru: "Учебные материалы Осень-Зима 2026/2027",
  },
  selectModel: { en: "Select a model", ru: "Выберите модель" },
  search: { en: "SEARCH", ru: "ПОИСК" },
  searchPlaceholder: { en: "Search model…", ru: "Поиск модели…" },
  analysis: { en: "ANALYSIS", ru: "АНАЛИЗ" },
  description: { en: "1. DESCRIPTION", ru: "1. ОПИСАНИЕ" },
  colors: { en: "2. COLOR VARIANTS", ru: "2. ВАРИАНТЫ ЦВЕТА" },
  styling: { en: "3. STYLING & COMBINATIONS", ru: "3. СТАЙЛИНГ И СОЧЕТАНИЯ" },
  sales: { en: "4. SALES ADVICE", ru: "4. СОВЕТЫ ПО ПРОДАЖАМ" },
  objections: { en: "5. OBJECTION HANDLING", ru: "5. УПРАВЛЕНИЕ ВОЗРАЖЕНИЯМИ" },
  noImage: { en: "Image not available", ru: "Изображение недоступно" },
  matchingPieces: { en: "Matching pieces", ru: "Сочетаемые вещи" },
  emptyState: {
    en: "Choose a model above to open its training sheet.",
    ru: "Выберите модель выше, чтобы открыть учебную карточку.",
  },
  noStyling: { en: "No styling notes for this model.", ru: "Для этой модели нет заметок по стайлингу." },
  models: { en: "models", ru: "моделей" },
  look: { en: "Look", ru: "Образ" },
  customerSays: { en: "Customer says", ru: "Клиент говорит" },
  yourAnswer: { en: "Your answer", ru: "Ваш ответ" },
  categories: {
    knitwear: { en: "Knitwear", ru: "Трикотаж" },
    outerwear: { en: "Outerwear", ru: "Верхняя одежда" },
    dresses: { en: "Dresses", ru: "Платья" },
    trousers: { en: "Trousers", ru: "Брюки" },
    skirts: { en: "Skirts", ru: "Юбки" },
    shirts: { en: "Shirts & Tops", ru: "Рубашки и топы" },
    accessories: { en: "Accessories", ru: "Аксессуары" },
    other: { en: "Collection", ru: "Коллекция" },
  },
} as const;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
  tc: (key: keyof (typeof dict)["categories"]) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("ls-lang");
    if (stored === "ru" || stored === "en") setLangState(stored);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang: (l) => {
        setLangState(l);
        window.localStorage.setItem("ls-lang", l);
      },
      t: (key) => {
        const entry = dict[key];
        if (key === "categories") return "";
        return (entry as Record<Lang, string>)[lang];
      },
      tc: (key) => dict.categories[key][lang],
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
