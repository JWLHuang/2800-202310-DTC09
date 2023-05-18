const express = require('express');
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");
const { render } = require('ejs');
const router = express.Router();
const mongo = require("mongodb");

router.get("/history", async (req, res) => {
    const user = await findUser({ email: req.session.email });
    const restaurantHistory = await user.history;
    let historyList = []
    const restaurantInfo = async () => {
        for (let i = 0; i < restaurantHistory.length; i++) {
            restaurant = await restaurantModel.find({ _id: new mongo.ObjectId(restaurantHistory[i]) })
            historyList = historyList.concat(restaurant)
        }
    }
    await restaurantInfo()
    res.render("history.ejs", {
        user: user,
        restaurants: historyList,
    })

});

module.exports = router;
