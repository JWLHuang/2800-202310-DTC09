const express = require('express');
const app = express();
const Joi = require('joi');
const mongo = require('mongodb');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const url = require('url');


const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './frontend/views/');

// importing static files for navigation links
const footerLinks = require('../frontend/footerLinks');

// middleware to set global variables for header and footer links
app.use('/', (req, res, next) => {
    res.locals.footerLinks = footerLinks.footerLinks;
    res.locals.socialLinks = footerLinks.socialLinks;
    next();
});

app.get('/', (req, res) => {
    // console.log(req.url)
    res.render('index.ejs');
});

const signupRoutes = require('./signupRoutes');
const authorizationRoutes = require('./authorizationRoutes');
const profileRoutes = require('./profileRoutes');
const restaurantListRoutes = require('./restaurantListRoutes');
const restPasswordRoutes = require('./restPasswordRoutes');


app.use(signupRoutes);
app.use(authorizationRoutes);
app.use(profileRoutes);
app.use(restaurantListRoutes);
app.use(restPasswordRoutes);

function handle404(req, res, _) {
    res.status(404).render('404.ejs');
}

app.use(handle404);

module.exports = app;