const Joi = require("joi");

// Create a signup schema
const signupSchema = Joi.object(
    {
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "ca", "co"] } }).required(),
        name: Joi.string().alphanum().max(20).required(),
        password: Joi.string().max(20).required(),
        question: Joi.string().max(20).required(),
        answer: Joi.string().max(20).required(),
        type: Joi.boolean(),
    });

// Export the schema
module.exports = signupSchema;