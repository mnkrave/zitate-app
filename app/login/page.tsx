"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email, password, redirect: false
    });
    if (res?.error) {
      setError("Login fehlgeschlagen. Bitte überprüfe deine Daten.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: "400px", margin: "4rem auto" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Login</h2>
      {error && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Passwort</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Einloggen</button>
        <div style={{ textAlign: "center", margin: "1rem 0", color: "var(--text-secondary)" }}>oder</div>
        <button type="button" className="btn btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} onClick={() => signIn("google", { callbackUrl: "/" })}>
          Mit Google einloggen
        </button>
      </form>
    </div>
  );
}
