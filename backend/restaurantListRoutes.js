const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");

router.get('/restaurants', async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    const user = await findUser({ email: req.session.email });
    const restaurants = await restaurantModel.find({
        FacilitiesAndServices: /Vegetarian/i
    });
    console.log(restaurants)
    res.render('restaurantList.ejs', restaurants ? { user: user, restaurants: restaurants, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg });
});

router.get('/restaurant/:id?', async (req, res) => {
    const user = await findUser({ email: req.session.email });
    try {
        const restaurant = await restaurantModel.findOne({ _id: req.params.id });
        if (restaurant) {
            res.render("restaurant", restaurant ? { user: user, restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254 } : { user: user, restaurant: null });
        } else {
            req.session.error = "No restaurant selected";
            res.redirect("/restaurants")
        }

    } catch (error) {
        req.session.error = "Restaurant not found";
        res.redirect("/restaurants")

    }
});

module.exports = router;