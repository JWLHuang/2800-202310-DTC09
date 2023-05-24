const express = require("express");
const app = express();
const mongo = require("mongodb");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const { findUser } = require("./findUser");
const url = require('url');
const restaurantModel = require("./models/restaurantModel");


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

// Setup the MongoStore for storing session data
var dbStore = MongoStore.create({
  mongoUrl: `${process.env.MONGODB_PROTOCOL}://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}`,
  collection: "sessions",
  crypto: {
    secret: process.env.MONGODB_SESSION_SECRET,
  },
});

// Setup the session middleware
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

// Handle the index route
app.get("/", async (req, res) => {
  const featuredRestaurants = await restaurantModel.find({ Location: 'Vancouver, Canada', Award: "1 MICHELIN Star", Cuisine: { $not: /^C.*/ } }).limit(3);
  // Check if user is logged in
  if (req.session.authenticated) {
    const user = await findUser({ email: req.session.email });
    const history = await user.history;
    const restaurantHistory = history.reverse().slice(0, 3);
    const location = await restaurantModel.distinct("Location");
    const cuisine = await restaurantModel.distinct("Cuisine");
    const price = await restaurantModel.distinct("Price");
    const award = await restaurantModel.distinct("Award");
    location.push("Chris")
    cuisine.push("Don't")
    price.push("Select")
    award.push("This")


    let historyList = []
    const restaurantInfo = async () => {
      for (let i = 0; i < restaurantHistory.length; i++) {
        restaurant = await restaurantModel.find({ _id: new mongo.ObjectId(restaurantHistory[i]) })
        historyList = historyList.concat(restaurant)
      }
    }
    await restaurantInfo()
    return res.render("index.ejs", { user: user, featuredRestaurant: featuredRestaurants, restaurantHistory: historyList, location: location, cuisine: cuisine, price: price, award: award });
  }
  return res.render("index.ejs", { featuredRestaurant: featuredRestaurants });
});


// Dempose the server into seperate files

// Authentication routes
const signupRoutes = require("./signupRoutes");
const authorizationRoutes = require("./authorizationRoutes");

app.use(signupRoutes);
app.use(authorizationRoutes);


// User routes
const profileRoutes = require("./profileRoutes");
const forgotPasswordRoutes = require('./forgotPasswordRoutes');
const resetPasswordRoutes = require('./resetPasswordRoutes');
const extAuthRoutes = require('./extAuthRoutes');
const historyRoutes = require('./historyRoutes');
const contactRoutes = require('./contactRoutes');


app.use(profileRoutes);
app.use(forgotPasswordRoutes);
app.use(resetPasswordRoutes);
app.use(extAuthRoutes);
app.use(historyRoutes);
app.use(contactRoutes);

// Restaurant routes
const restaurantListRoutes = require("./restaurantListRoutes");
const planMyDayRoutes = require('./planMyDayRoutes');
const reviewRoutes = require('./reviewRoutes');
const mapRoutes = require('./mapRoutes');


app.use(restaurantListRoutes);
app.use(planMyDayRoutes);
app.use(reviewRoutes);
app.use(mapRoutes);


// Error 404 handling
async function handle404(req, res, _) {
  if (req.session.authenticated) {
    res.status(404).render("404.ejs", { user: req.session });
  } else {
    res.status(404).render("404.ejs");
  }
}

app.use(handle404);


// Express error handling middleware
module.exports = app;
