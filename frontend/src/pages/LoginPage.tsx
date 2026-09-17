import { useState } from "react";
import { FaGraduationCap, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginStudent, loginAdmin } from "../lib/api";
import { inputClass, labelClass } from "../lib/ui";
import Alert from "../components/ui/Alert";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "admin">("student");
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
        res = await loginAdmin(form.id, form.password);
        sessionStorage.setItem("sams_token", res.data.token);
        sessionStorage.setItem("sams_user", JSON.stringify({ ...res.data.admin, role: "admin" }));
        navigate("/admin");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again");
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
          {(["student", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setForm({ id: "", password: "" }); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                role === r ? "bg-primary text-white shadow" : "text-gray-500 hover:text-dark"
              }`}
            >
              {r === "student" ? "Student" : "Admin"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              {role === "student" ? "Matric Number" : "Admin ID"}
            </label>
            <input
              type="text"
              placeholder={role === "student" ? "e.g. STU1001" : "e.g. ADM001"}
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`${inputClass} w-full pr-12`}
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
          <Alert type="error" message={error} />
          <button
            type="submit"
            disabled={loading}
            className="btn py-3 text-sm font-bold mt-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {role === "student" && (
            <p className="text-xs text-gray-400 text-center">
              New student? You'll need a registration link from your admin.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
