import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "./redux/store.js";
import { persistor } from "./redux/store.ts";

import { Toaster } from "react-hot-toast";
// 
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
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
      </PersistGate>
    </Provider>
  </StrictMode>
);
