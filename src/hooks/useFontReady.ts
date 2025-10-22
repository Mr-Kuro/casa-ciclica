import { useEffect, useState } from "react";

/**
 * Detecta quando as fontes (document.fonts) estão prontas.
 * Fallback: timeout se API não suportada.
 */
export function useFontReady(timeoutMs: number = 1200) {
  const [ready, setReady] = useState<boolean>(false);
  useEffect(() => {
    let done = false;
    function mark() {
      if (!done) {
        done = true;
        setReady(true);
      }
    }
    try {
      if ((document as any).fonts && (document as any).fonts.ready) {
        (document as any).fonts.ready.then(mark);
        setTimeout(mark, timeoutMs); // fallback
      } else {
        // Sem suporte: marcar rápido
        setTimeout(mark, 60);
      }
    } catch {
      setTimeout(mark, 80);
    }
    return () => {
      done = true;
    };
  }, [timeoutMs]);
  return ready;
}
