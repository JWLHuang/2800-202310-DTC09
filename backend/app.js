const app = express();
const Joi = require('joi');
const mongo = require('mongodb');
const bcrypt = require('bcrypt');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', '../views/');

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