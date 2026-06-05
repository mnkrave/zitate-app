"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function QuoteCard({ quote, onUpvote }: { quote: any, onUpvote: () => void }) {
  const { data: session } = useSession();
  // @ts-ignore
  const userId = session?.user?.id;
  const isUpvoted = quote.upvotes.some((u: any) => u.userId === userId);

  const handleUpvote = async () => {
    if (!session) return alert("Bitte logge dich ein, um abzustimmen!");
    await fetch(`/api/quotes/${quote.id}/upvote`, { method: "POST" });
    onUpvote();
  };

  return (
    <div className="glass-panel">
      <Link href={`/profile/${quote.author.id}`} className="quote-header">
        <div className="quote-avatar">{quote.author.name.charAt(0).toUpperCase()}</div>
        <div>
          <strong>{quote.author.name}</strong>
        </div>
      </Link>
      
      {quote.imageUrl && (
        <img src={quote.imageUrl} alt="Quote context" className="quote-image" />
      )}
      
      <p className="quote-text">"{quote.text}"</p>
      
      <div className="quote-meta">
        <div>Eingereicht von: {quote.submitter.name}</div>
        <button className={`upvote-btn ${isUpvoted ? 'active' : ''}`} onClick={handleUpvote}>
          👍 {quote.upvotes.length}
        </button>
      </div>
    </div>
  );
}
