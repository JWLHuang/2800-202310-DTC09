const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");

router.get('/restaurant', (req, res) => {
    res.render('restaurant.ejs');
});

router.get("/testRestaurant", async (req, res) => {
    const restaurant = await restaurantModel.findOne({ Name: "Forum" });
    const user = await findUser({ email: req.session.email });
    res.render("restaurant.ejs", restaurant ? { user: user, restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254 } : { user: user, restaurant: null });
});

module.exports = router;