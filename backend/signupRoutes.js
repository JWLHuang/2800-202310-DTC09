const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const usersModel = require("./models/usersModel");
const signupSchema = require("./schema/signupSchema");

// Use urlencoded middleware to parse the body of incoming requests
router.use(express.urlencoded({ extended: false }))


// Display signup route
router.get('/signup', async (req, res) => {
    // If the user is already logged in, redirect to home page
    if (req.session.authenticated) {
        res.redirect("/");
    } else {
        // Otherwise, display the signup page
        res.render('authentication.ejs', { target: "signup"});
    }
});

// Handle signup route POST request
router.post("/signup", async (req, res) => {
    // Validate the request body against the signup schema
    const validationResult = signupSchema.validate(req.body);

    // If there are validation errors, display them
    if (validationResult.error != null) {
        errorRegMsg = validationResult.error.details[0].message
        return res.render('authentication.ejs', { errorRegMsg: errorRegMsg, target: "signup" });
    } else if (await usersModel.findOne({ email: req.body.email, })) {
        errorRegMsg = "Email already exists"
        return res.render('authentication.ejs', { errorRegMsg: errorRegMsg, target: "signup" });
    } else {
        // Otherwise, create a new user
        newUser = {
            email: req.body.signupEmail,
            name: req.body.signupName,
            password: bcrypt.hashSync(req.body.signupPassword, 10),
            question: req.body.securityQuestion,
            answer: bcrypt.hashSync(req.body.securityAnswer, 10),
            type: "user",
            extAuth: false,
        };
        await usersModel.create(newUser)
        console.log("User created");
        req.session.authenticated = true;
        req.session.email = req.body.signupEmail;
        req.session.name = req.body.signupName;
        return res.redirect("/");
    };
});

// Export router
module.exports = router;