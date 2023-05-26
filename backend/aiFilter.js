const { Configuration, OpenAIApi } = require("openai");

// Create a configuration object for OpenAI API
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create an instance of the API class
const openai = new OpenAIApi(configuration);

// Function to generate a recommendation
const findRestaurants = async (restaurantList) => {
    // const prompt = `Restaurant Recommendation\n\nPlease recommend me a random restaurant that must be from this following list:\n${JSON.stringify(restaurantList)}\nConsider the cuisine type, rating, and location while making recommendations. 1.`
    const prompt = `Restaurant Recommendation\n\nPlease recommend random restaurants for me from this following list:\n${JSON.stringify(restaurantList[0])}\nConsider the cuisine type, rating, and location while making recommendations. Give me up to 5 restaurants. 1. `;
    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 200,
            temperature: 0.7,
            n: 5,
        });
        const recommendations = response.data.choices
            .slice(0, Math.min(restaurantList.length, 5))
            .map((choice, index) => restaurantList[index]);
        return recommendations;
    } catch (err) {
        console.log(err);
    }
}

// Export the function
module.exports = findRestaurants;