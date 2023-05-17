const { Configuration, OpenAIApi } = require("azure-openai");

const configuration = new Configuration({
    apiKey: this.apiKey,
    endpoint: "https://nathanyau-openai-azure.openai.azure.com",
    azure: {
        apiKey: process.env.OPENAI_API_KEY,
        endpoint: "https://nathanyau-openai-azure.openai.azure.com",
        deploymentName: 'text-davinci-003',
    }
});

const openai = new OpenAIApi(configuration);

const reviewRating = async (reviewSubject, reviewContent) => {
    const prompt = `Give me a rating out of 5 in json format on Service, Food, Atmosphere, Cleanliness, Price, Accessibility based on the review below. 
    If the aspect is missing, make it 2.5. \n\n Review Title:${reviewSubject}. \n\nReview Content:${reviewContent}}`;
    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 200,
            temperature: 0,
            n: 1,
        });
        console.log(response.data.usage)
        return response.data.choices[0].text;
    } catch (err) {
        console.log(err);
    }
}

module.exports = reviewRating;