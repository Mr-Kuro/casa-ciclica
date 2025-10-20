import React from "react";
import { LABELS } from "../../constants/strings";

interface Props {
  value: "HOJE" | "QUINZENA" | "MES";
  onChange(val: "HOJE" | "QUINZENA" | "MES"): void;
  counts?: { HOJE: number; QUINZENA: number; MES: number };
}

export const Filters: React.FC<Props> = ({ value, onChange, counts }) => {
  const opts: Array<{
    v: "HOJE" | "QUINZENA" | "MES";
    label: string;
    hint: string;
  }> = [
    { v: "HOJE", label: "Hoje", hint: "Diárias abertas + semanais do dia" },
    { v: "QUINZENA", label: "Quinzena", hint: "Quinzenais pendentes" },
    { v: "MES", label: "Mês", hint: "Mensais pendentes" },
  ];

  return (
    <div className="mb-4" role="tablist" aria-label="Filtros de tarefas">
      <div className="tabs">
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
