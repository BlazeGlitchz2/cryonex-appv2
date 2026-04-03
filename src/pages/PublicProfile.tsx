import { useQuery } from "convex/react";
import { useNavigate, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Globe2,
  Target,
  Trophy,
} from "lucide-react";

function formatStudyTime(studyTimeMs?: number) {
  const minutes = Math.round((studyTimeMs || 0) / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function buildClassLabel(profile: {
  gradeLevel?: string | null;
  classSection?: string | null;
}) {
  if (!profile.gradeLevel && !profile.classSection) return null;
  if (!profile.classSection) return profile.gradeLevel || null;
  return `${profile.gradeLevel || "Student"} • Section ${profile.classSection}`;
}

export default function PublicProfile() {
  const navigate = useNavigate();
  const params = useParams();
  const profileData = useQuery(
    api.school.getStudentProfile,
    params.profileUserId
      ? { profileUserId: params.profileUserId as any }
      : "skip",
  );
  const profile = profileData?.profile;
  const leaderboardSummary = profileData?.leaderboardSummary;

  if (profileData === null) {
    return (
      <div className="study-dashboard-shell relative min-h-full overflow-x-hidden px-4 pb-10 pt-6 md:px-8 xl:px-10">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="deepshi-panel rounded-[28px] border border-white/10 p-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/school")}
              className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to School Hub
            </Button>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-white">
              Profile unavailable
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              This profile is private or you do not have permission to view it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData || !profile) {
    return (
      <div className="study-dashboard-shell relative min-h-full overflow-x-hidden px-4 pb-10 pt-6 md:px-8 xl:px-10">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="deepshi-panel rounded-[28px] border border-white/10 p-6 text-sm text-white/55">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-dashboard-shell relative min-h-full overflow-x-hidden px-4 pb-10 pt-6 md:px-8 xl:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(255,255,255,0.05),transparent_0,transparent_22%),radial-gradient(circle_at_74%_8%,rgba(112,88,255,0.14),transparent_26%),linear-gradient(180deg,#07031c_0%,#050218_56%,#040114_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:url('/noise.svg')]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <section className="deepshi-panel rounded-[32px] border border-white/10 p-6 md:p-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/school")}
            className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to School Hub
          </Button>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[26px] border border-white/10 bg-white/10 text-2xl font-semibold text-white">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profile.name?.slice(0, 2)?.toUpperCase() || "ST"
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                    <Globe2 className="h-3.5 w-3.5" />
                    Public profile
                  </div>
                  <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">
                    {profile.name}
                  </h1>
                  <p className="mt-2 text-sm text-white/50">
                    {buildClassLabel(profile) ||
                      profile.curriculumTrack ||
                      "Student"}
                  </p>
                </div>
              </div>

              {profile.bio ? (
                <p className="mt-6 max-w-3xl text-sm leading-7 text-white/58 md:text-base">
                  {profile.bio}
                </p>
              ) : null}

              {profile.interests?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/60"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <aside className="space-y-3">
              {[
                ["Overall rating", `${leaderboardSummary?.overallScore || 0}/100`],
                [
                  "Study packs",
                  String(leaderboardSummary?.studyPacksCreated || 0),
                ],
                [
                  "Study time",
                  formatStudyTime((leaderboardSummary?.studyMinutes || 0) * 60000),
                ],
                [
                  "Quiz questions right",
                  String(leaderboardSummary?.quizQuestionsCorrect || 0),
                ],
                [
                  "Quiz accuracy",
                  `${Math.round(
                    ((leaderboardSummary?.quizQuestionsCorrect || 0) /
                      Math.max(1, leaderboardSummary?.quizQuestionsAnswered || 0)) *
                      100,
                  )}%`,
                ],
                ["Class rank", leaderboardSummary?.classRanking || "N/A"],
                [
                  "Weekly individual rank",
                  leaderboardSummary?.individualRanking || "N/A",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/88">{value}</p>
                </div>
              ))}
            </aside>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Overall",
              value: `${leaderboardSummary?.overallScore || 0}/100`,
              icon: Trophy,
            },
            {
              label: "Pack rating",
              value: `${leaderboardSummary?.categoryRatings?.studyPacks || 0}/100`,
              icon: BookOpen,
            },
            {
              label: "Time rating",
              value: `${leaderboardSummary?.categoryRatings?.studyTime || 0}/100`,
              icon: Clock3,
            },
            {
              label: "Quiz rating",
              value: `${leaderboardSummary?.categoryRatings?.quizAccuracy || 0}/100`,
              icon: Target,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="deepshi-panel rounded-[26px] border border-white/10 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                  {card.label}
                </p>
                <card.icon className="h-4 w-4 text-white/55" />
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                {card.value}
              </div>
            </div>
          ))}
        </section>

        <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            <BookOpen className="h-3.5 w-3.5" />
            Recent shared study work
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(leaderboardSummary?.boards || []).length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.025] px-4 py-6 text-sm text-white/55">
                No school-visible leaderboard context yet.
              </div>
            ) : (
              (leaderboardSummary?.boards || []).slice(0, 3).map((board: any) => (
                <div
                  key={`${board.timeframe}-${board.view}`}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                    {board.timeframe} • {board.view}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {board.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {board.description}
                  </p>
                  <div className="mt-4 text-xs text-white/45">
                    Matching entries: {board.entries?.length || 0}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
