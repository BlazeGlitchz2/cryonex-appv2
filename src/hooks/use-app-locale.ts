import i18n, { isRtlLanguage, type SupportedLanguage } from "@/lib/i18n";
import { useTranslation } from "react-i18next";

export function useAppLocale() {
  const { t, i18n: instance } = useTranslation();
  const language = (instance.resolvedLanguage ||
    instance.language ||
    "en") as SupportedLanguage;
  const isRTL = isRtlLanguage(language);

  const setLanguage = async (nextLanguage: SupportedLanguage) => {
    if (nextLanguage === language) return;
    await i18n.changeLanguage(nextLanguage);
  };

  return {
    t,
    i18n: instance,
    language,
    isRTL,
    dir: isRTL ? "rtl" : "ltr",
    setLanguage,
  };
}
