const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// EJS setup
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(new LocalStrategy(
    (username, password, done) => {
        // Replace this with your authentication logic
        if (username === 'user' && password === 'password') {
            return done(null, { id: 1, username: 'user' });
        } else {
            return done(null, false, { message: 'Invalid credentials' });
        }
    }
));

// Passport serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Replace this with your logic to fetch user from database
    done(null, { id: 1, username: 'user' });
});

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
