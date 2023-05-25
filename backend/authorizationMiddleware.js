// Export authorization middleware
module.exports = {
    authenticatedOnly: (req, res, next) => {
        // Check if user is logged in. If not, redirect to login page.
        if (!req.session.authenticated) {
            return res.redirect("/login");
        }
        next();
    },
}