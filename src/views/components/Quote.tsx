import React, { useEffect, useState } from "react";
import phrases from "../../data/phrases.json";

interface QuoteData {
  content: string;
  author: string;
}
interface PhraseJson {
  id: number;
  quote: string;
  author: string;
}

export const Quote: React.FC = () => {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastTs, setLastTs] = useState<number | null>(null);

  function load(force = false) {
    const KEY = "quoteCacheLocal";
    if (!force) {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        try {
          const cached = JSON.parse(raw) as { idx: number; ts: number };
          const age = Date.now() - cached.ts;
          if (age < 86400000 && phrases[cached.idx]) {
            const p = phrases[cached.idx] as PhraseJson;
            setQuote({ content: p.quote, author: p.author.trim() });
            setLastTs(cached.ts);
            return;
          }
        } catch {}
      }
    }
    setLoading(true);
    setError(null);
    try {
      const idx = Math.floor(Math.random() * (phrases as PhraseJson[]).length);
      const p = (phrases as PhraseJson[])[idx];
      if (!p) throw new Error("Lista vazia");
      const q = { content: p.quote, author: p.author.trim() };
      setQuote(q);
      const ts = Date.now();
      setLastTs(ts);
      localStorage.setItem(KEY, JSON.stringify({ idx, ts }));
    } catch (e) {
      setError("Faça pequenas coisas com grande amor. — Madre Teresa");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // se veio do cache registrar timestamp
    const raw = localStorage.getItem("quoteCacheLocal");
    if (raw) {
      try {
        const cached = JSON.parse(raw) as { idx: number; ts: number };
        setLastTs(cached.ts);
      } catch {}
    }
  }, []);

  return (
    <div className="text-sm text-gray-700 bg-gray-50 border rounded p-3 flex flex-col gap-2">
      {quote && (
        <p className="italic">
          “{quote.content}”{" "}
          <span className="text-xs not-italic text-gray-500">
            — {quote.author}
          </span>
        </p>
      )}
      {loading && <p>Carregando inspiração...</p>}
      {!loading && !quote && error && <p className="italic">{error}</p>}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => load(true)}
          className="btn px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700"
        >
          Retry
        </button>
        <span className="text-[10px] text-gray-500">
          {lastTs && `Atualizado: ${new Date(lastTs).toLocaleString()}`}
        </span>
      </div>
    </div>
  );
};
