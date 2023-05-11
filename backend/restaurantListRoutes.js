const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");

router.get('/restaurants', async (req, res) => {
    try {
        const user = await findUser({ email: req.session.email });
        const searchTerms = user.dietary_preferences
        const searchQuery = {
            $or: searchTerms.map((term) => ({
                FacilitiesAndServices: { $regex: term, $options: "i" }
            }))
        }
        try {
            const restaurants = await restaurantModel.find(searchQuery);
            res.render('restaurantList.ejs', restaurants ? { user: user, restaurants: restaurants } : { user: user, restaurants: null });
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/restaurant', (req, res) => {
    res.render('restaurant.ejs');
});

router.get("/testRestaurant", async (req, res) => {
    const restaurant = await restaurantModel.findOne({ Name: "Forum" });
    const user = await findUser({ email: req.session.email });
    res.render("restaurant.ejs", restaurant ? { user: user, restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254 } : { user: user, restaurant: null });
});

router.get("/filterRestaurants", async (req, res) => {
    const user = await findUser({ email: req.session.email });
    const cuisine = await restaurantModel.distinct("Cuisine");
    const price = await restaurantModel.distinct("Price");
    const award = await restaurantModel.distinct("Award");
    res.render("filterRestaurants.ejs", { user: user, cuisine: cuisine, price: price, award: award });
});

router.post("/filterRestaurantsResults", async (req, res) => {
    console.log(req.body);
})
    
module.exports = router;