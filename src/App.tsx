import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { Link, BrowserRouter } from "react-router-dom";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-blue-600 text-white p-4 shadow flex justify-between items-center">
          <h1 className="text-xl font-semibold">Gerenciador de Tarefas</h1>
          <nav className="flex gap-3 text-sm">
            <Link to="/" className="hover:underline">
              Início
            </Link>
            <Link to="/tarefas/nova" className="hover:underline">
              Nova Tarefa
            </Link>
            <Link to="/config" className="hover:underline">
              Configurações
            </Link>
          </nav>
        </header>
        <main className="flex-1 container mx-auto p-4">
          <AppRouter />
        </main>
        <footer
          className="p-4 text-center text-xs text-gray-500"
          role="contentinfo"
        >
          &copy; {new Date().getFullYear()} Casa
        </footer>
      </div>
    </BrowserRouter>
  );
};
