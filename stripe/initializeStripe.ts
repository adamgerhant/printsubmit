import { Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Stripe | null;

const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(
      "pk_live_51NgM2hJQ8XUMrVQjcUvBOWSHVXHpeEr9DB3jCspil6Ni4S4FwbKT4Ma4BjOpYDIDhOwSIyBm9wtZVb7b8J5DKpZj009Th5IwLu"
    );
  }
  return stripePromise;
};
export default initializeStripe;