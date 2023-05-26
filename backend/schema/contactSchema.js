const Joi = require('joi');


// Create a contact schema
const contactSchema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "ca", "co"] } }).required(),
    subject: Joi.string().min(3).max(30).required(),
    message: Joi.string().min(3).max(100).required(),
    type: Joi.boolean(),
});

// Export the contactSchema object
module.exports = contactSchema;