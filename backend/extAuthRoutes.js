const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const usersModel = require("./models/usersModel");
const { findUser } = require("./findUser");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

var userProfile;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

router.use(passport.initialize());
router.use(passport.session());

router.get("/ExtAuthSuccess", async (req, res) => {
    try {
        const email = userProfile.emails[0].value

        const user = await findUser({ email: email });

        if (user && user.extAuth === true) {
            req.session.authenticated = true;
            req.session.email = email
            console.log("User logged in");
            res.redirect("/");
        } else if (user && user.extAuth !== true) {
            res.render("login.ejs", { user: null, errorMsg: "Your account was not created with external authentication. Please use the login form instead." });
        } else {
            const username = userProfile.displayName
            newUser = {
                email: email,
                name: username,
                password: bcrypt.hashSync("", 10),
                type: "user",
                extAuth: true,
            };

            await usersModel.create(newUser).then(() => {
                console.log("User created");
                req.session.authenticated = true;
                req.session.email = email;
                res.redirect("/");
            });
        }
    } catch {
        return res.render("login.ejs", { user: null, errorMsg: "Authentication error. Please try again." });
    }
});

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_AUTH_CALLBACK
},
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        return done(null, userProfile);
    }
));

router.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/loginError",
    }),
    function (req, res) {
        res.redirect("/ExtAuthSuccess");
    });


module.exports = router;