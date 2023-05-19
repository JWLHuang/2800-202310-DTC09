const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = {
    getTopThree: async (restaurantList) => {
        const prompt = `Please only return a JSON object of exactly 3 restaurants for each of Breakfast, Lunch, and Dinner from this list (only one per meal), in the following format: {"Breakfast":"645bdf114c5057693bcac787","Lunch":"645bdf114c5057693bcac78d","Dinner":"645bdf114c5057693bcac78f"}. \nList:\n${JSON.stringify(restaurantList)}\nConsider the cuisine type, rating, and hours. Please MAKE SURE they are in the same country. If none meet the criteria, please use the value "646562b76644f1aa93bc2ba2". Please return nothing else.`;

        // console.log(prompt)

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