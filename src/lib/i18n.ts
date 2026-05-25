import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export const LANGUAGE_STORAGE_KEY = "cryonex-language";
export const RTL_LANGUAGES = new Set(["ar"]);
export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isRtlLanguage(language?: string | null) {
  return RTL_LANGUAGES.has((language || "en").split("-")[0]);
}

export function applyLanguageToDocument(language: string) {
  if (typeof document === "undefined") return;

  const normalizedLanguage = (language || "en").split("-")[0];
  const dir = isRtlLanguage(normalizedLanguage) ? "rtl" : "ltr";
  const root = document.documentElement;
  const body = document.body;

  root.lang = normalizedLanguage;
  root.dir = dir;
  root.dataset.locale = normalizedLanguage;
  root.dataset.localeDir = dir;
  root.classList.toggle("dir-rtl", dir === "rtl");
  root.classList.toggle("dir-ltr", dir === "ltr");
  root.classList.toggle("font-arabic", dir === "rtl");

  if (body) {
    body.dir = dir;
    body.lang = normalizedLanguage;
    body.dataset.locale = normalizedLanguage;
    body.dataset.localeDir = dir;
    body.classList.toggle("dir-rtl", dir === "rtl");
    body.classList.toggle("dir-ltr", dir === "ltr");
    body.classList.toggle("font-arabic", dir === "rtl");
  }
}

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Cryonex",
      study_mode: "Study Mode",
      ai_tutor: "AI Tutor",
      settings: "Settings",
      school_mode: "School Mode",
      assistant: "Assistant",
      library: "Library",
      projects: "Projects",
      study: "Study",
      common: {
        home: "Home",
        profile: "Profile",
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel",
        delete: "Delete",
        signOut: "Sign Out",
        active: "Active",
        credits: "Credits",
      },
      mobileNav: {
        home: "Home",
        coach: "Coach",
        capture: "Capture",
        library: "Library",
        profile: "Profile",
      },
      mobileShell: {
        default: {
          eyebrow: "Cryonex",
          title: "Cryonex",
          subtitle: "Private study AI",
        },
        studyWorkspace: {
          eyebrow: "Focus",
          title: "Workspace",
          subtitle: "Review, revise, and submit",
        },
        studyDashboard: {
          eyebrow: "Study",
          title: "Dashboard",
          subtitle: "Today in Cryonex",
        },
        library: {
          eyebrow: "Library",
          title: "Materials",
          subtitle: "Sources, notes, and packs",
        },
        settings: {
          eyebrow: "Profile",
          title: "Settings",
          subtitle: "Account and app preferences",
        },
        projects: {
          eyebrow: "Build",
          title: "Projects",
          subtitle: "Keep coursework moving",
        },
        gpts: {
          eyebrow: "Assist",
          title: "Assistants",
          subtitle: "Custom study copilots and tools",
        },
        actions: {
          captureSource: "Capture a study source",
          openAssistant: "Open assistant",
          openMobileMenu: "Open mobile navigation menu",
        },
      },
      sidebar: {
        dashboard: "Dashboard",
        schoolHub: "School Hub",
        assistant: "Assistant",
        library: "Library",
        settings: "Settings",
        newChat: "New Chat",
        createChatSignIn: "Please sign in to create chats",
        chatDeleted: "Chat deleted",
        deleteFailed: "Failed to delete chat",
        chatRenamed: "Chat renamed",
        enterChatTitle: "Enter a chat title",
        switchWorkspace: "Switch workspace",
        chatHistory: "Chat history",
        searchChats: "Search chats",
        today: "Today",
        yesterday: "Yesterday",
        previous7Days: "Previous 7 Days",
        older: "Older",
        rename: "Rename",
        delete: "Delete",
        deleteConfirmTitle: "Delete chat?",
        deleteConfirmDescription:
          "This will permanently remove the chat and its messages.",
      },
      chatHeader: {
        flow: "Cryonex Flow",
        switchWorkspace: "Switch workspace",
        upgradeToPro: "Upgrade to Pro",
        upgradeToCryonexPro: "Upgrade to Cryonex Pro",
        logIn: "Log in",
        signUp: "Sign up",
        focusOn: "Focus on",
        focusView: "Focus view",
      },
      settingsPage: {
        title: "Settings",
        subtitle: "Manage your preferences",
        profile: {
          label: "Profile",
          description: "Manage your public profile",
          photoTitle: "Profile Photo",
          photoDescription:
            "Click the image to upload a new one. Supports JPG, PNG or GIF. Max 5MB.",
          updatedSuccess: "Profile updated successfully",
          updatedError: "Failed to update profile",
          deleteConfirm:
            "Are you sure you want to delete your account? This action cannot be undone.",
          deletedSuccess: "Account deleted",
          deletedError: "Failed to delete account",
          providerManaged: "This setting is managed by your login provider.",
          imageOnly: "Please upload an image file",
          imageTooLarge: "Image must be less than 5MB",
          avatarUpdated: "Avatar updated successfully!",
          avatarUploadError: "Failed to upload avatar",
        },
        appearance: {
          label: "Appearance",
          description: "Customize the interface",
          system: "System",
          systemDescription: "Follow your device appearance automatically",
          light: "Light",
          lightDescription: "Aurora light mode with bright glass surfaces",
          dark: "Dark",
          darkDescription: "Original cosmic mode with a darker aurora backdrop",
        },
        account: {
          label: "Account",
          description: "Security and login methods",
        },
        regional: {
          label: "Regional",
          description: "Localized experience and language",
          title: "Regional Preferences",
          intro: "Tailor Cryonex to your local curriculum and language.",
          studyRegion: "Study Region",
          activeCurriculum: "Active Curriculum",
          languageTitle: "App Language",
          languageDescription:
            "Switch the whole app between English and Arabic, including RTL layout.",
          languageEnglish: "English",
          languageArabic: "Arabic",
          languageSwitched: "Language switched to {{language}}",
          save: "Save Regional Preferences",
        },
        notifications: {
          label: "Notifications",
          description: "Email and push preferences",
        },
        privacy: {
          label: "Privacy",
          description: "Data and visibility settings",
        },
        education: {
          label: "Education",
          description: "School, grade, and study pacing",
        },
      },
      accounts: {
        alreadyUsing: "You're already using this account",
        switching: "Switching account...",
        redirectingAdd: "Redirecting to add account...",
        signedOut: "Signed out successfully",
        userFallback: "User",
        showNotifications: "Show notifications",
      },
      native: {
        appNameArabic: "كريونكس",
      },
    },
  },
  ar: {
    translation: {
      welcome: "مرحباً بك في كريونكس",
      study_mode: "وضع الدراسة",
      ai_tutor: "المدرس الذكي",
      settings: "الإعدادات",
      school_mode: "وضع المدرسة",
      assistant: "المساعد",
      library: "المكتبة",
      projects: "المشاريع",
      study: "الدراسة",
      common: {
        home: "الرئيسية",
        profile: "الملف الشخصي",
        save: "حفظ",
        saving: "جارٍ الحفظ...",
        cancel: "إلغاء",
        delete: "حذف",
        signOut: "تسجيل الخروج",
        active: "نشط",
        credits: "الرصيد",
      },
      mobileNav: {
        home: "الرئيسية",
        coach: "المدرب",
        capture: "التقاط",
        library: "المكتبة",
        profile: "الملف",
      },
      mobileShell: {
        default: {
          eyebrow: "كريونكس",
          title: "كريونكس",
          subtitle: "ذكاء دراسة خاص",
        },
        studyWorkspace: {
          eyebrow: "تركيز",
          title: "مساحة العمل",
          subtitle: "راجع وحرر وسلم",
        },
        studyDashboard: {
          eyebrow: "الدراسة",
          title: "لوحة الدراسة",
          subtitle: "يومك اليوم في كريونكس",
        },
        library: {
          eyebrow: "المكتبة",
          title: "المواد",
          subtitle: "المصادر والملاحظات والحزم",
        },
        settings: {
          eyebrow: "الملف الشخصي",
          title: "الإعدادات",
          subtitle: "الحساب وتفضيلات التطبيق",
        },
        projects: {
          eyebrow: "الإنجاز",
          title: "المشاريع",
          subtitle: "حافظ على تقدمك الدراسي",
        },
        gpts: {
          eyebrow: "المساعدة",
          title: "المساعدون",
          subtitle: "مساعدو دراسة مخصصون وأدوات",
        },
        actions: {
          captureSource: "التقط مصدراً دراسياً",
          openAssistant: "افتح المساعد",
          openMobileMenu: "افتح قائمة التنقل على الجوال",
        },
      },
      sidebar: {
        dashboard: "لوحة الدراسة",
        schoolHub: "بوابة المدرسة",
        assistant: "المساعد",
        library: "المكتبة",
        settings: "الإعدادات",
        newChat: "دردشة جديدة",
        createChatSignIn: "يرجى تسجيل الدخول لإنشاء دردشات",
        chatDeleted: "تم حذف الدردشة",
        deleteFailed: "تعذر حذف الدردشة",
        chatRenamed: "تمت إعادة تسمية الدردشة",
        enterChatTitle: "أدخل عنواناً للدردشة",
        switchWorkspace: "بدل مساحة العمل",
        chatHistory: "سجل الدردشات",
        searchChats: "ابحث في الدردشات",
        today: "اليوم",
        yesterday: "أمس",
        previous7Days: "آخر 7 أيام",
        older: "الأقدم",
        rename: "إعادة تسمية",
        delete: "حذف",
        deleteConfirmTitle: "حذف الدردشة؟",
        deleteConfirmDescription: "سيؤدي هذا إلى إزالة الدردشة ورسائلها نهائياً.",
      },
      chatHeader: {
        flow: "تدفق كريونكس",
        switchWorkspace: "بدل مساحة العمل",
        upgradeToPro: "الترقية إلى برو",
        upgradeToCryonexPro: "الترقية إلى كريونكس برو",
        logIn: "تسجيل الدخول",
        signUp: "إنشاء حساب",
        focusOn: "وضع التركيز",
        focusView: "عرض التركيز",
      },
      settingsPage: {
        title: "الإعدادات",
        subtitle: "أدر تفضيلاتك",
        profile: {
          label: "الملف الشخصي",
          description: "أدر ملفك العام",
          photoTitle: "صورة الملف الشخصي",
          photoDescription:
            "اضغط على الصورة لرفع صورة جديدة. يدعم JPG وPNG وGIF بحد أقصى 5 ميجابايت.",
          updatedSuccess: "تم تحديث الملف الشخصي بنجاح",
          updatedError: "تعذر تحديث الملف الشخصي",
          deleteConfirm:
            "هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.",
          deletedSuccess: "تم حذف الحساب",
          deletedError: "تعذر حذف الحساب",
          providerManaged: "هذا الإعداد تتم إدارته من موفر تسجيل الدخول.",
          imageOnly: "يرجى رفع ملف صورة",
          imageTooLarge: "يجب ألا يزيد حجم الصورة عن 5 ميجابايت",
          avatarUpdated: "تم تحديث الصورة الشخصية بنجاح",
          avatarUploadError: "تعذر رفع الصورة الشخصية",
        },
        appearance: {
          label: "المظهر",
          description: "خصص واجهة التطبيق",
          system: "النظام",
          systemDescription: "اتبع مظهر جهازك تلقائياً",
          light: "فاتح",
          lightDescription: "وضع أورورا الفاتح بواجهات زجاجية ساطعة",
          dark: "داكن",
          darkDescription: "الوضع الكوني الأصلي بخلفية أورورا أغمق",
        },
        account: {
          label: "الحساب",
          description: "الأمان وطرق تسجيل الدخول",
        },
        regional: {
          label: "الإعدادات المحلية",
          description: "اللغة وتجربة الاستخدام المحلية",
          title: "التفضيلات المحلية",
          intro: "خصص كريونكس ليلائم منهجك المحلي ولغتك.",
          studyRegion: "منطقة الدراسة",
          activeCurriculum: "المنهج الحالي",
          languageTitle: "لغة التطبيق",
          languageDescription:
            "بدل التطبيق بالكامل بين الإنجليزية والعربية، مع دعم التخطيط من اليمين إلى اليسار.",
          languageEnglish: "الإنجليزية",
          languageArabic: "العربية",
          languageSwitched: "تم تبديل اللغة إلى {{language}}",
          save: "حفظ التفضيلات المحلية",
        },
        notifications: {
          label: "الإشعارات",
          description: "تفضيلات البريد والإشعارات",
        },
        privacy: {
          label: "الخصوصية",
          description: "إعدادات البيانات والظهور",
        },
        education: {
          label: "التعليم",
          description: "المدرسة والصف وسرعة الدراسة",
        },
      },
      accounts: {
        alreadyUsing: "أنت تستخدم هذا الحساب بالفعل",
        switching: "جارٍ تبديل الحساب...",
        redirectingAdd: "جارٍ تحويلك لإضافة حساب...",
        signedOut: "تم تسجيل الخروج بنجاح",
        userFallback: "مستخدم",
        showNotifications: "إظهار الإشعارات",
      },
      native: {
        appNameArabic: "كريونكس",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    initImmediate: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

applyLanguageToDocument(i18n.resolvedLanguage || i18n.language || "en");
i18n.on("languageChanged", (language) => applyLanguageToDocument(language));

export default i18n;
