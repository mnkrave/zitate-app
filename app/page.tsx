"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import QuoteCard from "@/components/QuoteCard";
import SubmitQuoteModal from "@/components/SubmitQuoteModal";

export default function Home() {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuotes = async () => {
    const res = await fetch("/api/quotes");
    const data = await res.json();
    setQuotes(data);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Neueste Zitate</h1>
        {session && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Neues Zitat</button>
        )}
      </div>

      {!session && (
        <div className="glass-panel" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h3>Willkommen bei den Zitaten deiner Freunde!</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Bitte logge dich ein oder registriere dich, um Zitate hinzuzufügen und abzustimmen.</p>
        </div>
      )}

      <div className="quotes-grid">
        {quotes.map((q: any) => (
          <QuoteCard key={q.id} quote={q} onUpvote={fetchQuotes} />
        ))}
      </div>

      <SubmitQuoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchQuotes} 
      />
    </div>
  );
}
