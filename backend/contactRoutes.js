const express = require('express');
const router = express.Router();

// Importing the contact schema
const contactSchema = require('./schema/contactSchema')

// Middleware to parse the request body as JSON
router.use(express.urlencoded({ extended: false }))

// GET route for the contact page
router.get('/contact/:message?', async (req, res) => {
    const message = req.params.message ? req.params.message : null;
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    try {
        // Render the contact page
        return res.render('contact.ejs', { message: message, user: req.session.authenticated ? req.session : undefined });
    } catch (err) {
        // If an error occurs, render the contact page with the error message
        console.log(err);
        return res.render('contact.ejs', { message: errorMsg, user: req.session.authenticated ? req.session : undefined });
    }
});

// POST route for the contact page
router.post('/contact/:message?', async (req, res) => {
    const validationResult = contactSchema.validate(req.body);
    // If the validation fails, redirect to the contact page with the error message
    if (validationResult.error != null) {
        res.redirect('/contact/' + validationResult.error.details[0].message);
    } else {
        // If the validation succeeds, redirect to the contact page with the success message
        req.session.error = null;
        res.redirect('/contact/' + "Submission successfully sent! We will get back to you in 3-5 business days.");
    }
});

// Export the router
module.exports = router;