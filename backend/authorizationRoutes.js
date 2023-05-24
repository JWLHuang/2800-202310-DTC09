const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const usersModel = require("./models/usersModel");
const { authenticatedOnly } = require("./authorizationMiddleware");
const loginSchema = require("./schema/loginSchema");

// Use urlencoded middleware to parse the body of incoming requests
router.use(express.urlencoded({ extended: false }))

// Display login route
router.get("/login", async (req, res) => {
    // If there is an error message in the session, display it
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;

    // If the user is already logged in, redirect to home page
    if (req.session.authenticated) {
        res.redirect("/");
    } else {
        // Otherwise, display the login page
        res.render("authentication.ejs", { errorMsg: errorMsg, target: "login" });
    }
});

// Handle login route POST request
router.post("/login", async (req, res) => {
    // Validate the request body against the login schema
    const validationResult = loginSchema.validate(req.body);

    // If there are validation errors, display them
    if (validationResult.error != null) {
        errorMsg = validationResult.error.details[0].message
    } else {
        // Otherwise, check if the user exists and if the password is correct
        const user = await usersModel.findOne({
            email: req.body.email,
        })
        // If the user registered with external authentication, display an error message
        if (user && user.extAuth === true) {
            errorMsg = "Please use external authentication instead."
            // If the user does not exist, display an error message
        } else if (!user) {
            errorMsg = "Email is not registered."
            // If the user exists and the password is incorrect, display an error message
        } else if (user && !bcrypt.compareSync(req.body.password, user.password)) {
            errorMsg = "Invalid Password."
            // If the user exists and the password is correct, log the user in
        } else if (user && bcrypt.compareSync(req.body.password, user.password)) {
            req.session.authenticated = true;
            req.session.email = req.body.email;
            req.session.name = user.name;
            console.log("User logged in");
            return res.redirect("/");
            // If there is an unknown error, display an error message
        } else {
            errorMsg = "An error has occurred. Please try again."
        }
    }
    // Render the login page with the error message
    return res.render("authentication.ejs", { errorMsg: errorMsg, target: "login" });
});


// Login error route for external authentication
router.get("/loginError", async (req, res) => {
    req.session.error = "Authentication error. Please try again.";
    res.redirect("/login")
});


// Logout route - destroy session
router.get("/logout", authenticatedOnly, (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// Export router
module.exports = router;