// Purpose: Displays the premium Google login page.

import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  // React Router navigation
  const navigate = useNavigate();

  // Handle successful Google login
  const handleSuccess = async (credentialResponse) => {
    try {
      // Send Google ID token to backend
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/google",
        {
          token: credentialResponse.credential,
        }
      );

      // Print backend response
      console.log("Backend Response:", response.data);

      // Save JWT token
      localStorage.setItem(
        "token",
        response.data.access_token
      );

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Redirect to Welcome page
      navigate("/welcome");

    } catch (error) {
      console.error(error.response?.data || error.message);

      alert(
        JSON.stringify(
          error.response?.data || { error: error.message },
          null,
          2
        )
      );
    }
  };

  // Handle failed Google login
  const handleError = () => {
    console.log("Google Login Failed");
    alert("Google Login Failed");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-6">

      {/* Top Glow */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-[140px]" />

      {/* Bottom Glow */}
      <div className="absolute -bottom-40 -right-32 h-[450px] w-[450px] rounded-full bg-violet-600/20 blur-[180px]" />

      {/* Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:45px_45px] opacity-20" />

      {/* Login Card */}
      <section className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-2xl">

        {/* Badge */}
        <div className="mx-auto mb-6 w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
          AI CAREER PLATFORM
        </div>

        {/* Title */}
        <h1 className="text-center text-6xl font-black tracking-tight text-white">
          NotunPath
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-sm text-center text-lg leading-8 text-gray-400">
          Learn. Build. Showcase your skills. Get hired with AI.
        </p>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="filled_black"
            shape="pill"
            size="large"
            width="320"
          />
        </div>

        {/* Terms */}
        <p className="mt-8 text-center text-sm leading-7 text-gray-500">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>

      </section>

      {/* Footer */}
      <p className="absolute bottom-8 text-sm uppercase tracking-[0.4em] text-cyan-300/60">
        Build • Learn • Grow
      </p>

    </main>
  );
}

export default Login;