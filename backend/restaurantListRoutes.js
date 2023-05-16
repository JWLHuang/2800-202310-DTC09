const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");

const findRestaurants = async (user, searchQuery, res, errorMsg) => {
    try {
        const restaurants = await restaurantModel.find(searchQuery);
        res.render('restaurantList.ejs', restaurants ? { user: user, restaurants: restaurants, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg });
    } catch (err) {
        console.log(err);
    }
}

router.get("/snake", async (req, res) => {
    const user = await findUser({ email: req.session.email });
    user ? res.locals.user = user : res.locals.user = null;
    res.render("snake");
});

router.get('/restaurants', async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    const filterParam = req.query.filter; // Get the filter data from the query parameter
    if (!filterParam) return res.redirect("/filterRestaurants/error"); // If there is no filter data, redirect to the filter page with an error message
    const filterData = JSON.parse(decodeURIComponent(req.query.filter)); // Decode and parse the filter data from the query parameter
    try {
        const user = await findUser({ email: req.session.email });
        if (!user) {
            return res.redirect("/login")
        } else if (user.dietary_preferences.length === 0) {
            const searchQuery = {
                $and: Object.keys(filterData).map((field) => ({
                    [field]: { $regex: filterData[field], $options: "i" }
                }))
            }
            findRestaurants(user, searchQuery, res, errorMsg);
        } else {
            const searchTerms = user.dietary_preferences
            const searchQuery = {
                $and: [
                    {
                        $or: searchTerms.map((term) => ({
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
            findRestaurants(user, searchQuery, res, errorMsg);
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

        cuisine.push("Hi")
        price.push("Chris")
        award.push("Don't")
        location.push("Select")

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

    if (filterData["Cuisine"] === "Hi" &&
        filterData["Price"] === "Chris" &&
        filterData["Award"] === "Don't" &&
        filterData["Location"] === "Select") {

        res.redirect("/snake");
        return;
    }

    res.redirect(`/restaurants?filter=${encodeURIComponent(JSON.stringify(filterData))}`);
})

module.exports = router;