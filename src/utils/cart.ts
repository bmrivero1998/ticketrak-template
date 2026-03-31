import { CartItem } from "@/types"

export type CartByEvent = {
  [eventId: string]: {
    event_id: string
    project_id: string
    currency: string
    items: CartItem[]
  }
}

export function groupCartByEvent(cart: CartItem[]): CartByEvent {
  return cart.reduce((acc, item) => {
    if (!acc[item.event_id]) {
      acc[item.event_id] = {
        event_id: item.event_id,
        project_id: item.project_id,
        currency: item.currency,
        items: [],
      }
    }

    acc[item.event_id].items.push(item)
    return acc
  }, {} as CartByEvent)
}

export function getEventTotal(items: CartItem[]) {
  return items.reduce((total, item) => {
    const price = item.tier.price_amount || 0
    const donation = item.donationAmount || 0
    return total + price * item.quantity + donation
  }, 0)
}