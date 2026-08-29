/**
 * Pide permiso de notificaciones, registra el service worker de Firebase y
 * manda el token al backend identificado por el email del comprador (no
 * tiene user_id de staff como el vendedor). Nunca debe romper el chat si
 * algo falla (permiso denegado, navegador sin soporte, etc.).
 */
import { useCallback, useState } from 'react'
import { firebaseApp, getMessaging, getToken, isSupported, VAPID_PUBLIC_KEY } from '@/firebase'
import { registerFanPushToken } from '@/services/api'

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export function useFanPushNotifications() {
  const [permission, setPermission] = useState<PushPermission>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : (Notification.permission as PushPermission),
  )
  const [isRequesting, setIsRequesting] = useState(false)

  const requestAndRegister = useCallback(async (fanEmail: string) => {
    if (!fanEmail || typeof Notification === 'undefined') return

    setIsRequesting(true)
    try {
      if (!('serviceWorker' in navigator) || !(await isSupported())) {
        setPermission('unsupported')
        return
      }

      const result = await Notification.requestPermission()
      setPermission(result as PushPermission)
      if (result !== 'granted') return

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      const messaging = getMessaging(firebaseApp)
      const token = await getToken(messaging, {
        vapidKey: VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: registration,
      })

      if (token) {
        await registerFanPushToken(fanEmail, token)
      }
    } catch (err) {
      console.error('[push] No se pudo registrar el token de notificaciones:', err)
    } finally {
      setIsRequesting(false)
    }
  }, [])

  return { permission, isRequesting, requestAndRegister }
}
