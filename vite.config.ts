import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimizaciones para rendimiento en dispositivos de bajos recursos
  build: {
    target: 'es2015', // Compatibilidad con navegadores más antiguos
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true, // Compatibilidad con Safari
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          utils: ['date-fns', 'clsx', 'class-variance-authority'],
        },
      },
    },
    // Optimizaciones de CSS
    cssCodeSplit: true,
    cssMinify: mode === 'production',
    // Reducir el tamaño del bundle
    chunkSizeWarningLimit: 1000,
  },
  // Optimizaciones de desarrollo
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    exclude: [
      // Excluir dependencias que pueden causar problemas de rendimiento
    ],
  },
  // Configuración para mejor rendimiento en desarrollo
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
