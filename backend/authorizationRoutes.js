const express = require('express');
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const usersModel = require("./models/usersModel");
const { authenticatedOnly } = require("./authorizationMiddleware");

router.get('/login', (req, res) => {
    res.render('login.ejs');
});

const loginSchema = Joi.object(
    {
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "ca", "co"] } }).required(),
        password: Joi.string().max(20).required(),
    });

router.use(express.urlencoded({ extended: false }))
router.post("/login", async (req, res) => {
    const validationResult = loginSchema.validate(req.body);
    if (validationResult.error != null) {
        // res.render("authError", { errorType: "Login", errorMsg: validationResult.error.details[0].message })
        console.log(validationResult.error.details[0].message)
    } else {
        const result = await usersModel.findOne({
            email: req.body.email,
        })
        if (result && bcrypt.compareSync(req.body.password, result.password)) {
            req.session.authenticated = true;
            req.session.email = req.body.email;
            console.log("User logged in");
            res.redirect("/");
        } else {
            // res.render("authError", { errorType: "Login", errorMsg: "Invalid email/password combination." })
            console.log("Invalid email/password combination.")
        }
    };
});

router.get("/logout", authenticatedOnly, (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;