const express = require('express');
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");
const { render } = require('ejs');
const reviewModel = require("./models/reviewModel");
const usersModel = require("./models/usersModel");
const router = express.Router();
const mongo = require("mongodb");

router.get("/history", async (req, res) => {
    const user = await findUser({ email: req.session.email });
    const history = await user.history;
    const restaurantHistory = history.reverse();
    let historyList = []
    const restaurantInfo = async () => {
        for (let i = 0; i < Math.min(restaurantHistory.length, 20); i++) {
            restaurant = await restaurantModel.find({ _id: new mongo.ObjectId(restaurantHistory[i]) })
            historyList = historyList.concat(restaurant)
        }
    }
    await restaurantInfo()
    restaurantList = await getRestaurantRatings(user, historyList);
    res.render("history.ejs", {
        user: user,
        restaurants: restaurantList,
    })

});

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

module.exports = router;
