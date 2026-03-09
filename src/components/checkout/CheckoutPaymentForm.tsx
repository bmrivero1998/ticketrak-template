import { useState, type FormEvent } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'

// ─── Paso 4: Formulario de pago Stripe ───────────────────────────────────────
export const CheckoutPaymentForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsProcessing(true)
    setPaymentError(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/success` },
    })

    if (error) {
      setPaymentError(error.message ?? 'Ocurrió un error inesperado con el pago.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      <PaymentElement />
      {paymentError && <div className="alert alert-danger py-2 mb-0">{paymentError}</div>}
      <button
        type="submit"
        className="btn btn-primary w-100 btn-lg"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? 'Procesando pago, no cierres esta ventana...' : 'Confirmar y Pagar'}
      </button>
    </form>
  )
}