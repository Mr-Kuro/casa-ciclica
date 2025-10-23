import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "@organisms/Navbar";
import { Footer } from "@organisms/Footer";
import { Quote } from "@organisms/Quote";
import { injectTestMassGlobal } from "./data/testMass";
import { ToastProvider } from "@molecules/toast/ToastContext";

declare global {
  interface Window {
    injectTestMass: (options: {
      dailyCount: number;
      weeklyPerDay: number;
      includeInactive: boolean;
    }) => void;
  }
}

export const App: React.FC = () => {
  React.useEffect(() => {
    //    injectTestMass(); // injeta tudo com valores padrão

    injectTestMassGlobal();
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="page">
          <Navbar />
          <Quote />
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 mt-2">
            <AppRouter />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
};
