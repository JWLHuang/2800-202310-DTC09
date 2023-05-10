const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const usersModel = require("./models/usersModel");
const Joi = require("joi");

const schema = Joi.object({
    about_me: Joi.string().min(1).max(100).trim().required(),
});

router.get('/profile', async (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    const user = await findUser({ email: req.session.email });
    console.log(user)
    console.log(user.dietary_preferences)
    res.render('profile.ejs', { 'user': user });
});

router.post('/profileUpdate', async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
        console.log('About me field is invalid');
    }
    else {
        usersModel.updateOne({ email: req.session.email }, { about_me: req.body.about_me }).then((result) => {
            console.log('About me field updated');
            res.redirect('/profile');
        }).catch((err) => {
            console.log(err);
            console.log('About me field not updated');
        });
    }
})


module.exports = router;