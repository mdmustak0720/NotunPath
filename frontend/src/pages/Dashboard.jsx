/**
 * Dashboard
 *
 * Purpose:
 * Main authenticated workspace for NotunPath.
 * Displays resume upload and the generated AI career profile.
 */

import { useMemo, useState } from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Code2,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ResumeUpload from "../components/resume/ResumeUpload";
import useAuthStore from "../store/authStore";


// =======================================================
// Helper Functions
// =======================================================

function hasValue(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}


function cleanArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => {
    if (!hasValue(item)) {
      return false;
    }

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


// =======================================================
// Reusable UI Components
// =======================================================

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  count,
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-cyan-400/20
          bg-cyan-400/[0.08]
          text-cyan-300
        ">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-cyan-400
          ">
            {eyebrow}
          </p>

          <h3 className="
            mt-1
            text-xl
            font-semibold
            tracking-tight
            text-white
          ">
            {title}
          </h3>
        </div>
      </div>

      {hasValue(count) && (
        <span className="
          rounded-full
          border
          border-white/10
          bg-white/[0.04]
          px-3
          py-1
          text-xs
          text-gray-400
        ">
          {count}
        </span>
      )}
    </div>
  );
}


function ProfileCard({
  children,
  className = "",
  delay = 0,
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay,
        ease: "easeOut",
      }}
      className={`
        rounded-3xl
        border
        border-white/10
        bg-white/[0.025]
        shadow-[0_20px_80px_rgba(0,0,0,0.18)]
        backdrop-blur-xl
        ${className}
      `}
    >
      {children}
    </motion.section>
  );
}


// =======================================================
// Dashboard
// =======================================================

function Dashboard() {

  // -------------------------------------------------------
  // Authentication
  // -------------------------------------------------------

  const {
    user,
  } = useAuthStore();


  // -------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------

  const prefersReducedMotion = useReducedMotion();


  // -------------------------------------------------------
  // Resume State
  // -------------------------------------------------------

  const [
    resumeResult,
    setResumeResult,
  ] = useState(null);


  // -------------------------------------------------------
  // Extract AI Analysis
  // -------------------------------------------------------

  const analysis = resumeResult?.analysis || null;


  const personalInformation =
    analysis?.personal_information || null;


  // -------------------------------------------------------
  // Clean Resume Data
  // -------------------------------------------------------

  const skills = useMemo(
    () => cleanArray(analysis?.skills),
    [analysis],
  );


  const targetRoles = useMemo(
    () => cleanArray(analysis?.target_roles),
    [analysis],
  );


  const projects = useMemo(
    () => cleanArray(analysis?.projects),
    [analysis],
  );


  const education = useMemo(
    () => cleanArray(analysis?.education),
    [analysis],
  );


  const certifications = useMemo(
    () => cleanArray(analysis?.certifications),
    [analysis],
  );


  const languages = useMemo(
    () => cleanArray(analysis?.languages),
    [analysis],
  );


  const workExperience = useMemo(
    () => cleanArray(analysis?.work_experience),
    [analysis],
  );


  // -------------------------------------------------------
  // Upload Success
  // -------------------------------------------------------

  const handleResumeUploadSuccess = (result) => {
    setResumeResult(result);
  };


  // -------------------------------------------------------
  // Animation Configuration
  // -------------------------------------------------------

  const pageAnimation = prefersReducedMotion
    ? {}
    : {
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: 1,
        },
        transition: {
          duration: 0.35,
        },
      };


  // =======================================================
  // Render
  // =======================================================

  return (
    <div className="
      flex
      min-h-screen
      bg-[#030712]
      text-white
    ">

      {/* =================================================
          Sidebar
      ================================================= */}

      <Sidebar />


      {/* =================================================
          Main Workspace
      ================================================= */}

      <div className="
        flex
        min-w-0
        flex-1
        flex-col
      ">

        {/* Navbar */}

        <Navbar />


        {/* =================================================
            Main Dashboard
        ================================================= */}

        <main className="
          flex-1
          overflow-x-hidden
          px-5
          py-8
          sm:px-8
          lg:px-10
          lg:py-10
        ">

          <div className="
            mx-auto
            max-w-7xl
          ">


            {/* =================================================
                Welcome Section
            ================================================= */}

            <motion.section
              {...pageAnimation}
              className="mb-10"
            >

              <div className="
                mb-3
                flex
                items-center
                gap-2
              ">

                <span className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-cyan-400
                  shadow-[0_0_12px_rgba(34,211,238,0.8)]
                " />

                <p className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-cyan-400
                ">
                  AI Career Workspace
                </p>

              </div>


              <h1 className="
                text-3xl
                font-bold
                tracking-tight
                text-white
                sm:text-4xl
                lg:text-5xl
              ">

                👋 Welcome back,{" "}

                <span className="
                  bg-gradient-to-r
                  from-cyan-300
                  via-cyan-400
                  to-blue-400
                  bg-clip-text
                  text-transparent
                ">
                  {user?.name || "there"}
                </span>

              </h1>


              <p className="
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-gray-400
                sm:text-base
              ">
                Your AI Career Coach is ready. Upload your
                resume to build your personalized career
                profile.
              </p>

            </motion.section>


            {/* =================================================
                Resume Upload
            ================================================= */}

            <ProfileCard>

              <div className="
                p-6
                sm:p-8
                lg:p-10
              ">

                <div className="
                  mb-8
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                ">

                  <div>

                    <div className="
                      mb-4
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-cyan-400/20
                      bg-cyan-400/[0.08]
                      text-cyan-300
                      shadow-[0_0_30px_rgba(34,211,238,0.06)]
                    ">
                      <Sparkles className="h-5 w-5" />
                    </div>


                    <h2 className="
                      text-2xl
                      font-semibold
                      tracking-tight
                      text-white
                    ">
                      Build your AI career profile
                    </h2>


                    <p className="
                      mt-2
                      max-w-2xl
                      text-sm
                      leading-6
                      text-gray-400
                    ">
                      Upload your latest resume and
                      NotunPath will extract your skills,
                      projects, education, experience,
                      and career signals.
                    </p>

                  </div>


                  {analysis && (
                    <div className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-2
                      self-start
                      rounded-full
                      border
                      border-emerald-400/20
                      bg-emerald-400/[0.06]
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-emerald-300
                    ">

                      <CheckCircle2 className="h-3.5 w-3.5" />

                      Profile generated

                    </div>
                  )}

                </div>


                <ResumeUpload
                  onUploadSuccess={
                    handleResumeUploadSuccess
                  }
                />

              </div>

            </ProfileCard>


            {/* =================================================
                AI Career Profile
            ================================================= */}

            <AnimatePresence mode="wait">

              {analysis && (

                <motion.div
                  key={resumeResult?.resume_id || "profile"}
                  initial={
                    prefersReducedMotion
                      ? {
                          opacity: 0,
                        }
                      : {
                          opacity: 0,
                          y: 20,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: "easeOut",
                  }}
                  className="mt-10 space-y-6"
                >


                  {/* =================================================
                      Profile Hero
                  ================================================= */}

                  <ProfileCard
                    className="
                      relative
                      overflow-hidden
                    "
                    delay={0.05}
                  >

                    {/* Ambient glow */}

                    <div className="
                      pointer-events-none
                      absolute
                      -right-24
                      -top-24
                      h-72
                      w-72
                      rounded-full
                      bg-cyan-400/[0.08]
                      blur-3xl
                    " />


                    <div className="
                      pointer-events-none
                      absolute
                      -bottom-32
                      left-1/3
                      h-64
                      w-64
                      rounded-full
                      bg-blue-500/[0.05]
                      blur-3xl
                    " />


                    <div className="
                      relative
                      p-6
                      sm:p-8
                      lg:p-10
                    ">

                      <div className="
                        flex
                        flex-col
                        gap-7
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                      ">

                        {/* Identity */}

                        <div className="
                          flex
                          min-w-0
                          items-center
                          gap-5
                        ">

                          <div className="
                            flex
                            h-16
                            w-16
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-cyan-400/20
                            bg-gradient-to-br
                            from-cyan-400/15
                            to-blue-500/10
                            text-xl
                            font-bold
                            text-cyan-300
                            shadow-[0_0_35px_rgba(34,211,238,0.08)]
                            sm:h-20
                            sm:w-20
                            sm:text-2xl
                          ">

                            {(
                              personalInformation?.full_name ||
                              user?.name ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>


                          <div className="min-w-0">

                            <p className="
                              mb-1
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.18em]
                              text-cyan-400
                            ">
                              AI Career Profile
                            </p>


                            <h2 className="
                              truncate
                              text-2xl
                              font-bold
                              tracking-tight
                              text-white
                              sm:text-3xl
                            ">
                              {personalInformation?.full_name ||
                                user?.name ||
                                "Your Profile"}
                            </h2>


                            {hasValue(
                              analysis.professional_summary,
                            ) && (

                              <p className="
                                mt-2
                                max-w-2xl
                                text-sm
                                leading-6
                                text-gray-400
                              ">
                                {analysis.professional_summary}
                              </p>

                            )}

                          </div>

                        </div>


                        {/* Status */}

                        <div className="
                          flex
                          shrink-0
                          items-center
                          gap-2
                          self-start
                          rounded-full
                          border
                          border-emerald-400/20
                          bg-emerald-400/[0.06]
                          px-4
                          py-2
                          text-sm
                          text-emerald-300
                          lg:self-center
                        ">

                          <span className="
                            h-2
                            w-2
                            rounded-full
                            bg-emerald-400
                            shadow-[0_0_10px_rgba(52,211,153,0.8)]
                          " />

                          AI analysis complete

                        </div>

                      </div>


                      {/* Contact Information */}

                      {personalInformation && (
                        <div className="
                          mt-8
                          flex
                          flex-wrap
                          gap-3
                        ">

                          {hasValue(
                            personalInformation.email,
                          ) && (

                            <div className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-white/10
                              bg-white/[0.025]
                              px-3
                              py-2
                              text-xs
                              text-gray-400
                            ">

                              <Mail className="
                                h-3.5
                                w-3.5
                                text-cyan-400
                              " />

                              {personalInformation.email}

                            </div>

                          )}


                          {hasValue(
                            personalInformation.phone,
                          ) && (

                            <div className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-white/10
                              bg-white/[0.025]
                              px-3
                              py-2
                              text-xs
                              text-gray-400
                            ">

                              <Phone className="
                                h-3.5
                                w-3.5
                                text-cyan-400
                              " />

                              {personalInformation.phone}

                            </div>

                          )}


                          {hasValue(
                            personalInformation.location,
                          ) && (

                            <div className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-white/10
                              bg-white/[0.025]
                              px-3
                              py-2
                              text-xs
                              text-gray-400
                            ">

                              <MapPin className="
                                h-3.5
                                w-3.5
                                text-cyan-400
                              " />

                              {personalInformation.location}

                            </div>

                          )}

                        </div>
                      )}

                    </div>

                  </ProfileCard>


                  {/* =================================================
                      Quick Stats
                  ================================================= */}

                  <div className="
                    grid
                    grid-cols-2
                    gap-4
                    lg:grid-cols-4
                  ">

                    {[
                      {
                        label: "Skills",
                        value: skills.length,
                        icon: Code2,
                      },
                      {
                        label: "Projects",
                        value: projects.length,
                        icon: BriefcaseBusiness,
                      },
                      {
                        label: "Target Roles",
                        value: targetRoles.length,
                        icon: Target,
                      },
                      {
                        label: "Education",
                        value: education.length,
                        icon: GraduationCap,
                      },
                    ].map((stat, index) => {

                      const Icon = stat.icon;

                      return (
                        <motion.div
                          key={stat.label}
                          initial={{
                            opacity: 0,
                            y: 12,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay:
                              prefersReducedMotion
                                ? 0
                                : 0.08 + index * 0.05,
                            duration: 0.3,
                          }}
                          className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/[0.025]
                            p-5
                          "
                        >

                          <div className="
                            mb-4
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-cyan-400/[0.08]
                            text-cyan-300
                          ">

                            <Icon className="h-4 w-4" />

                          </div>


                          <p className="
                            text-2xl
                            font-bold
                            text-white
                          ">
                            {stat.value}
                          </p>


                          <p className="
                            mt-1
                            text-xs
                            text-gray-500
                          ">
                            {stat.label}
                          </p>

                        </motion.div>
                      );

                    })}

                  </div>


                  {/* =================================================
                      Target Roles
                  ================================================= */}

                  {targetRoles.length > 0 && (

                    <ProfileCard delay={0.1}>

                      <div className="p-6 sm:p-8">

                        <SectionHeader
                          icon={Target}
                          eyebrow="Career Direction"
                          title="Target roles"
                          count={`${targetRoles.length} roles`}
                        />


                        <div className="
                          flex
                          flex-wrap
                          gap-3
                        ">

                          {targetRoles.map(
                            (role, index) => (

                              <motion.div
                                key={`${role}-${index}`}
                                whileHover={
                                  prefersReducedMotion
                                    ? undefined
                                    : {
                                        y: -2,
                                      }
                                }
                                className="
                                  group
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-cyan-400/15
                                  bg-cyan-400/[0.05]
                                  px-4
                                  py-3
                                  text-sm
                                  font-medium
                                  text-cyan-200
                                  transition-colors
                                  hover:border-cyan-400/30
                                  hover:bg-cyan-400/[0.08]
                                "
                              >

                                <Sparkles className="
                                  h-3.5
                                  w-3.5
                                  text-cyan-400
                                " />

                                {role}

                              </motion.div>

                            ),
                          )}

                        </div>

                      </div>

                    </ProfileCard>

                  )}


                  {/* =================================================
                      Skills
                  ================================================= */}

                  {skills.length > 0 && (

                    <ProfileCard delay={0.12}>

                      <div className="p-6 sm:p-8">

                        <SectionHeader
                          icon={Code2}
                          eyebrow="Technical Profile"
                          title="Skills & technologies"
                          count={`${skills.length} skills`}
                        />


                        <div className="
                          flex
                          flex-wrap
                          gap-2.5
                        ">

                          {skills.map(
                            (skill, index) => (

                              <motion.span
                                key={`${skill}-${index}`}
                                initial={{
                                  opacity: 0,
                                  scale: 0.96,
                                }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                }}
                                transition={{
                                  delay:
                                    prefersReducedMotion
                                      ? 0
                                      : 0.02 * index,
                                }}
                                className="
                                  rounded-lg
                                  border
                                  border-white/10
                                  bg-white/[0.035]
                                  px-3
                                  py-2
                                  text-xs
                                  font-medium
                                  text-gray-300
                                  transition
                                  hover:border-cyan-400/20
                                  hover:bg-cyan-400/[0.05]
                                  hover:text-cyan-200
                                "
                              >
                                {skill}
                              </motion.span>

                            ),
                          )}

                        </div>

                      </div>

                    </ProfileCard>

                  )}


                  {/* =================================================
                      Projects
                  ================================================= */}

                  {projects.length > 0 && (

                    <ProfileCard delay={0.14}>

                      <div className="p-6 sm:p-8">

                        <SectionHeader
                          icon={BriefcaseBusiness}
                          eyebrow="Portfolio"
                          title="Projects"
                          count={`${projects.length} projects`}
                        />


                        <div className="
                          grid
                          gap-4
                          lg:grid-cols-2
                        ">

                          {projects.map(
                            (project, index) => {

                              if (
                                typeof project !==
                                "object"
                              ) {
                                return null;
                              }

                              const title =
                                project.title ||
                                project.name;

                              const technologies =
                                cleanArray(
                                  project.technologies ||
                                  project.tech_stack,
                                );

                              const description =
                                project.description;


                              return (
                                <motion.article
                                  key={
                                    `${title || "project"}-${index}`
                                  }
                                  whileHover={
                                    prefersReducedMotion
                                      ? undefined
                                      : {
                                          y: -3,
                                        }
                                  }
                                  className="
                                    group
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-black/10
                                    p-5
                                    transition
                                    hover:border-cyan-400/20
                                  "
                                >

                                  <div className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-4
                                  ">

                                    <div className="
                                      flex
                                      min-w-0
                                      items-center
                                      gap-3
                                    ">

                                      <div className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-cyan-400/[0.08]
                                        text-cyan-300
                                      ">

                                        <Code2 className="
                                          h-4
                                          w-4
                                        " />

                                      </div>


                                      <h4 className="
                                        truncate
                                        font-semibold
                                        text-white
                                      ">
                                        {title ||
                                          "Project"}
                                      </h4>

                                    </div>


                                    <ChevronRight className="
                                      h-4
                                      w-4
                                      shrink-0
                                      text-gray-600
                                      transition
                                      group-hover:translate-x-0.5
                                      group-hover:text-cyan-400
                                    " />

                                  </div>


                                  {hasValue(
                                    description,
                                  ) && (

                                    <p className="
                                      mt-4
                                      text-sm
                                      leading-6
                                      text-gray-400
                                    ">
                                      {Array.isArray(
                                        description,
                                      )
                                        ? description.join(
                                            " ",
                                          )
                                        : description}
                                    </p>

                                  )}


                                  {technologies.length >
                                    0 && (

                                    <div className="
                                      mt-5
                                      flex
                                      flex-wrap
                                      gap-2
                                    ">

                                      {technologies.map(
                                        (
                                          technology,
                                          techIndex,
                                        ) => (

                                          <span
                                            key={
                                              `${technology}-${techIndex}`
                                            }
                                            className="
                                              rounded-md
                                              bg-white/[0.04]
                                              px-2.5
                                              py-1.5
                                              text-[11px]
                                              text-gray-400
                                            "
                                          >
                                            {technology}
                                          </span>

                                        ),
                                      )}

                                    </div>

                                  )}

                                </motion.article>
                              );

                            },
                          )}

                        </div>

                      </div>

                    </ProfileCard>

                  )}


                  {/* =================================================
                      Education
                  ================================================= */}

                  {education.length > 0 && (

                    <ProfileCard delay={0.16}>

                      <div className="p-6 sm:p-8">

                        <SectionHeader
                          icon={GraduationCap}
                          eyebrow="Academic Background"
                          title="Education"
                          count={`${education.length} entries`}
                        />


                        <div className="
                          space-y-4
                        ">

                          {education.map(
                            (item, index) => {

                              if (
                                typeof item !==
                                "object"
                              ) {
                                return null;
                              }


                              return (
                                <div
                                  key={`education-${index}`}
                                  className="
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-black/10
                                    p-5
                                  "
                                >

                                  <div className="
                                    flex
                                    flex-col
                                    gap-3
                                    sm:flex-row
                                    sm:items-start
                                    sm:justify-between
                                  ">

                                    <div>

                                      {hasValue(
                                        item.degree,
                                      ) && (

                                        <h4 className="
                                          font-semibold
                                          text-white
                                        ">
                                          {item.degree}
                                        </h4>

                                      )}


                                      {hasValue(
                                        item.institution,
                                      ) && (

                                        <p className="
                                          mt-1
                                          text-sm
                                          text-cyan-300/80
                                        ">
                                          {
                                            item.institution
                                          }
                                        </p>

                                      )}

                                    </div>


                                    {hasValue(
                                      item.dates,
                                    ) && (

                                      <span className="
                                        shrink-0
                                        rounded-lg
                                        border
                                        border-white/10
                                        px-3
                                        py-1.5
                                        text-xs
                                        text-gray-400
                                      ">
                                        {item.dates}
                                      </span>

                                    )}

                                  </div>


                                  {hasValue(
                                    item.cgpa,
                                  ) && (

                                    <p className="
                                      mt-4
                                      text-xs
                                      text-gray-500
                                    ">
                                      Result:{" "}
                                      <span className="
                                        text-gray-300
                                      ">
                                        {item.cgpa}
                                      </span>
                                    </p>

                                  )}

                                </div>
                              );

                            },
                          )}

                        </div>

                      </div>

                    </ProfileCard>

                  )}


                  {/* =================================================
                      Experience
                  ================================================= */}

                  {workExperience.length > 0 && (

                    <ProfileCard delay={0.18}>

                      <div className="p-6 sm:p-8">

                        <SectionHeader
                          icon={BriefcaseBusiness}
                          eyebrow="Professional Journey"
                          title="Work experience"
                          count={`${workExperience.length} roles`}
                        />


                        <div className="space-y-4">

                          {workExperience.map(
                            (experience, index) => {

                              if (
                                typeof experience !==
                                "object"
                              ) {
                                return null;
                              }


                              return (
                                <div
                                  key={`experience-${index}`}
                                  className="
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-black/10
                                    p-5
                                  "
                                >

                                  <div className="
                                    flex
                                    flex-col
                                    gap-2
                                    sm:flex-row
                                    sm:items-start
                                    sm:justify-between
                                  ">

                                    <div>

                                      {hasValue(
                                        experience.job_title,
                                      ) && (

                                        <h4 className="
                                          font-semibold
                                          text-white
                                        ">
                                          {
                                            experience.job_title
                                          }
                                        </h4>

                                      )}


                                      {hasValue(
                                        experience.company,
                                      ) && (

                                        <p className="
                                          mt-1
                                          text-sm
                                          text-cyan-300
                                        ">
                                          {
                                            experience.company
                                          }
                                        </p>

                                      )}

                                    </div>


                                    {hasValue(
                                      experience.dates,
                                    ) && (

                                      <span className="
                                        text-xs
                                        text-gray-500
                                      ">
                                        {
                                          experience.dates
                                        }
                                      </span>

                                    )}

                                  </div>


                                  {hasValue(
                                    experience.description,
                                  ) && (

                                    <p className="
                                      mt-4
                                      text-sm
                                      leading-6
                                      text-gray-400
                                    ">
                                      {
                                        experience.description
                                      }
                                    </p>

                                  )}

                                </div>
                              );

                            },
                          )}

                        </div>

                      </div>

                    </ProfileCard>

                  )}


                  {/* =================================================
                      Certifications + Languages
                  ================================================= */}

                  {(certifications.length > 0 ||
                    languages.length > 0) && (

                    <div className="
                      grid
                      gap-6
                      lg:grid-cols-2
                    ">


                      {/* Certifications */}

                      {certifications.length > 0 && (

                        <ProfileCard delay={0.2}>

                          <div className="p-6 sm:p-8">

                            <SectionHeader
                              icon={Award}
                              eyebrow="Credentials"
                              title="Certifications"
                              count={
                                `${certifications.length}`
                              }
                            />


                            <div className="space-y-3">

                              {certifications.map(
                                (certification, index) => {

                                  if (
                                    typeof certification !==
                                    "object"
                                  ) {
                                    return null;
                                  }


                                  return (
                                    <div
                                      key={
                                        `certification-${index}`
                                      }
                                      className="
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-black/10
                                        p-4
                                      "
                                    >

                                      {hasValue(
                                        certification.title,
                                      ) && (

                                        <p className="
                                          text-sm
                                          font-medium
                                          text-white
                                        ">
                                          {
                                            certification.title
                                          }
                                        </p>

                                      )}


                                      {hasValue(
                                        certification.issuer,
                                      ) && (

                                        <p className="
                                          mt-1
                                          text-xs
                                          text-cyan-300/80
                                        ">
                                          {
                                            certification.issuer
                                          }
                                        </p>

                                      )}


                                      {hasValue(
                                        certification.dates,
                                      ) && (

                                        <p className="
                                          mt-2
                                          text-[11px]
                                          text-gray-500
                                        ">
                                          {
                                            certification.dates
                                          }
                                        </p>

                                      )}

                                    </div>
                                  );

                                },
                              )}

                            </div>

                          </div>

                        </ProfileCard>

                      )}


                      {/* Languages */}

                      {languages.length > 0 && (

                        <ProfileCard delay={0.22}>

                          <div className="p-6 sm:p-8">

                            <SectionHeader
                              icon={Languages}
                              eyebrow="Communication"
                              title="Languages"
                              count={`${languages.length}`}
                            />


                            <div className="
                              flex
                              flex-wrap
                              gap-2.5
                            ">

                              {languages.map(
                                (language, index) => (

                                  <span
                                    key={
                                      `${language}-${index}`
                                    }
                                    className="
                                      rounded-xl
                                      border
                                      border-white/10
                                      bg-white/[0.035]
                                      px-4
                                      py-2.5
                                      text-sm
                                      text-gray-300
                                    "
                                  >
                                    {language}
                                  </span>

                                ),
                              )}

                            </div>

                          </div>

                        </ProfileCard>

                      )}

                    </div>

                  )}


                  {/* =================================================
                      Footer / Resume ID
                  ================================================= */}

                  {hasValue(
                    resumeResult?.resume_id,
                  ) && (

                    <div className="
                      flex
                      flex-col
                      gap-2
                      border-t
                      border-white/5
                      pt-6
                      text-xs
                      text-gray-600
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    ">

                      <span>
                        Powered by NotunPath AI Career Engine
                      </span>

                      <span>
                        Resume ID:{" "}
                        {resumeResult.resume_id}
                      </span>

                    </div>

                  )}

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