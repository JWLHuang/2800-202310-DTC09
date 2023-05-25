const express = require('express');
const router = express.Router();

// Import model
const restaurantModel = require("./models/restaurantModel");

// Display the map page
router.get('/map', async (req, res) => {
    if (req.session.authenticated) {
        // Get list of restaurant objects from database
        var restaurants = await restaurantModel.find({ _id: { $ne: "646562b76644f1aa93bc2ba2" } }, { Name: 1, _id: 1, Longitude: 1, Latitude: 1, Award: 1, Cuisine: 1 });
        // Render map with restaurants
        return res.render("map", { user: req.session, restaurants: JSON.stringify(restaurants) });
    } else {
        // If the user is not logged in, redirect them to the login page
        return res.redirect("/login");
    }
});

// Export the router
module.exports = router;