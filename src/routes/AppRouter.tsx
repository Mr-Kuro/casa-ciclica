import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "../views/pages/Home";
import { TaskDetail } from "../views/pages/TaskDetail";
import { Settings } from "../views/pages/Settings";
import { NovaTarefa } from "../views/pages/NovaTarefa";
import { Desativadas } from "../views/pages/Desativadas"; // rota reintroduzida para inspeção de tarefas inativas

export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/tarefas/:id" element={<TaskDetail />} />
    <Route path="/config" element={<Settings />} />
    <Route path="/desativadas" element={<Desativadas />} />
    <Route path="/tarefas/nova" element={<NovaTarefa />} />
    <Route path="*" element={<Home />} />
  </Routes>
);
