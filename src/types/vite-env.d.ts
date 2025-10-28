/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT: string;
  readonly VITE_ENV: "dev" | "prod";
  readonly VITE_ENABLE_TEST_MASS: "true" | "false" | undefined;
  readonly VITE_AD_SLOT_SIDEBAR: string;
  readonly VITE_AD_SLOT_MOBILE_TOP: string;
  readonly VITE_AD_SLOT_MOBILE_BOTTOM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
