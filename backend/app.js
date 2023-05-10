const express = require('express');
const app = express();
const Joi = require('joi');
const mongo = require('mongodb');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const { findUser } = require('./findUser');
const usersModel = require("./models/usersModel");
const restaurantModel = require("./models/restaurantModel");
const url = require('url');


require('dotenv').config();
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

var dbStore = MongoStore.create({
    mongoUrl: (`${process.env.MONGODB_PROTOCOL}://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}`),
    collection: "sessions",
    crypto: {
        secret: process.env.MONGODB_SESSION_SECRET
    },
});

app.use(session({
    secret: process.env.NODE_SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    },
    store: dbStore,
    saveUninitialized: false,
    resave: true
}));

app.get("/testRestaurant", async (req, res) => {
    const restaurant = await restaurantModel.findOne({ Name: "Forum" });
    res.render("restaurant.ejs", restaurant ? { restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254 } : { restaurant: null });
});

app.get("/", async (req, res) => {
    const user = await findUser({ email: req.session.email, });
    res.render("index.ejs", user ? { user: user } : { user: null });
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