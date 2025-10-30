import React, { useEffect } from "react";

/**
 * @description
 * Generic Google AdSense slot wrapper.
 * Usage:
 *
 * @example
 * <AdSlot client="ca-pub-XXXXXXXXXXXX" slot="1234567890" format="auto" responsive />
 * Place multiple instances; script will only be injected once.
 */
export interface AdSlotProps {
  /** Slot ID provided by AdSense */
  adSlot: string;
  /** Ad format, typically 'auto' for responsive */
  format?: string;
  /** Make the ad container full width on mobile */
  responsive?: boolean;
  /** Additional Tailwind classes for container */
  className?: string;
  /** Fixed style height hint (optional) */
  style?: React.CSSProperties;
}

let adsenseLoaded = false;

export const AdSlot = ({
  adSlot,
  format = "auto",
  responsive = true,
  className = "",
  style,
}: AdSlotProps) => {
  const ambient = import.meta.env.VITE_ENV as "dev" | "prod";
  const adSenseClient = import.meta.env.VITE_ADSENSE_CLIENT;

  const isDev = ambient === "dev";
  const isProd = !isDev;

  const scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`;

  useEffect(() => {
    if (!adsenseLoaded) {
      const existingScript = document.querySelector(
        `script[src="${scriptSrc}"]`
      );
      const existingMeta = document.querySelector(
        'meta[name="google-adsense-client"]'
      ) as HTMLMetaElement | null;

      if (!existingScript) {
        const script = document.createElement("script");
        script.async = true;
        script.src = scriptSrc;
        script.setAttribute("data-ad-client", adSenseClient);
        document.head.appendChild(script);
      }

      if (!existingMeta) {
        const meta = document.createElement("meta");
        meta.name = "google-adsense-client";
        meta.content = adSenseClient;
        document.head.appendChild(meta);
      }
      adsenseLoaded = true;
    }
  }, [adSenseClient]);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      if (error instanceof Error) {
        isDev && console.error(error);
        isProd && console.error(error.message);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dinamicAttributes = isDev ? { "data-adtest": "on" } : {};

  return (
    <div
      className={`ad-slot mx-auto my-2 ${
        responsive ? "w-full" : ""
      } ${className}`.trim()}
    >
      <ins
        {...dinamicAttributes}
        className="adsbygoogle block"
        style={style || { display: "block" }}
        data-ad-client={adSenseClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        data-testid="adsense"
      />
    </div>
  );
};
