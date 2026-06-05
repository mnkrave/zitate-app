"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [inviteResult, setInviteResult] = useState<{ inviteLink: string; emailSent: boolean } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copyStatus, setCopyStatus] = useState("Kopieren");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wlRes, usersRes] = await Promise.all([
        fetch("/api/admin/whitelist"),
        fetch("/api/admin/users")
      ]);

      if (!wlRes.ok || !usersRes.ok) {
        throw new Error("Fehler beim Laden der Admin-Daten.");
      }

      const wlData = await wlRes.json();
      const usersData = await usersRes.json();

      setWhitelist(wlData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || "Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user?.email !== "lukasreinle0@gmail.com") {
        router.push("/");
      } else {
        fetchData();
      }
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return <div style={{ textAlign: "center", marginTop: "4rem" }}>Lade Admin-Dashboard...</div>;
  }

  if (session?.user?.email !== "lukasreinle0@gmail.com") {
    return <div style={{ textAlign: "center", marginTop: "4rem", color: "var(--danger)" }}>Zugriff verweigert.</div>;
  }

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviteResult(null);

    if (!newEmail) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "E-Mail konnte nicht hinzugefügt werden.");
      }

      setSuccess("E-Mail erfolgreich freigeschaltet!");
      setInviteResult({
        inviteLink: data.inviteLink,
        emailSent: data.emailSent
      });
      setNewEmail("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveWhitelist = async (email: string) => {
    if (!confirm(`Möchtest du ${email} wirklich von der Whitelist löschen? Der User kann sich danach nicht mehr anmelden.`)) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/whitelist?email=${encodeURIComponent(email)}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "E-Mail konnte nicht gelöscht werden.");
      }

      setSuccess(data.message);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus("Kopiert!");
    setTimeout(() => setCopyStatus("Kopieren"), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1>User-Verwaltung (Super-Admin)</h1>
        <p style={{ color: "var(--text-secondary)" }}>Verwalte hier den Zugriff auf die Webseite und lade deine Freunde ein.</p>
      </div>

      {error && <div className="glass-panel" style={{ borderLeft: "4px solid var(--danger)", color: "var(--danger)", marginBottom: "1.5rem", padding: "1rem" }}>{error}</div>}
      {success && <div className="glass-panel" style={{ borderLeft: "4px solid #10b981", color: "#10b981", marginBottom: "1.5rem", padding: "1rem" }}>{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start", marginBottom: "3rem" }}>
        {/* Whitelist section */}
        <div className="glass-panel" style={{ height: "100%" }}>
          <h3>E-Mail Whitelist (Zugriffserlaubnis)</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.5rem 0 1.5rem 0" }}>
            Trage hier E-Mails von Freunden ein. Nur freigeschaltete E-Mails können sich registrieren oder per Google anmelden.
          </p>

          <form onSubmit={handleAddWhitelist} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <input 
              type="email" 
              placeholder="freund@example.com" 
              className="form-input" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)} 
              required 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? "Lade..." : "Einladen"}
            </button>
          </form>

          {inviteResult && (
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--glass-border)", marginBottom: "1.5rem" }}>
              <strong style={{ fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>
                {inviteResult.emailSent ? "📧 Einladungs-E-Mail versendet!" : "🔗 Einladungslink generiert:"}
              </strong>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={inviteResult.inviteLink} 
                  readOnly 
                  style={{ flex: 1, fontSize: "0.8rem", padding: "8px" }}
                />
                <button className="btn btn-secondary" onClick={() => copyToClipboard(inviteResult.inviteLink)} style={{ padding: "8px 12px", fontSize: "0.8rem" }}>
                  {copyStatus}
                </button>
              </div>
              {!inviteResult.emailSent && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem", display: "block" }}>
                  Kopiere den Link und sende ihn deinem Freund manuell (z.B. per WhatsApp). Google Log In ist ebenfalls möglich, sofern die Google E-Mail eingetragen wurde!
                </span>
              )}
            </div>
          )}

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
                  <th style={{ padding: "8px 0", color: "var(--text-secondary)" }}>E-Mail</th>
                  <th style={{ padding: "8px 0", color: "var(--text-secondary)", textAlign: "right" }}>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {whitelist.map(item => (
                  <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "10px 0" }}>{item.email}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                      {item.email !== "lukasreinle0@gmail.com" ? (
                        <button 
                          onClick={() => handleRemoveWhitelist(item.email)} 
                          style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          Löschen
                        </button>
                      ) : (
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontStyle: "italic" }}>Super Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
                {whitelist.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ padding: "1rem 0", textStyle: "italic", color: "var(--text-secondary)" }}>Keine E-Mails auf der Whitelist.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registered Users Section */}
        <div className="glass-panel" style={{ height: "100%" }}>
          <h3>Registrierte Benutzer</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.5rem 0 1.5rem 0" }}>
            Hier siehst du alle registrierten Accounts und wie viele Zitate ihnen zugeschrieben oder eingereicht wurden.
          </p>

          <div style={{ maxHeight: "450px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
                  <th style={{ padding: "8px 0", color: "var(--text-secondary)" }}>Name</th>
                  <th style={{ padding: "8px 0", color: "var(--text-secondary)" }}>E-Mail</th>
                  <th style={{ padding: "8px 0", color: "var(--text-secondary)", textAlign: "center" }}>Zitate (Gesagt/Erstellt)</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: u.role === "ADMIN" ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "bold" }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: u.role === "ADMIN" ? "bold" : "normal" }}>
                        {u.name} {u.role === "ADMIN" && "👑"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 0", color: "var(--text-secondary)" }}>{u.email}</td>
                    <td style={{ padding: "10px 0", textAlign: "center" }}>
                      {u._count.quotes} / {u._count.submitted}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: "1rem 0", textStyle: "italic", color: "var(--text-secondary)", textAlign: "center" }}>Keine registrierten Benutzer.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
