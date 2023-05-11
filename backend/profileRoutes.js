const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const profileLinks = require('../frontend/public/script/profileLinks');
const usersModel = require("./models/usersModel");
const criteriaModel = require("./models/criteriaModel");
const Joi = require("joi");

const profileSchema = Joi.object({
    about_me: Joi.string().min(1).max(100).trim().required(),
});

const factorsSchema = Joi.object({
    service: Joi.number().min(1).max(5).required(),
    food: Joi.number().min(1).max(5).required(),
    price: Joi.number().min(1).max(5).required(),
    atmosphere: Joi.number().min(1).max(5).required(),
    cleanliness: Joi.number().min(1).max(5).required(),
    accessibility: Joi.number().min(1).max(5).required()
});

router.get('/profile', async (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    const user = await findUser({ email: req.session.email });
    const dietaryPreferences = await criteriaModel.findOne({ 'category': 'Dietary Preferences' }, { category: 0, _id: 0 })
    const diningCriteria = await criteriaModel.findOne({ 'category': 'Dining Experience Factors' }, { category: 0, _id: 0 })
    const diningDict = diningCriteria.toObject()
    const dietaryDict = dietaryPreferences.toObject()
    res.render('profile.ejs', { 'user': user, 'profileInfo': profileLinks, 'diningCriteria': diningDict, 'dietaryPreferences': dietaryDict });
});

router.post('/profileUpdate', async (req, res) => {
    const { error, value } = profileSchema.validate(req.body);
    if (error) {
        console.log('About me field is invalid');
    }
    else {
        usersModel.updateOne({ email: req.session.email }, { about_me: req.body.about_me }).then((_) => {
            res.redirect('/profile');
        }).catch((err) => {
            console.log(err);
        });
    }
})

router.post('/updateDietaryPreferences', async (req, res) => {
    console.log(req.body.dietaryPreferences);
    usersModel.updateOne({ email: req.session.email }, { dietary_preferences: req.body.dietaryPreferences }).then((_) => {
        res.redirect('/profile');
    }).catch((err) => {
        console.log(err);
    })
});

router.post('/updateDiningCriteria', async (req, res) => {
    ratings = {};
    for (const key in req.body) {
        ratings[key] = parseInt(req.body[key]);
    }
    const { error, value } = factorsSchema.validate(ratings);
    if (error) {
        console.log(error);
    }
    else {
        usersModel.updateOne({ email: req.session.email }, ratings).then((_) => {
            res.redirect('/profile');
        }
        ).catch((err) => {
            console.log(err);
        }
        )
    }
});


module.exports = router;