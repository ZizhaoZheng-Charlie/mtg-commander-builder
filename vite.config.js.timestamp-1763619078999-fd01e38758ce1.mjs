// vite.config.js
import { defineConfig } from "file:///C:/Users/kenzh/Work/mtg-commander-builder/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/kenzh/Work/mtg-commander-builder/node_modules/@vitejs/plugin-react/dist/index.js";
import electron from "file:///C:/Users/kenzh/Work/mtg-commander-builder/node_modules/vite-plugin-electron/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process entry file
        entry: "electron/main.js"
      },
      {
        // Preload scripts
        entry: "electron/preload.js",
        onstart(options) {
          options.reload();
        }
      }
    ])
  ],
  server: {
    port: 5173
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxrZW56aFxcXFxXb3JrXFxcXG10Zy1jb21tYW5kZXItYnVpbGRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxca2VuemhcXFxcV29ya1xcXFxtdGctY29tbWFuZGVyLWJ1aWxkZXJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2tlbnpoL1dvcmsvbXRnLWNvbW1hbmRlci1idWlsZGVyL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24nXHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGVsZWN0cm9uKFtcclxuICAgICAge1xyXG4gICAgICAgIC8vIE1haW4gcHJvY2VzcyBlbnRyeSBmaWxlXHJcbiAgICAgICAgZW50cnk6ICdlbGVjdHJvbi9tYWluLmpzJyxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIC8vIFByZWxvYWQgc2NyaXB0c1xyXG4gICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vcHJlbG9hZC5qcycsXHJcbiAgICAgICAgb25zdGFydChvcHRpb25zKSB7XHJcbiAgICAgICAgICAvLyBOb3RpZnkgdGhlIFJlbmRlcmVyIHByb2Nlc3MgdG8gcmVsb2FkIHRoZSBwYWdlIHdoZW4gdGhlIFByZWxvYWQgc2NyaXB0cyBidWlsZCBpcyBjb21wbGV0ZSwgXHJcbiAgICAgICAgICAvLyBpbnN0ZWFkIG9mIHJlc3RhcnRpbmcgdGhlIGVudGlyZSBFbGVjdHJvbiBhcHAuXHJcbiAgICAgICAgICBvcHRpb25zLnJlbG9hZCgpXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIF0pLFxyXG4gIF0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTczLFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgfSxcclxufSlcclxuXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVQsU0FBUyxvQkFBb0I7QUFDcFYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sY0FBYztBQUlyQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUDtBQUFBO0FBQUEsUUFFRSxPQUFPO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQTtBQUFBLFFBRUUsT0FBTztBQUFBLFFBQ1AsUUFBUSxTQUFTO0FBR2Ysa0JBQVEsT0FBTztBQUFBLFFBQ2pCO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
