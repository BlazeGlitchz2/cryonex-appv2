export type SchoolConfig = {
    id: string;
    name: string;
    branding: {
        primaryColor: string; // Hex code
        secondaryColor: string;
        logoUrl?: string;
    };
    systemPrompt: string;
    defaultCurriculum: 'american' | 'british' | 'ib';
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
        defaultCurriculum: 'british', // Defaulting to british, but user can override
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
