import { Stripe, loadStripe } from "@stripe/stripe-js";
import keys from "../keys"

let stripePromise: Stripe | null;

const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(
      keys.stripeKey
    );
  }
  return stripePromise;
};
export default initializeStripe;