import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Auto-reload when a stale chunk fails to load after a redeploy
const RELOAD_KEY = "__chunk_reload_attempt";
const handleChunkError = (message?: string) => {
  if (!message) return;
  const isChunkError =
    /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk \d+ failed|ChunkLoadError/i.test(
      message
    );
  if (!isChunkError) return;
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
};
window.addEventListener("error", (e) => handleChunkError(e.message));
window.addEventListener("unhandledrejection", (e) =>
  handleChunkError(String((e as PromiseRejectionEvent).reason?.message ?? ""))
);
window.addEventListener("load", () => sessionStorage.removeItem(RELOAD_KEY));

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
