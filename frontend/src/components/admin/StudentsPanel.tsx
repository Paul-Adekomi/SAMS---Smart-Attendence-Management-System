import { useState, useEffect } from "react";
import { FaUserPlus, FaUsers, FaPen, FaUserSlash, FaRotateLeft } from "react-icons/fa6";
import { getAllStudents, createStudent, updateStudent, deleteStudent } from "../../lib/api";
import { inputClass, selectClass, labelClass } from "../../lib/ui";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import type { Department, Student } from "../../types";

const emptyForm = { fullName: "", email: "", matricNo: "", password: "", departmentId: "" };

function StudentsPanel({ departments }: { departments: Department[] }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addLoading, setAddLoading] = useState(false);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", matricNo: "", departmentId: "" });
  const [editLoading, setEditLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getAllStudents()
      .then((res) => setStudents(res.data))
      .catch(() => setError("Failed to load students."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visibleStudents = deptFilter ? students.filter((s) => s.department?._id === deptFilter) : students;

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!addForm.fullName || !addForm.email || !addForm.matricNo || !addForm.password || !addForm.departmentId) {
      setError("Please fill in all fields.");
      return;
    }
    setAddLoading(true);
    try {
      await createStudent(addForm);
      setSuccess(`Account created for ${addForm.fullName}.`);
      setAddForm(emptyForm);
      setShowAddModal(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create student account.");
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (student: Student) => {
    setError("");
    setSuccess("");
    setEditingStudent(student);
    setEditForm({
      fullName: student.fullName,
      email: student.email,
      matricNo: student.matricNo,
      departmentId: student.department?._id || "",
    });
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setError("");
    setEditLoading(true);
    try {
      await updateStudent(editingStudent._id, editForm);
      setSuccess(`${editForm.fullName}'s details were updated.`);
      setEditingStudent(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update student.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async (student: Student) => {
    if (!confirm(`Deactivate ${student.fullName}'s account? Their attendance history will be kept.`)) return;
    setError("");
    try {
      await deleteStudent(student._id);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to deactivate student.");
    }
  };

  const handleReactivate = async (student: Student) => {
    setError("");
    try {
      await updateStudent(student._id, { isActive: true });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reactivate student.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">Students</h1>
          <p className="text-gray-500 mt-1 text-sm">Add students directly, or share a registration link so they sign themselves up.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={() => { setShowAddModal(true); setError(""); setSuccess(""); }}
            className="btn py-2 px-5 text-sm flex items-center gap-2"
          >
            <FaUserPlus /> Add Student
          </button>
        </div>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {loading ? (
        <Spinner label="Loading students..." />
      ) : visibleStudents.length === 0 ? (
        <EmptyState
          icon={<FaUsers />}
          title={deptFilter ? "No students in this department yet." : "No students yet."}
          description="Add the first one, or generate a registration link from the Registration Links tab."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Matric No</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Department</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-dark">{s.fullName}</td>
                  <td className="py-3 px-4 text-gray-500 font-mono">{s.matricNo}</td>
                  <td className="py-3 px-4 text-gray-500">{s.email}</td>
                  <td className="py-3 px-4 text-gray-500">{s.department?.name || "—"}</td>
                  <td className="py-3 px-4">
                    <Badge tone={s.isActive ? "green" : "gray"}>{s.isActive ? "Active" : "Deactivated"}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-gray-400 hover:text-primary cursor-pointer transition-colors"
                        title="Edit student"
                      >
                        <FaPen />
                      </button>
                      {s.isActive ? (
                        <button
                          onClick={() => handleDeactivate(s)}
                          className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                          title="Deactivate account"
                        >
                          <FaUserSlash />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(s)}
                          className="text-gray-400 hover:text-green-600 cursor-pointer transition-colors"
                          title="Reactivate account"
                        >
                          <FaRotateLeft />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <Modal title="Add Student" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Full Name</label>
              <input type="text" value={addForm.fullName} onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Email</label>
              <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Matric Number</label>
              <input type="text" placeholder="e.g. STU1010" value={addForm.matricNo} onChange={(e) => setAddForm({ ...addForm, matricNo: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Department</label>
              <select value={addForm.departmentId} onChange={(e) => setAddForm({ ...addForm, departmentId: e.target.value })} className={selectClass}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Temporary Password</label>
              <input type="text" placeholder="Student will use this to log in" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className={inputClass} />
            </div>
            <Alert type="error" message={error} />
            <button type="submit" disabled={addLoading} className="btn py-3 text-sm font-bold disabled:opacity-60">
              {addLoading ? "Creating account..." : "Create Student Account"}
            </button>
          </form>
        </Modal>
      )}

      {editingStudent && (
        <Modal title={`Edit ${editingStudent.fullName}`} onClose={() => setEditingStudent(null)}>
          <form onSubmit={handleUpdateStudent} className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Full Name</label>
              <input type="text" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Matric Number</label>
              <input type="text" value={editForm.matricNo} onChange={(e) => setEditForm({ ...editForm, matricNo: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Department</label>
              <select value={editForm.departmentId} onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })} className={selectClass}>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <Alert type="error" message={error} />
            <button type="submit" disabled={editLoading} className="btn py-3 text-sm font-bold disabled:opacity-60">
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default StudentsPanel;
