import { useState } from "react";
import { FaGraduationCap, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginStudent, loginLecturer } from "../lib/api";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"lecturer" | "student">("student");
  const [form, setForm] = useState({ id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.id || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      let res;
      if (role === "student") {
        res = await loginStudent(form.id, form.password);
        sessionStorage.setItem("sams_token", res.data.token);
        sessionStorage.setItem("sams_user", JSON.stringify({ ...res.data.student, role: "student" }));
        navigate("/student");
      } else {
        res = await loginLecturer(form.id, form.password);
        sessionStorage.setItem("sams_token", res.data.token);
        sessionStorage.setItem("sams_user", JSON.stringify({ ...res.data.lecturer, role: "lecturer" }));
        navigate("/lecturer");
      }
    } catch (err: unknown) {
      if (err instanceof Error){
        setError(err.message)
      }else{
        setError("Login failed. Please try again")
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <a href="/" className="text-primary flex items-center gap-2 self-start">
          <FaGraduationCap className="text-4xl" />
          <span className="font-extrabold text-xl">SAMS</span>
        </a>

        <div>
          <h1 className="text-2xl font-bold text-dark">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {/* Role Toggle */}
        <div className="flex w-full bg-gray-100 rounded-xl p-1">
          {(["student", "lecturer"] as const).map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setForm({ id: "", password: "" }); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                role === r ? "bg-primary text-white shadow" : "text-gray-500 hover:text-dark"
              }`}
            >
              {r === "student" ? "Student" : "Lecturer"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-dark">
              {role === "student" ? "Matric Number" : "Lecturer ID"}
            </label>
            <input
              type="text"
              placeholder={role === "student" ? "e.g. STU1001" : "e.g. LEC001"}
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-dark">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn py-3 text-sm font-bold mt-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
