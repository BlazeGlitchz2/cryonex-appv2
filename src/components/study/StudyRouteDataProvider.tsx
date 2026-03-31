import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type StudyRouteDataContextValue = {
  recommendations: any;
  recentMaterials: any[];
};

const StudyRouteDataContext =
  createContext<StudyRouteDataContextValue | null>(null);

export function StudyRouteDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const recommendations = useQuery(
    api.study.getStudyRecommendations,
    user ? {} : "skip",
  );
  const recentMaterials =
    useQuery(api.study.getRecentMaterials, user ? { limit: 6 } : "skip") || [];

  const value = useMemo(
    () => ({
      recommendations,
      recentMaterials,
    }),
    [recommendations, recentMaterials],
  );

  return (
    <StudyRouteDataContext.Provider value={value}>
      {children}
    </StudyRouteDataContext.Provider>
  );
}

export function useStudyRouteData() {
  const value = useContext(StudyRouteDataContext);

  if (!value) {
    throw new Error(
      "useStudyRouteData must be used within a StudyRouteDataProvider",
    );
  }

  return value;
}
