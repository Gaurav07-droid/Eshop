import axios from 'axios';
import {
  login,
  logout,
  signup,
  updateMe,
  updatePassword,
  forgotPassword,
  resetPassword,
} from './auth.js';

import { addToCart, removeFromCart, reviewAndRate } from './cartAndOrder.js';
import { bookProduct } from './stripe.js';

const inputSearch = document.querySelector('.input-search');
const formSearch = document.querySelector('.formSearch');
const formLogin = document.querySelector('.form_login');
const formSignup = document.querySelector('.form_signup');
const formSaveData = document.querySelector('.form-user-data');
const formSavePassword = document.querySelector('.form-user-settings');
const formFeedback = document.getElementById('feedback');
const formForgotPass = document.getElementById('forgot-pass');
const formResetPass = document.getElementById('resetpass-form');

const inputEmail = document.getElementById('email');
const inputUsername = document.getElementById('user-name');
const inputName = document.getElementById('name');
const inputPassword = document.getElementById('password');
const btnLogout = document.getElementById('log-out');
const inputPasswordConf = document.getElementById('password-confirm');
const inputPassCur = document.getElementById('password-current');
const inputRating = document.querySelector('.form-control');
const inputFeedback = document.getElementById('review');
const inputToken = document.getElementById('reset-token');

const btnAddToCart = document.querySelector('.btn-add-to-cart');
const btnRemoveFromCart = document.querySelectorAll('.btn-remove');
const btnBookProduct = document.getElementById('book-product');
const reviewBtn = document.getElementById('reviewbtn');

const getSearchResults = async (query) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/products?name=${query}`,
    });

    if (res.data.status === 'success' && res.data.data.length > 0) {
      alert('result fetched');
      // window.location.assign('/api/v1/home');
    } else {
      // window.location.assign('/api/v1/home');
    }
  } catch (err) {
    console.log(err);
  }
};

if (formSearch)
  formSearch.addEventListener('submit', function (e) {
    e.preventDefault();
    getSearchResults(inputSearch.value);
  });

if (formLogin)
  formLogin.addEventListener('submit', function (e) {
    e.preventDefault();
    login(inputEmail.value, inputPassword.value);
  });

if (formSignup)
  formSignup.addEventListener('submit', function (e) {
    e.preventDefault();

    signup(
      inputUsername.value,
      inputEmail.value,
      inputPassword.value,
      inputPasswordConf.value
    );
  });

if (btnLogout)
  btnLogout.addEventListener('click', function () {
    logout();
  });

if (btnAddToCart)
  btnAddToCart.addEventListener('click', (e) => {
    e.preventDefault();
    const proId = e.target.dataset.proid;

    addToCart(proId);
  });

if (btnRemoveFromCart)
  btnRemoveFromCart.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const proId = e.target.dataset.proid;

      removeFromCart(proId);
    });
  });

if (btnBookProduct)
  btnBookProduct.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';

    const proId = e.target.dataset.proid;

    bookProduct(proId);
  });

if (formSaveData)
  formSaveData.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', inputName.value);
    form.append('email', inputEmail.value);
    form.append('profileImage', document.getElementById('photo').files[0]);

    updateMe(form);
  });

if (formSavePassword)
  formSavePassword.addEventListener('submit', (e) => {
    e.preventDefault();

    updatePassword(
      inputPassCur.value,
      inputPassword.value,
      inputPasswordConf.value
    );
  });

if (formForgotPass)
  formForgotPass.addEventListener('submit', (e) => {
    e.preventDefault();

    forgotPassword(inputEmail.value);
  });

if (formResetPass)
  formResetPass.addEventListener('submit', (e) => {
    e.preventDefault();

    resetPassword(
      inputToken.value,
      inputPassword.value,
      inputPasswordConf.value
    );
  });

if (formFeedback)
  reviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let rating = +inputRating.value.split('s')[0];
    let proId = e.target.dataset.proid;

    reviewAndRate(proId, rating, inputFeedback.value);
  });
