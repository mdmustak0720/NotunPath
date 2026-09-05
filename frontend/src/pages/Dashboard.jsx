import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Sparkles,
  Target,
  Upload,
  UserRound,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ResumeUpload from "../components/resume/ResumeUpload";

import useAuthStore from "../store/authStore";

import { getLatestResume } from "../services/resumeService";

// /human: Small shared helpers keep the dashboard defensive without hiding data problems.
function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// /human: Clean array of null/empty values and common placeholder strings.
function cleanArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => {
    if (!hasValue(item)) return false;
    if (typeof item === "string") {
      const normalized = item.trim().toLowerCase();
      return (
        normalized !== "none" &&
        normalized !== "null" &&
        normalized !== "not specified" &&
        normalized !== "n/a"
      );
    }
    return true;
  });
}

// /human: Extract user-friendly error message from API response.
function getErrorMessage(error) {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "Something went wrong while loading your resume.";
}

// /human: SectionHeader - consistent header for profile sections.
function SectionHeader({ icon: Icon, eyebrow, title, count }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
            {title}
          </h3>
        </div>
      </div>
      {hasValue(count) && (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-400">
          {count}
        </span>
      )}
    </div>
  );
}

// /human: ProfileCard - reusable card container with soft neumorphic shadow.
function ProfileCard({ children, className = "", delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`
        rounded-3xl border border-white/10
        bg-white/[0.025]
        shadow-[8px_8px_20px_rgba(0,0,0,0.3),-8px_-8px_20px_rgba(255,255,255,0.02)]
        backdrop-blur-xl
        ${className}
      `}
    >
      {children}
    </motion.section>
  );
}

// /human: AtsAnalysisCard - compact card, details hidden behind a button.
function AtsAnalysisCard({ ats, prefersReducedMotion }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!ats) return null;

  const dimensions = [
    { key: "parsing_interpretability", label: "Parsing Interpretability" },
    { key: "structure_interpretability", label: "Structure Interpretability" },
    { key: "text_integrity", label: "Text Integrity" },
    { key: "terminology_consistency", label: "Terminology Consistency" },
    { key: "layout_risk", label: "Layout Risk" },
  ];

  const issues = cleanArray(ats.issues);
  const recommendations = cleanArray(ats.recommendations);
  const score = typeof ats.overall_score === "number" ? ats.overall_score : null;

  const getScoreTone = (value) => {
    if (value >= 90) return "text-emerald-300";
    if (value >= 75) return "text-cyan-300";
    if (value >= 60) return "text-amber-300";
    return "text-red-300";
  };

  const getScoreWidth = (value) => {
    if (typeof value !== "number") return "0%";
    return `${Math.max(0, Math.min(100, value))}%`;
  };

  return (
    <ProfileCard delay={0.04}>
      <div className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/[0.07] blur-3xl" />

        {/* Compact Header */}
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Resume Intelligence
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  ATS Compatibility
                </h3>
              </div>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
              <span className="text-2xl font-bold text-white">{score ?? "--"}</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">ATS Score</p>
              <p className={`mt-1 text-sm font-semibold ${getScoreTone(score ?? 0)}`}>
                {ats.score_label || "Analyzed"}
              </p>
              {ats.confidence && (
                <p className="mt-1 text-[11px] text-gray-500">Confidence: {ats.confidence}</p>
              )}
            </div>
          </div>
        </div>

        {/* Issue/Recommendation Summary */}
        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.035] px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="text-xs font-medium text-gray-300">
                {issues.length} {issues.length === 1 ? "issue" : "issues"}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">Detected</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.035] px-4 py-3">
            <Lightbulb className="h-4 w-4 shrink-0 text-cyan-300" />
            <div>
              <p className="text-xs font-medium text-gray-300">
                {recommendations.length} {recommendations.length === 1 ? "recommendation" : "recommendations"}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">Suggestions</p>
            </div>
          </div>
        </div>

        {/* Toggle Details Button */}
        <div className="relative mt-5">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            className="group inline-flex w-full items-center justify-between gap-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3 text-left text-sm font-medium text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_20px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-cyan-400/[0.09] active:translate-y-0 active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          >
            <span>{isExpanded ? "Hide detailed analysis" : "View detailed analysis"}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-5 grid gap-3">
                  {dimensions.map((dimension) => {
                    const item = ats[dimension.key];
                    if (!item || typeof item.score !== "number") return null;
                    const value = item.score;
                    return (
                      <div key={dimension.key} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-medium text-gray-300">{dimension.label}</p>
                          <span className={`shrink-0 text-sm font-semibold ${getScoreTone(value)}`}>{value}</span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{ width: prefersReducedMotion ? getScoreWidth(value) : "0%" }}
                            animate={{ width: getScoreWidth(value) }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                          />
                        </div>
                        {item.rationale && (
                          <p className="mt-3 text-xs leading-5 text-gray-500">{item.rationale}</p>
                        )}
                      </div>
                    );
                  })}

                  {/* Issues & Recommendations Details */}
                  {(issues.length > 0 || recommendations.length > 0) && (
                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      {issues.length > 0 && (
                        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-300" />
                            <h4 className="text-sm font-semibold text-white">Detected issues</h4>
                          </div>
                          <div className="mt-4 space-y-3">
                            {issues.map((issue, index) => (
                              <div key={`issue-${index}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm font-medium text-gray-200">{issue?.title || "Issue detected"}</p>
                                  {issue?.severity && (
                                    <span className="shrink-0 rounded-full border border-amber-400/15 bg-amber-400/[0.05] px-2 py-1 text-[10px] uppercase tracking-wide text-amber-300">
                                      {issue.severity}
                                    </span>
                                  )}
                                </div>
                                {issue?.description && (
                                  <p className="mt-2 text-xs leading-5 text-gray-500">{issue.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {recommendations.length > 0 && (
                        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-cyan-300" />
                            <h4 className="text-sm font-semibold text-white">Recommendations</h4>
                          </div>
                          <div className="mt-4 space-y-3">
                            {recommendations.map((recommendation, index) => (
                              <div key={`recommendation-${index}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm font-medium text-gray-200">{recommendation?.title || "Recommendation"}</p>
                                  {Number.isFinite(Number(recommendation?.priority)) && (
                                    <span className="shrink-0 text-[10px] text-gray-500">Priority {recommendation.priority}</span>
                                  )}
                                </div>
                                {recommendation?.description && (
                                  <p className="mt-2 text-xs leading-5 text-gray-500">{recommendation.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ProfileCard>
  );
}

// /human: EmptyResumeState - shown when no resume exists.
function EmptyResumeState({ onRetry, isLoading }) {
  return (
    <ProfileCard>
      <div className="p-8 sm:p-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Build your AI career profile
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
            Upload your latest resume and NotunPath will extract your skills, projects, education, and career signals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> AI analysis
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
              <Target className="h-3.5 w-3.5 text-cyan-400" /> Career direction
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
              <Code2 className="h-3.5 w-3.5 text-cyan-400" /> Skills extraction
            </span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isLoading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-gray-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh profile
            </button>
          )}
        </div>
      </div>
    </ProfileCard>
  );
}

// /human: LoadingProfile - shown while fetching latest resume.
function LoadingProfile() {
  return (
    <ProfileCard>
      <div className="p-8 sm:p-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white">Loading your career profile</h2>
          <p className="mt-2 text-sm text-gray-500">Retrieving your latest resume analysis...</p>
        </div>
      </div>
    </ProfileCard>
  );
}

// /human: ErrorState - shown on API error with retry option.
function ErrorState({ message, onRetry, isLoading }) {
  return (
    <ProfileCard>
      <div className="p-8 sm:p-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.06] text-red-300">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-white">We couldn't load your profile</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            disabled={isLoading}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Try again
          </button>
        </div>
      </div>
    </ProfileCard>
  );
}

// /human: Dashboard - main page, orchestrates state and rendering.
function Dashboard() {
  const { user, token } = useAuthStore();
  const prefersReducedMotion = useReducedMotion();

  const [resumeResult, setResumeResult] = useState(null);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [resumeError, setResumeError] = useState(null);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);

  // /human: loadLatestResume - fetch latest resume from backend.
  const loadLatestResume = useCallback(async () => {
    if (!token) {
      setIsLoadingResume(false);
      setHasCheckedResume(true);
      return;
    }
    setIsLoadingResume(true);
    setResumeError(null);
    try {
      const result = await getLatestResume(token);
      setResumeResult(result || null);
    } catch (error) {
      if (error?.response?.status === 404) {
        setResumeResult(null);
        setResumeError(null);
      } else {
        setResumeError(getErrorMessage(error));
      }
    } finally {
      setIsLoadingResume(false);
      setHasCheckedResume(true);
    }
  }, [token]);

  useEffect(() => {
    loadLatestResume();
  }, [loadLatestResume]);

  // /human: Prefer canonical API shape, tolerate legacy nesting.
  const analysis = resumeResult?.analysis || resumeResult?.data?.analysis || resumeResult?.result?.analysis || null;

  // /human: Keep ATS data separate from resume analysis.
  const ats = resumeResult?.intelligence?.ats || resumeResult?.data?.intelligence?.ats || resumeResult?.result?.intelligence?.ats || resumeResult?.ats || resumeResult?.data?.ats || resumeResult?.result?.ats || null;

  const personalInformation = analysis?.personal_information || null;

  const skills = useMemo(() => cleanArray(analysis?.skills), [analysis]);
  const targetRoles = useMemo(() => cleanArray(analysis?.target_roles), [analysis]);
  const projects = useMemo(() => cleanArray(analysis?.projects), [analysis]);
  const education = useMemo(() => cleanArray(analysis?.education), [analysis]);
  const certifications = useMemo(() => cleanArray(analysis?.certifications), [analysis]);
  const languages = useMemo(() => cleanArray(analysis?.languages), [analysis]);
  const workExperience = useMemo(() => cleanArray(analysis?.work_experience), [analysis]);

  // /human: Upload success triggers fresh latest-resume read.
  const handleResumeUploadSuccess = async (result) => {
    if (result) setResumeResult(result);
    setResumeError(null);
    await loadLatestResume();
  };

  const pageAnimation = prefersReducedMotion ? {} : {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.35 },
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-x-hidden px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">
            {/* Welcome Section */}
            <motion.section {...pageAnimation} className="mb-10">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
                  AI Career Workspace
                </p>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                👋 Welcome back,{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {user?.name || "there"}
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                {analysis
                  ? "Your AI career profile is ready. Explore your skills, projects, education and career direction."
                  : "Your AI Career Coach is ready. Upload your resume to build your personalized career profile."}
              </p>
            </motion.section>

            {/* Upload Card */}
            <ProfileCard>
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300">
                      {analysis ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {analysis ? "Your career profile is ready" : "Build your AI career profile"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                      {analysis
                        ? "Your latest resume has already been analyzed. Upload a newer resume below whenever your profile changes."
                        : "Upload your latest resume and NotunPath will extract your skills, projects, education, experience, and career signals."}
                    </p>
                  </div>
                  {analysis && (
                    <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Profile generated
                    </div>
                  )}
                </div>
                <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
              </div>
            </ProfileCard>

            {/* Loading / Error / Empty States */}
            {isLoadingResume && !analysis && (
              <div className="mt-10"><LoadingProfile /></div>
            )}
            {!isLoadingResume && resumeError && !analysis && (
              <div className="mt-10">
                <ErrorState message={resumeError} onRetry={loadLatestResume} isLoading={isLoadingResume} />
              </div>
            )}
            {!isLoadingResume && !resumeError && hasCheckedResume && !analysis && (
              <div className="mt-10">
                <EmptyResumeState onRetry={loadLatestResume} isLoading={isLoadingResume} />
              </div>
            )}

            {/* Main Profile Content */}
            <AnimatePresence mode="wait">
              {analysis && (
                <motion.div
                  key={resumeResult?.resume_id || "profile"}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="mt-10 space-y-6"
                >
                  <AtsAnalysisCard ats={ats} prefersReducedMotion={prefersReducedMotion} />

                  {/* Profile Header */}
                  <ProfileCard className="relative overflow-hidden" delay={0.05}>
                    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/[0.05] blur-3xl" />
                    <div className="relative p-6 sm:p-8 lg:p-10">
                      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-5">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-blue-500/10 text-xl font-bold text-cyan-300 sm:h-20 sm:w-20 sm:text-2xl">
                            {(personalInformation?.full_name || user?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                              AI Career Profile
                            </p>
                            <h2 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                              {personalInformation?.full_name || user?.name || "Your Profile"}
                            </h2>
                            {hasValue(analysis.professional_summary) && (
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                                {analysis.professional_summary}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-sm text-emerald-300 lg:self-center">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                          AI analysis complete
                        </div>
                      </div>

                      {personalInformation && (
                        <div className="mt-8 flex flex-wrap gap-3">
                          {hasValue(personalInformation.email) && (
                            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-gray-400">
                              <Mail className="h-3.5 w-3.5 text-cyan-400" />
                              {personalInformation.email}
                            </div>
                          )}
                          {hasValue(personalInformation.phone) && (
                            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-gray-400">
                              <Phone className="h-3.5 w-3.5 text-cyan-400" />
                              {personalInformation.phone}
                            </div>
                          )}
                          {hasValue(personalInformation.location) && (
                            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-gray-400">
                              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                              {personalInformation.location}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-2">
                        {hasValue(resumeResult?.version) && (
                          <span className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-1.5 text-xs text-cyan-300">
                            Resume version V{resumeResult.version}
                          </span>
                        )}
                        {resumeResult?.is_latest && (
                          <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-xs text-emerald-300">
                            Current resume
                          </span>
                        )}
                      </div>
                    </div>
                  </ProfileCard>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                      { label: "Skills", value: skills.length, icon: Code2 },
                      { label: "Projects", value: projects.length, icon: BriefcaseBusiness },
                      { label: "Target Roles", value: targetRoles.length, icon: Target },
                      { label: "Education", value: education.length, icon: GraduationCap },
                    ].map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: prefersReducedMotion ? 0 : 0.08 + index * 0.05, duration: 0.3 }}
                          className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                        >
                          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Target Roles */}
                  {targetRoles.length > 0 && (
                    <ProfileCard delay={0.1}>
                      <div className="p-6 sm:p-8">
                        <SectionHeader icon={Target} eyebrow="Career Direction" title="Target roles" count={`${targetRoles.length} roles`} />
                        <div className="flex flex-wrap gap-3">
                          {targetRoles.map((role, index) => (
                            <motion.div
                              key={`${role}-${index}`}
                              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                              className="group inline-flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] px-4 py-3 text-sm font-medium text-cyan-200 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/[0.08]"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                              {role}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </ProfileCard>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <ProfileCard delay={0.12}>
                      <div className="p-6 sm:p-8">
                        <SectionHeader icon={Code2} eyebrow="Technical Profile" title="Skills & technologies" count={`${skills.length} skills`} />
                        <div className="flex flex-wrap gap-2.5">
                          {skills.map((skill, index) => (
                            <motion.span
                              key={`${skill}-${index}`}
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: prefersReducedMotion ? 0 : 0.02 * index }}
                              className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-200"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </ProfileCard>
                  )}

                  {/* Projects */}
                  {projects.length > 0 && (
                    <ProfileCard delay={0.14}>
                      <div className="p-6 sm:p-8">
                        <SectionHeader icon={BriefcaseBusiness} eyebrow="Portfolio" title="Projects" count={`${projects.length} projects`} />
                        <div className="grid gap-4 lg:grid-cols-2">
                          {projects.map((project, index) => {
                            if (typeof project !== "object") return null;
                            const title = project.title || project.name;
                            const technologies = cleanArray(project.technologies || project.tech_stack);
                            const description = project.description;
                            return (
                              <motion.article
                                key={`${title || "project"}-${index}`}
                                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                                className="group rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:border-cyan-400/20"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
                                      <Code2 className="h-4 w-4" />
                                    </div>
                                    <h4 className="truncate font-semibold text-white">{title || "Project"}</h4>
                                  </div>
                                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-400" />
                                </div>
                                {hasValue(description) && (
                                  <p className="mt-4 text-sm leading-6 text-gray-400">
                                    {Array.isArray(description) ? description.join(" ") : description}
                                  </p>
                                )}
                                {technologies.length > 0 && (
                                  <div className="mt-5 flex flex-wrap gap-2">
                                    {technologies.map((technology, techIndex) => (
                                      <span key={`${technology}-${techIndex}`} className="rounded-md bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-gray-400">
                                        {technology}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </motion.article>
                            );
                          })}
                        </div>
                      </div>
                    </ProfileCard>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <ProfileCard delay={0.16}>
                      <div className="p-6 sm:p-8">
                        <SectionHeader icon={GraduationCap} eyebrow="Academic Background" title="Education" count={`${education.length} entries`} />
                        <div className="space-y-4">
                          {education.map((item, index) => {
                            if (typeof item !== "object") return null;
                            return (
                              <div key={`education-${index}`} className="rounded-2xl border border-white/10 bg-black/10 p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    {hasValue(item.degree) && <h4 className="font-semibold text-white">{item.degree}</h4>}
                                    {hasValue(item.institution) && <p className="mt-1 text-sm text-cyan-300/80">{item.institution}</p>}
                                  </div>
                                  {hasValue(item.dates) && (
                                    <span className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400">
                                      {item.dates}
                                    </span>
                                  )}
                                </div>
                                {hasValue(item.cgpa) && (
                                  <p className="mt-4 text-xs text-gray-500">
                                    Result: <span className="text-gray-300">{item.cgpa}</span>
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </ProfileCard>
                  )}

                  {/* Work Experience */}
                  {workExperience.length > 0 && (
                    <ProfileCard delay={0.18}>
                      <div className="p-6 sm:p-8">
                        <SectionHeader icon={BriefcaseBusiness} eyebrow="Professional Journey" title="Work experience" count={`${workExperience.length} roles`} />
                        <div className="space-y-4">
                          {workExperience.map((experience, index) => {
                            if (typeof experience !== "object") return null;
                            return (
                              <div key={`experience-${index}`} className="rounded-2xl border border-white/10 bg-black/10 p-5">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    {hasValue(experience.job_title) && <h4 className="font-semibold text-white">{experience.job_title}</h4>}
                                    {hasValue(experience.company) && <p className="mt-1 text-sm text-cyan-300">{experience.company}</p>}
                                  </div>
                                  {hasValue(experience.dates) && (
                                    <span className="text-xs text-gray-500">{experience.dates}</span>
                                  )}
                                </div>
                                {hasValue(experience.description) && (
                                  <p className="mt-4 text-sm leading-6 text-gray-400">{experience.description}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </ProfileCard>
                  )}

                  {/* Certifications & Languages */}
                  {(certifications.length > 0 || languages.length > 0) && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      {certifications.length > 0 && (
                        <ProfileCard delay={0.2}>
                          <div className="p-6 sm:p-8">
                            <SectionHeader icon={Award} eyebrow="Credentials" title="Certifications" count={`${certifications.length}`} />
                            <div className="space-y-3">
                              {certifications.map((certification, index) => {
                                if (typeof certification !== "object") return null;
                                return (
                                  <div key={`certification-${index}`} className="rounded-xl border border-white/10 bg-black/10 p-4">
                                    {hasValue(certification.title) && <p className="text-sm font-medium text-white">{certification.title}</p>}
                                    {hasValue(certification.issuer) && <p className="mt-1 text-xs text-cyan-300/80">{certification.issuer}</p>}
                                    {hasValue(certification.dates) && <p className="mt-2 text-[11px] text-gray-500">{certification.dates}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </ProfileCard>
                      )}

                      {languages.length > 0 && (
                        <ProfileCard delay={0.22}>
                          <div className="p-6 sm:p-8">
                            <SectionHeader icon={Languages} eyebrow="Communication" title="Languages" count={`${languages.length}`} />
                            <div className="flex flex-wrap gap-2.5">
                              {languages.map((language, index) => (
                                <span key={`${language}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-gray-300">
                                  {language}
                                </span>
                              ))}
                            </div>
                          </div>
                        </ProfileCard>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                    <span>Powered by NotunPath AI Career Engine</span>
                    {hasValue(resumeResult?.resume_id) && (
                      <span>Resume ID: {resumeResult.resume_id}</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;