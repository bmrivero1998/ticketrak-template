// Service worker de Firebase Cloud Messaging para el sitio del comprador.
// Debe quedar en /public (raíz del sitio publicado) para poder registrarse
// con scope "/". Usa el SDK "compat" porque, a diferencia del código de la
// app, un service worker no puede hacer `import` desde npm.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

// Mismo config público que src/firebase.ts — si cambia uno, cambia el otro.
firebase.initializeApp({
  apiKey: 'AIzaSyB2FtDT_eA7QHOUnGKB3qDSagBdlTgjsus',
  authDomain: 'gen-lang-client-0352919821.firebaseapp.com',
  projectId: 'gen-lang-client-0352919821',
  storageBucket: 'gen-lang-client-0352919821.firebasestorage.app',
  messagingSenderId: '1014695036072',
  appId: '1:1014695036072:web:ff8bd9ac490da1018dee9d',
})

const messaging = firebase.messaging()

// Solo corre cuando la pestaña está en background o cerrada (con la app
// abierta y en foco, el mensaje llega por onMessage() en JS).
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || 'Chat en vivo', {
    body: body || '',
  })
})
