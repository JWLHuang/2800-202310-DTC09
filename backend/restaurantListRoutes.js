const express = require('express');
const router = express.Router();
const mongo = require("mongodb");

// Import models
const restaurantModel = require("./models/restaurantModel");
const reviewModel = require("./models/reviewModel");
const usersModel = require("./models/usersModel");

// Import helper functions
const aiFilter = require("../helperFunctions/aiFilter");
const { findUser } = require("../helperFunctions/findUser");
const { getRestaurantRatings } = require("../helperFunctions/getRestaurantRatings");
const { getSearchQuery } = require("../helperFunctions/getSearchQuery");

// Display Easter egg routes
router.get("/snake", async (req, res) => {
    res.render("snake");
});

// Display the restaurant list page
router.get('/restaurants', async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    const filterData = JSON.parse(decodeURIComponent(req.query.filter)); // Decode and parse the filter data from the query parameter
    if (!filterData.Location) return res.redirect("/filterRestaurants/error");
    try {
        // Retrieve user preferences from their account
        const user = await findUser({ email: req.session.email }) // Replace with your actual implementation
        if (!user) {
            return res.redirect("/login")
        } else {
            const searchQuery = await getSearchQuery(filterData, user.dietary_preferences);
            const restaurants = await restaurantModel.find(searchQuery);
            const randomRestaurants = restaurants.slice().sort(() => Math.random() - 0.5).slice(0, 10);
            // const filteredRestaurants = await getRestaurantRatings(user, randomRestaurants);
            // console.log(filteredRestaurants);
            let filteredRestaurants = await aiFilter(randomRestaurants);
            filteredRestaurants = await getRestaurantRatings(user, filteredRestaurants);
            res.render('restaurantList.ejs', restaurants ? { user: user, restaurants: filteredRestaurants, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg });
        }
    } catch (err) {
        console.log(err);
    }
});

// Get individual restaurant page.
router.get('/restaurant/:id?', async (req, res) => {
    const user = await findUser({ email: req.session.email });
    try {
        // Get restaurant reviews.
        const restaurant = await restaurantModel.findOne({ _id: req.params.id });
        const reviews = await reviewModel.find({ restaurantID: req.params.id }).sort({ TimeStamp: -1 });
        for (let i = 0; i < reviews.length; i++) {
            const author = await findUser({ _id: reviews[i].userID }, { name: 1 });
            reviews[i].userID = author.name;
        }
        if (restaurant && user) {
            // Get restaurant object, add to users history, and render page.
            const query = { email: req.session.email };

            if (!user.history.includes(restaurant._id)) {
                await usersModel.updateOne(query, { $push: { history: restaurant._id } });
            } else {
                await usersModel.updateOne(query, { $pull: { history: restaurant._id } });
                await usersModel.updateOne(query, { $push: { history: restaurant._id } });
            }
            return res.render("restaurant", { user: user, restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254, reviews: reviews });
        } else if (restaurant && !user) {
            // Get restaurant object and render page.
            return res.render("restaurant", { restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254, reviews: reviews });
        } else {
            // If id is invalid, return to filter page and show error.
            req.session.error = "Restaurant not found";
            return res.redirect("/filterRestaurants")
        }

    } catch (error) {
        // If id is invalid, return to filter page and show error.
        console.log(error)
        req.session.error = "Restaurant not found";
        res.redirect("/filterRestaurants")
    }
});

// Display the filter page
router.get("/filterRestaurants/:message?", async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    const featuredRestaurants = await restaurantModel.find({ Location: 'Vancouver, Canada', Award: "1 MICHELIN Star", Cuisine: { $not: /^C.*/ } }).limit(3);
    try {
        if (!req.session.authenticated) {
            return res.redirect('/login');
        }
        const user = await findUser({ email: req.session.email });
        const history = await user.history;
        const restaurantHistory = history.reverse().slice(0, 3);
        const cuisine = await restaurantModel.distinct("Cuisine");
        const price = await restaurantModel.distinct("Price");
        const award = await restaurantModel.distinct("Award");
        const location = await restaurantModel.distinct("Location");
        location.push("Chris")
        cuisine.push("Don't")
        price.push("Select")
        award.push("This")
        let historyList = []
        const restaurantInfo = async () => {
            for (let i = 0; i < restaurantHistory.length; i++) {
                restaurant = await restaurantModel.find({ _id: new mongo.ObjectId(restaurantHistory[i]) })
                historyList = historyList.concat(restaurant)
            }
        }
        await restaurantInfo()

        if (req.params.message === "error") {
            return res.render("filterRestaurants.ejs", { user: user, featuredRestaurant: featuredRestaurants, restaurantHistory: historyList, cuisine: cuisine, price: price, award: award, location: location, errorMessage: "Location filter must be selected", errorMsg: errorMsg });
        }

        if (req.params.message === "embeddedError") {
            return res.render("index.ejs", { user: user, featuredRestaurant: featuredRestaurants, restaurantHistory: historyList, cuisine: cuisine, price: price, award: award, location: location, errorMessage: "Location filter must be selected", errorMsg: errorMsg, menuOpen: true });
        }

        return res.render("filterRestaurants.ejs", { user: user, featuredRestaurant: featuredRestaurants, restaurantHistory: historyList, cuisine: cuisine, price: price, award: award, location: location, errorMsg: errorMsg });
    } catch (err) {
        console.log(err);
    }
});

// Handle filter form submission.
router.post("/filterRestaurantsResults", async (req, res) => {
    let filterData = req.body;
    embeddedTab = filterData.embedded;
    delete filterData.embedded;
    console.log(filterData);

    if (Object.keys(filterData).length === 0 || filterData === undefined || filterData.Location === undefined) {
        if (embeddedTab === "true") {
            return res.redirect("/filterRestaurants/embeddedError");
        }
        return res.redirect("/filterRestaurants/error");
    }

    // Trigger easter egg if "Chris don't select this" is selected.
    if (filterData["Location"] === "Chris" &&
        filterData["Cuisine"] === "Don't" &&
        filterData["Price"] === "Select" &&
        filterData["Award"] === "This") {

        res.redirect("/snake");
        return;
    }

    res.redirect(`/restaurants?filter=${encodeURIComponent(JSON.stringify(filterData))}`);
})

module.exports = router;