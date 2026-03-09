import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { CartSummary } from '../../../components/checkout/CartSummary'
import { CheckoutPaymentForm } from '../../../components/checkout/CheckoutPaymentForm'
import { CONFIG } from '../../../config'

const stripePromise = CONFIG.STRIPE_ACCOUNT
  ? loadStripe(CONFIG.PUBLIC_KEY, { stripeAccount: CONFIG.STRIPE_ACCOUNT })
  : loadStripe(CONFIG.PUBLIC_KEY)

// ─── Paso 4: Vista de pago con Stripe ────────────────────────────────────────
interface StepPaymentProps {
  clientSecret: string
}

export const StepPayment = ({ clientSecret }: StepPaymentProps) => (
  <div className="row g-4 justify-content-center">
    <div className="col-12 col-lg-5">
      <CartSummary />
    </div>
    <div className="col-12 col-lg-7">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 bg-light rounded">
          <h2 className="card-title h5 mb-4 text-center">Ingresa tu método de pago</h2>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutPaymentForm />
          </Elements>
        </div>
      </div>
    </div>
  </div>
)