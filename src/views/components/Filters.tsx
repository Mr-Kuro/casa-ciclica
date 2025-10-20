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
    <div className="mb-4">
      <div className="flex border-b">
        {opts.map((o) => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                active ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {o.label}
              {counts && (
                <span
                  className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts[o.v]}
                </span>
              )}
              {active && (
                <span className="absolute left-0 -bottom-px h-[3px] w-full bg-blue-600 rounded-t" />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] mt-1 text-gray-500">
        {opts.find((o) => o.v === value)?.hint}
      </p>
    </div>
  );
};
