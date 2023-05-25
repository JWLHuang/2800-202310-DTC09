// get the individual rating of the user for a restaurant
module.exports = {
    getIndividualRating : async (weights, ratings) => {
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
}