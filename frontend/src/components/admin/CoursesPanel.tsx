import { useState, useEffect } from "react";
import { FaBook, FaPlus } from "react-icons/fa6";
import { getAllCourses, createCourse } from "../../lib/api";
import { inputClass, selectClass, labelClass } from "../../lib/ui";
import Alert from "../ui/Alert";
import Modal from "../ui/Modal";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import type { Department, Course } from "../../types";

const emptyForm = {
  courseTitle: "",
  courseCode: "",
  departmentId: "",
  creditUnit: 3,
  semester: "first" as "first" | "second",
  level: "",
};

function CoursesPanel({ departments }: { departments: Department[] }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [addLoading, setAddLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getAllCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setError("Failed to load courses."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visibleCourses = deptFilter ? courses.filter((c) => c.department?._id === deptFilter) : courses;

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.courseTitle || !form.courseCode || !form.departmentId || !form.creditUnit || !form.level) {
      setError("Please fill in all fields.");
      return;
    }
    setAddLoading(true);
    try {
      await createCourse(form);
      setSuccess(`${form.courseCode} was added.`);
      setForm(emptyForm);
      setShowAddModal(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create course.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">Courses</h1>
          <p className="text-gray-500 mt-1 text-sm">Courses students take attendance sessions under.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={selectClass}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={() => { setShowAddModal(true); setError(""); setSuccess(""); }}
            className="btn py-2 px-5 text-sm flex items-center gap-2"
          >
            <FaPlus /> Add Course
          </button>
        </div>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {loading ? (
        <Spinner label="Loading courses..." />
      ) : visibleCourses.length === 0 ? (
        <EmptyState
          icon={<FaBook />}
          title={deptFilter ? "No courses in this department yet." : "No courses yet."}
          description="Add a course so you can start attendance sessions for it."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Code</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Title</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Department</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Level</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Semester</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Units</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-dark">{c.courseCode}</td>
                  <td className="py-3 px-4 text-gray-600">{c.courseTitle}</td>
                  <td className="py-3 px-4 text-gray-500">{c.department?.name || "—"}</td>
                  <td className="py-3 px-4 text-gray-500">{c.level?.join(", ")}</td>
                  <td className="py-3 px-4 text-gray-500 capitalize">{c.semester}</td>
                  <td className="py-3 px-4 text-gray-500">{c.creditUnit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <Modal title="Add Course" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className={labelClass}>Course Title</label>
              <input type="text" value={form.courseTitle} onChange={(e) => setForm({ ...form, courseTitle: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Course Code</label>
              <input type="text" placeholder="e.g. CSC101" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Credit Units</label>
              <input type="number" min={1} value={form.creditUnit} onChange={(e) => setForm({ ...form, creditUnit: Number(e.target.value) })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Department</label>
              <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className={selectClass}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value as "first" | "second" })} className={selectClass}>
                <option value="first">First</option>
                <option value="second">Second</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className={labelClass}>Level</label>
              <input type="text" placeholder="e.g. ND3 or 300" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inputClass} />
            </div>
            <Alert type="error" message={error} className="md:col-span-2" />
            <button type="submit" disabled={addLoading} className="btn py-3 text-sm font-bold disabled:opacity-60 md:col-span-2">
              {addLoading ? "Adding course..." : "Add Course"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default CoursesPanel;
