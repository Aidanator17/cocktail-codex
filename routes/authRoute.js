const express = require('express');
const passport = require('passport');
const authRouter = express.Router();

authRouter.get('/login', (req, res) => {
    res.render('auth/login')
});

authRouter.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// Registration route
authRouter.post('/register', (req, res) => {
    // Handle user registration
});

// Logout route
authRouter.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});
authRouter.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = authRouter;