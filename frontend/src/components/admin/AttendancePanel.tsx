import { useState, useEffect, useCallback } from "react";
import { FaClipboardCheck, FaQrcode, FaRotateRight, FaArrowLeft } from "react-icons/fa6";
import { getAllCourses, createSession, getActiveSessions, getSessionRoster, setAttendanceStatus } from "../../lib/api";
import { inputClass, selectClass, labelClass } from "../../lib/ui";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import type { Course, SessionCreated, SessionRoster } from "../../types";

function AttendancePanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSessions, setActiveSessions] = useState<{ _id: string; course: Course; code: string; expiresAt: string }[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState(15);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [session, setSession] = useState<SessionCreated | null>(null);
  const [roster, setRoster] = useState<SessionRoster | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLists = useCallback(() => {
    setLoadingLists(true);
    Promise.all([getAllCourses(), getActiveSessions()])
      .then(([coursesRes, sessionsRes]) => {
        setCourses(coursesRes.data);
        setActiveSessions(sessionsRes.data);
      })
      .catch(() => setError("Failed to load courses."))
      .finally(() => setLoadingLists(false));
  }, []);

  useEffect(loadLists, [loadLists]);

  const loadRoster = (sessionId: string) => {
    setRosterLoading(true);
    getSessionRoster(sessionId)
      .then((res) => setRoster(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load roster."))
      .finally(() => setRosterLoading(false));
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!courseId || !duration) {
      setError("Select a course and duration.");
      return;
    }
    setCreating(true);
    try {
      const res = await createSession(courseId, duration);
      setSession(res.data);
      loadRoster(res.data.sessionId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start session.");
    } finally {
      setCreating(false);
    }
  };

  const resumeSession = (s: { _id: string; course: Course; code: string; expiresAt: string }) => {
    setError("");
    setSession({
      sessionId: s._id,
      code: s.code,
      qr: "",
      expiresAt: s.expiresAt,
      course: { courseTitle: s.course.courseTitle, courseCode: s.course.courseCode },
    });
    loadRoster(s._id);
  };

  const handleMark = async (studentId: string, status: "present" | "absent") => {
    if (!session) return;
    setUpdatingId(studentId);
    setRoster((prev) =>
      prev ? { ...prev, roster: prev.roster.map((r) => (r.studentId === studentId ? { ...r, status } : r)) } : prev
    );
    try {
      await setAttendanceStatus(session.sessionId, studentId, status);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update attendance.");
      loadRoster(session.sessionId);
    } finally {
      setUpdatingId(null);
    }
  };

  const backToStart = () => {
    setSession(null);
    setRoster(null);
    loadLists();
  };

  if (loadingLists) return <Spinner label="Loading attendance tools..." />;

  if (session) {
    const presentCount = roster?.roster.filter((r) => r.status === "present").length ?? 0;
    const isExpired = new Date(session.expiresAt) < new Date();

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <button onClick={backToStart} className="flex items-center gap-2 text-gray-400 hover:text-dark text-sm mb-2 cursor-pointer">
              <FaArrowLeft /> Back
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-dark">
              {session.course.courseCode} · {session.course.courseTitle}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {isExpired ? "This session has ended." : `Open until ${new Date(session.expiresAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
            </p>
          </div>
          <button onClick={() => loadRoster(session.sessionId)} className="flex items-center gap-2 text-primary text-sm font-semibold cursor-pointer">
            <FaRotateRight /> Refresh
          </button>
        </div>

        <Alert type="error" message={error} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {session.qr && (
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-4 text-center">
              <p className="text-sm font-semibold text-dark flex items-center gap-2"><FaQrcode /> Student self check-in</p>
              <img src={session.qr} alt="Session QR code" className="w-40 h-40" />
              <div>
                <p className="text-xs text-gray-400">PIN</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-primary">{session.code}</p>
              </div>
              <p className="text-xs text-gray-400">Students can scan this or enter the PIN to mark themselves present.</p>
            </div>
          )}

          <div className={`bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-1 ${session.qr ? "" : "lg:col-span-1"}`}>
            <p className="text-xs text-gray-400 font-semibold">Present</p>
            <p className="text-3xl font-bold text-dark">{presentCount}<span className="text-base text-gray-300"> / {roster?.roster.length ?? 0}</span></p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-1">
            <p className="text-xs text-gray-400 font-semibold">Unmarked</p>
            <p className="text-3xl font-bold text-dark">
              {roster?.roster.filter((r) => r.status === "unmarked").length ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-bold text-dark text-sm">Roll call</p>
            <p className="text-xs text-gray-400">Mark students manually, or let them self check-in above.</p>
          </div>
          {rosterLoading ? (
            <Spinner label="Loading roster..." />
          ) : !roster || roster.roster.length === 0 ? (
            <EmptyState icon={<FaClipboardCheck />} title="No students found for this course's department yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-6 text-gray-400 font-semibold">Name</th>
                    <th className="text-left py-3 px-6 text-gray-400 font-semibold">Matric No</th>
                    <th className="text-left py-3 px-6 text-gray-400 font-semibold">Status</th>
                    <th className="text-right py-3 px-6 text-gray-400 font-semibold">Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.roster.map((r) => (
                    <tr key={r.studentId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 font-semibold text-dark">{r.fullName}</td>
                      <td className="py-3 px-6 text-gray-500 font-mono">{r.matricNo}</td>
                      <td className="py-3 px-6">
                        <Badge tone={r.status === "present" ? "green" : r.status === "absent" ? "red" : "orange"}>
                          {r.status === "unmarked" ? "Unmarked" : r.status[0].toUpperCase() + r.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={updatingId === r.studentId}
                            onClick={() => handleMark(r.studentId, "present")}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 ${
                              r.status === "present" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            disabled={updatingId === r.studentId}
                            onClick={() => handleMark(r.studentId, "absent")}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 ${
                              r.status === "absent" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Attendance</h1>
        <p className="text-gray-500 mt-1 text-sm">Start a session, then mark students present or absent as they arrive.</p>
      </div>

      <Alert type="error" message={error} />

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="font-bold text-dark text-sm mb-4">Start a new session</p>
        <form onSubmit={handleCreateSession} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
            <label className={labelClass}>Course</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={selectClass}>
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.courseCode} · {c.courseTitle}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className={labelClass}>Duration (min)</label>
            <input type="number" min={1} max={120} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} />
          </div>
          <button type="submit" disabled={creating} className="btn py-3 px-6 text-sm font-bold disabled:opacity-60">
            {creating ? "Starting..." : "Start Session"}
          </button>
        </form>
      </div>

      <div>
        <p className="font-bold text-dark text-sm mb-4">Sessions still open</p>
        {activeSessions.length === 0 ? (
          <EmptyState icon={<FaClipboardCheck />} title="No open sessions right now." description="Start one above to begin taking attendance." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map((s) => (
              <button
                key={s._id}
                onClick={() => resumeSession(s)}
                className="bg-white rounded-2xl shadow-sm p-5 text-left hover:shadow-md transition-shadow cursor-pointer"
              >
                <p className="font-bold text-dark text-sm">{s.course?.courseCode}</p>
                <p className="text-xs text-gray-500 mt-1">{s.course?.courseTitle}</p>
                <p className="text-xs text-gray-400 mt-3">
                  Closes {new Date(s.expiresAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendancePanel;
