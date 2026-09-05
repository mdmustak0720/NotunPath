/**
 * Profile
 *
 * Purpose:
 * Displays the authenticated user's persistent
 * AI-generated career profile.
 *
 * Resume history is available through a dedicated
 * side panel instead of occupying the main profile page.
 */

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  Archive,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  History,
  Languages,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Target,
  UserRound,
  X,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import useAuthStore from "../store/authStore";

import {
  getLatestResume,
  getResumeHistory,
} from "../services/resumeService";


// =========================================================
// Profile
// =========================================================

function Profile() {

  // =======================================================
  // Authentication
  // =======================================================

  const {
    user,
    token,
  } = useAuthStore();


  // =======================================================
  // Resume State
  // =======================================================

  const [resume, setResume] = useState(null);

  const [resumeHistory, setResumeHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [isHistoryOpen, setIsHistoryOpen] =
    useState(false);


  // =======================================================
  // Load Profile
  // =======================================================

  const loadProfile = useCallback(
    async () => {

      try {

        setLoading(true);
        setHistoryLoading(true);
        setError(null);


        // ---------------------------------------------------
        // Validate authentication
        // ---------------------------------------------------

        if (!token) {

          throw new Error(
            "Authentication token is missing.",
          );

        }


        // ---------------------------------------------------
        // Load latest resume + history
        // ---------------------------------------------------

        const [
          latestResponse,
          historyResponse,
        ] = await Promise.all([

          getLatestResume(token),

          getResumeHistory(token),

        ]);


        // ---------------------------------------------------
        // Store latest resume
        // ---------------------------------------------------

        setResume(
          latestResponse,
        );


        // ---------------------------------------------------
        // Store resume history
        // ---------------------------------------------------

        setResumeHistory(
          historyResponse?.history || [],
        );

      } catch (error) {

        console.error(
          "Failed to load profile:",
          error,
        );


        // ---------------------------------------------------
        // Handle no resume
        // ---------------------------------------------------

        if (
          error?.response?.status === 404
        ) {

          setError(
            "You haven't uploaded a resume yet.",
          );

        } else {

          setError(
            "Unable to load your career profile.",
          );

        }

      } finally {

        setLoading(false);
        setHistoryLoading(false);

      }

    },
    [token],
  );


  // =======================================================
  // Initial Load
  // =======================================================

  useEffect(() => {

    loadProfile();

  }, [loadProfile]);


  // =======================================================
  // Loading State
  // =======================================================

  if (loading) {

    return <ProfileLoading />;

  }


  // =======================================================
  // Error State
  // =======================================================

  if (
    error ||
    !resume?.analysis
  ) {

    return (
      <ProfileState
        error={error}
        onRetry={loadProfile}
      />
    );

  }


  // =======================================================
  // Resume Analysis
  // =======================================================

  const analysis =
    resume.analysis;


  const personal =
    analysis.personal_information || {};


  const skills =
    analysis.skills || [];


  const targetRoles =
    analysis.target_roles || [];


  const projects =
    analysis.projects || [];


  const education =
    analysis.education || [];


  const certifications =
    analysis.certifications || [];


  const languages =
    analysis.languages || [];


  const workExperience =
    analysis.work_experience || [];


  const internships =
    analysis.internships || [];


  const achievements =
    analysis.achievements || [];


  // =======================================================
  // Profile Identity
  // =======================================================

  const displayName =
    personal.full_name ||
    user?.name ||
    "Your Profile";


  const initials =
    getInitials(displayName);


  // =======================================================
  // Resume Metadata
  // =======================================================

  const currentVersion =
    resume?.version || 1;


  const updatedAt =
    resume?.updated_at ||
    resume?.created_at;


  // =======================================================
  // Render
  // =======================================================

  return (

    <div
      className="
        flex
        min-h-screen
        min-w-0
        overflow-x-hidden
        bg-[#030712]
        text-white
      "
    >

      {/* =================================================
          Sidebar
      ================================================== */}

      <Sidebar />


      {/* =================================================
          Main Workspace
      ================================================== */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
        "
      >

        {/* =================================================
            Navbar
        ================================================== */}

        <Navbar />


        {/* =================================================
            Main Content
        ================================================== */}

        <main
          className="
            min-w-0
            flex-1
            p-4
            sm:p-6
            lg:p-10
          "
        >

          <div
            className="
              mx-auto
              w-full
              max-w-7xl
            "
          >


            {/* =================================================
                Page Header
            ================================================= */}

            <section className="mb-8">

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >

                {/* AI Career Profile */}

                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-cyan-400/20
                    bg-cyan-400/5
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-cyan-300
                  "
                >

                  <UserRound size={13} />

                  AI Career Profile

                </span>


                {/* Profile Active */}

                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-emerald-400/20
                    bg-emerald-400/5
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-emerald-300
                  "
                >

                  <CheckCircle2 size={13} />

                  Profile active

                </span>

              </div>


              <h1
                className="
                  mt-4
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                  sm:text-4xl
                "
              >
                Your Professional Profile
              </h1>


              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-6
                  text-gray-400
                "
              >
                Your latest resume analysis is stored
                securely and used as the foundation of
                your NotunPath career profile.
              </p>

            </section>


            {/* =================================================
                Profile Hero
            ================================================== */}

            <section
              className="
                relative
                overflow-hidden
                rounded-[2rem]
                border
                border-white/10
                bg-gradient-to-br
                from-cyan-500/[0.08]
                via-white/[0.035]
                to-transparent
                p-5
                shadow-2xl
                sm:p-6
                lg:p-8
              "
            >

              {/* Decorative glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-24
                  -top-28
                  h-72
                  w-72
                  rounded-full
                  bg-cyan-500/10
                  blur-3xl
                "
              />


              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-32
                  -left-20
                  h-64
                  w-64
                  rounded-full
                  bg-blue-500/5
                  blur-3xl
                "
              />


              {/* =================================================
                  Hero Content
              ================================================== */}

              <div
                className="
                  relative
                  flex
                  flex-col
                  gap-6
                  lg:flex-row
                  lg:items-start
                  lg:justify-between
                "
              >


                {/* =================================================
                    Identity
                ================================================== */}

                <div
                  className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-start
                  "
                >

                  {/* Avatar */}

                  <div
                    className="
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-cyan-400/20
                      bg-cyan-400/10
                      text-lg
                      font-bold
                      text-cyan-300
                      shadow-lg
                      shadow-cyan-950/20
                      sm:h-20
                      sm:w-20
                      sm:text-2xl
                    "
                  >
                    {initials}
                  </div>


                  {/* Identity Information */}

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-cyan-400
                      "
                    >
                      Career Profile
                    </p>


                    <h2
                      className="
                        mt-1
                        break-words
                        text-xl
                        font-bold
                        leading-tight
                        tracking-tight
                        text-white
                        sm:text-3xl
                      "
                    >
                      {displayName}
                    </h2>


                    {analysis.professional_summary && (

                      <p
                        className="
                          mt-3
                          max-w-3xl
                          text-sm
                          leading-7
                          text-gray-400
                          sm:text-base
                        "
                      >
                        {analysis.professional_summary}
                      </p>

                    )}

                  </div>

                </div>


                {/* =================================================
                    Status + History
                ================================================== */}

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >

                  {/* Current Version */}

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-cyan-400/20
                      bg-cyan-400/5
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-cyan-300
                    "
                  >

                    <span
                      className="
                        flex
                        h-5
                        min-w-5
                        items-center
                        justify-center
                        rounded-md
                        bg-cyan-400/10
                        px-1
                        text-[10px]
                        font-bold
                      "
                    >
                      V{currentVersion}
                    </span>

                    Current resume

                  </span>


                  {/* AI Status */}

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-emerald-400/20
                      bg-emerald-400/5
                      px-3
                      py-2
                      text-xs
                      font-medium
                      text-emerald-300
                    "
                  >

                    <span
                      className="
                        h-2
                        w-2
                        rounded-full
                        bg-emerald-400
                        shadow-[0_0_10px_rgba(52,211,153,0.7)]
                      "
                    />

                    AI analysis complete

                  </span>


                  {/* History Button */}

                  <button
                    type="button"
                    onClick={() =>
                      setIsHistoryOpen(true)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.03]
                      px-3
                      py-2
                      text-xs
                      font-medium
                      text-gray-300
                      transition
                      hover:border-cyan-400/20
                      hover:bg-cyan-400/5
                      hover:text-cyan-300
                      focus:outline-none
                      focus:ring-2
                      focus:ring-cyan-400/30
                    "
                  >

                    <History size={14} />

                    View history

                    <span className="text-gray-500">
                      ({resumeHistory.length})
                    </span>

                  </button>

                </div>

              </div>


              {/* =================================================
                  Contact Information
              ================================================== */}

              <div
                className="
                  relative
                  mt-7
                  flex
                  flex-col
                  gap-2
                  border-t
                  border-white/5
                  pt-6
                  sm:flex-row
                  sm:flex-wrap
                "
              >

                {personal.email && (

                  <ContactItem
                    icon={<Mail size={14} />}
                    value={personal.email}
                  />

                )}


                {personal.phone && (

                  <ContactItem
                    icon={<Phone size={14} />}
                    value={personal.phone}
                  />

                )}


                {personal.location && (

                  <ContactItem
                    icon={<MapPin size={14} />}
                    value={personal.location}
                  />

                )}


                {personal.linkedin && (

                  <ContactLink
                    icon={<ExternalLink size={14} />}
                    label="LinkedIn"
                    href={personal.linkedin}
                  />

                )}


                {personal.github && (

                  <ContactLink
                    icon={<ExternalLink size={14} />}
                    label="GitHub"
                    href={personal.github}
                  />

                )}


                {personal.portfolio && (

                  <ContactLink
                    icon={<ExternalLink size={14} />}
                    label="Portfolio"
                    href={personal.portfolio}
                  />

                )}

              </div>


              {/* =================================================
                  Resume Metadata
              ================================================== */}

              <div
                className="
                  relative
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  border-t
                  border-white/5
                  pt-5
                "
              >

                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-white/[0.03]
                    px-3
                    py-1.5
                    text-xs
                    text-gray-500
                  "
                >

                  Resume version

                  <span
                    className="
                      font-semibold
                      text-gray-300
                    "
                  >
                    V{currentVersion}
                  </span>

                </span>


                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-white/[0.03]
                    px-3
                    py-1.5
                    text-xs
                    text-gray-500
                  "
                >

                  Updated

                  <span
                    className="
                      font-medium
                      text-gray-300
                    "
                  >
                    {formatResumeDate(updatedAt)}
                  </span>

                </span>

              </div>

            </section>


            {/* =================================================
                Profile Statistics
            ================================================== */}

            <section
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
                sm:gap-4
                lg:grid-cols-4
              "
            >

              <StatCard
                icon={<Code2 size={18} />}
                value={skills.length}
                label="Skills"
              />


              <StatCard
                icon={<FolderKanban size={18} />}
                value={projects.length}
                label="Projects"
              />


              <StatCard
                icon={<Target size={18} />}
                value={targetRoles.length}
                label="Target Roles"
              />


              <StatCard
                icon={<GraduationCap size={18} />}
                value={education.length}
                label="Education"
              />

            </section>


            {/* =================================================
                Target Roles
            ================================================== */}

            {targetRoles.length > 0 && (

              <ProfileSection
                icon={<Target size={18} />}
                eyebrow="Career Direction"
                title="Target Roles"
                count={`${targetRoles.length} roles`}
              >

                <div
                  className="
                    grid
                    gap-3
                    sm:grid-cols-2
                    lg:grid-cols-3
                  "
                >

                  {targetRoles.map(
                    (role, index) => (

                      <div
                        key={`${role}-${index}`}
                        className="
                          group
                          rounded-2xl
                          border
                          border-cyan-400/10
                          bg-cyan-400/[0.04]
                          p-4
                          transition
                          duration-200
                          hover:-translate-y-0.5
                          hover:border-cyan-400/25
                          hover:bg-cyan-400/[0.07]
                        "
                      >

                        <div
                          className="
                            mb-3
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-cyan-400/10
                            text-cyan-400
                          "
                        >
                          <BriefcaseBusiness size={17} />
                        </div>


                        <p
                          className="
                            text-sm
                            font-semibold
                            text-white
                          "
                        >
                          {role}
                        </p>


                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-500
                          "
                        >
                          Target career direction
                        </p>

                      </div>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* =================================================
                Skills
            ================================================== */}

            {skills.length > 0 && (

              <ProfileSection
                icon={<Code2 size={18} />}
                eyebrow="Technical Profile"
                title="Skills & Technologies"
                count={`${skills.length} skills`}
              >

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {skills.map(
                    (skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                        className="
                          max-w-full
                          break-words
                          rounded-xl
                          border
                          border-white/10
                          bg-white/[0.035]
                          px-3
                          py-2
                          text-xs
                          text-gray-300
                          transition
                          hover:border-cyan-400/25
                          hover:bg-cyan-400/5
                          hover:text-cyan-300
                          sm:text-sm
                        "
                      >
                        {skill}
                      </span>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* =================================================
                Projects
            ================================================== */}

            {projects.length > 0 && (

              <ProfileSection
                icon={<FolderKanban size={18} />}
                eyebrow="Portfolio"
                title="Projects"
                count={`${projects.length} projects`}
              >

                <div
                  className="
                    grid
                    gap-4
                    lg:grid-cols-2
                  "
                >

                  {projects.map(
                    (project, index) => (

                      <article
                        key={`${project.title}-${index}`}
                        className="
                          group
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/10
                          p-5
                          transition
                          duration-200
                          hover:-translate-y-0.5
                          hover:border-cyan-400/20
                          hover:bg-white/[0.025]
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          "
                        >

                          <h3
                            className="
                              text-base
                              font-semibold
                              leading-6
                              text-white
                              sm:text-lg
                            "
                          >
                            {project.title ||
                              "Untitled Project"}
                          </h3>


                          <FolderKanban
                            size={17}
                            className="
                              shrink-0
                              text-cyan-400/60
                            "
                          />

                        </div>


                        {project.technologies?.length > 0 && (

                          <div
                            className="
                              mt-4
                              flex
                              flex-wrap
                              gap-1.5
                            "
                          >

                            {project.technologies.map(
                              (
                                technology,
                                techIndex,
                              ) => (

                                <span
                                  key={`${technology}-${techIndex}`}
                                  className="
                                    rounded-lg
                                    border
                                    border-cyan-400/10
                                    bg-cyan-400/5
                                    px-2.5
                                    py-1
                                    text-[11px]
                                    font-medium
                                    text-cyan-300
                                  "
                                >
                                  {technology}
                                </span>

                              ),
                            )}

                          </div>

                        )}


                        {project.description && (

                          <p
                            className="
                              mt-4
                              text-sm
                              leading-6
                              text-gray-400
                            "
                          >
                            {project.description}
                          </p>

                        )}

                      </article>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* =================================================
                Work Experience
            ================================================== */}

            {workExperience.length > 0 && (

              <ProfileSection
                icon={<BriefcaseBusiness size={18} />}
                eyebrow="Professional Background"
                title="Work Experience"
                count={`${workExperience.length} roles`}
              >

                <div className="space-y-4">

                  {workExperience.map(
                    (
                      experience,
                      index,
                    ) => (

                      <article
                        key={`${experience.company}-${index}`}
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/10
                          p-5
                        "
                      >

                        <div
                          className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                          "
                        >

                          <div>

                            <h3
                              className="
                                text-base
                                font-semibold
                                text-white
                              "
                            >
                              {experience.job_title}
                            </h3>


                            <p
                              className="
                                mt-1
                                text-sm
                                text-cyan-300
                              "
                            >
                              {experience.company}
                            </p>

                          </div>


                          {experience.dates && (

                            <span
                              className="
                                w-fit
                                rounded-lg
                                bg-white/5
                                px-3
                                py-1.5
                                text-xs
                                text-gray-400
                              "
                            >
                              {experience.dates}
                            </span>

                          )}

                        </div>


                        {experience.location && (

                          <p
                            className="
                              mt-3
                              flex
                              items-center
                              gap-2
                              text-xs
                              text-gray-500
                            "
                          >

                            <MapPin size={13} />

                            {experience.location}

                          </p>

                        )}


                        {experience.description && (

                          <p
                            className="
                              mt-4
                              text-sm
                              leading-6
                              text-gray-400
                            "
                          >
                            {experience.description}
                          </p>

                        )}

                      </article>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* =================================================
                Internships
            ================================================== */}

            {internships.length > 0 && (

              <ProfileSection
                icon={<BriefcaseBusiness size={18} />}
                eyebrow="Early Career"
                title="Internships"
                count={`${internships.length}`}
              >

                <div className="space-y-3">

                  {internships.map(
                    (
                      internship,
                      index,
                    ) => (

                      <div
                        key={`${internship}-${index}`}
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/10
                          p-4
                          text-sm
                          leading-6
                          text-gray-300
                        "
                      >

                        {typeof internship === "string"
                          ? internship
                          : JSON.stringify(
                              internship,
                            )}

                      </div>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* =================================================
                Education
            ================================================== */}

            {education.length > 0 && (

              <ProfileSection
                icon={<GraduationCap size={18} />}
                eyebrow="Academic Background"
                title="Education"
                count={`${education.length} entries`}
              >

                <div className="space-y-4">

                  {education.map(
                    (
                      item,
                      index,
                    ) => (

                      <article
                        key={`${item.degree}-${index}`}
                        className="
                          relative
                          overflow-hidden
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/10
                          p-5
                        "
                      >

                        <div
                          className="
                            absolute
                            left-0
                            top-0
                            h-full
                            w-0.5
                            bg-cyan-400/40
                          "
                        />


                        <div className="pl-2">

                          <h3
                            className="
                              text-base
                              font-semibold
                              text-white
                            "
                          >
                            {item.degree}
                          </h3>


                          {item.institution && (

                            <p
                              className="
                                mt-2
                                text-sm
                                text-gray-400
                              "
                            >
                              {item.institution}
                            </p>

                          )}


                          <div
                            className="
                              mt-4
                              flex
                              flex-wrap
                              gap-2
                            "
                          >

                            {item.dates && (

                              <span
                                className="
                                  rounded-lg
                                  bg-white/5
                                  px-3
                                  py-1.5
                                  text-xs
                                  text-gray-400
                                "
                              >
                                {item.dates}
                              </span>

                            )}


                            {item.cgpa && (

                              <span
                                className="
                                  rounded-lg
                                  border
                                  border-cyan-400/10
                                  bg-cyan-400/5
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-medium
                                  text-cyan-300
                                "
                              >
                                {item.cgpa}
                              </span>

                            )}

                          </div>

                        </div>

                      </article>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* =================================================
                Certifications + Languages
            ================================================== */}

            <div
              className="
                mt-5
                grid
                gap-5
                lg:grid-cols-2
              "
            >

              {certifications.length > 0 && (

                <ProfileSection
                  icon={<Award size={18} />}
                  eyebrow="Credentials"
                  title="Certifications"
                  count={`${certifications.length}`}
                >

                  <div className="space-y-3">

                    {certifications.map(
                      (
                        certification,
                        index,
                      ) => (

                        <div
                          key={`${certification.title}-${index}`}
                          className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-black/10
                            p-4
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-semibold
                              text-white
                            "
                          >
                            {certification.title}
                          </p>


                          {certification.issuer && (

                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-400
                              "
                            >
                              {certification.issuer}
                            </p>

                          )}


                          {certification.dates && (

                            <p
                              className="
                                mt-3
                                text-xs
                                font-medium
                                text-cyan-300
                              "
                            >
                              {certification.dates}
                            </p>

                          )}

                        </div>

                      ),
                    )}

                  </div>

                </ProfileSection>

              )}


              {languages.length > 0 && (

                <ProfileSection
                  icon={<Languages size={18} />}
                  eyebrow="Communication"
                  title="Languages"
                  count={`${languages.length}`}
                >

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >

                    {languages.map(
                      (
                        language,
                        index,
                      ) => (

                        <span
                          key={`${language}-${index}`}
                          className="
                            rounded-xl
                            border
                            border-white/10
                            bg-white/[0.03]
                            px-3
                            py-2
                            text-sm
                            text-gray-300
                          "
                        >
                          {language}
                        </span>

                      ),
                    )}

                  </div>

                </ProfileSection>

              )}

            </div>


            {/* =================================================
                Achievements
            ================================================== */}

            {achievements.length > 0 && (

              <ProfileSection
                icon={<Award size={18} />}
                eyebrow="Highlights"
                title="Achievements"
                count={`${achievements.length}`}
              >

                <div className="space-y-3">

                  {achievements.map(
                    (
                      achievement,
                      index,
                    ) => (

                      <div
                        key={`${achievement}-${index}`}
                        className="
                          flex
                          items-start
                          gap-3
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/10
                          p-4
                        "
                      >

                        <CheckCircle2
                          size={17}
                          className="
                            mt-0.5
                            shrink-0
                            text-cyan-400
                          "
                        />


                        <p
                          className="
                            text-sm
                            leading-6
                            text-gray-300
                          "
                        >
                          {achievement}
                        </p>

                      </div>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* =================================================
                Footer
            ================================================== */}

            <div
              className="
                mt-8
                flex
                flex-col
                gap-3
                border-t
                border-white/5
                pt-6
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <p
                className="
                  text-xs
                  leading-5
                  text-gray-600
                "
              >
                Profile generated from your current
                resume version.
              </p>


              <p
                className="
                  break-all
                  text-xs
                  text-gray-600
                "
              >
                Resume V{currentVersion} ·{" "}
                {resume.resume_id}
              </p>

            </div>

          </div>

        </main>

      </div>


      {/* =================================================
          Resume History Drawer
      ================================================== */}

      <ResumeHistoryPanel
        open={isHistoryOpen}
        onClose={() =>
          setIsHistoryOpen(false)
        }
        currentVersion={currentVersion}
        currentUpdatedAt={updatedAt}
        history={resumeHistory}
        loading={historyLoading}
      />

    </div>

  );
}


// =========================================================
// Resume History Panel
// =========================================================

function ResumeHistoryPanel({
  open,
  onClose,
  currentVersion,
  currentUpdatedAt,
  history,
  loading,
}) {

  // =======================================================
  // Lock body scroll + Escape key
  // =======================================================

  useEffect(() => {

    if (!open) {
      return undefined;
    }


    const originalOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      "hidden";


    const handleKeyDown = (event) => {

      if (event.key === "Escape") {
        onClose();
      }

    };


    document.addEventListener(
      "keydown",
      handleKeyDown,
    );


    return () => {

      document.body.style.overflow =
        originalOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

    };

  }, [open, onClose]);


  if (!open) {
    return null;
  }


  // =======================================================
  // Render
  // =======================================================

  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        justify-end
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-history-title"
    >

      {/* =================================================
          Backdrop
      ================================================== */}

      <button
        type="button"
        aria-label="Close resume history"
        onClick={onClose}
        className="
          absolute
          inset-0
          cursor-default
          bg-black/60
          backdrop-blur-[3px]
        "
      />


      {/* =================================================
          Drawer
      ================================================== */}

      <section
        className="
          relative
          z-10
          flex
          h-full
          w-full
          max-w-md
          flex-col
          border-l
          border-white/10
          bg-[#0B1120]
          shadow-2xl
          shadow-black/50
          max-md:max-w-none
          max-md:border-l-0
        "
      >


        {/* =================================================
            Drawer Header
        ================================================== */}

        <header
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-white/10
            px-6
            py-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-cyan-400/20
                bg-cyan-400/10
                text-cyan-400
              "
            >
              <History size={19} />
            </div>


            <div>

              <h2
                id="resume-history-title"
                className="
                  text-base
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Resume History
              </h2>


              <p
                className="
                  mt-0.5
                  text-xs
                  text-gray-500
                "
              >
                Previous analyzed versions
              </p>

            </div>

          </div>


          {/* Close */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close resume history"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-white/10
              text-gray-400
              transition
              hover:border-white/20
              hover:bg-white/5
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400/30
            "
          >
            <X size={18} />
          </button>

        </header>


        {/* =================================================
            Drawer Body
        ================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-6
            py-6
          "
        >


          {/* =================================================
              Current Resume
          ================================================== */}

          <div className="mb-6">

            <p
              className="
                mb-3
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-cyan-400
              "
            >
              Current resume
            </p>


            <div
              className="
                rounded-2xl
                border
                border-cyan-400/20
                bg-cyan-400/[0.06]
                p-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                {/* Version */}

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/10
                    text-sm
                    font-bold
                    text-cyan-300
                  "
                >
                  V{currentVersion || 1}
                </div>


                {/* Details */}

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >

                    <h3
                      className="
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      Current Resume
                    </h3>


                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-emerald-400/20
                        bg-emerald-400/10
                        px-2
                        py-0.5
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-emerald-400
                      "
                    >
                      <CheckCircle2 size={10} />
                      Current
                    </span>

                  </div>


                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-gray-500
                    "
                  >
                    <Clock3 size={13} />

                    Updated{" "}

                    {formatResumeDate(
                      currentUpdatedAt,
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              Previous Versions
          ================================================== */}

          <div>

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
              "
            >

              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-gray-500
                "
              >
                Previous versions
              </p>


              {!loading && (

                <span
                  className="
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.03]
                    px-2
                    py-1
                    text-[10px]
                    font-medium
                    text-gray-500
                  "
                >
                  {history.length}{" "}

                  {history.length === 1
                    ? "version"
                    : "versions"}

                </span>

              )}

            </div>


            {/* =================================================
                Loading
            ================================================== */}

            {loading ? (

              <div
                className="
                  flex
                  min-h-40
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.02]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-gray-500
                  "
                >

                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Loading history...

                </div>

              </div>

            ) : history.length > 0 ? (

              /* =================================================
                  History List
              ================================================== */

              <div className="space-y-3">

                {history.map(
                  (
                    item,
                    index,
                  ) => {

                    const version =
                      item.version || 1;


                    return (

                      <div
                        key={
                          item.id ||
                          item.source_resume_id ||
                          `${version}-${index}`
                        }
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/[0.02]
                          p-4
                          transition
                          hover:border-white/15
                          hover:bg-white/[0.035]
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          {/* Version */}

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-white/10
                              bg-white/[0.03]
                              text-sm
                              font-bold
                              text-gray-400
                            "
                          >
                            V{version}
                          </div>


                          {/* Details */}

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >

                              <div>

                                <h3
                                  className="
                                    text-sm
                                    font-semibold
                                    text-white
                                  "
                                >
                                  Resume Version {version}
                                </h3>


                                <div
                                  className="
                                    mt-1.5
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    text-gray-500
                                  "
                                >

                                  <Archive size={12} />

                                  Archived{" "}

                                  {formatResumeDate(
                                    item.archived_at,
                                  )}

                                </div>

                              </div>


                              <span
                                className="
                                  shrink-0
                                  text-xs
                                  text-gray-600
                                "
                              >
                                {formatResumeDate(
                                  item.archived_at ||
                                  item.updated_at ||
                                  item.created_at,
                                )}
                              </span>

                            </div>


                            <div
                              className="
                                mt-3
                                border-t
                                border-white/5
                                pt-3
                              "
                            >

                              <p
                                className="
                                  text-[11px]
                                  leading-5
                                  text-gray-600
                                "
                              >
                                Archived after a newer
                                resume was uploaded.
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    );

                  },
                )}

              </div>

            ) : (

              /* =================================================
                  Empty History
              ================================================== */

              <div
                className="
                  flex
                  min-h-40
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-dashed
                  border-white/10
                  bg-white/[0.02]
                  px-6
                  text-center
                "
              >

                <Archive
                  size={24}
                  className="text-gray-600"
                />


                <p
                  className="
                    mt-3
                    text-sm
                    font-medium
                    text-gray-400
                  "
                >
                  No previous versions
                </p>


                <p
                  className="
                    mt-1
                    max-w-xs
                    text-xs
                    leading-5
                    text-gray-600
                  "
                >
                  Previous resume versions will appear
                  here after you upload an updated resume.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            Drawer Footer
        ================================================== */}

        <footer
          className="
            shrink-0
            border-t
            border-white/10
            px-6
            py-4
          "
        >

          <p
            className="
              text-center
              text-[11px]
              leading-5
              text-gray-600
            "
          >
            Your resume history is securely associated
            with your account.
          </p>

        </footer>

      </section>

    </div>

  );
}


// =========================================================
// Profile Loading
// =========================================================

function ProfileLoading() {

  return (

    <div
      className="
        flex
        min-h-screen
        min-w-0
        overflow-x-hidden
        bg-[#030712]
        text-white
      "
    >

      <Sidebar />


      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
        "
      >

        <Navbar />


        <main
          className="
            flex-1
            p-4
            sm:p-6
            lg:p-10
          "
        >

          <div
            className="
              mx-auto
              w-full
              max-w-7xl
              animate-pulse
            "
          >

            <div
              className="
                h-4
                w-32
                rounded-full
                bg-white/10
              "
            />


            <div
              className="
                mt-4
                h-10
                w-72
                max-w-full
                rounded-xl
                bg-white/10
              "
            />


            <div
              className="
                mt-3
                h-4
                w-full
                max-w-2xl
                rounded-full
                bg-white/5
              "
            />


            <div
              className="
                mt-8
                rounded-[2rem]
                border
                border-white/5
                bg-white/[0.025]
                p-5
                sm:p-8
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-center
                "
              >

                <div
                  className="
                    h-16
                    w-16
                    shrink-0
                    rounded-2xl
                    bg-white/10
                  "
                />


                <div
                  className="
                    w-full
                    max-w-xl
                  "
                >

                  <div
                    className="
                      h-3
                      w-24
                      rounded-full
                      bg-white/10
                    "
                  />


                  <div
                    className="
                      mt-3
                      h-7
                      w-64
                      max-w-full
                      rounded-lg
                      bg-white/10
                    "
                  />


                  <div
                    className="
                      mt-3
                      h-4
                      w-full
                      rounded-full
                      bg-white/5
                    "
                  />

                </div>

              </div>

            </div>


            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-4
                lg:grid-cols-4
              "
            >

              {[1, 2, 3, 4].map(
                (item) => (

                  <div
                    key={item}
                    className="
                      h-28
                      rounded-2xl
                      bg-white/[0.03]
                    "
                  />

                ),
              )}

            </div>

          </div>

        </main>

      </div>

    </div>

  );
}


// =========================================================
// Profile Empty / Error State
// =========================================================

function ProfileState({
  error,
  onRetry,
}) {

  const isNoResume =
    error ===
    "You haven't uploaded a resume yet.";


  return (

    <div
      className="
        flex
        min-h-screen
        min-w-0
        overflow-x-hidden
        bg-[#030712]
        text-white
      "
    >

      <Sidebar />


      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
        "
      >

        <Navbar />


        <main
          className="
            flex
            flex-1
            items-center
            justify-center
            p-5
            sm:p-8
          "
        >

          <div
            className="
              w-full
              max-w-md
              rounded-[2rem]
              border
              border-white/10
              bg-white/[0.03]
              p-8
              text-center
              shadow-2xl
              backdrop-blur-xl
              sm:p-10
            "
          >

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-cyan-400/20
                bg-cyan-400/10
                text-cyan-400
              "
            >
              <AlertCircle size={28} />
            </div>


            <h1
              className="
                mt-6
                text-2xl
                font-semibold
                text-white
              "
            >
              {isNoResume
                ? "Build your career profile"
                : "Profile unavailable"}
            </h1>


            <p
              className="
                mt-3
                text-sm
                leading-6
                text-gray-400
              "
            >
              {error ||
                "We couldn't load your career profile."}
            </p>


            {!isNoResume && (

              <button
                type="button"
                onClick={onRetry}
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-cyan-500
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-cyan-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-cyan-400/40
                "
              >

                <RefreshCw size={15} />

                Try again

              </button>

            )}

          </div>

        </main>

      </div>

    </div>

  );
}


// =========================================================
// Contact Item
// =========================================================

function ContactItem({
  icon,
  value,
}) {

  return (

    <div
      className="
        flex
        max-w-full
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
      "
    >

      <span
        className="
          shrink-0
          text-cyan-400
        "
      >
        {icon}
      </span>


      <span className="truncate">
        {value}
      </span>

    </div>

  );
}


// =========================================================
// Contact Link
// =========================================================

function ContactLink({
  icon,
  label,
  href,
}) {

  return (

    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
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
        transition
        hover:border-cyan-400/20
        hover:bg-cyan-400/5
        hover:text-cyan-300
        focus:outline-none
        focus:ring-2
        focus:ring-cyan-400/30
      "
    >

      <span className="text-cyan-400">
        {icon}
      </span>

      {label}

    </a>

  );
}


// =========================================================
// Stat Card
// =========================================================

function StatCard({
  icon,
  value,
  label,
}) {

  return (

    <div
      className="
        group
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-4
        backdrop-blur-xl
        transition
        duration-200
        hover:-translate-y-0.5
        hover:border-cyan-400/20
        hover:bg-white/[0.045]
        sm:p-5
      "
    >

      <div
        className="
          mb-4
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          border
          border-cyan-400/10
          bg-cyan-400/10
          text-cyan-400
        "
      >
        {icon}
      </div>


      <p
        className="
          text-2xl
          font-bold
          tracking-tight
          text-white
        "
      >
        {value}
      </p>


      <p
        className="
          mt-1
          text-xs
          text-gray-500
        "
      >
        {label}
      </p>

    </div>

  );
}


// =========================================================
// Profile Section
// =========================================================

function ProfileSection({
  icon,
  eyebrow,
  title,
  count,
  children,
}) {

  return (

    <section
      className="
        mt-5
        rounded-[1.75rem]
        border
        border-white/10
        bg-white/[0.025]
        p-5
        shadow-xl
        shadow-black/10
        backdrop-blur-xl
        sm:p-7
      "
    >

      <div
        className="
          mb-6
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-cyan-400/15
              bg-cyan-400/10
              text-cyan-400
            "
          >
            {icon}
          </div>


          <div>

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-cyan-400
              "
            >
              {eyebrow}
            </p>


            <h2
              className="
                mt-1
                text-lg
                font-semibold
                tracking-tight
                text-white
              "
            >
              {title}
            </h2>

          </div>

        </div>


        {count && (

          <span
            className="
              w-fit
              rounded-full
              border
              border-white/10
              bg-white/[0.025]
              px-3
              py-1.5
              text-xs
              text-gray-500
            "
          >
            {count}
          </span>

        )}

      </div>


      {children}

    </section>

  );
}


// =========================================================
// Helpers
// =========================================================

function getInitials(name) {

  if (!name) {
    return "U";
  }


  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (words.length === 1) {

    return words[0]
      .slice(0, 2)
      .toUpperCase();

  }


  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();

}


// =========================================================
// Resume Date Formatter
// =========================================================

function formatResumeDate(date) {

  if (!date) {
    return "Unknown date";
  }


  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {

    return "Unknown date";

  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(parsedDate);

}

// =========================================================
// Export
// =========================================================

export default Profile;