const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");
const aiFilter = require("./aiFilter");
const mongo = require("mongodb");

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
        let restaurantRating = 0;
        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];
            const reviews = await reviewModel.find({ restaurantID: restaurant._id });

            const userWeights = {
                service: user.service,
                food: user.food,
                atmosphere: user.atmosphere,
                cleanliness: user.cleanliness,
                price: user.price,
                accessibility: user.accessibility,
            };

            const hasUndefinedValues = Object.values(userWeights).some(value => value === undefined);

            const averageRating = reviews.length === 0 ? 0 : calculateRestaurantRating(reviews);
            if (averageRating === 0 && hasUndefinedValues) {
                restaurantRatings.push({ ...restaurant, averageRating: 0, individualRating: "No Rating" });
                continue;
            }
            if (averageRating === 0 && !hasUndefinedValues) {
                restaurantRatings.push({ ...restaurant, averageRating: 0, individualRating: 0 });
                continue;
            }

            const totalAverageSum = Object.values(averageRating).reduce((sum, rating) => sum + rating, 0);
            restaurantRating = Math.round((totalAverageSum / Object.keys(averageRating).length) * 100) / 100;

            if (restaurantRating !== 0 && hasUndefinedValues) {
                restaurantRatings.push({ ...restaurant, averageRating: restaurantRating, individualRating: "No Rating" });
                continue;
            }

            const individualRating = await getIndividualRating(userWeights, averageRating);
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


// Get the search query for the restaurants using the filter data and user preferences
const getSearchQuery = async (filterData, preferences) => {
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

router.get("/snake", async (req, res) => {
    res.render("snake");
});

router.get('/restaurants', async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    const filterParam = req.query.filter; // Get the filter data from the query parameter
    // if (!filterParam) return res.redirect("/filterRestaurants/error"); // If there is no filter data, redirect to the filter page with an error message
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

router.get('/restaurant/:id?', async (req, res) => {
    const user = await findUser({ email: req.session.email });
    try {
        const restaurant = await restaurantModel.findOne({ _id: req.params.id });
        const reviews = await reviewModel.find({ restaurantID: req.params.id }).sort({ TimeStamp: -1 });
        for (let i = 0; i < reviews.length; i++) {
            const author = await findUser({ _id: reviews[i].userID }, { name: 1 });
            reviews[i].userID = author.name;
        }
        if (restaurant && user) {
            await usersModel.updateOne(
                { email: req.session.email },
                { $push: { history: restaurant._id } });
            return res.render("restaurant", { user: user, restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254, reviews: reviews });
        } else if (restaurant && !user) {
            return res.render("restaurant", { restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254, reviews: reviews });
        } else {
            req.session.error = "Restaurant not found";
            return res.redirect("/filterRestaurants")
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
            return res.render("filterRestaurants.ejs", { user: user, featuredRestaurant: featuredRestaurants, restaurantHistory: historyList, cuisine: cuisine, price: price, award: award, location: location, errorMessage: "Location filter must be selected", errorMsg: errorMsg});
        }

        if (req.params.message === "embeddedError") {
            return res.render("index.ejs", { user: user, featuredRestaurant: featuredRestaurants, restaurantHistory: historyList, cuisine: cuisine, price: price, award: award, location: location, errorMessage: "Location filter must be selected", errorMsg: errorMsg, menuOpen: true});
        }

        return res.render("filterRestaurants.ejs", { user: user, featuredRestaurant: featuredRestaurants, restaurantHistory: historyList, cuisine: cuisine, price: price, award: award, location: location, errorMsg: errorMsg });
    } catch (err) {
        console.log(err);
    }
});

router.post("/filterRestaurantsResults", async (req, res) => {
    let filterData = req.body;
    embeddedTab = filterData.embedded;
    delete filterData.embedded;
    console.log(filterData);

    if (Object.keys(filterData).length === 0 || filterData === undefined || filterData.location === undefined) {
        if (embeddedTab === "true") {
            return res.redirect("/filterRestaurants/embeddedError");
        }
        return res.redirect("/filterRestaurants/error");
    }

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