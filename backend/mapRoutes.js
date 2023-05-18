const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");

router.get('/map', async (req, res) => {
    const user = await findUser({ email: req.session.email });
    user ? res.locals.user = user : res.locals.user = null;

    var restaurants = await restaurantModel.find({ _id: { $ne: "646562b76644f1aa93bc2ba2" } }, { Name: 1, _id: 1, Longitude: 1, Latitude: 1, Award: 1, Cuisine: 1 });

    res.render("map", { restaurants: JSON.stringify(restaurants) });
});

module.exports = router;