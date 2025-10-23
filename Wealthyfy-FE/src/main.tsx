import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { keycloakService } from "@/services/keycloak";
import { AuthProvider } from "@/context/AuthContext";

const root = createRoot(document.getElementById("root")!);

(async () => {
  try {
    await keycloakService.init();

    root.render(
      <StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </StrictMode>
    );
  } catch (error) {
    console.error("❌ Keycloak initialization failed in main.tsx:", error);
  }
})();
