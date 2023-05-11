const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const usersModel = require("./models/usersModel");
const { findUser } = require("./findUser");

const signupSchema = Joi.object(
    {
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "ca", "co"] } }).required(),
        name: Joi.string().alphanum().max(20).required(),
        password: Joi.string().max(20).required(),
        type: Joi.boolean(),
    });

router.get('/signup', async (req, res) => {
    const user = await findUser({ email: req.session.email });
    res.render('signup.ejs', user ? { user: user } : { user: null });
});

router.use(express.urlencoded({ extended: false }))
router.post("/signup", async (req, res) => {
    const validationResult = signupSchema.validate(req.body);
    if (validationResult.error != null) {
        // res.render("authError", { errorType: "Signup", errorMsg: validationResult.error.details[0].message })
        console.log(validationResult.error.details[0].message)
    } else if (await usersModel.findOne({ email: req.body.email, })) {
        // res.render("authError", { errorType: "Signup", errorMsg: "Email already exists." })
        console.log("Email already exists.")
    } else {
        newUser = {
            email: req.body.email,
            name: req.body.name,
            password: bcrypt.hashSync(req.body.password, 10),
            type: "user",
        };
        await usersModel.create(newUser).then(() => {
            console.log("User created");
            req.session.authenticated = true;
            req.session.email = req.body.email;
            res.redirect("/");
        }
        );
    };
});

module.exports = router;