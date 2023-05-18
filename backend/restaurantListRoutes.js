const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");
const aiFilter = require("./aiFilter");

const reviewModel = require("./models/reviewModel");
const usersModel = require("./models/usersModel");


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
        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];
            const reviews = await reviewModel.find({ restaurantID: restaurant._id });
            if (reviews.length === 0) {
                restaurantRatings.push({ ...restaurant, averageRating: 0 });
            } else {
                let service = 0;
                let food = 0;
                let atmosphere = 0;
                let cleanliness = 0;
                let price = 0;
                let accessibility = 0;
                for (let j = 0; j < reviews.length; j++) {
                    service += reviews[j].service ?? 0;
                    food += reviews[j].food ?? 0;
                    atmosphere += reviews[j].atmosphere ?? 0;
                    cleanliness += reviews[j].cleanliness ?? 0;
                    price += reviews[j].price ?? 0;
                    accessibility += reviews[j].accessibility ?? 0;
                }
                const averageRating = {
                    service: service / reviews.length,
                    food: food / reviews.length,
                    atmosphere: atmosphere / reviews.length,
                    cleanliness: cleanliness / reviews.length,
                    price: price / reviews.length,
                    accessibility: accessibility / reviews.length,
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
                restaurantRatings.push({ ...restaurant, averageRating: individualRating });
            }
        }
        return restaurantRatings;
    } catch (err) {
        console.log(err);
        return [];
    }
}

const getSearchQuery = async (filterData, preferences) => {
    if (preferences.length === 0) {
        const query = {
            $and: Object.keys(filterData).map((field) => ({
                [field]: { $regex: filterData[field], $options: "i" }
            }))
        }
        return query;
    } else {
        const query = {
            $and: [
                {
                    $or: preferences.map((term) => ({
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
        return query;
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
        // Retrieve user preferences from their account
        const user = await findUser({ email: req.session.email }) // Replace with your actual implementation
        if (!user) {
            return res.redirect("/login")
        } else {
            const searchQuery = await getSearchQuery(filterData, user.dietary_preferences);
            const restaurants = await restaurantModel.find(searchQuery);
            const randomRestaurants = restaurants.slice().sort(() => Math.random() - 0.5).slice(0, 10);
            let filteredRestaurants = await aiFilter(randomRestaurants);
            console.log(filteredRestaurants);
            filteredRestaurants = await getRestaurantRatings(user, filteredRestaurants);
            res.render('restaurantList.ejs', restaurants ? { user: user, restaurants: filteredRestaurants, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg });
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/restaurant/:id?', async (req, res) => {
    const user = await findUser({ email: req.session.email });
    try {
        const restaurant = await restaurantModel.findOne({ _id: req.params.id });
        const reviews = await reviewModel.find({ restaurantID: req.params.id }).sort({ TimeStamp: -1 });
        for (let i = 0; i < reviews.length; i++) {
            const author = await findUser({ _id: reviews[i].userID }, { name: 1 });
            reviews[i].userID = author.name;
        }
        if (restaurant) {
            await usersModel.updateOne(
                { email: req.session.email },
                { $push: { history: restaurant._id } });
            res.render("restaurant", restaurant ? { user: user, restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254, reviews: reviews } : { user: user, restaurant: null });
        } else {
            req.session.error = "Restaurant not found";
            res.redirect("/filterRestaurants")
        }

    } catch (error) {
        console.log(error)
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