const { Configuration, OpenAIApi } = require("azure-openai");

// Create a configuration object for Azure OpenAI
const configuration = new Configuration({
    apiKey: this.apiKey,
    endpoint: process.env.OPENAI_ENDPOINT,
    azure: {
        apiKey: process.env.OPENAI_API_KEY_AZ,
        endpoint: process.env.OPENAI_ENDPOINT,
        deploymentName: 'text-davinci-003',
    }
});

// Create an instance of the API class
const openai = new OpenAIApi(configuration);

// Function to generate a review
const reviewPrompt = async (prompt, randomness) => {
    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 200,
            temperature: randomness,
            n: 1,
        });
        return response.data.choices[0].text;
    } catch (err) {
        console.log(err);
    }
}

// Export the function
module.exports = reviewPrompt;