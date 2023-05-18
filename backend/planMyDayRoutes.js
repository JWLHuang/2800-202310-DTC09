const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");
const { getTopThree } = require("./planMyDay");

const planMyDay = async (user, searchQuery, req, res, errorMsg) => {
    console.log(req)
    try {
        const restaurants = await restaurantModel.find(searchQuery);
        var restaurantsList = [];
        var dayToday = new Date().getDay();
        var results = {};

        restaurants.forEach((restaurant) => {
            restaurantsList.push(`${restaurant["_id"]} (${restaurant["Name"]} at ${restaurant["Address"]}) open ${JSON.parse(restaurant["OpenHours"])[String(dayToday)]})`)
        })

        choicesList = restaurantsList.sort(() => Math.random() - Math.random()).slice(0, 5)

        try {
            // console.log(choicesList)

            const response = await getTopThree(choicesList)
            var restaurantResults = response.data.choices[0].text
            // console.log(restaurantResults)

            // var restaurantResults = '{"Breakfast":"645bdf114c5057693bcac787a","Lunch":"645bdf114c5057693bcac78d","Dinner":"645bdf114c5057693bcac78f"}'
            restaurantResults = JSON.parse(restaurantResults)
        } catch (err) {
            try {
                console.log(`Attempt 1: ${err}`)
                // console.log(choicesList)

                const response = await getTopThree(choicesList)
                var restaurantResults = response.data.choices[0].text
                // console.log(restaurantResults)

                // var restaurantResults = '{"Breakfast":"645bdf114c5057693bcac787a","Lunch":"645bdf114c5057693bcac78d","Dinner":"645bdf114c5057693bcac78f"}'
                restaurantResults = JSON.parse(restaurantResults)

            } catch {
                console.log(`Attempt 2: ${err}`)
                req.session.error = "Error. Please try again.";
                res.redirect("/filterRestaurants")
            }
        }

        for (var meal in restaurantResults) {
            const searchResults = restaurants.filter((restaurant) => String(restaurant["_id"]) === restaurantResults[meal])[0]
            console.log(searchResults)

            const selectedRestaurant = searchResults ? searchResults : "646562b76644f1aa93bc2ba2"

            results[meal] = selectedRestaurant
        }

        res.render("planMyDay", restaurantResults ? { user: user, results: results, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg });
    } catch (err) {
        console.log(err);
    }
}

router.get('/planmyday', async (req, res) => {
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
            planMyDay(user, searchQuery, req, res, errorMsg);
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
            planMyDay(user, searchQuery, req, res, errorMsg);
        }
    } catch (err) {
        console.log(err);
    }
});

router.post("/planmyday", async (req, res) => {
    let filterData = req.body;

    if (Object.keys(filterData).length === 0 || filterData === undefined) {
        return res.redirect("/filterRestaurants/error");
    }

    res.redirect(`/planmyday?filter=${encodeURIComponent(JSON.stringify(filterData))}`);
})

module.exports = router;