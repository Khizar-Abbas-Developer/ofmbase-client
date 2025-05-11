import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      position="top-center"
      toastOptions={{
        // Default options for all toasts
        duration: 3000,
        style: {
          padding: "16px",
          fontSize: "14px",
        },
      }}
    />
    <App />
  </StrictMode>
);
