import React, { useEffect, useRef } from "react";
import { LABELS } from "../../constants/strings";

interface Props {
  value: "HOJE" | "SEMANA" | "QUINZENA" | "MES";
  onChange(val: "HOJE" | "SEMANA" | "QUINZENA" | "MES"): void;
  counts?: { HOJE: number; SEMANA: number; QUINZENA: number; MES: number };
}

export const Filters: React.FC<Props> = ({ value, onChange, counts }) => {
  const opts: Array<{
    v: "HOJE" | "SEMANA" | "QUINZENA" | "MES";
    label: string;
    hint: string;
  }> = [
    { v: "HOJE", label: "Hoje", hint: "Diárias abertas + semanais do dia" },
    {
      v: "SEMANA",
      label: "Semana",
      hint: "Todas as diárias e semanais não concluídas",
    },
    { v: "QUINZENA", label: "Quinzena", hint: "Quinzenais pendentes" },
    { v: "MES", label: "Mês", hint: "Mensais pendentes" },
  ];

  // Refs para auto-scroll
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const container = containerRef.current;
    const btn = tabRefs.current[value];
    if (!container || !btn) return;

    // Se não há overflow horizontal, não fazer scroll
    if (container.scrollWidth <= container.clientWidth) return;

    const left = btn.offsetLeft;
    const right = left + btn.offsetWidth;
    const visibleStart = container.scrollLeft;
    const visibleEnd = visibleStart + container.clientWidth;

    // Apenas scroll se o botão não estiver totalmente visível
    if (left < visibleStart || right > visibleEnd) {
      const target = left - (container.clientWidth - btn.offsetWidth) / 2;
      container.scrollTo({ left: target, behavior: "smooth" });
    }
  }, [value]);

  return (
    <div className="mb-4" role="tablist" aria-label="Filtros de tarefas">
      <div className="tabs" ref={containerRef}>
        {opts.map((o) => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${o.v}`}
              id={`tab-${o.v}`}
              onClick={() => onChange(o.v)}
              ref={(el) => (tabRefs.current[o.v] = el)}
              className="tab"
            >
              <span>{o.label}</span>
              {counts && <span className="tab-badge">{counts[o.v]}</span>}
            </button>
          );
        })}
      </div>
      <p
        id={`panel-${value}`}
        role="note"
        aria-labelledby={`tab-${value}`}
        className="text-[11px] mt-1 text-subtle"
      >
        {opts.find((o) => o.v === value)?.hint}
      </p>
    </div>
  );
};
