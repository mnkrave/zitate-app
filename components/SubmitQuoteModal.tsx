"use client";
import { useState, useEffect } from "react";

export default function SubmitQuoteModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [text, setText] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/users").then(res => res.json()).then(setUsers);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (image && image.size > 3 * 1024 * 1024) {
      alert("Das Bild ist zu groß! Bitte wähle ein Bild, das kleiner als 3 MB ist (für Vercel).");
      return;
    }

    const formData = new FormData();
    formData.append("text", text);
    formData.append("authorId", authorId);
    if (date) formData.append("date", date);
    if (image) formData.append("image", image);

    await fetch("/api/quotes", {
      method: "POST",
      body: formData
    });
    
    setText("");
    setAuthorId("");
    setDate("");
    setImage(null);
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Neues Zitat eintragen</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
          <div className="form-group">
            <label className="form-label">Wer hat es gesagt?</label>
            <select className="form-input" value={authorId} onChange={e => setAuthorId(e.target.value)} required>
              <option value="">Bitte wählen...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Was wurde gesagt?</label>
            <textarea className="form-input" rows={4} value={text} onChange={e => setText(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Datum (optional)</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Beweisfoto (optional)</label>
            <input className="form-input" type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
          </div>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
            <button type="submit" className="btn btn-primary">Speichern</button>
          </div>
        </form>
      </div>
    </div>
  );
}
