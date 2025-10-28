import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "@organisms/Navbar";
import { Footer } from "@organisms/Footer";
import { Quote } from "@organisms/Quote";
import { injectTestMassGlobal } from "./data/testMass";
import { AdSlot } from "@atoms/AdSlot";
import { ToastProvider } from "@molecules/toast/ToastContext";

const TEST_MASS_FLAG = import.meta.env.VITE_ENABLE_TEST_MASS;
// Only inject mass test data in dev by default, but allow explicit override via env.
const SHOULD_INJECT_TEST_MASS =
  TEST_MASS_FLAG === "true" ||
  (TEST_MASS_FLAG !== "false" && import.meta.env.DEV);

const AD_SIDEBAR_SLOT = import.meta.env.VITE_AD_SLOT_SIDEBAR;
const AD_MOBILE_TOP_SLOT = import.meta.env.VITE_AD_SLOT_MOBILE_TOP;
const AD_MOBILE_BOTTOM_SLOT = import.meta.env.VITE_AD_SLOT_MOBILE_BOTTOM;

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
    if (SHOULD_INJECT_TEST_MASS) {
      injectTestMassGlobal();
    }
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        {/* Link de pular conteúdo para acessibilidade */}
        <a href="#conteudo-principal" className="skip-link">
          Pular para conteúdo principal
        </a>
        <div className="page">
          <Navbar />
          <Quote />
          <main
            id="conteudo-principal"
            role="main"
            aria-label="Conteúdo principal"
            className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 mt-2"
          >
            <div className="space-y-6">
              {/* Layout de página com anúncios move para cá */}
              <div className="flex flex-col lg:flex-row gap-6">
                {AD_SIDEBAR_SLOT ? (
                  <aside
                    className="hidden lg:flex flex-col gap-4 w-[260px] shrink-0"
                    aria-label="Publicidade lateral esquerda"
                  >
                    <AdSlot
                      slot={AD_SIDEBAR_SLOT}
                      ariaLabel="Publicidade lateral"
                      format="autorelaxed"
                    />
                  </aside>
                ) : null}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Ad mobile antes */}
                  {AD_MOBILE_TOP_SLOT ? (
                    <div className="lg:hidden">
                      <AdSlot
                        slot={AD_MOBILE_TOP_SLOT}
                        ariaLabel="Publicidade antes do conteúdo principal"
                      />
                    </div>
                  ) : null}
                  <AppRouter />
                  {/* Ad mobile depois */}
                  {AD_MOBILE_BOTTOM_SLOT ? (
                    <div className="lg:hidden">
                      <AdSlot
                        slot={AD_MOBILE_BOTTOM_SLOT}
                        ariaLabel="Publicidade depois do conteúdo principal"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
};
