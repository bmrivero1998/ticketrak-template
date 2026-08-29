/**
 * Config pública de Firebase (Web) para notificaciones push — mismo
 * proyecto que usa el panel de MetriTrak y el módulo de mailbox en el
 * backend. Es la misma que public/firebase-messaging-sw.js — si cambia
 * una, hay que cambiar la otra. No es sensible: la Web API key de Firebase
 * está pensada para vivir en el bundle del cliente.
 */
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyB2FtDT_eA7QHOUnGKB3qDSagBdlTgjsus',
  authDomain: 'gen-lang-client-0352919821.firebaseapp.com',
  projectId: 'gen-lang-client-0352919821',
  storageBucket: 'gen-lang-client-0352919821.firebasestorage.app',
  messagingSenderId: '1014695036072',
  appId: '1:1014695036072:web:ff8bd9ac490da1018dee9d',
}

export const VAPID_PUBLIC_KEY =
  'BOereXLPchVpxbMehecnqpa4k1qj_5e9VLwyMxlJh6qwfLu550CA60EpPU7_3n259lNmo8k8LJ_vxvQerLF87LA'

export const firebaseApp = initializeApp(firebaseConfig)

export { getMessaging, getToken, isSupported }
