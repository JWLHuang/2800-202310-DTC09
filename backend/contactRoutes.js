const express = require('express');
const router = express.Router();
const { findUser } = require('./findUser');

router.use(express.urlencoded({ extended: false }))
router.get('/contact', async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    try {
        const user = await findUser({ email: req.session.email });
        res.render('contact.ejs', user ? { user: user } : { user: null });
    } catch (err) {
        console.log(err);
        res.render('contact.ejs', { user: null, errorMsg: errorMsg });
    }
});

module.exports = router;