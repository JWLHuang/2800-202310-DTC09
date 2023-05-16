const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");
const aiFilter = require("./aiFilter");


const getSearchQuery = async (filterData, preferences) => {
    if (preferences.length === 0) {
        const query = {
            $and: Object.keys(filterData).map((field) => ({
                [field]: { $regex: filterData[field], $options: "i" }
            }))
        }
        return query;
    } else {
        const query = {
            $and: [
                {
                    $or: preferences.map((term) => ({
                        "Dietary Restrictions": { $regex: term, $options: "i" }
                    }))
                },
                {
                    $and: Object.keys(filterData).map((field) => ({
                        [field]: { $regex: filterData[field], $options: "i" }
                    }))
                }
            ]
        }
        return query;
    }
}

router.get('/restaurants', async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    const filterParam = req.query.filter; // Get the filter data from the query parameter
    if (!filterParam) return res.redirect("/filterRestaurants/error"); // If there is no filter data, redirect to the filter page with an error message
    const filterData = JSON.parse(decodeURIComponent(req.query.filter)); // Decode and parse the filter data from the query parameter
    try {
        // Retrieve user preferences from their account
        const user = await findUser({ email: req.session.email }) // Replace with your actual implementation
        if (!user) {
            return res.redirect("/login")
        } else {
            const searchQuery = await getSearchQuery(filterData, user.dietary_preferences);
            const restaurants = await restaurantModel.find(searchQuery);
            let filteredRestaurants = await aiFilter(restaurants);
            res.render('restaurantList.ejs', restaurants ? { user: user, restaurants: filteredRestaurants, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg });
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/restaurant/:id?', async (req, res) => {
    const user = await findUser({ email: req.session.email });
    try {
        const restaurant = await restaurantModel.findOne({ _id: req.params.id });
        if (restaurant) {
            res.render("restaurant", restaurant ? { user: user, restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254 } : { user: user, restaurant: null });
        } else {
            req.session.error = "Restaurant not found";
            res.redirect("/filterRestaurants")
        }

    } catch (error) {
        req.session.error = "Restaurant not found";
        res.redirect("/filterRestaurants")
    }
});

router.get("/filterRestaurants/:message?", async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    try {
        if (!req.session.authenticated) {
            return res.redirect('/login');
        }
        const user = await findUser({ email: req.session.email });
        const cuisine = await restaurantModel.distinct("Cuisine");
        const price = await restaurantModel.distinct("Price");
        const award = await restaurantModel.distinct("Award");
        const location = await restaurantModel.distinct("Location");
        if (req.params.message === "error") {
            return res.render("filterRestaurants.ejs", { user: user, cuisine: cuisine, price: price, award: award, location: location, errorMessage: "At least one filter must be selected", errorMsg: errorMsg });
        }
        res.render("filterRestaurants.ejs", { user: user, cuisine: cuisine, price: price, award: award, location: location, errorMsg: errorMsg });
    } catch (err) {
        console.log(err);
    }
});

router.post("/filterRestaurantsResults", async (req, res) => {
    let filterData = req.body;
    if (Object.keys(filterData).length === 0 || filterData === undefined) {
        return res.redirect("/filterRestaurants/error");
    }
    res.redirect(`/restaurants?filter=${encodeURIComponent(JSON.stringify(filterData))}`);
})

module.exports = router;