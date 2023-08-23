import {collection, setDoc, onSnapshot, addDoc} from "firebase/firestore";
import auth, { db } from "@/app/firebase";

import getStripe from "./initializeStripe";

export async function createCheckoutSession(uid: string, setRedirectError: any) {
const  checkoutSessionCollectionRef = collection(db, "users",  uid, "checkout_sessions")

  // Create a new checkout session in the subollection inside this users document
  const checkoutSessionRef = await addDoc(checkoutSessionCollectionRef, {
      // replace the price_XXX value with the correct value from your product in stripe.
      price: "price_1NhSgcJQ8XUMrVQjT64GkmGJ",
      success_url: "https://www.printsubmit.com/confirmation",
      cancel_url: window.location.origin,
    });

  // Wait for the CheckoutSession to get attached by the extension
 onSnapshot( checkoutSessionRef, async (snap) => {
    const snapData = snap.data()
    console.log("snap data: ")
    console.log(snapData)
    if(snapData){
        const sessionId  = snapData.sessionId;
        const error = snapData.error;
        console.log(sessionId)
        if (sessionId) {
          // We have a session, let's redirect to Checkout
          // Init Stripe
          const stripe = await getStripe();

          if(stripe){
            stripe.redirectToCheckout({ sessionId });
          }
        } 
        else if(error){
            setRedirectError(error.message)
        }
    }
  });
}