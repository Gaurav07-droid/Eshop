import axios from 'axios';
import { showAlert } from '../js/alert';

export const getSearchResults = async (query) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/products?category=${query}`,
    });

    if (res.data.status === 'success' && res.data.data.length > 0) {
      alert('result fetched');
      // window.location.assign('/api/v1/home');
    } else {
      // window.location.assign('/api/v1/home');
    }
  } catch (err) {
    // console.log(err);
  }
};
