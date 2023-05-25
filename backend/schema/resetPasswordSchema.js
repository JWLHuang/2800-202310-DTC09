const Joi = require("joi");

// Create the reset password schema
const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(20).required(),
    newPassword: Joi.string().max(20).required(),
    newPasswordConfirm: Joi.string().max(20).required(),
});

// Export the module
module.exports = resetPasswordSchema;