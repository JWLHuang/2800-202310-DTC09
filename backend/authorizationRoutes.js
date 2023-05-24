const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const usersModel = require("./models/usersModel");
const { authenticatedOnly } = require("./authorizationMiddleware");
const { findUser } = require("./findUser");

router.get("/login", async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    const user = await findUser({ email: req.session.email });
    user ? res.locals.user = user : res.locals.user = null;
    if (user) {
        res.redirect("/");
    } else {
        res.render("authentication.ejs", { errorMsg: errorMsg, target: "login"});
    }
});

const loginSchema = Joi.object(
    {
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "ca", "co", "org"] } }).required(),
        password: Joi.string().max(20).required(),
    });

router.use(express.urlencoded({ extended: false }))
router.post("/login", async (req, res) => {
    const validationResult = loginSchema.validate(req.body);
    if (validationResult.error != null) {
        const user = await findUser({ email: req.session.email });
        user ? res.locals.user = user : res.locals.user = null;
        res.render("authentication.ejs", { errorMsg: validationResult.error.details[0].message });
    } else {
        const user = await usersModel.findOne({
            email: req.body.email,
        })
        if (user && user.extAuth === true) {
            user ? res.locals.user = user : res.locals.user = null;
            res.render("authentication.ejs", { errorMsg: "Please use external authentication instead.", target: "login" });
        } else if (user && bcrypt.compareSync(req.body.password, user.password)) {
            req.session.authenticated = true;
            req.session.email = req.body.email;
            console.log("User logged in");
            res.redirect("/");
        } else {
            user ? res.locals.user = user : res.locals.user = null;
            res.render("authentication.ejs", { errorMsg: "Invalid email/password combination.", target: "login" });
        }
    };
});

router.get("/loginError", async (req, res) => {
    req.session.error = "Login error. Please try again.";
    res.redirect("/login")
});

router.get("/logout", authenticatedOnly, (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;