import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../../branding";
import { LABELS } from "@constants/strings";

export const Footer: React.FC = () => {
  return (
    <footer
      className="mt-auto border-t text-sm"
      style={{
        background: "var(--cc-bg-alt)",
        color: "var(--cc-text)",
        borderColor: "var(--cc-border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div className="space-y-2">
          <h4 className="font-semibold" style={{ color: "var(--cc-text)" }}>
            Aplicação
          </h4>
          <p className="text-xs leading-relaxed">
            Gerenciador de tarefas domésticas recorrentes para rotina da casa.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold" style={{ color: "var(--cc-text)" }}>
            Navegação
          </h4>
          <ul className="space-y-1">
            <li>
              <Link
                to="/"
                className="hover:underline"
                style={{ color: "var(--cc-text)" }}
              >
                {LABELS.navigation.inicio}
              </Link>
            </li>
            <li>
              <Link
                to="/tarefas/nova"
                className="hover:underline"
                style={{ color: "var(--cc-text)" }}
              >
                {LABELS.navigation.novaTarefa}
              </Link>
            </li>
            <li>
              <Link
                to="/desativadas"
                className="hover:underline"
                style={{ color: "var(--cc-text)" }}
              >
                {LABELS.navigation.desativadas}
              </Link>
            </li>
            <li>
              <Link
                to="/config"
                className="hover:underline"
                style={{ color: "var(--cc-text)" }}
              >
                {LABELS.campos.config}
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold" style={{ color: "var(--cc-text)" }}>
            Status
          </h4>
          <ul className="space-y-1 text-xs">
            <li>{LABELS.feedback.persistencia}</li>
            <li>{LABELS.feedback.seedsDinamicos}</li>
            <li>{LABELS.feedback.filtrosResumo}</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold" style={{ color: "var(--cc-text)" }}>
            Créditos
          </h4>
          <p className="text-xs">Feito com React + Tailwind + Vite.</p>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </div>
      <div
        className="text-[11px] py-3 text-center"
        style={{
          background: "var(--cc-bg)",
          borderTop: "1px solid var(--cc-border)",
          color: "var(--cc-muted)",
        }}
      >
        <span>{LABELS.feedback.designNota}</span>
      </div>
    </footer>
  );
};
