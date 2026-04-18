export type SchoolConfig = {
  id: string;
  name: string;
  branding: {
    primaryColor: string; // Hex code
    secondaryColor: string;
    logoUrl?: string;
  };
  systemPrompt: string;
  defaultCurriculum: "american" | "british" | "ib";
  features: {
    enableSchedule: boolean;
    enableSchoolNews: boolean;
  };
};

export const SCHOOLS: Record<string, SchoolConfig> = {
  alhussan_jubail: {
    id: "alhussan_jubail",
    name: "Alhussan International School - Jubail",
    branding: {
      primaryColor: "#003366", // Deep Blue (Placeholder - need verification)
      secondaryColor: "#DAA520", // Gold
      logoUrl: "/schools/alhussan_logo.png",
    },
    systemPrompt: `You are an AI Tutor specifically for a student at Alhussan International School - Jubail. 
    Construct your responses to be encouraging, ethical, and academic.
    Uphold the school's core values of EXCEL: Empathy, Exemplary conduct, Compassion, Efficiency, and Leadership.
    Refer to the British (Cambridge) or American Common Core curriculum standards when explaining topics if applicable.`,
    defaultCurriculum: "british", // Defaulting to british, but user can override
    features: {
      enableSchedule: true,
      enableSchoolNews: true,
    },
  },
  mariya_intl_jubail: {
    id: "mariya_intl_jubail",
    name: "Mariya International School - Jubail",
    branding: {
      primaryColor: "#E0115F", // Ruby/Pinkish color from logo
      secondaryColor: "#FFFFFF",
      logoUrl: "/schools/mariya_logo.png",
    },
    systemPrompt: `You are an AI Tutor for a student at Mariya International School in Jubail. 
    Construct your responses to be encouraging, ethical, and academic.
    Refer to the British (Oxford/Cambridge) curriculum standards when explaining topics if applicable.`,
    defaultCurriculum: "british",
    features: {
      enableSchedule: true,
      enableSchoolNews: true,
    },
  },
};

export const ALHUSSAN_SCHOOL_IDS = [
  "alhussan_jubail",
  "ahis_dammam",
  "ahis_jubail",
  "ahis_khobar",
  "ahis_riyadh",
  "ahis_yanbu",
  "orbit_khobar",
  "grammar_khobar",
  "ahis_aziziyah",
  "hussan_national_boys_dammam",
  "hussan_national_girls_dammam",
  "hussan_national_boys_jubail",
  "hussan_national_girls_jubail",
  "riyadh_model_intl",
  "ajyal_alhussan",
  "hussan_national_rabigh",
  "hussan_arar",
  "hussan_turaif",
  "hussan_medina",
  "hussan_rakah",
];

export const LEGACY_SCHOOL_ID_ALIASES: Record<string, string> = {
  jubail_international_school: "ahis_jubail",
  jubail_international: "ahis_jubail",
  jubail_intl_school: "ahis_jubail",
  jis_jubail: "ahis_jubail",
  alhussan_jubail: "ahis_jubail",
};

export const getCanonicalSchoolId = (schoolId?: string | null) => {
  if (!schoolId) return schoolId ?? null;

  const normalized = String(schoolId).trim().toLowerCase();
  return LEGACY_SCHOOL_ID_ALIASES[normalized] || normalized;
};

export const isLegacySchoolId = (schoolId?: string | null) => {
  if (!schoolId) return false;
  const normalized = String(schoolId).trim().toLowerCase();
  return normalized in LEGACY_SCHOOL_ID_ALIASES;
};

export const getSchoolConfig = (schoolId?: string | null) => {
  const canonicalSchoolId = getCanonicalSchoolId(schoolId);
  if (!canonicalSchoolId) return null;

  // Check if it's one of the Al-Hussan branches
  if (ALHUSSAN_SCHOOL_IDS.includes(canonicalSchoolId)) {
    return SCHOOLS.alhussan_jubail; // Use the base Al-Hussan config
  }

  return SCHOOLS[canonicalSchoolId] || null;
};

export const isAlhussanSchool = (schoolId?: string | null) => {
  const canonicalSchoolId = getCanonicalSchoolId(schoolId);
  return canonicalSchoolId
    ? ALHUSSAN_SCHOOL_IDS.includes(canonicalSchoolId)
    : false;
};

export function parseGradeNumber(gradeLevel?: string | null) {
  if (!gradeLevel) return null;

  const match = String(gradeLevel).match(/grade\s+(\d+)/i);
  if (match) {
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  return null;
}

export function getAvailableClassSections(
  schoolId?: string | null,
  gradeLevel?: string | null,
) {
  if (!isAlhussanSchool(schoolId)) return [];

  const gradeNumber = parseGradeNumber(gradeLevel);
  if (!gradeNumber) return [];

  return gradeNumber >= 9 ? ["O", "Q", "P", "A"] : ["O", "Q", "P"];
}

export function isValidClassSection(
  schoolId?: string | null,
  gradeLevel?: string | null,
  classSection?: string | null,
) {
  if (!classSection) return true;
  return getAvailableClassSections(schoolId, gradeLevel).includes(
    classSection.toUpperCase(),
  );
}

export function buildStudentClassLabel(input: {
  gradeLevel?: string | null;
  classSection?: string | null;
}) {
  if (!input.gradeLevel && !input.classSection) return null;
  if (!input.classSection) return input.gradeLevel || null;
  if (!input.gradeLevel) return `Section ${input.classSection}`;
  return `${input.gradeLevel} • Section ${input.classSection}`;
}
