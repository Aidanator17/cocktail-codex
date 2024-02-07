//NOT CURRENTLY BEING USED

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Assuming you have a User model
const user_prisma_functions = require('./prismaController').user

passport.use('local', new LocalStrategy({
    usernameField: 'email', // assuming email is used for login
    passwordField: 'password' // assuming password is used for login
},
    async (email, password, done) => {
        const user = await user_prisma_functions.get_user_by_email(email)
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (!user.validPassword(password)) { // Assuming you have a method in your User model to check passwords
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    }));

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
