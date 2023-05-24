const Joi = require("joi");

// Create a signup schema
const signupSchema = Joi.object(
    {
        signupEmail: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "ca", "co"] } }).required().messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Please enter a valid email address',
        }),
        signupName: Joi.string().alphanum().max(20).required().messages({
            'string.alphanum': 'Username must only contain alphanumeric characters',
            'string.max': 'Username must be less than 20 characters',
            'string.empty': 'Please enter a valid username',
        }),
        signupPassword: Joi.string().max(20).required().messages({
            'string.alphanum': 'Password must only contain alphanumeric characters',
            'string.empty': 'Please enter a valid password',
            'string.max': 'Password must be less than 20 characters',
        }),
        securityQuestion: Joi.string().valid('questionOne', 'questionTwo', 'questionThree', 'questionFour').required().messages({
            'any.only': 'Please select a valid security question',
        }),
        securityAnswer: Joi.string().alphanum().max(20).required().messages({
            'string.alphanum': 'Security answer must only contain alphanumeric characters',
            'string.max': 'Security answer must be less than 20 characters',
            'string.empty': 'Please enter a valid security answer',
        }),
        type: Joi.boolean(),
    });

// Export the schema
module.exports = signupSchema;