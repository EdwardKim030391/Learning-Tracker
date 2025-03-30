const passport = require('passport');
const User = require('../models/User');

exports.registerUser = async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  if (!name || !email || !password || !confirm_password) {
    return res.render('register', { error_msg: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error_msg: 'Email is already registered', name, email });
    }

    if (password !== confirm_password) {
      return res.render('register', { error_msg: 'Passwords do not match', name, email });
    }

    const newUser = new User({ name, email, password }); // 해시 처리 전제
    await newUser.save();

    req.flash('success_msg', 'You are registered. Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('register', { error_msg: 'Error registering user' });
  }
};

exports.loginUser = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
};

exports.logoutUser = (req, res) => {
  req.logout(() => {
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
};
