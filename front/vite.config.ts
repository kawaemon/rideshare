import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Latest Chrome only: use modern output for faster builds
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext"
  },
  esbuild: {
    target: "esnext"
  }
});

