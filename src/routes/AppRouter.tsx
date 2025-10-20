import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "../views/pages/Home";
import { TaskDetail } from "../views/pages/TaskDetail";
import { Settings } from "../views/pages/Settings";
import { NovaTarefa } from "../views/pages/NovaTarefa";
import { Concluidas } from "../views/pages/Concluidas";
import { Desativadas } from "../views/pages/Desativadas";

export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/tarefas/:id" element={<TaskDetail />} />
    <Route path="/config" element={<Settings />} />
    <Route path="/concluidas" element={<Concluidas />} />
    <Route path="/desativadas" element={<Desativadas />} />
    <Route path="/tarefas/nova" element={<NovaTarefa />} />
  </Routes>
);
