import React, { useEffect, useRef } from "react";

interface AdSlotProps {
  slot: string; // data-ad-slot id provided by Adsense
  client?: string; // optional override for Adsense client id
  className?: string;
  format?: string; // e.g. "auto"
  layout?: string;
  responsive?: boolean;
  // Label for accessibility; if omitted generic label
  ariaLabel?: string;
  // Optional style override
  style?: React.CSSProperties;
}

// NOTE: Real Adsense requires a client id in script and data-ad-client attribute.
// We read it from Vite env vars so it never ships with the code bundle.
// This component tries to load the adsbygoogle script only once.
export const AdSlot: React.FC<AdSlotProps> = ({
  slot,
  client = import.meta.env.VITE_ADSENSE_CLIENT,
  className = "",
  format = "auto",
  layout,
  responsive = true,
  ariaLabel = "Publicidade",
  style,
}) => {
  const insRef = useRef<HTMLModElement | null>(null);
  const clientId = client?.trim();

  useEffect(() => {
    if (!clientId) {
      if (import.meta.env.DEV) {
        console.warn(
          "AdSlot: nenhum VITE_ADSENSE_CLIENT configurado; ignorando carregamento de anúncios."
        );
      }
      return undefined;
    }

    // If script not present, inject
    const scriptSrcBase =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    const encodedClientId = encodeURIComponent(clientId);
    const existingScript = Array.from(
      document.querySelectorAll<HTMLScriptElement>(
        `script[src^="${scriptSrcBase}"]`
      )
    ).find((script) => script.src.includes(`client=${encodedClientId}`));

    if (!existingScript) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `${scriptSrcBase}?client=${encodedClientId}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }

    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let intervalId: number | undefined;
    let pushed = false;

    const tryPush = () => {
      if (cancelled || pushed) {
        return;
      }
      const element = insRef.current;
      const width = element?.offsetWidth ?? 0;
      if (width > 0) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed = true;
        } catch (e) {
          if (import.meta.env.DEV) {
            console.warn("AdSlot: falha ao inicializar anúncio", e);
          }
        }
        observer?.disconnect();
        observer = undefined;
        if (intervalId) {
          window.clearInterval(intervalId);
          intervalId = undefined;
        }
      }
    };

    const setupObserver = () => {
      if (
        observer ||
        !insRef.current ||
        typeof ResizeObserver === "undefined"
      ) {
        return;
      }
      observer = new ResizeObserver(() => {
        tryPush();
      });
      observer.observe(insRef.current as Element);
    };

    // Attempt immediately in case the slot already has space
    tryPush();
    // Fallback: watch size changes until width is > 0
    setupObserver();
    if (typeof ResizeObserver === "undefined") {
      intervalId = window.setInterval(tryPush, 250);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [clientId, slot]);

  if (!clientId) {
    return null;
  }

  return (
    <div
      className={"ad-container " + className}
      aria-label={ariaLabel}
      role="complementary"
      style={style}
    >
      {/* Fallback text if ad blocked */}
      <div className="ad-fallback" aria-hidden="true">
        <span className="text-[10px] opacity-60">Carregando anúncio...</span>
      </div>
      {/* Actual Adsense tag container; user must fill data-ad-client */}
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(responsive ? { "data-full-width-responsive": "true" } : {})}
      />
    </div>
  );
};
