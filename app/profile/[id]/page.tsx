"use client";
import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import QuoteCard from "@/components/QuoteCard";

export default function Profile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchUser = async () => {
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    setUser(data);
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await fetch(`/api/users/${id}/analyze`, { method: "POST" });
      await fetchUser();
    } catch (e) {
      alert("Analyse fehlgeschlagen.");
    }
    setAnalyzing(false);
  };

  if (!user) return <div>Lade Profil...</div>;

  return (
    <div>
      <div className="glass-panel" style={{ marginBottom: "2rem", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <div style={{ width: "100px", height: "100px", borderRadius: "50%", flexShrink: 0, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: "bold" }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1>{user.name}</h1>
          <p style={{ color: "var(--text-secondary)" }}>{user.quotes?.length || 0} Zitate</p>
          
          <div style={{ marginTop: "1rem", padding: "1.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>KI Humor-Profil</h3>
              {/* @ts-ignore */}
              {session?.user?.id === user.id && (
                <button className="btn btn-secondary" onClick={handleAnalyze} disabled={analyzing} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                  {analyzing ? "Analysiere..." : (user.aiProfile ? "Neu analysieren" : "Profil generieren")}
                </button>
              )}
            </div>
            {user.aiProfile ? (
              <p style={{ fontStyle: "italic", whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>{user.aiProfile}</p>
            ) : (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Noch kein KI-Profil generiert. Klicke auf "Profil generieren", wenn Zitate vorhanden sind!</p>
            )}
          </div>
        </div>
      </div>

      <h2>Beliebteste Zitate von {user.name}</h2>
      <div className="quotes-grid">
        {user.quotes?.map((q: any) => (
          <QuoteCard key={q.id} quote={q} onUpvote={fetchUser} />
        ))}
        {user.quotes?.length === 0 && <p style={{ gridColumn: "1/-1", color: "var(--text-secondary)" }}>Keine Zitate vorhanden.</p>}
      </div>
    </div>
  );
}
