// src/registerServiceWorker.js
export function registerServiceWorker({ onUpdate, onSuccess } = {}) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;

      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          //console.log('Service Worker registrado:', registration);

          // detectar updates
          registration.onupdatefound = () => {
            const installing = registration.installing;
            installing.onstatechange = () => {
              if (installing.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // nueva versión lista
                  console.log('Nueva versión disponible (updatefound).');
                  onUpdate && onUpdate(registration);
                } else {
                  console.log('Contenido cacheado para uso offline.');
                  onSuccess && onSuccess(registration);
                }
              }
            };
          };
        })
        .catch(err => console.error('Error registrando SW:', err));
    });
  }
}
