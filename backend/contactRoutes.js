const express = require('express');
const router = express.Router();
const { findUser } = require('./findUser');
const contactSchema = require('./schema/contactSchema')

// Middleware to parse the request body as JSON
router.use(express.urlencoded({ extended: false }))

// GET route for the contact page
router.get('/contact/:message?', async (req, res) => {
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

// POST route for the contact page
router.post('/contact/:message?', async (req, res) => {
    const validationResult = contactSchema.validate(req.body);
    if (validationResult.error != null) {
        res.redirect('/contact/' + validationResult.error.details[0].message);
    } else {
        console.log('passed validation')
        req.session.error = null;
        res.redirect('/contact/' + "Submission successfully sent! We will get back to you in 3-5 business days.");
    }
});

// Export the router
module.exports = router;