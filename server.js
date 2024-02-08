const express = require('express');
const flash = require('express-flash')
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const prisma_functions = require("./controllers/prismaController")
const user_prisma_functions = prisma_functions.user

const authRoutes = require('./routes/authRoute');
const indexRoutes = require('./routes/indexRoute');
const addRoutes = require('./routes/addRoute');

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const PORT = process.env.PORT || 3000;

// EJS setup
// app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'))


passport.use('local', new LocalStrategy({
    usernameField: 'email', // assuming email is used for login
    passwordField: 'password' // assuming password is used for login
},
    async (email, password, done) => {
        const user = await user_prisma_functions.get_user_by_email(email)
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (!user_prisma_functions.validPassword(user, password)) { // Assuming you have a method in your User model to check passwords
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    }));

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async(id, done) => {
    const user = await user_prisma_functions.get_user_by_id(id)
    done(null, user);
});


app.use('/', indexRoutes)
app.use('/auth', authRoutes);
app.use('/add', addRoutes)


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
