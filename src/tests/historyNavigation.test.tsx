/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest"; // matcher extensions
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AppRouter } from "../routes/AppRouter";
import { render, fireEvent, screen } from "@testing-library/react";
import { ToastProvider } from "@molecules/toast/ToastContext";

// Basic smoke tests for new /historico routes and select navigation logic
// NOTE: We assume Navbar is rendered in the main App layout elsewhere; if not, this test can be adjusted.

function renderWithRouter(initial: string) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initial]}>
        <AppRouter />
      </MemoryRouter>
    </ToastProvider>
  );
}

describe("history routes", () => {
  it("redirects legacy /desativadas to /historico/desativadas", () => {
    renderWithRouter("/desativadas");
    // After routing, we expect Desativadas page heading
    const heading = screen.getByRole("heading", {
      name: /tarefas desativadas/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("renders concluidas page at /historico/concluidas", () => {
    renderWithRouter("/historico/concluidas");
    const heading = screen.getByRole("heading", {
      name: /tarefas concluídas/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
