const Joi = require('joi');


// Create a factor schema
const factorsSchema = Joi.object({
    service: Joi.number().min(1).max(6).required(),
    food: Joi.number().min(1).max(6).required(),
    price: Joi.number().min(1).max(6).required(),
    atmosphere: Joi.number().min(1).max(6).required(),
    cleanliness: Joi.number().min(1).max(6).required(),
    accessibility: Joi.number().min(1).max(6).required()
});

// Export the factorsSchema object
module.exports = factorsSchema;