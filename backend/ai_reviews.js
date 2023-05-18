const { Configuration, OpenAIApi } = require("azure-openai");

const configuration = new Configuration({
    apiKey: this.apiKey,
    endpoint: process.env.OPENAI_ENDPOINT,
    azure: {
        apiKey: process.env.OPENAI_API_KEY,
        endpoint: process.env.OPENAI_ENDPOINT,
        deploymentName: 'text-davinci-003',
    }
});

const openai = new OpenAIApi(configuration);

const reviewRating = async (prompt) => {
    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 200,
            temperature: 0,
            n: 1,
        });
        // console.log(response.data.choices[0].text);
        // console.log(response.data.usage)
        return response.data.choices[0].text;
    } catch (err) {
        console.log(err);
    }
}

module.exports = reviewRating;