import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerServiceWorker } from './registerServiceWorker';
import "./styles.css";

import App from "./App";

// Opcional: mostrar una alerta o UI cuando hay nueva versión
registerServiceWorker({
  onUpdate: (registration) => {
    
    //console.log('Hay una actualización disponible.');
    
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  },
  onSuccess: () => {
    //console.log('SW instalado y listo para uso offline.');
  }
});

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);