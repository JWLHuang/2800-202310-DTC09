const express = require("express");
const app = express();
const Joi = require("joi");
const mongo = require("mongodb");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const { findUser } = require("./findUser");
const url = require('url');

require("dotenv").config();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', process.env.VIEW_PATH);
// app.use(express.static(__dirname + '/../frontend/script'))
// app.use(express.static(__dirname + '/../frontend/style'))
app.use(express.static(__dirname + '/../frontend/public'))

// importing static files for navigation links
const footerLinks = require("../frontend/public/script/footerLinks");
const navbarLinks = require("../frontend/public/script/navbarLinks");

// middleware to set global variables for header and footer links
app.use("/", (req, res, next) => {
  res.locals.footerLinks = footerLinks.footerLinks;
  res.locals.socialLinks = footerLinks.socialLinks;
  res.locals.mobileLinks = footerLinks.mobileLinks;
  res.locals.beforeLoginNav = navbarLinks.beforeLoginNav;
  res.locals.afterLoginNav = navbarLinks.afterLoginNav;
  res.locals.currentURL = url.parse(req.url).pathname;
  next();
});

var dbStore = MongoStore.create({
  mongoUrl: `${process.env.MONGODB_PROTOCOL}://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}`,
  collection: "sessions",
  crypto: {
    secret: process.env.MONGODB_SESSION_SECRET,
  },
});

app.use(
  session({
    secret: process.env.NODE_SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: dbStore,
    saveUninitialized: false,
    resave: true,
  })
);

app.get("/", async (req, res) => {
  const user = await findUser({ email: req.session.email });
  res.render("index.ejs", user ? { user: user } : { user: null });
});

const signupRoutes = require("./signupRoutes");
const authorizationRoutes = require("./authorizationRoutes");
const profileRoutes = require("./profileRoutes");
const restaurantListRoutes = require("./restaurantListRoutes");
const resetPasswordRoutes = require('./resetPasswordRoutes');
const extAuthRoutes = require('./extAuthRoutes');
const forgotPasswordRoutes = require('./forgotPasswordRoutes');
const reviewRoutes = require('./reviewRoutes');


app.use(signupRoutes);
app.use(authorizationRoutes);
app.use(profileRoutes);
app.use(restaurantListRoutes);
app.use(resetPasswordRoutes);
app.use(extAuthRoutes);

app.use(forgotPasswordRoutes);
app.use(reviewRoutes);


function handle404(req, res, _) {
  res.status(404).render("404.ejs");
}

app.use(handle404);

module.exports = app;
