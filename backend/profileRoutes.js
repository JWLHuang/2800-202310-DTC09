const express = require('express');
const router = express.Router();
const { searchByEmail } = require('./searchProfile')
const usersModel = require("./models/usersModel");
const Joi = require("joi");

const schema = Joi.object({
    about_me: Joi.string().min(1).max(100).trim().required(),
});

router.get('/profile', async (req, res) => {
    profile = await searchByEmail(req.session.email)
    console.log(profile[0].dietary_perferences)
    res.render('profile.ejs', { 'profile': profile[0] });
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
            console.log('About me field not updated');
        });
    }
})


module.exports = router;