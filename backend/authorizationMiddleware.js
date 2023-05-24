module.exports = {
    authenticatedOnly: (req, res, next) => {
        // Check if user is logged in. If not, redirect to login page.
        if (!req.session.authenticated) {
            console.log("You are not logged in");
            return res.redirect("/login");
        }
        next();
    },
}