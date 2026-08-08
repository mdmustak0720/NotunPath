/**
 * Profile
 *
 * Purpose:
 * Displays the authenticated user's latest
 * AI-generated career profile.
 */

import { useEffect, useState } from "react";

import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Award,
  Languages,
  FolderKanban,
  LoaderCircle,
  AlertCircle,
  Target,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import useAuthStore from "../store/authStore";
import { getLatestResume } from "../services/resumeService";


function Profile() {

  // -------------------------------------------------------
  // Authentication
  // -------------------------------------------------------

  const {
    user,
    token,
  } = useAuthStore();


  // -------------------------------------------------------
  // Resume State
  // -------------------------------------------------------

  const [
    resume,
    setResume,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);


  // -------------------------------------------------------
  // Fetch Latest Resume
  // -------------------------------------------------------

  useEffect(() => {

    const loadProfile = async () => {

      try {

        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error(
            "Authentication token is missing.",
          );
        }

        const response =
          await getLatestResume(token);

        setResume(response);

      } catch (error) {

        console.error(
          "Failed to load profile:",
          error,
        );

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

      }

    };


    loadProfile();

  }, [token]);


  // -------------------------------------------------------
  // Loading State
  // -------------------------------------------------------

  if (loading) {

    return (

      <div
        className="
          flex
          min-h-screen
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
              p-6
            "
          >

            <div
              className="
                flex
                flex-col
                items-center
                gap-4
                text-center
              "
            >

              <LoaderCircle
                size={38}
                className="
                  animate-spin
                  text-cyan-400
                "
              />

              <p
                className="
                  text-sm
                  text-gray-400
                "
              >
                Loading your AI career profile...
              </p>

            </div>

          </main>

        </div>

      </div>

    );
  }


  // -------------------------------------------------------
  // Error / No Resume State
  // -------------------------------------------------------

  if (error || !resume?.analysis) {

    return (

      <div
        className="
          flex
          min-h-screen
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
              p-6
            "
          >

            <div
              className="
                w-full
                max-w-lg
                rounded-3xl
                border
                border-white/10
                bg-white/[0.03]
                p-10
                text-center
                backdrop-blur-xl
              "
            >

              <div
                className="
                  mx-auto
                  mb-5
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-cyan-400/20
                  bg-cyan-400/10
                "
              >

                <AlertCircle
                  size={26}
                  className="text-cyan-400"
                />

              </div>


              <h1
                className="
                  text-2xl
                  font-semibold
                  text-white
                "
              >
                No career profile yet
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
                  "Upload your resume from the dashboard to create your AI career profile."}
              </p>

            </div>

          </main>

        </div>

      </div>

    );
  }


  // -------------------------------------------------------
  // Resume Analysis
  // -------------------------------------------------------

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


  // -------------------------------------------------------
  // Render Profile
  // -------------------------------------------------------

  return (

    <div
      className="
        flex
        min-h-screen
        bg-[#030712]
        text-white
      "
    >

      {/* Sidebar */}

      <Sidebar />


      {/* Main Workspace */}

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
            p-6
            lg:p-10
          "
        >

          <div
            className="
              mx-auto
              max-w-7xl
            "
          >

            {/* -------------------------------------------------
                Page Header
            -------------------------------------------------- */}

            <section className="mb-8">

              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-cyan-400
                "
              >
                AI Career Profile
              </p>


              <h1
                className="
                  mt-2
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
                and available here whenever you return.
              </p>

            </section>


            {/* -------------------------------------------------
                Profile Hero
            -------------------------------------------------- */}

            <section
              className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-white/[0.03]
                p-6
                shadow-2xl
                backdrop-blur-xl
                sm:p-8
              "
            >

              {/* Glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-24
                  -top-24
                  h-64
                  w-64
                  rounded-full
                  bg-cyan-500/10
                  blur-3xl
                "
              />


              <div
                className="
                  relative
                  flex
                  flex-col
                  gap-6
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >

                {/* Identity */}

                <div
                  className="
                    flex
                    items-center
                    gap-5
                  "
                >

                  <div
                    className="
                      flex
                      h-20
                      w-20
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-cyan-400/20
                      bg-cyan-400/10
                      text-3xl
                      font-bold
                      text-cyan-300
                    "
                  >
                    {(
                      personal.full_name ||
                      user?.name ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-[0.2em]
                        text-cyan-400
                      "
                    >
                      Career Profile
                    </p>


                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-bold
                        text-white
                        sm:text-3xl
                      "
                    >
                      {personal.full_name ||
                        user?.name ||
                        "Your Profile"}
                    </h2>


                    {analysis.professional_summary && (

                      <p
                        className="
                          mt-2
                          max-w-3xl
                          text-sm
                          leading-6
                          text-gray-400
                        "
                      >
                        {analysis.professional_summary}
                      </p>

                    )}

                  </div>

                </div>


                {/* Status */}

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-emerald-400/20
                    bg-emerald-400/5
                    px-4
                    py-2
                    text-sm
                    text-emerald-300
                  "
                >

                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-emerald-400
                    "
                  />

                  AI analysis complete

                </div>

              </div>


              {/* Contact Information */}

              <div
                className="
                  relative
                  mt-8
                  flex
                  flex-wrap
                  gap-3
                "
              >

                {personal.email && (

                  <ContactItem
                    icon={<Mail size={15} />}
                    value={personal.email}
                  />

                )}


                {personal.phone && (

                  <ContactItem
                    icon={<Phone size={15} />}
                    value={personal.phone}
                  />

                )}


                {personal.location && (

                  <ContactItem
                    icon={<MapPin size={15} />}
                    value={personal.location}
                  />

                )}

              </div>

            </section>


            {/* -------------------------------------------------
                Stats
            -------------------------------------------------- */}

            <section
              className="
                mt-6
                grid
                grid-cols-2
                gap-4
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


            {/* -------------------------------------------------
                Target Roles
            -------------------------------------------------- */}

            {targetRoles.length > 0 && (

              <ProfileSection
                icon={<Target size={18} />}
                eyebrow="Career Direction"
                title="Target Roles"
                count={`${targetRoles.length} roles`}
              >

                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                  "
                >

                  {targetRoles.map(
                    (role, index) => (

                      <span
                        key={`${role}-${index}`}
                        className="
                          rounded-xl
                          border
                          border-cyan-400/20
                          bg-cyan-400/5
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-cyan-300
                        "
                      >
                        {role}
                      </span>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* -------------------------------------------------
                Skills
            -------------------------------------------------- */}

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
                          rounded-lg
                          border
                          border-white/10
                          bg-white/[0.03]
                          px-3
                          py-2
                          text-sm
                          text-gray-300
                          transition
                          hover:border-cyan-400/30
                          hover:text-cyan-300
                        "
                      >
                        {skill}
                      </span>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* -------------------------------------------------
                Projects
            -------------------------------------------------- */}

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

                      <div
                        key={`${project.title}-${index}`}
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/10
                          p-5
                          transition
                          hover:border-cyan-400/20
                        "
                      >

                        <h3
                          className="
                            text-lg
                            font-semibold
                            text-white
                          "
                        >
                          {project.title}
                        </h3>


                        {project.technologies?.length > 0 && (

                          <div
                            className="
                              mt-4
                              flex
                              flex-wrap
                              gap-2
                            "
                          >

                            {project.technologies.map(
                              (technology, techIndex) => (

                                <span
                                  key={`${technology}-${techIndex}`}
                                  className="
                                    rounded-md
                                    bg-cyan-400/5
                                    px-2
                                    py-1
                                    text-xs
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

                      </div>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* -------------------------------------------------
                Education
            -------------------------------------------------- */}

            {education.length > 0 && (

              <ProfileSection
                icon={<GraduationCap size={18} />}
                eyebrow="Academic Background"
                title="Education"
                count={`${education.length} entries`}
              >

                <div className="space-y-4">

                  {education.map(
                    (item, index) => (

                      <div
                        key={`${item.degree}-${index}`}
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/10
                          p-5
                        "
                      >

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
                            mt-3
                            flex
                            flex-wrap
                            gap-3
                          "
                        >

                          {item.dates && (

                            <span
                              className="
                                rounded-lg
                                bg-white/5
                                px-3
                                py-1
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
                                bg-cyan-400/5
                                px-3
                                py-1
                                text-xs
                                text-cyan-300
                              "
                            >
                              {item.cgpa}
                            </span>

                          )}

                        </div>

                      </div>

                    ),
                  )}

                </div>

              </ProfileSection>

            )}


            {/* -------------------------------------------------
                Certifications + Languages
            -------------------------------------------------- */}

            <div
              className="
                mt-6
                grid
                gap-6
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
                      (certification, index) => (

                        <div
                          key={`${certification.title}-${index}`}
                          className="
                            rounded-xl
                            border
                            border-white/10
                            bg-black/10
                            p-4
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-medium
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
                                mt-2
                                text-xs
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
                      (language, index) => (

                        <span
                          key={`${language}-${index}`}
                          className="
                            rounded-lg
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


            {/* -------------------------------------------------
                Resume Metadata
            -------------------------------------------------- */}

            <div
              className="
                mt-6
                border-t
                border-white/5
                pt-6
              "
            >

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Profile generated from your latest uploaded
                resume · Resume ID: {resume.resume_id}
              </p>

            </div>

          </div>

        </main>

      </div>

    </div>

  );
}


// =========================================================
// Reusable Components
// =========================================================

function ContactItem({
  icon,
  value,
}) {

  return (

    <div
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border
        border-white/10
        bg-white/[0.03]
        px-3
        py-2
        text-xs
        text-gray-400
      "
    >

      <span className="text-cyan-400">
        {icon}
      </span>

      <span>
        {value}
      </span>

    </div>

  );
}


function StatCard({
  icon,
  value,
  label,
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-5
        backdrop-blur-xl
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
        mt-6
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
        p-6
        backdrop-blur-xl
        sm:p-8
      "
    >

      <div
        className="
          mb-6
          flex
          items-center
          justify-between
          gap-4
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
            {icon}
          </div>


          <div>

            <p
              className="
                text-[10px]
                font-medium
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
              rounded-full
              border
              border-white/10
              bg-white/[0.03]
              px-3
              py-1
              text-xs
              text-gray-400
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


export default Profile;