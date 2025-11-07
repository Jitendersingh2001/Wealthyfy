import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SITE_CONFIG } from "@/constants/site";
import { Toaster } from "@/components/ui/toaster/sonner";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toaster />
          <AuthProvider>
            <ThemeProvider
              defaultTheme={SITE_CONFIG.DEFAULT_THEME}
            >
              <App />
            </ThemeProvider>
          </AuthProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
