const { getIndividualRating } = require("./getIndividualRating");
const {calculateRestaurantRating} = require("./calculateRestaurantRating");
const reviewModel = require("../models/reviewModel");

// get the rating for each restaurant from reviews and user weights
module.exports = {
    getRestaurantRatings : async (user, restaurants) => {
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
    }
}