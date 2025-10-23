import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "../views/pages/Home";
import { TaskDetail } from "../views/pages/TaskDetail";
import { Settings } from "../views/pages/Settings";
import { NovaTarefa } from "../views/pages/NovaTarefa";
// Rota Desativadas removida (desativada do produto) para reduzir complexidade

export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/tarefas/:id" element={<TaskDetail />} />
    <Route path="/config" element={<Settings />} />
    <Route path="/tarefas/nova" element={<NovaTarefa />} />
    <Route path="*" element={<Home />} />
  </Routes>
);
