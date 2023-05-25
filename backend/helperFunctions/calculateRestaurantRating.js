// Get the average rating of a restaurant based on reviews.
module.exports = {
    calculateRestaurantRating: (reviews) => {
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
    }
}