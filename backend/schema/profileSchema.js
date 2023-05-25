const Joi = require('joi');

// Create a profile schema
const profileSchema = Joi.object({
    about_me: Joi.string().min(1).max(1000).trim().required(),
});

// Export the profileSchema object
module.exports = profileSchema;