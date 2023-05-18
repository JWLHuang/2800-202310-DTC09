const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = {
    getTopThree: async (restaurantList) => {
        const prompt = `Please only return a JSON of exactly 3 restaurants for each of Breakfast, Lunch, and Dinner from this list (only one per meal):\n${JSON.stringify(restaurantList)}\nConsider the cuisine type, rating, and hours. Please MAKE SURE they are in the same country. If none meet the criteria, please return the string "No restaurant available". Please use the format: {"Breakfast":"645bdf114c5057693bcac787","Lunch":"645bdf114c5057693bcac78d","Dinner":"645bdf114c5057693bcac78f"}`;

        try {
            const response = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: prompt,
                max_tokens: 200,
                temperature: 0.9,
                n: 5,
            });

            return response

        } catch (err) {
            console.log(err);
        }
    }
}