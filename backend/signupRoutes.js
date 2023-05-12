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
    user ? res.locals.user = user : res.locals.user = null;
    if (user) {
        res.redirect("/");
    } else {
        res.render('signup.ejs');
    }
});

router.use(express.urlencoded({ extended: false }))
router.post("/signup", async (req, res) => {
    const validationResult = signupSchema.validate(req.body);
    if (validationResult.error != null) {
        const user = await findUser({ email: req.session.email });
        user ? res.locals.user = user : res.locals.user = null;
        res.render('signup.ejs', { errorMsg: validationResult.error.details[0].message });
    } else if (await usersModel.findOne({ email: req.body.email, })) {
        const user = await findUser({ email: req.session.email });
        user ? res.locals.user = user : res.locals.user = null;
        res.render('signup.ejs', { errorMsg: "Email already exists" });
    } else {
        newUser = {
            email: req.body.email,
            name: req.body.name,
            password: bcrypt.hashSync(req.body.password, 10),
            type: "user",
            extAuth: false,
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