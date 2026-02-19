# Ticketrak — Plantilla Cliente

Plantilla React + Vite + TypeScript para el flujo público de venta de boletos de Ticketrak.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **React Router v6** para navegación
- **Context API** para carrito de compras
- Sin dependencias de estado externo (Zustand/Redux)

## Páginas incluidas

| Ruta | Descripción |
|------|-------------|
| `/` | Cartelera de eventos |
| `/events/:id` | Detalle del evento + selección de boletos |
| `/checkout` | Confirmación y pago (Stripe) |
| `/success?session_id=...` | Página de éxito post-pago |

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu VITE_PROJECT_ID y VITE_API_URL

# 3. Correr en desarrollo
npm run dev

# 4. Build de producción
npm run build
```

## Configuración

Toda la configuración está centralizada en `src/config.ts`. También puedes usar variables de entorno (prefijo `VITE_`).

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `https://api.ticketrak.com` |
| `VITE_PROJECT_ID` | UUID del proyecto | — |
| `VITE_BRAND_NAME` | Nombre de la marca | `Ticketrak` |
| `VITE_BRAND_TAGLINE` | Tagline del hero | `Vive la experiencia.` |
| `VITE_LOGO_URL` | URL del logo (opcional) | — |
| `VITE_SITE_URL` | URL base del sitio | `http://localhost:5173` |

## Estructura del proyecto

```
src/
├── config.ts           # ← Config central + helpers de formato
├── types/index.ts      # Tipos TypeScript (alineados con OpenAPI spec)
├── services/api.ts     # Cliente HTTP (todos los endpoints del spec)
├── context/
│   └── CartContext.tsx # Estado global del carrito
├── hooks/
│   └── useFetch.ts     # Hook genérico de fetching
├── components/
│   ├── layout/Header.tsx
│   ├── ui/Spinner.tsx
│   ├── event/EventCard.tsx
│   ├── event/TierSelector.tsx
│   └── checkout/CartSummary.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── EventDetailPage.tsx
│   ├── CheckoutPage.tsx
│   └── SuccessPage.tsx
├── styles/main.css     # Design system completo
└── App.tsx             # Router + providers
```

## Flujo de pago

```
EventDetailPage
  → Seleccionar tiers (TierSelector)
  → Sticky CTA aparece
  → navigate('/checkout')

CheckoutPage
  → Ingresar email
  → POST /tr/engine/reserve   (bloquea inventario)
  → POST /tr/engine/checkout/session  (genera sesión Stripe)
  → redirect a Stripe

SuccessPage (?session_id=...)
  → GET /tr/engine/checkout/session/:id
  → Muestra estado (complete / open / expired)
```

## Nota importante

En `EventDetailPage`, el `event_id` se guarda en `sessionStorage` bajo la clave `current_event_id` cuando el usuario navega al detalle. `CheckoutPage` lo lee desde ahí para crear la reserva. Asegúrate de que `EventDetailPage` haga:

```tsx
sessionStorage.setItem('current_event_id', id!)
```

al montarse. Esto ya está implementado — solo asegúrate de no borrarlo accidentalmente.
