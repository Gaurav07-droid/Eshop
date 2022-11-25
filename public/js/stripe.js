import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51Ln0ePSALN1vrLI6bux8JP9hJfHQcRE1wiwDZ88aCi7303rQAhU8HGI3pdAGblguW66jps7ut2SERNaFCxH25MhX00n6WE8ce0'
);

export const bookProduct = async (prodId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${prodId}`
    );

    //Create checkout form + form credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', 'Something went wrong!');
  }
};
