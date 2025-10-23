import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Usando caminhos relativos simples para evitar dependência de tipos node

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@atoms": "/src/components/atoms",
      "@molecules": "/src/components/molecules",
      "@organisms": "/src/components/organisms",
      "@templates": "/src/components/templates",
      "@utils": "/src/utils",
      "@hooks": "/src/hooks",
      "@models": "/src/models",
      "@services": "/src/services",
      "@routes": "/src/routes",
      "@constants": "/src/constants",
      "@controllers": "/src/controllers",
      "@molecules/toast": "/src/components/molecules/toast",
    },
  },
});
