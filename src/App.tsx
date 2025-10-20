import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./views/components/Navbar";
import { Footer } from "./views/components/Footer";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="page">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
          <AppRouter />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
