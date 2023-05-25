const express = require('express');
const router = express.Router();

// Import helper functions
const { findUser } = require("./findUser");
const { getTopThree } = require("./planMyDay");
const { getRestaurantRatings } = require("./getRestaurantRatings");
const { getSearchQuery } = require("./getSearchQuery");

// Import models
const restaurantModel = require("./models/restaurantModel");

// Display the planMyDay page
const planMyDay = async (user, searchQuery, req, res, errorMsg) => {
    try {
        var restaurants = await restaurantModel.find(searchQuery);
        var restaurantsList = [];
        var dayToday = new Date().getDay();
        var results = {};

        // Get the ratings for each restaurant.
        restaurants = await getRestaurantRatings(user, restaurants);

        restaurants.forEach((restaurant) => {
            restaurantsList.push(`${restaurant._doc["_id"]} - ${restaurant._doc["Location"]} - ${restaurant._doc["Name"]} at open ${JSON.parse(restaurant._doc["OpenHours"])[String(dayToday)]})`)
        })

        // Get top 10 to pass to OpenAI.
        choicesList = restaurantsList.slice(0, 10)

        try {
            // Pass restaurant information to OpenAI and parse response.
            const response = await getTopThree(choicesList)
            var restaurantResults = response.data.choices[0].text
            restaurantResults = JSON.parse(restaurantResults)
        } catch (err) {
            try {
                // Try again if OpenAI fails to return an apporpriate response.
                console.log(`Attempt 1: ${err}`)
                const response = await getTopThree(choicesList)
                var restaurantResults = response.data.choices[0].text
                restaurantResults = JSON.parse(restaurantResults)
            } catch {
                // Display error message if OpenAI fails to return an appropriate response twice.
                console.log(`Attempt 2: ${err}`)
                req.session.error = "Error. Please try again.";
                res.redirect("/filterRestaurants")
                return;
            }
        }

        // Build list of restaurants to display.
        for (var meal in restaurantResults) {
            const searchResults = restaurants.filter((restaurant) => String(restaurant._doc["_id"]) === restaurantResults[meal])[0]
            const selectedRestaurant = searchResults ? searchResults : { _doc: { _id: "646562b76644f1aa93bc2ba2" } }
            results[meal] = selectedRestaurant
        }
        // Render page with restaurants
        res.render("planMyDay", results ? { user: user, results: results, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg });
    } catch (err) {
        console.log(err);
    }
}

// Display the planMyDay page
router.get('/planmyday', async (req, res) => {
    // Get error message from session if it exists.
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    // Decode and parse the filter data from the query parameter
    const filterData = JSON.parse(decodeURIComponent(req.query.filter));
    embeddedTab = filterData.embedded;
    delete filterData.embedded;
    // If no filter data, redirect to error page.
    if (Object.keys(filterData).length === 0 || filterData === undefined || filterData.Location === undefined) {
        if (embeddedTab === "true") {
            return res.redirect("/filterRestaurants/embeddedError");
        }
        return res.redirect("/filterRestaurants/error");
    }
    try {
        // If user exists, get search query and feed to OpenAI API.
        const user = await findUser({ email: req.session.email });
        if (!user) {
            return res.redirect("/login")

        } else {
            const searchQuery = await getSearchQuery(filterData, user.dietary_preferences);
            planMyDay(user, searchQuery, req, res, errorMsg);
        }
    } catch (err) {
        console.log(err);
    }
});

// Capture user's input for Plan My Day.
router.post("/planmyday", async (req, res) => {
    let filterData = req.body;
    if (Object.keys(filterData).length === 0 || filterData === undefined) {
        return res.redirect("/filterRestaurants/error");
    }
    res.redirect(`/planmyday?filter=${encodeURIComponent(JSON.stringify(filterData))}`);
})

module.exports = router;