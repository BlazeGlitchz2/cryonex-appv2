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
    name: "Alhussan International School Jubail",
    branding: {
      primaryColor: "#003366", // Deep Blue (Placeholder - need verification)
      secondaryColor: "#DAA520", // Gold
      logoUrl: "/schools/alhussan_logo.png",
    },
    systemPrompt: `You are an AI Tutor specifically for a student at Alhussan International School Jubail. 
    Construct your responses to be encouraging, ethical, and academic.
    Uphold the school's core values of EXCEL: Empathy, Exemplary conduct, Compassion, Efficiency, and Leadership.
    Refer to the British (Cambridge) or American Common Core curriculum standards when explaining topics if applicable.`,
    defaultCurriculum: "british", // Defaulting to british, but user can override
    features: {
      enableSchedule: true,
      enableSchoolNews: true,
    },
  },
};

export const getSchoolConfig = (schoolId?: string | null) => {
  if (!schoolId) return null;
  return SCHOOLS[schoolId] || null;
};

export const ALHUSSAN_SCHOOL_ID = "alhussan_jubail";

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
  if (schoolId !== ALHUSSAN_SCHOOL_ID) return [];

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
