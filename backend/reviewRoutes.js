const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const restaurantModel = require("./models/restaurantModel");

router.get("/writeReview/:id?", async (req, res) => {
    const user = await findUser({ email: req.session.email });
    const restaurant = await restaurantModel.findOne({ _id: req.params.id });
    res.render("writeReview", { user: user, restaurant: restaurant });
});

module.exports = router;
