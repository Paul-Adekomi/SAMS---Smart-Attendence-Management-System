import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import Login from "./pages/LoginPage";
import LecturerDashboard from "./pages/LecturerDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
