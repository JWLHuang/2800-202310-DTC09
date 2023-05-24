const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: false }))
router.get('/about', async (req, res) => {
    const message = req.params.message ? req.params.message : null;
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    res.render('about.ejs', { user: req.session });
});

module.exports = router;