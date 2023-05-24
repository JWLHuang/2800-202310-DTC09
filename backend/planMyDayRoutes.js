const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");
const { getTopThree } = require("./planMyDay");
const reviewModel = require("./models/reviewModel");

// get the individual rating of the user for a restaurant
const getIndividualRating = async (weights, ratings) => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = {};

    for (const field in weights) {
        normalizedWeights[field] = (weights[field] / totalWeight);
    }
    const weightedSum =
        (normalizedWeights.service * ratings.service) +
        (normalizedWeights.food * ratings.food) +
        (normalizedWeights.atmosphere * ratings.atmosphere) +
        (normalizedWeights.cleanliness * ratings.cleanliness) +
        (normalizedWeights.price * ratings.price) +
        (normalizedWeights.accessibility * ratings.accessibility);
    const individualRating = Math.round(weightedSum * 100) / 100;
    return individualRating;
}

// get the rating for each restaurant from reviews and user weights
const getRestaurantRatings = async (user, restaurants) => {
    try {
        const restaurantRatings = [];
        let restaurantRating = 0;
        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];
            const reviews = await reviewModel.find({ restaurantID: restaurant._id });

            const averageRating = reviews.length === 0 ? 0 : calculateRestaurantRating(reviews);
            if (averageRating === 0) {
                restaurantRatings.push({ ...restaurant, averageRating: 0 });
                continue;
            }
            const userWeights = {
                service: user.service,
                food: user.food,
                atmosphere: user.atmosphere,
                cleanliness: user.cleanliness,
                price: user.price,
                accessibility: user.accessibility,
            };
            const individualRating = await getIndividualRating(userWeights, averageRating);
            const totalAverageSum = Object.values(averageRating).reduce((sum, rating) => sum + rating, 0);
            restaurantRating = Math.round((totalAverageSum / Object.keys(averageRating).length) * 100) / 100;
            restaurantRatings.push({ ...restaurant, averageRating: restaurantRating, individualRating: individualRating });
        }
        return restaurantRatings;
    } catch (err) {
        console.log(err);
        return [];
    }
};

// Get the average rating of a restaurant based on reviews.
const calculateRestaurantRating = (reviews) => {
    let ratingSum = {
        service: 0,
        food: 0,
        atmosphere: 0,
        cleanliness: 0,
        price: 0,
        accessibility: 0,
    };

    for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        ratingSum.service += review.service ?? 0;
        ratingSum.food += review.food ?? 0;
        ratingSum.atmosphere += review.atmosphere ?? 0;
        ratingSum.cleanliness += review.cleanliness ?? 0;
        ratingSum.price += review.price ?? 0;
        ratingSum.accessibility += review.accessibility ?? 0;
    }

    const averageRating = {
        service: ratingSum.service / reviews.length,
        food: ratingSum.food / reviews.length,
        atmosphere: ratingSum.atmosphere / reviews.length,
        cleanliness: ratingSum.cleanliness / reviews.length,
        price: ratingSum.price / reviews.length,
        accessibility: ratingSum.accessibility / reviews.length,
    };

    return averageRating;
};

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

// Build query for MongoDB based on user preferences.
const getSearchQuery = async (filterData, preferences) => {
    // If no preferences, just filter by user input.
    if (preferences.length === 0) {
        const query = {
            $and: Object.keys(filterData).map((field) => {
                if (field === "Price") {
                    return {
                        [field]: filterData.Price,
                    };
                }
                return {
                    [field]: { $regex: filterData[field], $options: "i" },
                };
            }),
        }
        return query;
    } else {
        // If preferences, filter by user input and preferences.
        const query = {
            $and: [
                {
                    $or: preferences.map((term) => ({
                        "DietaryRestrictions": { $regex: term, $options: "i" }
                    }))
                },
                {
                    $and: Object.keys(filterData).map((field) => {
                        if (field === "Price") {
                            return {
                                [field]: filterData.Price,
                            };
                        }
                        return {
                            [field]: { $regex: filterData[field], $options: "i" },
                        };
                    }),
                },
            ],
        };
        return query;
    }
}

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