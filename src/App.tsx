import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "@organisms/Navbar";
import { Footer } from "@organisms/Footer";
import { Quote } from "@organisms/Quote";
import { injectTestMassGlobal } from "./data/testMass";
import { AdSlot } from "@atoms/AdSlot";
import { ToastProvider } from "@molecules/toast/ToastContext";

const IS_DEV_ENV = import.meta.env.VITE_ENV === "dev";
const TEST_MASS_FLAG = import.meta.env.VITE_ENABLE_TEST_MASS;

const AD_SIDEBAR_SLOT = import.meta.env.VITE_AD_SLOT_SIDEBAR;
const AD_MOBILE_TOP_SLOT = import.meta.env.VITE_AD_SLOT_MOBILE_TOP;
const AD_MOBILE_BOTTOM_SLOT = import.meta.env.VITE_AD_SLOT_MOBILE_BOTTOM;

const SHOULD_INJECT_TEST_MASS = TEST_MASS_FLAG === "true" && IS_DEV_ENV;

const MobileBottomAdSlot = () => {
  if (!AD_MOBILE_BOTTOM_SLOT) return null;
  return (
    <div className="lg:hidden">
      <AdSlot adSlot={AD_MOBILE_BOTTOM_SLOT} />
    </div>
  );
};

const MobileTopAdSlot = () => {
  if (!AD_MOBILE_TOP_SLOT) return null;
  return (
    <div className="lg:hidden">
      <AdSlot adSlot={AD_MOBILE_TOP_SLOT} />
    </div>
  );
};

const SidebarAdSlot = () => {
  if (!AD_SIDEBAR_SLOT) return null;
  return (
    <aside
      className="hidden lg:flex flex-col gap-4 w-[260px] shrink-0"
      aria-label="Publicidade lateral esquerda"
    >
      <AdSlot adSlot={AD_SIDEBAR_SLOT} format="autorelaxed" />
    </aside>
  );
};

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
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0 space-y-6">
                  <MobileTopAdSlot />
                  <AppRouter />
                  <MobileBottomAdSlot />
                </div>
                <SidebarAdSlot />
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
};
