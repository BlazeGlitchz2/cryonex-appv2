export interface CountryConfig {
  id: string;
  name: string;
  flag: string; // Emoji for now, can be SVG path later
  direction: "ltr" | "rtl";
  currency: string;
  schools: { id: string; name: string }[];
  curriculums: string[];
  theme: {
    primary: string; // Subtle accent color
    flagGradient: string; // CSS gradient for faint background
  };
}

export const COUNTRIES: Record<string, CountryConfig> = {
  sa: {
    id: "sa",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    direction: "rtl",
    currency: "SAR",
    schools: [
      { id: "ahis_dammam", name: "Al Hussan International School - Dammam" },
      { id: "ahis_jubail", name: "Al Hussan International School - Jubail" },
      { id: "ahis_khobar", name: "Al Hussan International School - Khobar (Rakah)" },
      { id: "ahis_riyadh", name: "Al Hussan International School - Riyadh" },
      { id: "ahis_yanbu", name: "Al Hussan International School - Yanbu" },
      { id: "orbit_khobar", name: "Orbit International School (Khobar)" },
      { id: "grammar_khobar", name: "Grammar International School (Khobar)" },
      { id: "ahis_aziziyah", name: "International Program - Aziziyah" },
      { id: "hussan_national_boys_dammam", name: "Al Hussan National School (Boys) - Dammam" },
      { id: "hussan_national_girls_dammam", name: "Al Hussan National School (Girls) - Dammam" },
      { id: "hussan_national_boys_jubail", name: "Al Hussan National School (Boys) - Jubail" },
      { id: "hussan_national_girls_jubail", name: "Al Hussan National School (Girls) - Jubail" },
      { id: "riyadh_model_intl", name: "Al Riyadh Model International School" },
      { id: "ajyal_alhussan", name: "Ajyal Alhussan School" },
      { id: "hussan_national_rabigh", name: "Alhussan National School - Petro Rabigh" },
      { id: "hussan_arar", name: "Al Hussan School - Arar" },
      { id: "hussan_turaif", name: "Al Hussan School - Turaif" },
      { id: "hussan_medina", name: "Al Hussan School - Medina" },
      { id: "hussan_rakah", name: "Al Hussan School - Rakah" },
      { id: "mariya_intl_jubail", name: "Mariya International School - Jubail" },
      { id: "british_council_riyadh", name: "British Council Riyadh" },
      { id: "american_school_jeddah", name: "American School of Jeddah" },
    ],
    curriculums: [
      "Saudi National (Secondary Tracks)",
      "British (IGCSE / A-Level)",
      "American",
      "IB",
    ],
    theme: {
      primary: "emerald-500",
      flagGradient:
        "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 78, 59, 0.05) 100%)",
    },
  },
  eg: {
    id: "eg",
    name: "Egypt",
    flag: "🇪🇬",
    direction: "rtl",
    currency: "EGP",
    schools: [
      { id: "auc", name: "American University in Cairo" },
      { id: "cairo_english_school", name: "Cairo English School" },
    ],
    curriculums: [
      "Egyptian National (Preparatory / Thanaweya Amma)",
      "Nile International",
      "British (IGCSE / A-Level)",
      "American Diploma",
      "IB",
    ],
    theme: {
      primary: "red-500",
      flagGradient:
        "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%)",
    },
  },
  uk: {
    id: "uk",
    name: "United Kingdom",
    flag: "🇬🇧",
    direction: "ltr",
    currency: "GBP",
    schools: [],
    curriculums: ["GCSE", "A-Level", "IB Diploma", "Scottish Highers"],
    theme: {
      primary: "blue-600",
      flagGradient:
        "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)",
    },
  },
  us: {
    id: "us",
    name: "United States",
    flag: "🇺🇸",
    direction: "ltr",
    currency: "USD",
    schools: [],
    curriculums: ["Common Core", "AP", "IB", "Honors"],
    theme: {
      primary: "indigo-600",
      flagGradient:
        "linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)",
    },
  },
};

export const GRADE_LEVELS = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9 (Freshman)",
  "Grade 10 (Sophomore)",
  "Grade 11 (Junior)",
  "Grade 12 (Senior)",
  "University (Year 1)",
  "University (Year 2+)",
];
