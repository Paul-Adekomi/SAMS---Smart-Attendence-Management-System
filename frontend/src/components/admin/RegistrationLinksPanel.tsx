import { useState, useEffect } from "react";
import { FaLink, FaCopy, FaBan, FaPlus, FaCheck } from "react-icons/fa6";
import { generateRegistrationLink, listRegistrationLinks, revokeRegistrationLink } from "../../lib/api";
import { selectClass, labelClass, inputClass } from "../../lib/ui";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import type { Department, RegistrationLink, RegistrationLinkStatus } from "../../types";

const badgeTone: Record<RegistrationLinkStatus, "green" | "gray" | "red"> = {
  active: "green",
  expired: "gray",
  revoked: "red",
};

function RegistrationLinksPanel({ departments }: { departments: Department[] }) {
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedToken, setCopiedToken] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(48);
  const [generating, setGenerating] = useState(false);

  const load = () => {
    setLoading(true);
    listRegistrationLinks()
      .then((res) => setLinks(res.data))
      .catch(() => setError("Failed to load registration links."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const registrationUrl = (token: string) => `${window.location.origin}/register?token=${token}`;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!departmentId || !expiresInHours) {
      setError("Select a department and expiry.");
      return;
    }
    setGenerating(true);
    try {
      await generateRegistrationLink(departmentId, expiresInHours);
      setShowModal(false);
      setDepartmentId("");
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate link.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this link? Students will no longer be able to register with it.")) return;
    try {
      await revokeRegistrationLink(id);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to revoke link.");
    }
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(registrationUrl(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(""), 1500);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">Registration Links</h1>
          <p className="text-gray-500 mt-1 text-sm">Let students register themselves under a department, within a time window.</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(""); }} className="btn py-2 px-5 text-sm flex items-center gap-2">
          <FaPlus /> Generate Link
        </button>
      </div>

      <Alert type="error" message={error} />

      {loading ? (
        <Spinner label="Loading links..." />
      ) : links.length === 0 ? (
        <EmptyState icon={<FaLink />} title="No registration links yet." description="Generate one so students can sign themselves up." />
      ) : (
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <div key={link._id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-bold text-dark text-sm">{link.department?.name}</p>
                  <Badge tone={badgeTone[link.status]}>{link.status[0].toUpperCase() + link.status.slice(1)}</Badge>
                </div>
                <p className="text-xs text-gray-400">
                  {link.status === "active"
                    ? `Expires ${new Date(link.expiresAt).toLocaleString()}`
                    : link.status === "expired"
                    ? `Expired ${new Date(link.expiresAt).toLocaleString()}`
                    : "Revoked by admin"}
                </p>
                <p className="text-xs text-gray-400 font-mono truncate max-w-xs md:max-w-md">{registrationUrl(link.token)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => copyLink(link.token)}
                  disabled={link.status !== "active"}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {copiedToken === link.token ? <FaCheck /> : <FaCopy />}
                  {copiedToken === link.token ? "Copied" : "Copy link"}
                </button>
                {link.status === "active" && (
                  <button
                    onClick={() => handleRevoke(link._id)}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <FaBan /> Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Generate Registration Link" onClose={() => setShowModal(false)}>
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={selectClass}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Expires in (hours)</label>
              <input type="number" min={1} value={expiresInHours} onChange={(e) => setExpiresInHours(Number(e.target.value))} className={inputClass} />
            </div>
            <Alert type="error" message={error} />
            <button type="submit" disabled={generating} className="btn py-3 text-sm font-bold disabled:opacity-60">
              {generating ? "Generating..." : "Generate Link"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default RegistrationLinksPanel;
