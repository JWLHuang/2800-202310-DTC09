module.exports = {
    authenticatedOnly: (req, res, next) => {
        if (!req.session.authenticated) {
            // return res.status(401).json({ error: "You are not logged in." });
            console.log("You are not logged in");
            return res.redirect("/login");
        }
        next();
    },
}