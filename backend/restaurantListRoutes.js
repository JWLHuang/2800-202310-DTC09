const express = require('express');
const router = express.Router();

router.get('/restaurant', (req, res) => {
    res.render('restaurant.ejs');
});

module.exports = router;