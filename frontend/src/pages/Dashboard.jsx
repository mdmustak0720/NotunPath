// Purpose: Main dashboard workspace displayed after user authentication.

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ResumeUpload from "../components/resume/ResumeUpload";
import useAuthStore from "../store/authStore";

function Dashboard() {

  // Get the authenticated user.
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-[#030712]">

      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-1 flex-col">

        {/* Top navigation */}
        <Navbar />

        {/* Dashboard content */}
        <main className="flex-1 p-10">

          {/* Welcome section */}
          <section className="mb-10">

            <h1 className="text-4xl font-bold text-white">
              👋 Welcome back, {user?.name}
            </h1>

            <p className="mt-3 text-lg text-gray-400">
              Your AI Career Coach is ready. Upload your resume to begin your personalized career journey.
            </p>

          </section>

          {/* Resume upload */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <h2 className="mb-2 text-2xl font-semibold text-white">
              📄 Upload Your Resume
            </h2>

            <p className="mb-8 text-gray-400">
              Upload your latest resume to unlock AI-powered career analysis.
            </p>

            <ResumeUpload />

          </section>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;