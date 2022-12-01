import axios from 'axios';
import { token } from 'morgan';
import { showAlert } from '../js/alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        window.location.assign('/');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      url: '/api/v1/users/logout',
      method: 'GET',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logging you out !');

      window.setTimeout(() => {
        window.location.assign('/user/login');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', 'Something went wrong !');
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfully!');
      window.setTimeout(() => {
        window.location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updatePassword = async (
  currentPassword,
  newPassword,
  passwordConfirm
) => {
  try {
    const res = await axios({
      url: '/api/v1/users/updateMyPassword',
      method: 'PATCH',
      data: { currentPassword, newPassword, passwordConfirm },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password has been updated!');

      window.setTimeout(() => {
        window.location.assign('/my-account');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateMe = async (data) => {
  try {
    const res = await axios({
      url: '/api/v1/users/updateMe',
      method: 'PATCH',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Profile has been updated!');

      window.setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      url: '/api/v1/users/forgotPassword',
      method: 'POST',
      data: {
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Token sent to mail!');

      window.setTimeout(() => {
        window.location.assign('/reset-password');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', 'Something went wrong! Please try again later');
  }
};

export const resetPassword = async (token, newPassword, passwordConfirm) => {
  try {
    const res = await axios({
      url: `/api/v1/users/resetPassword/${token}`,
      method: 'PATCH',
      data: {
        newPassword,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password updated sucessfully!');

      window.setTimeout(() => {
        window.location.assign('/');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
