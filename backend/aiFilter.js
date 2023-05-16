const restaurantModel = require("./models/restaurantModel");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const findRestaurants = async (restaurantList) => {
    // console.log('restaurantList', restaurantList)
    // const prompt = `Restaurant Recommendation\n\nPlease recommend me a random restaurant that must be from this following list:\n${JSON.stringify(restaurantList)}\nConsider the cuisine type, rating, and location while making recommendations. 1.`
    const prompt = `Restaurant Recommendation\n\nPlease recommend random restaurants for me from this following list:\n${JSON.stringify(restaurantList)}\nConsider the cuisine type, rating, and location while making recommendations. Give me up to 5 restaurants. 1. `;
    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 200,
            temperature: 0.9,
            n: 5,
        });
        // console.log('response', response.data.choices[0].text);
        // const recommendations = response.data.choices.map(choice => choice.text.trim());
        // const recommendations = response.data.choices.slice(0, Math.min(restaurantList.length, 5)).map((choice, index) => {
        //     const restaurantIndex = index + 1;
        //     return {
        //         ...restaurantList[restaurantIndex - 1],
        //         recommendation: choice.text.trim(),
        //         rank: restaurantIndex
        //     };
        // });
        const recommendations = response.data.choices
            .slice(0, Math.min(restaurantList.length, 5))
            .map((choice, index) => restaurantList[index]);
        // const recommendations = response.data.choices.slice(0, Math.min(restaurantList.length, 5)).map((choice, index) => {
        //     restaurantList[index]
        // });
        // console.log('recommendations', recommendations)
        return recommendations;
        // console.log('generatedFilter', generatedFilter)
    } catch (err) {
        console.log(err);
    }

    // try {
    //     const restaurants = await restaurantModel.find(searchQuery).exec();
    //     const filteredRestaurantsAI = restaurants.filter((restaurant) =>
    //         restaurant.name.toLowerCase().includes(generatedFilter.toLowerCase())
    //     );
    //     console.log('filteredRestaurantsAI', filteredRestaurantsAI)
    //     return filteredRestaurantsAI
    // } catch (err) {
    //     console.log(err);
    // }
}

module.exports = findRestaurants;