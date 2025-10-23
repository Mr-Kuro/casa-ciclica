import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../views/pages/Home";
import { TaskDetail } from "../views/pages/TaskDetail";
import { Settings } from "../views/pages/Settings";
import { NovaTarefa } from "../views/pages/NovaTarefa";
import { Desativadas } from "../views/pages/Desativadas";
import { Concluidas } from "../views/pages/Concluidas";

// Nova estrutura de histórico: /historico/concluidas e /historico/desativadas
// Mantemos redirect da rota antiga /desativadas para /historico/desativadas
export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/tarefas/nova" element={<NovaTarefa />} />
    <Route path="/tarefas/:id" element={<TaskDetail />} />
    <Route path="/config" element={<Settings />} />
    <Route path="/historico/concluidas" element={<Concluidas />} />
    <Route path="/historico/desativadas" element={<Desativadas />} />
    <Route
      path="/desativadas"
      element={<Navigate to="/historico/desativadas" replace />}
    />
    <Route
      path="/concluidas"
      element={<Navigate to="/historico/concluidas" replace />}
    />
    <Route path="*" element={<Home />} />
  </Routes>
);
