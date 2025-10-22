import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./views/components/Navbar";
import { Footer } from "./views/components/Footer";
import { Quote } from "./views/components/Quote";
import { injectTestMassGlobal } from "./data/testMass";

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
  );
};
