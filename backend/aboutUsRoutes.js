const express = require('express');
const router = express.Router();

// Use urlencoded middleware to parse the body of incoming requests
router.use(express.urlencoded({ extended: false }))

// Display about us route
router.get('/about', async (req, res) => {
    return res.render('about.ejs', { user: req.session.authenticated ? req.session : undefined });
});

// Export the router
module.exports = router;