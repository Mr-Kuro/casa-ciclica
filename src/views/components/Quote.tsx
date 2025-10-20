import React, { useEffect, useState } from "react";
import { LABELS } from "../../constants/strings";
import phrases from "../../data/phrases.json";
import { Skeleton } from "./Skeleton";

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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
    // sempre que for força atualização renovar imagem também
    loadImage(force);
  }

  function getCachedImage(anyAge = false): string | null {
    try {
      const raw = localStorage.getItem("motivationImageCacheCat");
      if (!raw) return null;
      const cached = JSON.parse(raw) as { url: string; ts: number };
      if (!cached.url) return null;
      const age = Date.now() - cached.ts;
      if (anyAge) return cached.url;
      if (age < 86400000) return cached.url; // válido por 24h
      return null;
    } catch {
      return null;
    }
  }

  async function loadImage(force = false) {
    const IMG_KEY = "motivationImageCacheCat";
    if (!force) {
      const url = getCachedImage(false);
      if (url) {
        setImageUrl(url);
        return;
      }
    }
    setImageLoading(true);
    setImageError(null);
    try {
      const resp = await fetch(
        "https://api.thecatapi.com/v1/images/search?size=full&mime_types=jpg,png"
      );
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = (await resp.json()) as Array<{ url: string }>;
      const url = data?.[0]?.url;
      if (!url) throw new Error("Sem URL");
      const img = new Image();
      img.onload = () => {
        setImageUrl(url);
        localStorage.setItem(IMG_KEY, JSON.stringify({ url, ts: Date.now() }));
        setImageLoading(false);
      };
      img.onerror = () => {
        const fallback = getCachedImage(true);
        if (fallback) {
          setImageUrl(fallback);
          setImageError(LABELS.feedback.erroImagemFallback);
        } else {
          setImageError(LABELS.feedback.erroImagem);
        }
        setImageLoading(false);
      };
      img.src = url;
    } catch (e) {
      const fallback = getCachedImage(true);
      if (fallback) {
        setImageUrl(fallback);
        setImageError(LABELS.feedback.erroImagemFallback);
      } else {
        setImageError(LABELS.feedback.erroImagem);
      }
      setImageLoading(false);
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
    loadImage();
  }, []);

  return (
    <div
      className="motivation-bar"
      role="note"
      aria-label="Mensagem de motivação diária"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="sm:w-2/3 w-full order-2 sm:order-1">
            {loading && !quote && (
              <Skeleton
                lines={2}
                ariaLabel={LABELS.feedback.carregandoInspiracao}
                className="w-full"
              />
            )}
            {quote && !loading && (
              <p className="quote-text leading-relaxed text-center">
                “{quote.content}”{" "}
                <span className="motivation-author">— {quote.author}</span>
              </p>
            )}
            {!loading && !quote && error && <p className="italic">{error}</p>}
          </div>
          <div className="sm:w-1/3 w-full order-1 sm:order-2">
            {(imageLoading || (imageError && !imageUrl)) && (
              <Skeleton
                height="10rem"
                ariaLabel={LABELS.feedback.carregandoImagem}
                className="w-full"
              />
            )}
            {imageUrl && !imageLoading && (
              <img
                src={imageUrl}
                alt="Gato motivacional"
                loading="lazy"
                className="w-full h-40 object-cover rounded border"
                style={{ borderColor: "var(--cc-motive-border)" }}
              />
            )}
            {imageError && !imageLoading && imageUrl && (
              <div className="text-[11px] text-red-600 mt-1" role="alert">
                {imageError}
              </div>
            )}
          </div>
        </div>
        {loading && (
          <p className="sr-only">{LABELS.feedback.carregandoInspiracao}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => load(true)}
              className="btn-invert"
              aria-label="Atualizar citação"
            >
              {LABELS.actions.atualizarCitacao}
            </button>
            <button
              onClick={() => loadImage(true)}
              className="btn-invert"
              aria-label="Atualizar imagem motivacional"
            >
              Imagem
            </button>
          </div>
          <span className="motivation-meta">
            {lastTs &&
              `${LABELS.feedback.atualizadoPrefixo} ${new Date(
                lastTs
              ).toLocaleString()}`}
          </span>
        </div>
      </div>
    </div>
  );
};
