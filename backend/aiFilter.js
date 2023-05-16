const restaurantModel = require("./models/restaurantModel");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const findRestaurants = async (restaurantList) => {
    const prompt = `Can you give me 5 random restaurants in ${restaurantList}?}`;
    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.75,

    });
    console.log('response', response.data.choices[0].text);
    const generatedFilter = response.data.choices[0].text.trim();
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