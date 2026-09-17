import { useState, useEffect, useCallback } from "react";
import { FaCircleCheck, FaCircleXmark, FaUserGroup } from "react-icons/fa6";
import { getSessionRoster, setAttendanceStatus } from "../../lib/api";
import type { RosterEntry } from "../../types";
import Alert from "../ui/Alert";
import Spinner from "../ui/Spinner";
import Badge from "../ui/Badge";

function SessionRosterEditor({ sessionId }: { sessionId: string }) {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [courseLabel, setCourseLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadRoster = useCallback(() => {
    setLoading(true);
    setError("");
    getSessionRoster(sessionId)
      .then((res) => {
        setRoster(res.data.roster);
        setCourseLabel(`${res.data.courseCode} — ${res.data.courseTitle}`);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load roster."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const handleMark = async (studentId: string, status: "present" | "absent") => {
    setSavingId(studentId);
    setError("");
    try {
      await setAttendanceStatus(sessionId, studentId, status);
      setRoster((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update attendance.");
    } finally {
      setSavingId(null);
    }
  };

  const presentCount = roster.filter((r) => r.status === "present").length;
  const absentCount = roster.filter((r) => r.status === "absent").length;
  const unmarkedCount = roster.filter((r) => r.status === "unmarked").length;

  if (loading) return <Spinner label="Loading roster..." />;

  return (
    <div className="flex flex-col gap-4">
      <Alert type="error" message={error} />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm font-semibold text-dark">{courseLabel}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="green">{presentCount} present</Badge>
          <Badge tone="red">{absentCount} absent</Badge>
          <Badge tone="gray">{unmarkedCount} unmarked</Badge>
        </div>
      </div>

      {roster.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
          <FaUserGroup className="text-4xl" />
          <p className="text-sm">No active students found in this department.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-2.5 px-4 text-gray-400 font-semibold">Name</th>
                <th className="text-left py-2.5 px-4 text-gray-400 font-semibold">Matric No</th>
                <th className="text-left py-2.5 px-4 text-gray-400 font-semibold">Status</th>
                <th className="text-right py-2.5 px-4 text-gray-400 font-semibold">Mark</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.studentId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-dark">{r.fullName}</td>
                  <td className="py-3 px-4 text-gray-500 font-mono">{r.matricNo}</td>
                  <td className="py-3 px-4">
                    {r.status === "present" && (
                      <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                        <FaCircleCheck /> Present
                      </span>
                    )}
                    {r.status === "absent" && (
                      <span className="flex items-center gap-1.5 text-red-500 text-xs font-semibold">
                        <FaCircleXmark /> Absent
                      </span>
                    )}
                    {r.status === "unmarked" && (
                      <span className="text-gray-400 text-xs font-semibold">Not marked</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={savingId === r.studentId}
                        onClick={() => handleMark(r.studentId, "present")}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 ${
                          r.status === "present"
                            ? "bg-green-500 text-white"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        disabled={savingId === r.studentId}
                        onClick={() => handleMark(r.studentId, "absent")}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 ${
                          r.status === "absent"
                            ? "bg-red-500 text-white"
                            : "bg-red-50 text-red-500 hover:bg-red-100"
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
  );
}

export default SessionRosterEditor;
