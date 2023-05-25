const Joi = require("joi");

// Create a review schema
const reviewSchema = Joi.object({
    reviewTitle: Joi.string().min(2).max(300).trim().required().messages(
        {
            'string.empty': `Review Title cannot be empty`,
            'string.min': `Review Title must be at least 2 characters long`,
            'string.max': `Review Title cannot exceed 300 characters`
        }),
    reviewBody: Joi.string().min(20).max(1500).trim().required().messages(
        {
            'string.empty': `Review cannot be empty`,
            'string.min': `Review must be at least 20 characters long`,
            'string.max': `Review cannot exceed 1500 characters`
        }),
    restaurantID: Joi.string().min(1).max(100).trim().required(),
    userID: Joi.string().min(1).max(100).trim().required()
});

// Export the schema
module.exports = reviewSchema;