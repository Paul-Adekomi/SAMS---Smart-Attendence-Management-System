import { useState, useEffect } from "react";
import {
  FaGraduationCap,
  FaSignOutAlt,
  FaUserPlus,
  FaTrash,
  FaUsers,
  FaChartBar,
  FaPrint,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getDepartments,
  getCoursesByDepartment,
  getAllStudents,
  createStudent,
  deleteStudent,
  getWeeklyReport,
} from "../lib/api";

type Department = { _id: string; name: string };
type Course = { _id: string; courseCode: string; courseTitle: string };
type Student = {
  _id: string;
  fullName: string;
  email: string;
  matricNo: string;
  isActive: boolean;
  department?: { _id: string; name: string };
};
type ReportRow = {
  sessionId: string;
  date: string;
  courseCode: string;
  courseTitle: string;
  lecturerName: string;
  presentCount: number;
};
type WeeklyReport = {
  from: string;
  to: string;
  totalSessions: number;
  totalPresentMarks: number;
  sessions: ReportRow[];
};

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("sams_user") || "{}");

  const [activeTab, setActiveTab] = useState<"students" | "reports">("students");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [studentDeptFilter, setStudentDeptFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    matricNo: "",
    password: "",
    departmentId: "",
  });

  // Reports state
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [reportDeptId, setReportDeptId] = useState("");
  const [reportCourses, setReportCourses] = useState<Course[]>([]);
  const [reportCourseId, setReportCourseId] = useState("");
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    loadStudents();
    getDepartments()
      .then((res) => setDepartments(res.data))
      .catch(() => setError("Failed to load departments."));
  }, []);

  useEffect(() => {
    if (!reportDeptId) {
      setReportCourses([]);
      setReportCourseId("");
      return;
    }
    setReportCourseId("");
    getCoursesByDepartment(reportDeptId)
      .then((res) => setReportCourses(res.data))
      .catch(() => setError("Failed to load courses for this department."));
  }, [reportDeptId]);

  const visibleStudents = studentDeptFilter
    ? students.filter((s) => s.department?._id === studentDeptFilter)
    : students;

  const loadStudents = () => {
    setStudentsLoading(true);
    getAllStudents()
      .then((res) => setStudents(res.data))
      .catch(() => setError("Failed to load students."))
      .finally(() => setStudentsLoading(false));
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.fullName || !form.email || !form.matricNo || !form.password || !form.departmentId) {
      setError("Please fill in all fields.");
      return;
    }
    setAddLoading(true);
    try {
      await createStudent(form);
      setSuccess(`Account created for ${form.fullName}.`);
      setForm({ fullName: "", email: "", matricNo: "", password: "", departmentId: "" });
      setShowAddForm(false);
      loadStudents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create student account.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Deactivate ${student.fullName}'s account? Their attendance history will be kept.`)) return;
    setError("");
    try {
      await deleteStudent(student._id);
      loadStudents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to deactivate student.");
    }
  };

  const handleGenerateReport = async () => {
    setError("");
    if (!reportDeptId) {
      setError("Please select a department first.");
      return;
    }
    setReportLoading(true);
    setReport(null);
    try {
      const res = await getWeeklyReport(from, to, reportDeptId, reportCourseId || undefined);
      setReport(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    } finally {
      setReportLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("sams_token");
    sessionStorage.removeItem("sams_user");
    navigate("/login");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const tabs = [
    { id: "students", label: "Students", icon: <FaUsers /> },
    { id: "reports", label: "Reports", icon: <FaChartBar /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm h-16 px-6 md:px-12 flex items-center justify-between fixed w-full top-0 z-50 print:hidden">
        <a href="/" className="text-primary flex items-center gap-2">
          <FaGraduationCap className="text-3xl" />
          <span className="font-extrabold text-lg">SAMS</span>
        </a>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-semibold text-dark">{user.fullName || "Admin"}</p>
            <p className="text-xs text-gray-400">Admin · {user.adminId}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm cursor-pointer transition-colors">
            <FaSignOutAlt /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="mt-16 flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex flex-col w-56 bg-white shadow-sm p-6 gap-2 fixed top-16 bottom-0 print:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "students" | "reports")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </aside>

        {/* Mobile bottom bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex z-40 print:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "students" | "reports")}
              className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id ? "text-primary" : "text-gray-500"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <main className="flex-1 md:ml-56 p-6 md:p-10">
          {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl mb-4 print:hidden">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-xl mb-4 print:hidden">{success}</p>}

          {/* ── STUDENTS TAB ── */}
          {activeTab === "students" && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-dark">Students 👥</h1>
                  <p className="text-gray-500 mt-1 text-sm">Create and manage student accounts.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={studentDeptFilter}
                    onChange={(e) => setStudentDeptFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">All departments</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => { setShowAddForm(!showAddForm); setError(""); setSuccess(""); }}
                    className="btn py-2 px-5 text-sm flex items-center gap-2"
                  >
                    <FaUserPlus /> {showAddForm ? "Cancel" : "Add Student"}
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddStudent} className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-dark">Full Name</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-dark">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-dark">Matric Number</label>
                    <input
                      type="text"
                      placeholder="e.g. STU1010"
                      value={form.matricNo}
                      onChange={(e) => setForm({ ...form, matricNo: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-dark">Department</label>
                    <select
                      value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-semibold text-dark">Temporary Password</label>
                    <input
                      type="text"
                      placeholder="Student will use this to log in"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="btn py-3 text-sm font-bold md:col-span-2 disabled:opacity-60"
                  >
                    {addLoading ? "Creating account..." : "Create Student Account"}
                  </button>
                </form>
              )}

              {studentsLoading ? (
                <p className="text-sm text-gray-400">Loading students...</p>
              ) : visibleStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                  <FaUsers className="text-5xl" />
                  <p className="text-sm">
                    {studentDeptFilter ? "No students in this department yet." : "No students yet. Add the first one above."}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Matric No</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Department</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map((s) => (
                        <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-dark">{s.fullName}</td>
                          <td className="py-3 px-4 text-gray-500 font-mono">{s.matricNo}</td>
                          <td className="py-3 px-4 text-gray-500">{s.department?.name || "—"}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              s.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                            }`}>
                              {s.isActive ? "Active" : "Deactivated"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {s.isActive && (
                              <button
                                onClick={() => handleDeleteStudent(s)}
                                className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                title="Deactivate account"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS TAB ── */}
          {activeTab === "reports" && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-dark">Attendance Reports 📊</h1>
                  <p className="text-gray-500 mt-1 text-sm">View attendance across all courses for a date range.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-wrap items-end gap-4 print:hidden">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-dark">Department</label>
                  <select
                    value={reportDeptId}
                    onChange={(e) => setReportDeptId(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-dark">Course</label>
                  <select
                    value={reportCourseId}
                    onChange={(e) => setReportCourseId(e.target.value)}
                    disabled={!reportDeptId}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All courses</option>
                    {reportCourses.map((c) => (
                      <option key={c._id} value={c._id}>{c.courseCode} — {c.courseTitle}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-dark">From</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-dark">To</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="btn py-3 px-6 text-sm font-bold disabled:opacity-60"
                >
                  {reportLoading ? "Loading..." : "Generate Report"}
                </button>
                {report && (
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 border border-gray-200 text-dark text-sm font-bold px-5 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <FaPrint /> Print
                  </button>
                )}
              </div>

              {report && (
                <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">
                  <div className="hidden print:block mb-2">
                    <h2 className="text-xl font-bold text-dark">SAMS Attendance Report</h2>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-dark">
                      {formatDate(report.from)} — {formatDate(report.to)}
                    </p>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-3 bg-primary/5 rounded-xl px-5 py-4">
                      <FaChartBar className="text-primary text-2xl" />
                      <div>
                        <p className="text-2xl font-extrabold text-primary">{report.totalSessions}</p>
                        <p className="text-xs text-gray-500">sessions held</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-primary/5 rounded-xl px-5 py-4">
                      <FaUsers className="text-primary text-2xl" />
                      <div>
                        <p className="text-2xl font-extrabold text-primary">{report.totalPresentMarks}</p>
                        <p className="text-xs text-gray-500">total attendance marks</p>
                      </div>
                    </div>
                  </div>

                  {report.sessions.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No sessions were held in this date range.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 px-3 text-gray-400 font-semibold">Date</th>
                            <th className="text-left py-2 px-3 text-gray-400 font-semibold">Course</th>
                            <th className="text-left py-2 px-3 text-gray-400 font-semibold">Lecturer</th>
                            <th className="text-left py-2 px-3 text-gray-400 font-semibold">Present</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.sessions.map((r) => (
                            <tr key={r.sessionId} className="border-b border-gray-50">
                              <td className="py-3 px-3 text-gray-400">{formatDate(r.date)}</td>
                              <td className="py-3 px-3 font-semibold text-dark">{r.courseCode} — {r.courseTitle}</td>
                              <td className="py-3 px-3 text-gray-500">{r.lecturerName}</td>
                              <td className="py-3 px-3 text-gray-500">{r.presentCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
