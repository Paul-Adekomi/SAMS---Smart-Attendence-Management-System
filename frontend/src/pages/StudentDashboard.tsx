import { useState, useEffect } from "react";
import {
  FaGraduationCap,
  FaQrcode,
  FaSignOutAlt,
  FaCalendarCheck,
} from "react-icons/fa";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import API, { markAttendance, getMyAttendance } from "../lib/api";

type AttendanceRecord = {
  _id: string;
  status: "present" | "absent";
  createdAt: string;
  session: {
    _id: string;
    course: { courseTitle: string; courseCode: string };
    expiresAt: string;
  };
};

function StudentDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(sessionStorage.getItem("sams_user") || "{}");

  const [activeTab, setActiveTab] = useState<"home" | "mark">("home");
  const [pin, setPin] = useState("");
  const [sessionId, setSessionId] = useState(
    searchParams.get("sessionId") || "",
  );
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // If QR scan brought code + sessionId via URL params, pre-fill
  const urlCode = searchParams.get("code");
  const urlSession = searchParams.get("sessionId");

  useEffect(() => {
    if (urlCode && urlSession) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPin(urlCode);
      setSessionId(urlSession);
      setActiveTab("mark");
    }
  }, [urlCode, urlSession]);

  useEffect(() => {
    getMyAttendance()
      .then((res) => setHistory(res.data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setSubmitState("loading");
    setErrorMsg("");
    try {
      let resolvedSessionId = sessionId;
      if (!resolvedSessionId) {
        const res = await API.post("/sessions/by-code", { code: pin.trim() });
        resolvedSessionId = res.data.sessionId;
      }
      await markAttendance(resolvedSessionId, pin.trim());
      setSubmitState("success");
      getMyAttendance().then((res) => setHistory(res.data));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Invalid PIN or session expired.");
      }
      setSubmitState("error");
    }
  };

  const reset = () => {
    setPin("");
    setSessionId("");
    setSubmitState("idle");
    setErrorMsg("");
  };
  const logout = () => {
    sessionStorage.removeItem("sams_token");
    sessionStorage.removeItem("sams_user");
    navigate("/login");
  };

  const presentCount = history.filter((h) => h.status === "present").length;
  const rate =
    history.length > 0 ? Math.round((presentCount / history.length) * 100) : 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm h-16 px-6 md:px-12 flex items-center justify-between fixed w-full top-0 z-50">
        <a href="/" className="text-primary flex items-center gap-2">
          <FaGraduationCap className="text-3xl" />
          <span className="font-extrabold text-lg">SAMS</span>
        </a>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-semibold text-dark">
              {user.fullName || "Student"}
            </p>
            <p className="text-xs text-gray-400">{user.matricNo}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm cursor-pointer transition-colors"
          >
            <FaSignOutAlt /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="mt-16 flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex flex-col w-56 bg-white shadow-sm p-6 gap-2 fixed top-16 bottom-0">
          {[
            { id: "home", label: "My Attendance", icon: "📋" },
            { id: "mark", label: "Mark Attendance", icon: "✅" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "home" | "mark")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </aside>

        {/* Mobile bottom bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex z-40">
          {[
            { id: "home", label: "My Attendance", icon: "📋" },
            { id: "mark", label: "Mark Attendance", icon: "✅" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "home" | "mark")}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-semibold gap-1 cursor-pointer ${
                activeTab === tab.id ? "text-primary" : "text-gray-400"
              }`}
            >
              <span className="text-lg">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <main className="flex-1 md:ml-56 p-6 md:p-10 pb-24 md:pb-10">
          {activeTab === "home" && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-dark">
                  Hello, {user.fullName?.split(" ")[0] || "Student"} 👋
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Here's your attendance summary.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full w-max bg-primary/10 text-primary">
                    Total Classes
                  </span>
                  <p className="text-3xl font-bold text-dark">
                    {history.length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full w-max bg-green-100 text-green-600">
                    Present
                  </span>
                  <p className="text-3xl font-bold text-dark">{presentCount}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-2 col-span-2 md:col-span-1">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full w-max bg-orange-100 text-orange-500">
                    Attendance Rate
                  </span>
                  <p className="text-3xl font-bold text-dark">{rate}%</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-primary rounded-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                <h2 className="font-bold text-dark flex items-center gap-2">
                  <FaCalendarCheck className="text-primary" /> Attendance
                  History
                </h2>
                {historyLoading ? (
                  <p className="text-sm text-gray-400">Loading...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No attendance records yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {history.map((h) => (
                      <div
                        key={h._id}
                        className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-dark">
                            {h.session?.course?.courseCode} —{" "}
                            {h.session?.course?.courseTitle}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(h.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {h.status === "present" ? (
                            <>
                              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                                Present
                              </span>
                              <FaCircleCheck className="text-green-500" />
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded-full">
                                Absent
                              </span>
                              <FaCircleXmark className="text-red-400" />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "mark" && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-dark">
                  Mark Attendance
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Enter the session PIN given by your lecturer.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md flex flex-col gap-6">
                {submitState === "success" ? (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <FaCircleCheck className="text-green-500 text-6xl" />
                    <h2 className="text-xl font-bold text-dark">
                      Attendance Marked!
                    </h2>
                    <p className="text-sm text-gray-500 text-center">
                      You've been marked{" "}
                      <span className="text-green-600 font-semibold">
                        present
                      </span>{" "}
                      successfully.
                    </p>
                    <button
                      onClick={reset}
                      className="btn py-2 px-6 text-sm mt-2"
                    >
                      Mark Another
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleMarkAttendance}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <FaQrcode className="text-primary text-5xl" />
                      <p className="text-sm text-gray-400 text-center">
                        Enter the session PIN from your lecturer. If you scanned
                        the QR code, fields are pre-filled.
                      </p>
                    </div>

                    {/* Session ID input - only show if not from QR scan */}
                    {!searchParams.get("sessionId") && (
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-dark">
                          Session ID{" "}
                          <span className="text-gray-400 font-normal">
                            (optional if using PIN only)
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Paste session ID here"
                          value={sessionId}
                          onChange={(e) => setSessionId(e.target.value)}
                          className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-dark">
                        Session PIN
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AB12CD"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        maxLength={8}
                        className="border border-gray-200 rounded-xl px-4 py-4 text-center text-2xl font-mono font-bold tracking-widest outline-none focus:border-primary transition-colors uppercase"
                      />
                    </div>

                    {submitState === "error" && (
                      <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitState === "loading" || !pin.trim()}
                      className="btn py-3 text-sm font-bold disabled:opacity-60"
                    >
                      {submitState === "loading"
                        ? "Verifying..."
                        : "Submit Attendance"}
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      PINs are case-insensitive and expire when the session
                      ends.
                    </p>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
