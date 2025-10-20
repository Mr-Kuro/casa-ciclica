import { LABELS } from "../constants/strings";

// Retorna string tipo "há 2 dias" ou "agora"
export function timeAgo(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return LABELS.feedback.agoraMesmo; // futuro -> tratar como agora
  const sec = Math.floor(diffMs / 1000);
  if (sec < 10) return LABELS.feedback.agoraMesmo;
  if (sec < 60)
    return `${LABELS.feedback.haPrefixo} ${LABELS.feedback.unidadeSegundo(
      sec
    )}`;
  const min = Math.floor(sec / 60);
  if (min < 60)
    return `${LABELS.feedback.haPrefixo} ${LABELS.feedback.unidadeMinuto(min)}`;
  const h = Math.floor(min / 60);
  if (h < 24)
    return `${LABELS.feedback.haPrefixo} ${LABELS.feedback.unidadeHora(h)}`;
  const d = Math.floor(h / 24);
  if (d < 7)
    return `${LABELS.feedback.haPrefixo} ${LABELS.feedback.unidadeDia(d)}`;
  const w = Math.floor(d / 7);
  if (w < 5)
    return `${LABELS.feedback.haPrefixo} ${LABELS.feedback.unidadeSemana(w)}`;
  const m = Math.floor(d / 30);
  if (m < 12)
    return `${LABELS.feedback.haPrefixo} ${LABELS.feedback.unidadeMes(m)}`;
  const y = Math.floor(d / 365);
  return `${LABELS.feedback.haPrefixo} ${LABELS.feedback.unidadeAno(y)}`;
}
