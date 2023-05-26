const Joi = require("joi");

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    question: Joi.string().max(20).required(),
    answer: Joi.string().max(20).required(),
    newPassword: Joi.string().max(20).required(),
    newPasswordConfirm: Joi.string().max(20).required(),
});

module.exports = forgotPasswordSchema;