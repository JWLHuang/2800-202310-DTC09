const express = require('express');
const router = express.Router();
const { findUser } = require('./findUser');
const Joi = require("joi");

const contactSchema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "ca", "co"] } }).required(),
    subject: Joi.string().min(3).max(30).required(),
    message: Joi.string().min(3).max(100).required(),
    type: Joi.boolean(),
});

router.use(express.urlencoded({ extended: false }))
router.get('/contact/:message?', async (req, res) => {
    console.log('contact route')
    const message = req.params.message ? req.params.message : null;
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    try {
        const user = await findUser({ email: req.session.email });
        res.render('contact.ejs', user ? { user: user, message: message } : { user: null, message: message });
    } catch (err) {
        console.log(err);
        res.render('contact.ejs', { user: null, message: errorMsg });
    }
});

router.post('/contact', async (req, res) => {
    const validationResult = contactSchema.validate(req.body);
    if (validationResult.error != null) {
        res.redirect('/contact/' + validationResult.error.details[0].message);
    } else {
        console.log('passed validation')
        req.session.error = null;
        res.redirect('/contact/' + "Submission successfully sent! We will get back to you in 3-5 business days.");
    }
});

// router.get('/contactSubmitted', (req, res) => {
//     return res.render('contactSubmitted.ejs', { message: "Message sent." });
// });


module.exports = router;