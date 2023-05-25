const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const profileLinks = require('../frontend/public/script/profileLinks');
const usersModel = require("./models/usersModel");
const criteriaModel = require("./models/criteriaModel");
const profileSchema = require('./schema/profileSchema');
const factorsSchema = require('./schema/factorSchema');

router.get('/profile/:message?', async (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    const user = await findUser({ email: req.session.email });
    const dietaryPreferences = await criteriaModel.findOne({ 'category': 'Dietary Preferences' }, { category: 0, _id: 0 })
    const diningCriteria = await criteriaModel.findOne({ 'category': 'Dining Experience Factors' }, { category: 0, _id: 0 })
    const diningDict = diningCriteria.toObject()
    const dietaryDict = dietaryPreferences.toObject()
    if (req.params.message === "errorProfileEdit") {
        return res.render('profile.ejs', { 'user': user, 'profileInfo': profileLinks, 'diningCriteria': diningDict, 'dietaryPreferences': dietaryDict, errorProfileEdit: "Invalid Input for 'about me' section" });
    } else if (req.params.message === "errorDietaryPreferences") {
        return res.render('profile.ejs', { 'user': user, 'profileInfo': profileLinks, 'diningCriteria': diningDict, 'dietaryPreferences': dietaryDict, errorPreferencesEdit: "Please pick at least one dietary preference" });
    } else if (req.params.message === "errorDiningCriteria") {
        return res.render('profile.ejs', { 'user': user, 'profileInfo': profileLinks, 'diningCriteria': diningDict, 'dietaryPreferences': dietaryDict, errorFactorEdit: "Must rank all criteria" });
    } else if (req.params.message === "errorRanking") {
        return res.render('profile.ejs', { 'user': user, 'profileInfo': profileLinks, 'diningCriteria': diningDict, 'dietaryPreferences': dietaryDict, errorFactorEdit: "Cannot have duplicate rankings" });
    }
    res.render('profile.ejs', { 'user': user, 'profileInfo': profileLinks, 'diningCriteria': diningDict, 'dietaryPreferences': dietaryDict });
});

router.post('/profileUpdate', async (req, res) => {
    const { error, value } = profileSchema.validate(req.body);
    if (error) {
        return res.redirect("/profile/errorProfileEdit");
    }
    else {
        try {
            await usersModel.updateOne({ email: req.session.email }, { about_me: req.body.about_me })
            res.redirect('/profile');
        } catch (err) {
            console.log(err);
        }
    }
})

router.post('/updateDietaryPreferences', async (req, res) => {
    if (Object.keys(req.body).length === 0 || req.body === undefined) {
        return res.redirect("/profile/errorDietaryPreferences");
    }
    try {
        await usersModel.updateOne({ email: req.session.email }, { dietary_preferences: req.body.dietaryPreferences })
        res.redirect('/profile');
    } catch (err) {
        console.log(err);
    }
});

router.post('/updateDiningCriteria', async (req, res) => {

    // Check if all criteria are ranked
    ratings = {};
    for (const key in req.body) {
        ratings[key] = parseInt(req.body[key]);
    }
    const { error, value } = factorsSchema.validate(ratings);
    if (error) {
        return res.redirect("/profile/errorDiningCriteria");
    }

    // Check if there are duplicate rankings
    rankingArray = []
    for (const key in ratings) {
        if (rankingArray.includes(ratings[key])) {
            return res.redirect("/profile/errorRanking");
        }
        rankingArray.push(ratings[key])
    }

    // Update user's dining criteria
    try {
        await usersModel.updateOne({ email: req.session.email }, ratings)
        res.redirect('/profile');
    } catch (err) {
        console.log(err);
    }
});


module.exports = router;