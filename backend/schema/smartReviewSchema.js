const Joi = require("joi");

// Create a AI review schema
const smartReviewSchema = Joi.object({
    'tone': Joi.string().valid('positive', 'neutral', 'critical', 'humorous').required().messages(
        {
            'any.only': `Tone must be selected`
        }),
    'service': Joi.string().min(2).max(40).trim().messages(
        {
            'string.min': `Comment on service must be at least 2 characters long`,
            'string.max': `Comment on service cannot exceed 40 characters`
        }),
    'food': Joi.string().min(2).max(100).trim().messages(
        {
            'string.min': `Comment on food must be at least 2 characters long`,
            'string.max': `Comment on food cannot exceed 100 characters`
        }),
    'atmosphere': Joi.string().min(2).max(40).trim().messages(
        {
            'string.min': `Comment on atmosphere must be at least 2 characters long`,
            'string.max': `Comment on atmosphere cannot exceed 40 characters`
        }),
    'cleanliness': Joi.string().min(2).max(40).trim().messages(
        {
            'string.min': `Comment on cleanliness must be at least 2 characters long`,
            'string.max': `Comment on cleanliness cannot exceed 40 characters`
        }),
    'price': Joi.string().min(2).max(40).trim().messages(
        {
            'string.min': `Comment on value for money must be at least 2 characters long`,
            'string.max': `Comment on value for money cannot exceed 40 characters`
        }),
    'accessability': Joi.string().min(2).max(40).trim().messages(
        {
            'string.min': `Comment on accessability must be at least 2 characters long`,
            'string.max': `Comment on accessability cannot exceed 40 characters`
        }),
    'restaurantID': Joi.string().min(1).max(100).trim().required()
});

module.exports = smartReviewSchema;