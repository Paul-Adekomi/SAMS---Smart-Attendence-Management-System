import { useState, useEffect} from "react";
import { FaGraduationCap, FaQrcode, FaStop, FaDownload, FaSignOutAlt, FaCopy, FaCheck, FaChartBar, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { io as socketIO } from "socket.io-client";
import { getMyCourses, createSession, exportCSV, exportExcel, getLecturerReports, getSessionReport } from "../lib/api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

type Course = { _id: string; courseTitle: string; courseCode: string; semester: string; level: string[] };
type Session = { sessionId: string; code: string; qr: string; expiresAt: string; course: { courseTitle: string; courseCode: string } };
type AttendeeEvent = { sessionId: string; count: number };
type ReportSummary = { sessionId: string; courseTitle: string; courseCode: string; date: string; expiresAt: string; presentCount: number; isExpired: boolean };
type ReportDetail = { courseTitle: string; courseCode: string; date: string; totalPresent: number; students: { studentName: string; matricNo: string; time: string }[] };

function LecturerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("sams_user") || "{}");

  const [activeTab, setActiveTab] = useState<"home" | "session" | "reports">("home");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [duration, setDuration] = useState(30);
  const [session, setSession] = useState<Session | null>(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Reports state
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [reportDetailLoading, setReportDetailLoading] = useState(false);

  useEffect(() => {
    getMyCourses()
      .then((res) => {
        setCourses(res.data);
        if (res.data.length > 0) setSelectedCourseId(res.data[0]._id);
      })
      .catch(() => setError("Failed to load courses."))
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "reports" && reports.length === 0) {
      setReportsLoading(true);
      getLecturerReports()
        .then((res) => setReports(res.data))
        .catch(() => setError("Failed to load reports."))
        .finally(() => setReportsLoading(false));
    }
  }, [activeTab, reports.length]);

  const openReport = async (sessionId: string) => {
    setReportDetailLoading(true);
    setSelectedReport(null);
    try {
      const res = await getSessionReport(sessionId);
      setSelectedReport(res.data);
    } catch {
      setError("Failed to load session report.");
    } finally {
      setReportDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!session || sessionEnded) return;
    const socket = socketIO(SOCKET_URL);
    socket.emit("joinSession", session.sessionId);
    socket.on("attendance updated", (data: AttendeeEvent) => {
      if (data.sessionId === session.sessionId) setAttendanceCount(data.count);
    });
    return () => { socket.disconnect(); };
  }, [session, sessionEnded]);

  useEffect(() => {
    if (!session || sessionEnded) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) { setSessionEnded(true); clearInterval(interval); }
    }, 1000);
    return () => clearInterval(interval);
  }, [session, sessionEnded]);

  const startSession = async () => {
    if (!selectedCourseId) return;
    setLoading(true); setError("");
    try {
      const res = await createSession(selectedCourseId, duration);
      setSession(res.data);
      setAttendanceCount(0);
      setSessionEnded(false);
      setActiveTab("session");
    }  catch (err: unknown) {
      if (err instanceof Error){
        setError(err.message)
      }else{
        setError("Failed to create session")
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPin = () => {
    if (session) navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = async () => {
    if (!session) return;
    try {
      const res = await exportCSV(session.sessionId);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url;
      a.download = `attendance-${session.course.courseCode}.csv`; a.click();
    } catch { setError("Export failed."); }
  };

  const handleExportExcel = async () => {
    if (!session) return;
    try {
      const res = await exportExcel(session.sessionId);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url;
      a.download = `attendance-${session.course.courseCode}.xlsx`; a.click();
    } catch { setError("Export failed."); }
  };

  const logout = () => {
    sessionStorage.removeItem("sams_token");
    sessionStorage.removeItem("sams_user");
    navigate("/login");
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const tabs = [
    { id: "home", label: "Dashboard", icon: "🏠" },
    { id: "session", label: "Active Session", icon: "📡" },
    { id: "reports", label: "Reports", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm h-16 px-6 md:px-12 flex items-center justify-between fixed w-full top-0 z-50">
        <a href="/" className="text-primary flex items-center gap-2">
          <FaGraduationCap className="text-3xl" />
          <span className="font-extrabold text-lg">SAMS</span>
        </a>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-semibold text-dark">{user.fullName || "Lecturer"}</p>
            <p className="text-xs text-gray-400">Lecturer · {user.lecturerId}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm cursor-pointer transition-colors">
            <FaSignOutAlt /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="mt-16 flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex flex-col w-56 bg-white shadow-sm p-6 gap-2 fixed top-16 bottom-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as "home" || "session"); setSelectedReport(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 md:ml-56 p-6 md:p-10">
          {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl mb-4">{error}</p>}

          {/* ── HOME TAB ── */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-dark">Good day,Dr. {user.fullName?.split(" ")[1] || "Lecturer"} 👋</h1>
                <p className="text-gray-500 mt-1 text-sm">Start a new attendance session for your class.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5 max-w-xl">
                <h2 className="text-lg font-bold text-dark">Start New Session</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-dark">Select Course</label>
                  {coursesLoading ? (
                    <p className="text-sm text-gray-400">Loading courses...</p>
                  ) : courses.length === 0 ? (
                    <p className="text-sm text-gray-400">No courses assigned to you yet.</p>
                  ) : (
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary cursor-pointer"
                    >
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>{c.courseCode} — {c.courseTitle}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-dark">Duration (minutes)</label>
                  <input
                    type="number"
                    min={1} max={120}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={startSession}
                  disabled={loading || !selectedCourseId}
                  className="btn py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <FaQrcode /> {loading ? "Creating session..." : "Generate QR & Start Session"}
                </button>
              </div>
            </div>
          )}

          {/* ── SESSION TAB ── */}
          {activeTab === "session" && (
            <div className="flex flex-col gap-6">
              {!session ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
                  <FaQrcode className="text-5xl" />
                  <p className="text-sm">No active session. Go to Dashboard to start one.</p>
                  <button onClick={() => setActiveTab("home")} className="btn py-2 px-6 text-sm">Go to Dashboard</button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-xl font-bold text-dark">{session.course.courseTitle}</h1>
                      <p className="text-sm text-gray-400">{session.course.courseCode}</p>
                    </div>
                    {!sessionEnded ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          ⏱ {formatTime(timeLeft)}
                        </span>
                        <button
                          onClick={() => setSessionEnded(true)}
                          className="flex items-center gap-2 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-red-600 transition-colors"
                        >
                          <FaStop /> End Session
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">Session Ended</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-5">
                      <h3 className="text-sm font-bold text-dark self-start">Session QR Code</h3>
                      <img src={session.qr} alt="QR Code" className="w-48 h-48 rounded-xl border-4 border-primary/20" />
                      <div className="w-full flex flex-col gap-2 items-center">
                        <p className="text-xs text-gray-400">Or share the session PIN manually:</p>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-mono font-bold text-primary tracking-widest">{session.code}</span>
                          <button onClick={copyPin} className="text-gray-400 hover:text-primary cursor-pointer transition-colors">
                            {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                          </button>
                        </div>
                      </div>
                      {sessionEnded && (
                        <div className="flex gap-3 w-full">
                          <button onClick={handleExportCSV} className="btn py-2 px-4 text-sm flex items-center gap-2 flex-1 justify-center">
                            <FaDownload /> CSV
                          </button>
                          <button onClick={handleExportExcel} className="btn py-2 px-4 text-sm flex items-center gap-2 flex-1 justify-center">
                            <FaDownload /> Excel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4 items-center justify-center">
                      <h3 className="text-sm font-bold text-dark self-start">Live Attendance</h3>
                      <div className="flex flex-col items-center gap-2 py-8">
                        <span className={`w-3 h-3 rounded-full ${sessionEnded ? "bg-gray-400" : "bg-green-500 animate-pulse"}`} />
                        <p className="text-7xl font-extrabold text-primary">{attendanceCount}</p>
                        <p className="text-gray-400 text-sm">students marked present</p>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        Updates automatically as students submit their attendance
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS TAB ── */}
          {activeTab === "reports" && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-dark">Attendance Reports 📊</h1>
                <p className="text-gray-500 mt-1 text-sm">View and review all past attendance sessions.</p>
              </div>

              {selectedReport ? (
                <div className="flex flex-col gap-5">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-sm text-primary font-semibold flex items-center gap-2 hover:underline w-max cursor-pointer"
                  >
                    ← Back to all reports
                  </button>
                  <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold text-dark">{selectedReport.courseTitle}</h2>
                      <p className="text-sm text-gray-400">{selectedReport.courseCode} · {formatDate(selectedReport.date)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-primary/5 rounded-xl px-5 py-4 w-max">
                      <FaUsers className="text-primary text-2xl" />
                      <div>
                        <p className="text-2xl font-extrabold text-primary">{selectedReport.totalPresent}</p>
                        <p className="text-xs text-gray-500">students present</p>
                      </div>
                    </div>
                    {selectedReport.students.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No students marked attendance for this session.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-2 px-3 text-gray-400 font-semibold">#</th>
                              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Student Name</th>
                              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Matric No</th>
                              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.students.map((s, i) => (
                              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-3 text-gray-400">{i + 1}</td>
                                <td className="py-3 px-3 font-semibold text-dark">{s.studentName}</td>
                                <td className="py-3 px-3 text-gray-500 font-mono">{s.matricNo}</td>
                                <td className="py-3 px-3 text-gray-400">{s.time}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : reportsLoading ? (
                <p className="text-sm text-gray-400">Loading reports...</p>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                  <FaChartBar className="text-5xl" />
                  <p className="text-sm">No sessions yet. Start a session to see reports here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {reports.map((r) => (
                    <button
                      key={r.sessionId}
                      onClick={() => openReport(r.sessionId)}
                      className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer text-left w-full"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-dark">{r.courseCode} — {r.courseTitle}</p>
                        <p className="text-xs text-gray-400">{formatDate(r.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <FaUsers />
                          <span className="text-lg">{r.presentCount}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.isExpired ? "bg-gray-100 text-gray-400" : "bg-green-100 text-green-600"}`}>
                          {r.isExpired ? "Ended" : "Active"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {reportDetailLoading && <p className="text-sm text-gray-400">Loading session details...</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default LecturerDashboard;
