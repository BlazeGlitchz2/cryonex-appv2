import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Simple translation resources for now. 
// In a real app, these would be in public/locales/{lang}/translation.json
const resources = {
    en: {
        translation: {
            "welcome": "Welcome to Cryonex",
            "study_mode": "Study Mode",
            "ai_tutor": "AI Tutor",
            "settings": "Settings",
            "school_mode": "School Mode",
            "assistant": "Assistant",
            "library": "Library",
            "projects": "Projects",
            "studio": "Studio",
            "study": "Study"
        }
    },
    ar: {
        translation: {
            "welcome": "مرحباً بك في Cryonex",
            "study_mode": "وضع الدراسة",
            "ai_tutor": "المعلم الذكي",
            "settings": "الإعدادات",
            "school_mode": "وضع المدرسة",
            "assistant": "المساعد",
            "library": "المكتبة",
            "projects": "المشاريع",
            "studio": "الاستوديو",
            "study": "الدراسة"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
