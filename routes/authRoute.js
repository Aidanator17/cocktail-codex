const express = require('express');
const passport = require('passport');
const authRouter = express.Router();
const prisma_functions = require("../controllers/prismaController")
const user_prisma_functions = prisma_functions.user
const { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

authRouter.get('/login', ensureNotAuthenticated, (req, res) => {
    res.render('auth/login', {user:req.user})
});

authRouter.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));


authRouter.get('/signup', ensureNotAuthenticated, (req, res) => {
    res.render("auth/signup", {user:req.user})
});
authRouter.post('/signup', async (req, res) => {
    await user_prisma_functions.add_user(req.body.firstname,req.body.lastname,req.body.email,req.body.password)
    console.log("REGISTERED: "+req.body.firstname,req.body.lastname+" ("+req.body.email+")")
    res.redirect("/auth/login")
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