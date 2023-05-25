const express = require('express');
const router = express.Router();
const mongo = require("mongodb");

// Import helper functions and models
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("../helperFunctions/findUser");
const { getRestaurantRatings } = require("../helperFunctions/getRestaurantRatings");

// Display the history page
router.get("/history", async (req, res) => {
    // Retrieve the user from the database
    const user = await findUser({ email: req.session.email });
    const history = await user.history;
    const restaurantHistory = history.reverse();
    let historyList = []

    // get the latest 20 restaurant information from the database
    const restaurantInfo = async () => {
        for (let i = 0; i < Math.min(restaurantHistory.length, 20); i++) {
            restaurant = await restaurantModel.find({ _id: new mongo.ObjectId(restaurantHistory[i]) })
            historyList = historyList.concat(restaurant)
        }
    }
    await restaurantInfo()

    // get the rating for each restaurant from reviews and user weights
    restaurantList = await getRestaurantRatings(user, historyList);

    // render the history page
    res.render("history.ejs", {
        user: user,
        restaurants: restaurantList,
    })

});

module.exports = router;
