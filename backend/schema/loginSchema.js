const Joi = require("joi");

// Create a login schema
const loginSchema = Joi.object(
    {
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "ca", "co", "org"] } }).required().messages({
            "string.email": "Please enter a valid email address.",
            "string.empty": "Please enter your email address.",
        }),
        password: Joi.string().max(20).required().messages({
            "string.max": "Maximum password length is 20 characters.",
            "string.empty": "Please enter your password.",
        }),
    });

// Export the schema
module.exports = loginSchema;