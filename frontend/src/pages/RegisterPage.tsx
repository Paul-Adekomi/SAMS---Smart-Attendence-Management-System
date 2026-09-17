import { useState, useEffect } from "react";
import { FaGraduationCap, FaEye, FaEyeSlash, FaCircleExclamation } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateRegistrationLink, registerStudent } from "../lib/api";
import { inputClass, labelClass } from "../lib/ui";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";

type LinkState =
  | { status: "checking" }
  | { status: "invalid"; message: string }
  | { status: "valid"; department: { _id: string; name: string }; expiresAt: string };

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [linkState, setLinkState] = useState<LinkState>({ status: "checking" });
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", matricNo: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLinkState({ status: "invalid", message: "No registration link was provided. Ask your admin for a valid link." });
      return;
    }
    validateRegistrationLink(token)
      .then((res) => {
        setLinkState({ status: "valid", department: res.data.department, expiresAt: res.data.expiresAt });
      })
      .catch((err: unknown) => {
        setLinkState({
          status: "invalid",
          message: err instanceof Error ? err.message : "This registration link is no longer valid.",
        });
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.matricNo || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await registerStudent({ token, ...form });
      sessionStorage.setItem("sams_token", res.data.token);
      sessionStorage.setItem("sams_user", JSON.stringify({ ...res.data.student, role: "student" }));
      navigate("/student");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <a href="/" className="text-primary flex items-center gap-2 self-start">
          <FaGraduationCap className="text-4xl" />
          <span className="font-extrabold text-xl">SAMS</span>
        </a>

        {linkState.status === "checking" && <Spinner label="Checking your registration link..." />}

        {linkState.status === "invalid" && (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <FaCircleExclamation className="text-red-400 text-5xl" />
            <div>
              <h1 className="text-xl font-bold text-dark">Link not valid</h1>
              <p className="text-gray-500 text-sm mt-2">{linkState.message}</p>
            </div>
            <a href="/login" className="text-primary text-sm font-semibold hover:underline">
              Go to login
            </a>
          </div>
        )}

        {linkState.status === "valid" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-dark">Create your student account</h1>
              <p className="text-gray-500 text-sm mt-1">
                Registering under <span className="font-semibold text-dark">{linkState.department.name}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Matric Number</label>
                <input
                  type="text"
                  value={form.matricNo}
                  onChange={(e) => setForm({ ...form, matricNo: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. STU1010"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${inputClass} w-full pr-12`}
                    placeholder="At least 6 characters"
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
                disabled={submitting}
                className="btn py-3 text-sm font-bold mt-2 disabled:opacity-60"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Already have an account? <a href="/login" className="text-primary font-semibold hover:underline">Sign in</a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
