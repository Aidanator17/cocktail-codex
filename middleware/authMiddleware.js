// /middleware/authMiddleware.js

// Middleware to check if user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
};

// Middleware to check if user is not authenticated (e.g., for login and signup pages)
exports.ensureNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/profile'); // Redirect to profile page if already authenticated
};

// Middleware to check if user is an admin
exports.ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/'); // Redirect to home page or another appropriate page if not an admin
};