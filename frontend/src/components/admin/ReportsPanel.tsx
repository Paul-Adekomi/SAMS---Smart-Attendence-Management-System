import { useState, useEffect } from "react";
import { FaChartBar, FaFileCsv, FaFileExcel, FaMagnifyingGlass, FaUser } from "react-icons/fa6";
import {
  getCoursesByDepartment,
  getWeeklyReport,
  exportCSV,
  exportExcel,
  getAllStudents,
  getStudentAttendanceHistory,
} from "../../lib/api";
import { selectClass, labelClass, inputClass } from "../../lib/ui";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import type { Department, Course, WeeklyReport, Student, StudentAttendanceHistory } from "../../types";

const todayISO = () => new Date().toISOString().slice(0, 10);
const weekAgoISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
};

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function ReportsPanel({ departments }: { departments: Department[] }) {
  const [departmentId, setDepartmentId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [from, setFrom] = useState(weekAgoISO());
  const [to, setTo] = useState(todayISO());

  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportingId, setExportingId] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<StudentAttendanceHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    getAllStudents().then((res) => setStudents(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setCourseId("");
    if (!departmentId) { setCourses([]); return; }
    getCoursesByDepartment(departmentId).then((res) => setCourses(res.data)).catch(() => {});
  }, [departmentId]);

  const runReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!departmentId || !from || !to) {
      setError("Select a department and date range.");
      return;
    }
    setLoading(true);
    try {
      const res = await getWeeklyReport(from, to, departmentId, courseId || undefined);
      setReport(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (sessionId: string, format: "csv" | "excel") => {
    setExportingId(sessionId + format);
    try {
      const res = format === "csv" ? await exportCSV(sessionId) : await exportExcel(sessionId);
      downloadBlob(res.data, `attendance-${sessionId}.${format === "csv" ? "csv" : "xlsx"}`);
    } catch {
      setError("Failed to download report.");
    } finally {
      setExportingId("");
    }
  };

  const filteredStudents = search.trim()
    ? students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(search.toLowerCase()) ||
          s.matricNo.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : [];

  const viewStudentHistory = async (studentId: string) => {
    setHistoryLoading(true);
    setSearch("");
    try {
      const res = await getStudentAttendanceHistory(studentId);
      setHistory(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load student history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Reports</h1>
        <p className="text-gray-500 mt-1 text-sm">Attendance summaries by date range, and individual student histories.</p>
      </div>

      <Alert type="error" message={error} />

      {/* Period report */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="font-bold text-dark text-sm mb-4">Attendance by period</p>
        <form onSubmit={runReport} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className={labelClass}>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={selectClass}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className={labelClass}>Course (optional)</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={selectClass} disabled={!departmentId}>
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.courseCode}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={loading} className="btn py-3 px-6 text-sm font-bold disabled:opacity-60">
            {loading ? "Running..." : "Run Report"}
          </button>
        </form>
      </div>

      {loading && <Spinner label="Generating report..." />}

      {!loading && report && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs text-gray-400 font-semibold">Sessions</p>
              <p className="text-2xl font-bold text-dark mt-1">{report.totalSessions}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs text-gray-400 font-semibold">Present marks</p>
              <p className="text-2xl font-bold text-dark mt-1">{report.totalPresentMarks}</p>
            </div>
          </div>

          {report.sessions.length === 0 ? (
            <EmptyState icon={<FaChartBar />} title="No sessions in this range." description="Try widening the date range or picking a different department." />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Course</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Present</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Export</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sessions.map((s) => (
                    <tr key={s.sessionId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-500">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-semibold text-dark">{s.courseCode} <span className="text-gray-400 font-normal">· {s.courseTitle}</span></td>
                      <td className="py-3 px-4 text-gray-500">{s.presentCount}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            disabled={exportingId === s.sessionId + "csv"}
                            onClick={() => handleExport(s.sessionId, "csv")}
                            className="text-gray-400 hover:text-primary cursor-pointer transition-colors disabled:opacity-50"
                            title="Download CSV"
                          >
                            <FaFileCsv />
                          </button>
                          <button
                            disabled={exportingId === s.sessionId + "excel"}
                            onClick={() => handleExport(s.sessionId, "excel")}
                            className="text-gray-400 hover:text-primary cursor-pointer transition-colors disabled:opacity-50"
                            title="Download Excel"
                          >
                            <FaFileExcel />
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
      )}

      {/* Student history search */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="font-bold text-dark text-sm mb-4">Individual student history</p>
        <div className="relative max-w-sm">
          <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
          <input
            type="text"
            placeholder="Search by name or matric no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} w-full pl-10`}
          />
          {filteredStudents.length > 0 && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {filteredStudents.map((s) => (
                <button
                  key={s._id}
                  onClick={() => viewStudentHistory(s._id)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm cursor-pointer flex justify-between items-center"
                >
                  <span className="font-medium text-dark">{s.fullName}</span>
                  <span className="text-gray-400 font-mono text-xs">{s.matricNo}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {historyLoading && <Spinner label="Loading history..." />}

        {!historyLoading && history && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <FaUser />
                </span>
                <div>
                  <p className="font-bold text-dark text-sm">{history.student.fullName}</p>
                  <p className="text-xs text-gray-400 font-mono">{history.student.matricNo}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Present <span className="font-bold text-dark">{history.presentCount}</span> / {history.totalRecords}
              </p>
            </div>

            {history.history.length === 0 ? (
              <EmptyState icon={<FaChartBar />} title="No attendance records for this student yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold">Date</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold">Course</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.history.map((h) => (
                      <tr key={h.recordId} className="border-b border-gray-50">
                        <td className="py-2 px-3 text-gray-500">{new Date(h.date).toLocaleDateString()}</td>
                        <td className="py-2 px-3 text-dark font-medium">{h.courseCode}</td>
                        <td className="py-2 px-3">
                          <Badge tone={h.status === "present" ? "green" : "red"}>{h.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPanel;
