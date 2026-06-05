"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registrierung fehlgeschlagen");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: "400px", margin: "4rem auto" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Registrieren</h2>
      {error && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Passwort</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Konto erstellen</button>
        <div style={{ textAlign: "center", margin: "1rem 0", color: "var(--text-secondary)" }}>oder</div>
        <button type="button" className="btn btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} onClick={() => signIn("google", { callbackUrl: "/" })}>
          Mit Google registrieren
        </button>
      </form>
    </div>
  );
}
