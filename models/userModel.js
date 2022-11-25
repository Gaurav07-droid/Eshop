const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [2, 'A name must cntain less than 2 characters'],
    maxLength: [25, 'A name must cntain less than 25 characters'],
    required: [true, 'User must have a name'],
  },

  shopName: {
    type: String,
    maxlength: [30, 'Shop name must be less than 30 characters'],
    minLength: [2, 'Shop name must be greater than 2 characters'],
  },

  profileImage: {
    type: String,
    default: 'default.png',
  },

  email: {
    unique: [true, 'Email already used!Use different email'],
    lowercase: true,
    type: String,
    required: [true, 'Please provide your email !'],
    validate: [validator.isEmail, 'Please provide an valid email!'],
  },

  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'seller'],
      message: 'Role is either: user admin or seller!',
    },
    default: 'user',
  },

  password: {
    select: false,
    required: [true, 'User require a password'],
    type: String,
    minLength: [8, 'Password must be 8 characters long!'],
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (pass) {
        return this.password === pass;
      },
      message: 'Password doesnot match! Try again',
    },
  },

  changedPasswordAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

//middlewares
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAt = Date.now() - 1000;
  next();
});

//methods
userSchema.methods.comparePassword = async function (pass, userpass) {
  return await bcrypt.compare(userpass, pass);
};

//
userSchema.methods.checkPasswordChange = function (jwtTimeStamp) {
  if (this.changedPasswordAt) {
    const passChangedTime = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10
    );

    return jwtTimeStamp < passChangedTime;
  }

  //not changed
  return false;
};

userSchema.methods.createPasswordSendToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
