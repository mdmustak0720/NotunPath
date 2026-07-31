// Purpose: Defines all application routes.

import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <Routes>

      {/* Login Page */}
      <Route path="/" element={<Login />} />

      {/* Welcome Page */}
      <Route path="/welcome" element={<Welcome />} />

    </Routes>
  );
}

export default App;