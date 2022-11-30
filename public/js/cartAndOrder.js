import axios from 'axios';
import { showAlert } from '../js/alert';

export const addToCart = async (proId) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/my-cart',
      data: {
        product: proId,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Product added to the cart');
      window.setTimeout(() => {
        window.location.assign('/my-cart');
      }, 2000);
    }
  } catch (err) {
    if (err.response.data.error.code === 11000) {
      showAlert('error', 'Product is already in the cart!');
    } else {
      showAlert('error', 'Something went wrong!');
    }
  }
};

export const removeFromCart = async (proId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/cart/${proId}`,
    });

    if (res.status === 204) {
      showAlert('success', 'Product removed from the cart');
      window.setTimeout(() => {
        window.location.assign('/my-cart');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', 'Something went wrong!');
  }
};

export const reviewAndRate = async (proId, rating, review) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/products/${proId}/reviews`,
      data: {
        rating,
        review,
      },
    });

    if (res.status === 200) {
      showAlert('success', 'Thank you for your feedback!');
      window.setTimeout(() => {
        window.location.assign('/my-orders');
      }, 2000);
    }
  } catch (err) {
    if (err.response.data.error.name === 'ValidationError') {
      showAlert('error', 'You already given your feedback!');
      window.setTimeout(() => {
        window.location.assign('/my-orders');
      }, 2000);
    } else {
      showAlert('error', 'Something went wrong!');
    }
  }
};
