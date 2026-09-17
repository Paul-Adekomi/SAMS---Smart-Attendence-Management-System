import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaRightFromBracket,
  FaUsers,
  FaBook,
  FaClipboardCheck,
  FaChartBar,
  FaLink,
} from "react-icons/fa6";
import { getDepartments } from "../lib/api";
import type { Department } from "../types";
import StudentsPanel from "../components/admin/StudentsPanel";
import CoursesPanel from "../components/admin/CoursesPanel";
import AttendancePanel from "../components/admin/AttendancePanel";
import ReportsPanel from "../components/admin/ReportsPanel";
import RegistrationLinksPanel from "../components/admin/RegistrationLinksPanel";

type Tab = "students" | "courses" | "attendance" | "reports" | "links";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "students", label: "Students", icon: <FaUsers /> },
  { id: "courses", label: "Courses", icon: <FaBook /> },
  { id: "attendance", label: "Attendance", icon: <FaClipboardCheck /> },
  { id: "reports", label: "Reports", icon: <FaChartBar /> },
  { id: "links", label: "Reg. Links", icon: <FaLink /> },
];

function readAdmin(): { fullName?: string; adminId?: string; role?: string } {
  try {
    const raw = sessionStorage.getItem("sams_user");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin] = useState(readAdmin);
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("sams_token");
    if (!token || admin.role !== "admin") {
      navigate("/login");
      return;
    }
    getDepartments()
      .then((res) => setDepartments(res.data))
      .catch(() => {});
  }, [navigate, admin.role]);

  const logout = () => {
    sessionStorage.removeItem("sams_token");
    sessionStorage.removeItem("sams_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm h-16 px-6 md:px-12 flex items-center justify-between fixed w-full top-0 z-50">
        <a href="/" className="text-primary flex items-center gap-2">
          <FaGraduationCap className="text-3xl" />
          <span className="font-extrabold text-lg">SAMS</span>
        </a>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <p className="text-sm font-semibold text-dark">{admin.fullName || "Admin"}</p>
            <p className="text-xs text-gray-400">Admin{admin.adminId ? ` · ${admin.adminId}` : ""}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm cursor-pointer transition-colors"
          >
            <FaRightFromBracket /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="mt-16 flex flex-col md:flex-row flex-1">
        <aside className="hidden md:flex flex-col w-56 bg-white shadow-sm p-6 gap-2 fixed top-16 bottom-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id ? "bg-primary text-white shadow" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </aside>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex z-40">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 text-[0.65rem] font-semibold transition-all cursor-pointer ${
                activeTab === tab.id ? "text-primary" : "text-gray-400"
              }`}
            >
              <span className="text-base">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 md:ml-56 p-5 md:p-10 pb-28 md:pb-10">
          {activeTab === "students" && <StudentsPanel departments={departments} />}
          {activeTab === "courses" && <CoursesPanel departments={departments} />}
          {activeTab === "attendance" && <AttendancePanel />}
          {activeTab === "reports" && <ReportsPanel departments={departments} />}
          {activeTab === "links" && <RegistrationLinksPanel departments={departments} />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
