// Purpose: Main dashboard page.

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import useAuthStore from "../store/authStore";

function Dashboard() {

  // Logged-in user
  const { user } = useAuthStore();

  return (

    <div className="flex min-h-screen bg-[#030712]">

      {/* Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex flex-1 flex-col">

        {/* Top Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center p-10">

          {/* Welcome Card */}
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

            {/* Profile */}
            <div className="flex flex-col items-center">

              <img
                src={user?.picture}
                alt={user?.name}
                className="mb-6 h-28 w-28 rounded-full border-4 border-cyan-400"
              />

              <h1 className="text-4xl font-bold text-white">
                Welcome,
              </h1>

              <h2 className="mt-2 text-2xl font-semibold text-cyan-400">
                {user?.name}
              </h2>

              <p className="mt-4 text-gray-400">
                {user?.email}
              </p>

            </div>

            {/* Divider */}
            <div className="my-8 border-t border-white/10"></div>

            {/* Status */}
            <div className="space-y-4">

              <div className="flex justify-between">

                <span className="text-gray-400">
                  Authentication
                </span>

                <span className="font-medium text-green-400">
                  Active ✅
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-gray-400">
                  Account
                </span>

                <span className="font-medium text-cyan-400">
                  Google
                </span>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>

  );

}

export default Dashboard;